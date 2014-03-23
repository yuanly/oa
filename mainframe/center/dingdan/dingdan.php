<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("jiedan" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"接单","time"=>time());
	$one = coll("config")->findOne(array("_id"=>"dingdanbeizhu"));
	if(!empty($one)){
		$beizhu=$one["beizhu"];//缺省备注
	}else{
		$beizhu="";
	}
	$dingdan = coll("dingdan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"审核"),
								array('$set'=>array("zhuangtai"=>$liucheng["dongzuo"],"gendanyuan"=>$_SESSION["user"]["_id"],"beizhu"=>$beizhu),'$push'=>array("liucheng"=>$liucheng)));
	/*
		{	_id:"DD131008.1",
		liucheng:[{userId:3,dongzuo:"录单",time:1322}],
		mandan:true,
		yuangao:YG131008.1,//系统原稿编号
		taiguoyuangao:"xx",//泰国原稿编号
		taiguobianhao:3,//该订单在原始的泰国原稿中的序号（审录单时有用）
		zhuangtai:"录单",//录单 审核 接单（作废 接管 慢单/取消慢单） 下单申请（回退） 下单审核（打印 回退） 下单（回退） 发货 审结（回退） 作废（审结 回退） 
		kehu:"C",
		taiguoyangban:"xx",//从泰国原稿抄过来的，打印给泰国的柜单时有用
		yangban:{_id:"YB223",taiguoxinghao:"xxx",zhongguoxinghao:""},
		gonghuoshang:{_id:"SJ131110",mingchen:"大大",quyu:"xxx"},//计划装柜单的时候需要按区域查（方便装车？）
		lianxiren:{_id:12,mingchen:"xx"},
		gendanyuan:3,
		xiadanshijian:13223,//可以不要。这个时间出现在列表里，方便看出是否下单。但如果用颜色来区分状态，就没必要在列表里出现下单时间
		beizhu:"xxx",
		fudan:"fudanid",
		zidan:["zidanid"],//这个其实也可以不要，用父单做关联即可
		huowu:[{id:"xx",taiguoguige:"xx",guige:"xxx",shuliang:23,danwei:"KG"}...]}	
	*/
	$str = "接单：<br/>";
	var_dump($dingdan);
	foreach($dingdan["huowu"] as $huowu){
		$str = $str."规格：".$huowu["guige"]."数量：".$huowu["shuliang"]."单位：".$huowu["danwei"]."<br/>";
	}
	$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$param["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>$str);
	coll("liuyan")->save($liuyan);
	statExpired();
	echo '{"success":true}';
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
}else if("zidan" == $param["caozuo"]){//生成一张子单
	$dingdan = coll("dingdan")->findOne(array("_id"=>$param["_id"],"gendanyuan"=>$_SESSION["user"]["_id"]),array("liucheng"=>0));
	if(empty($dingdan)){
		echo '{"success":false}';
		exit;
	}
	$count = coll("dingdan")->count(array("_id"=>array('$regex'=>"^".$dingdan["_id"])));
	$dingdan["fudan"] = $dingdan["_id"];
	$dingdan["_id"] = $dingdan["_id"]."_".$count;//订单一旦被接单只能作废不能删除
	$dingdan["liucheng"] = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"接单","time"=>time());
	coll("dingdan")->save($dingdan);
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("zidan"=>$dingdan["_id"])));
	//$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$dingdan["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>"生成子单：".$dingdan["_id"]);
	coll("liuyan")->save($liuyan);
	echo '{"success":true,"id":'.$dingdan["_id"].'}';
	statExpired();
	echo '{"success":true}';
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
		$str = $str."规格：".$huowu["guige"]."数量：".$huowu["shuliang"]."单位：".$huowu["danwie"]."<br/>";
	}
	$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$param["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>$str);
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}else if("huitui" == $param["caozuo"]){//
	$dingdan = coll("dingdan")->findOne(array("_id"=>$param["_id"]));
	array_pop($dingdan["liucheng"]);
	$lastLC = end($dingdan["liucheng"]);
	$dingdan["zhuangtai"] = $lastLC["dongzuo"];//刚好状态与流程动作一一对应	
	coll("dingdan")->save($dingdan);
	statExpired();
	echo '{"success":true}';
}else if("xiadanshenhe" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"下单审核","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("xiadan" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"下单","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$xiadan),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("fahuo" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"发货","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("shenjie" == $param["caozuo"]){
	$shendan  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审结","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$shendan),'$set'=>array("zhuangtai"=>"结单")));
	statExpired();
	echo '{"success":true}';
}else if("baocun" == $param["caozuo"]){
	$dingdan = $param["dingdan"];
	$old = coll("dingdan")->findOne(array("_id"=>$dingdan["_id"]),array("gendanyuan"=>1));
	if($_SESSION["user"]["_id"] != $old["gendanyuan"]){//因为有接管功能，所以保存的时候有可能跟单员已经改变
		echo '{"success":false}';
		return;
	}
	if(!empty($dingdan["gonghuoshang"])){
		coll("contact")->update(array("_id"=>$dingdan["gonghuoshang"]["_id"]),array('$set'=>array("access"=>time())));
	}
	if(!empty($dingdan["yangban"])){
		coll("yangban")->update(array("_id"=>$dingdan["yangban"]["_id"]),array('$set'=>array("access"=>time())));
	}
	coll("dingdan")->save($dingdan);
	echo '{"success":true}';
}else if("ludan" == $param["caozuo"]){
	$dingdan = coll("dingdan")->findOne(array("_id"=>$param["_id"]),array("yuangao"=>1,"kehu"=>1,"gendanyuan"=>1,"zhuangtai"=>1,"huowu"=>1,"liucheng"=>1));
	$count = coll("dingdan")->count(array("_id"=>array('$regex'=>"^".$dingdan["_id"])));
	$dingdan["fudan"] = $dingdan["_id"];
	$dingdan["_id"] = $dingdan["_id"]."_".$count;
	$liucheng = $dingdan["liucheng"];
	$dingdan["liucheng"] = array();
	foreach($liucheng as $i=>$v){
		$dingdan["liucheng"][] = $v;
		if($v["dongzuo"] == "接单"){
			break;
		}
	}
	coll("dingdan")->save($dingdan);
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("zidan"=>$dingdan["_id"])));
	$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$dingdan["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>"生成子单：".jsonEncode($dingdan));
	coll("liuyan")->save($liuyan);
	echo '{"success":true,"id":'.$dingdan["_id"].'}';
}else if("dengban" == $param["caozuo"]){
	$dengban  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"等版","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$dengban),'$set'=>array("zhuangtai"=>"等版")));
	statExpired();
	echo '{"success":true}';
}else if("gethuowubyid2" == $param["caozuo"]){
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
}else if("gethuowubyid" == $param["caozuo"]){//应该不需要了，改成gethuowubyid2，在fahuodan.js中调用
	$dingdan  = coll("dingdan")->findOne(array("huowu.id"=>$param["huowuId"]));
	foreach($dingdan["huowu"] as $huowu){
		if($huowu["id"] == $param["huowuId"]){
			echo jsonEncode($huowu);
			exit;
		}
	}
	echo '{"success":false}';
}else if("lianxiren" == $param["caozuo"]){
	$query  = array("leixing"=>"个人");
	if(""!=$param["option"]){
		$query = array("leixing"=>"个人","mingchen"=>array('$regex'=>$param["option"]));
	}
	$cur = coll("contact")->find($query)->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("shangjia" == $param["caozuo"]){
	$query  = array("leixing"=>"商家");
	if(""!=$param["option"]){
		$query = array("leixing"=>"商家","py"=>$param["option"]);
	}
	$cur = coll("contact")->find($query)->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("huowu" == $param["caozuo"]){
	//$query = array("dingdanhuowu"=>'/^'.$param["_id"].'/');
	$query = array("dingdanhuowu"=>array('$regex'=>'^'.$param["_id"]));
	$cur = coll("huowu")->find($query);
	echo  cur2json($cur);
}
