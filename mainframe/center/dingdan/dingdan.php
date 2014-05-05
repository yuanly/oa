<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("jiedan" == $param["caozuo"]){
	jiedan($param["_id"]);
	statExpired();
	echo '{"success":true}';
}else if("piliangjiedan" == $param["caozuo"]){
	$number = 0;
	foreach($param["_ids"] as $_id){
		$number += jiedan($_id); 
	}
	statExpired();
	echo '{"success":true,"number":'.$number.'}';
}else if("mandan" == $param["caozuo"]){
	coll("dingdan")->update(array("_id"=>$param["_id"],"gendanyuan"=>$_SESSION["user"]["_id"]),array('$set'=>array("mandan"=>true)));
	echo '{"success":true}';
}else if("quxiaomandan" == $param["caozuo"]){
	coll("dingdan")->update(array("_id"=>$param["_id"],"gendanyuan"=>$_SESSION["user"]["_id"]),array('$set'=>array("mandan"=>false)));
	echo '{"success":true}';
}else if("xiadanshenqing" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"下单申请","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"],"gendanyuan"=>$_SESSION["user"]["_id"]),
								array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("zuofei" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"],"gendanyuan"=>$_SESSION["user"]["_id"]),
								array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("shenqingshenjie" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请审结","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"],"gendanyuan"=>$_SESSION["user"]["_id"],"zhuangtai"=>array('$in'=>array("发货","作废")))
			,array('$set'=>array("zhuangtai"=>$liucheng["dongzuo"]),'$push'=>array("liucheng"=>$liucheng)));
	statExpired();
	echo '{"success":true}';
}else if("zidan" == $param["caozuo"]){//生成一张子单
	//子单是加工订单的买材料的订单。如果临时追加新订单，需要临时加一个原稿（原稿相当于采购申请，这部不能随便省 ）。
	$dingdan = coll("dingdan")->findOne(array("_id"=>$param["_id"],"gendanyuan"=>$_SESSION["user"]["_id"])
					,array("yuangao"=>1,"taiguoyuangao"=>1,"kehu"=>1,"taiguoyangban"=>1,"gendanyuan"=>1,"taiguobianhao"=>1));
	if(empty($dingdan)){
		echo '{"success":false}';
		exit;
	}
	$dingdan["mandan"] = false;
	$dingdan["huowu"] = array();
	$dingdan["fudan"] = $dingdan["_id"];
	$count = coll("dingdan")->count(array("_id"=>array('$regex'=>"^".$dingdan["_id"]."_")));
	$dingdan["_id"] = $dingdan["_id"]."_".($count+1);//订单一旦被接单只能作废不能删除
	$dingdan["liucheng"] = array(array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"接单","time"=>time()));
	$dingdan["zhuangtai"] = "接单";
	coll("dingdan")->save($dingdan);
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("zidan"=>$dingdan["_id"])));
	statExpired();
	echo '{"success":true,"id":"'.$dingdan["_id"].'"}';
}else if("jieguan" == $param["caozuo"]){
	$dingdan = coll("dingdan")->findAndModify(array("_id"=>$param["_id"]),array('$set'=>array("gendanyuan"=>$_SESSION["user"]["_id"])));
	/*
		{
		mandan:true,
		zhuangtai:"录单",//录单 审核 接单（作废 接管 慢单/取消慢单） 下单申请（回退） 下单审核（打印 回退） 下单（回退） 发货 审结（回退） 作废（审结 回退） 
		yangban:{_id:"YB223",taiguoxinghao:"xxx",zhongguoxinghao:""},
		gonghuoshang:{_id:"SJ131110",mingchen:"大大",quyu:"xxx"},//计划装柜单的时候需要按区域查（方便装车？）
		lianxiren:{_id:12,mingchen:"xx"},
		gendanyuan:3,
		beizhu:"xxx",
		fudan:"fudanid",
		zidan:["zidanid"],//这个其实也可以不要，用父单做关联即可
		huowu:[{id:"xx",taiguoguige:"xx",guige:"xxx",shuliang:23,danwei:"KG"}...]}	
	*/
	$str = "接管：<br/>";
	if($dingdan["mandan"]){
		$str .= "慢单";
	}else{
		$str .= "新单";
	}
	$str .= "，状态：".$dingdan["zhuangtai"];
	if(!empty($dingdan["yangban"])&&!empty($dingdan["yangban"]["_id"])){
		$str .= "，样板：".$dingdan["yangban"]["_id"]."-".$dingdan["yangban"]["zhongguoxinghao"];
	}
	if(!empty($dingdan["gonghuoshang"]) && !empty($dingdan["gonghuoshang"]["_id"])){
		$str .= "，供货商：".$dingdan["gonghuoshang"]["_id"]."-".$dingdan["gonghuoshang"]["mingchen"];
	}
	if(!empty($dingdan["lianxiren"]) && !empty($dingdan["lianxiren"]["mingchen"])){
		$str .= "，联系人：".$dingdan["gonghuoshang"]["mingchen"];
	}
	$str .= "，跟单员ID：".$dingdan["gendanyuan"];
	if(!empty($dingdan["beizhu"])){
		$str .= "，备注：".$dingdan["beizhu"];
	}
	if(!empty($dingdan["fudan"])){
		$str .= "，父单：".$dingdan["fudan"];
	}
	if(!empty($dingdan["zidan"])){		
		$str .= "，子单：";
		foreach($dingdan["zidan"] as $zd){
			$str .= $zd." ";
		}
	}
	$str .=",货物：<br/>";
	foreach($dingdan["huowu"] as $huowu){
		$str = $str."规格：".$huowu["guige"]."数量：".$huowu["shuliang"]."单位：".$huowu["danwei"]."<br/>";
	}
	$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$param["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>$str);
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}else if("huitui" == $param["caozuo"]){//
	$obj = coll("dingdan")->findOne(array("_id"=>$param["_id"],"zhuangtai"=>$param["zhuangtai"]));
	if(empty($obj)){
		echo '{"success":true,"err":"后台数据异常，请刷新界面！"}';
		return;
	}
	array_pop($obj["liucheng"]);
	$lastLC = end($obj["liucheng"]);
	$obj["zhuangtai"] = $lastLC["dongzuo"];//刚好状态与流程动作一一对应	
	coll("dingdan")->save($obj);
	statExpired();
	echo '{"success":true}';
}else if("xiadanshenhe" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"下单审核","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("xiadan" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"下单","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("fahuo" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"发货","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("fahuodan" == $param["caozuo"]){
	$dd = coll("dingdan")->findOne(array("_id"=>$param["_id"],"liucheng.dongzuo"=>"下单"));
	if(empty($dd)){
		echo '{"success":true,"err":"后台数据异常，请刷新界面！"}';
		return;
	}
	$jiedanliucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"接单","time"=>time());
	$fahuodan["ludanzhe"] = $_SESSION["user"]["_id"];
	$fahuodan["type"] = "fahuodan";
	$fahuodan["zhuangtai"] = $jiedanliucheng["dongzuo"];
	$fahuodan["lastId"] = 0;
	$fahuodan["liucheng"][] = $jiedanliucheng;
	$d = date("ymd",time());
	$n = coll("fahuodan")->count(array("subid"=>array('$regex'=>"^".$d)));
	if($n>8){
		$fahuodan["subid"] = $d.".".($n+1);
	}else{
		$fahuodan["subid"] = $d.".0".($n+1);
	}
	while(coll("fahuodan")->findOne(array("subid"=>$fahuodan["subid"]))){
		$n ++;
		if($n>8){
			$fahuodan["subid"] = $d.".".($n+1);
		}else{
			$fahuodan["subid"] = $d.".0".($n+1);
		}
	}
	$fahuodan["_id"] = "FHD".$fahuodan["subid"];
	$fahuodan["gonghuoshang"] = $dd["gonghuoshang"];
	if(coll("fahuodan")->findOne(array("_id"=>$fahuodan["_id"]))){
		echo '{"success":true,"err":"新增发货单失败，请联系技术人员！"}';
		return;
	}
	coll("fahuodan")->save($fahuodan);
	$n=1;
	foreach($dd["huowu"] as $huowu){
		if(coll("huowu")->count(array("dingdanhuowu"=>$huowu["id"])) == 0){
			$hw["dingdanhuowu"]	= $huowu["id"];
			$hw["gonghuoshang"] = $dd["gonghuoshang"];
			$hw["yangban"] = $dd["yangban"];
			$hw["kehu"] = $dd["kehu"];
			$hw["guige"] = $huowu["guige"];
			$hw["danwei"] = $huowu["danwei"];
			$hw["danjia"] = $huowu["danjia"];
			$hw["shuliang"] = $huowu["shuliang"];
			$hw["jianshu"] = 1;
			$hw["fahuodan"] = $fahuodan["_id"];
			$hw["_id"] = $fahuodan["_id"]."HW".$n;
			$n = $n + 1;
			coll("huowu")->save($hw);
		}
	}
	if($n == 1){
		coll("fahuodan")->remove(array("_id"=>$fahuodan["_id"]));
		echo '{"success":true,"err":"所有货物已入发货单，若确实要为订单建发货单，请到发货单模块创建！"}';
		return;
	}
	statExpired();
	echo '{"success":true,"_id":"'.$fahuodan["_id"].'"}';
}else if("shenjie" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审结","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"],"zhuangtai"=>"申请审结"),
			array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("baocun" == $param["caozuo"]){
	$dingdan = $param["dingdan"];
	$old = coll("dingdan")->findOne(array("_id"=>$dingdan["_id"]),array("gendanyuan"=>1));
	if($_SESSION["user"]["_id"] != $old["gendanyuan"]){//因为有接管功能，所以保存的时候有可能跟单员已经改变
		echo '{"success":true,"err":"注意，订单已被接管。"}';
		return;
	}
	if(!empty($dingdan["gonghuoshang"])){
		coll("contact")->update(array("_id"=>$dingdan["gonghuoshang"]["_id"]),array('$set'=>array("access"=>time())));
	}
	if(!empty($dingdan["yangban"])){
		coll("yangban")->update(array("_id"=>$dingdan["yangban"]["_id"]),array('$set'=>array("access"=>time())));
		$yb = $dingdan["yangban"];
		$dingdan["yangban"] = array("_id"=>$yb["_id"],"taiguoxinghao"=>$yb["taiguoxinghao"],"zhongguoxinghao"=>$yb["zhongguoxinghao"]);//不保存样板全部信息，只保存列表需要的
	}
	coll("dingdan")->save($dingdan);
	echo jsonEncode($dingdan);
}else if("gethuowubyid2" == $param["caozuo"]){//在fahuodan.js & shenqing.js中调用
	$dingdan  = coll("dingdan")->findOne(array("huowu.id"=>$param["huowuId"]));
	foreach($dingdan["huowu"] as $huowu){
		if($huowu["id"] == $param["huowuId"]){
			$huowu["kehu"] = $dingdan["kehu"];
			$huowu["yangban"] = $dingdan["yangban"];
			echo jsonEncode($huowu);
			exit;
		}
	}
	echo '{"success":false}';
}else if("lianxiren" == $param["caozuo"]){
	$query  = array("leixing"=>"个人");
	if(""!=$param["option"]){
		$query["py"]=strtoupper($param["option"]);
	}
	if(!empty($param["shangjiaId"])){
		$query["shangjia._id"] = $param["shangjiaId"];
	}
	$cur = coll("contact")->find($query)->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("shangjia" == $param["caozuo"]){
	$query  = array("leixing"=>"商家");
	if(""!=$param["option"]){
		if(isUpper($param["option"])){
			$query = array("leixing"=>"商家","py"=>upper($param["option"]));
		}else{			
			$query = array("leixing"=>"商家","mingchen"=>array('$regex'=>$param["option"]));
		}
	}
	$cur = coll("contact")->find($query)->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("huowu" == $param["caozuo"]){
	//$query = array("dingdanhuowu"=>'/^'.$param["_id"].'/');
	//$query = array("dingdanhuowu"=>array('$regex'=>'^'.$param["_id"]));//因为历史原因导致有些货物id用了小写的hw，所以改用下面的规则表达式。以后再改回来
	$regexObj = new MongoRegex("/^".$param["_id"]."HW/i");
	$query = array("dingdanhuowu"=>$regexObj);
	$cur = coll("huowu")->find($query);
	echo  cur2json($cur);
}else if("fahuodanzhuangtai" == $param["caozuo"]){
	$fhd = coll("fahuodan")->findOne(array("_id"=>$param["fhdId"]),array("zhuangtai"=>1));
	echo  jsonEncode($fhd);
}




function jiedan($_id){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"接单","time"=>time());
	$one = coll("config")->findOne(array("_id"=>"dingdanbeizhu"));
	if(!empty($one)){
		$beizhu=$one["beizhu"];//缺省备注
	}else{
		$beizhu="";
	}
	$dingdan = coll("dingdan")->findAndModify(array("_id"=>$_id,"zhuangtai"=>"审核"),
								array('$set'=>array("zhuangtai"=>$liucheng["dongzuo"],"gendanyuan"=>$_SESSION["user"]["_id"],"beizhu"=>$beizhu),'$push'=>array("liucheng"=>$liucheng)));
	if(empty($dingdan)){
		return 0;
	}
	$str = "接单：<br/>";
	foreach($dingdan["huowu"] as $huowu){
		$str = $str."规格：".$huowu["guige"]."数量：".$huowu["shuliang"]."单位：".$huowu["danwei"]."<br/>";
	}
	$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$_id,"type"=>"caozuorizhi","userId"=>$_SESSION["user"]["_id"],"neirong"=>$str);
	coll("liuyan")->save($liuyan);
	return 1;
}