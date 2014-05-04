<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("shangchuan" == $param["caozuo"]){
	$shangchuanliucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"上传","time"=>time());
	$fahuodan = $param["fahuodan"];
	$fahuodan["type"] = "fahuodan";
	$fahuodan["zhuangtai"] = "上传";
	$fahuodan["lastId"] = 0;
	$fahuodan["liucheng"][] = $shangchuanliucheng;
	$d = date("ymd",time());
	$n = coll("fahuodan")->count(array("subid"=>array('$regex'=>"^".$d.".")));
	if($n>8){
		$fahuodan["subid"] = $d.".".($n+1);
	}else{
		$fahuodan["subid"] = $d.".0".($n+1);
	}
	$fahuodan["_id"] = "FHD".$fahuodan["subid"];
	coll("fahuodan")->save($fahuodan);
	statExpired();
	echo '{"success":true}';
}else if("shanchu" == $param["caozuo"]){
	$fhd = coll("fahuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"上传"),null,null,array("remove"=>true));
	if(empty($fhd)){
		echo '{"success":true,"err":"数据不一致，请刷新界面!"}';
		return;	
	}
	coll("liuyan")->remove(array("hostType"=>"fahuodan","hostId"=>$param["_id"]));
	statExpired();
	echo '{"success":true}';
}else if("daifu" == $param["caozuo"]){
	coll("fahuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"上传")
			,array('$set'=>array("daifu"=>true,"zhaiyao"=>"代付")));
	statExpired();
	$liuyan = array("_id"=>time(),"hostType"=>"fahuodan","hostId"=>$param["_id"],"type"=>"caozuorizhi"
			,"userId"=>$_SESSION["user"]["_id"],"neirong"=>"设为代付！");//以后改成保存整个json到另外一个表，界面是点击打开就可以像普通单一样显示详情。
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}else if("jiedan" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"接单","time"=>time());
	coll("fahuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"上传")
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"],"ludanzhe"=>$_SESSION["user"]["_id"])));
	statExpired();
	echo '{"success":true}';
}else if("shenqingduidan" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请对单","time"=>time());
	coll("fahuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"接单","ludanzhe"=>$_SESSION["user"]["_id"])
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	coll("huowu")->update(array("fahuodan"=>$param["_id"]),array('$set'=>array("beihuo"=>true)),array("multiple"=>true));
	statExpired();
	echo '{"success":true}';
}else if("zuofei" == $param["caozuo"]){
	$cur = coll("huowu")->find(array("fahuodan"=>$param["_id"]));
	$str = "作废：";
	foreach($cur as $hw){
		$str .= "<p>".$hw["dingdanhuowu"]."-".$hw["yangban"]["zhongguoxinghao"]."-".$hw["guige"]."</p>";
	}
	$liuyan = array("_id"=>time(),"hostType"=>"fahuodan","hostId"=>$param["_id"],"type"=>"caozuorizhi"
			,"userId"=>$_SESSION["user"]["_id"],"neirong"=>$str);//以后改成保存整个json到另外一个表，界面是点击打开就可以像普通单一样显示详情。
	coll("liuyan")->save($liuyan);
	
	coll("huowu")->remove(array("fahuodan"=>$param["_id"]));

	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	coll("fahuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"接单","ludanzhe"=>$_SESSION["user"]["_id"])
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("jieguan" == $param["caozuo"]){
	coll("fahuodan")->update(array("_id"=>$param["_id"]),array('$set'=>array("ludanzhe"=>$_SESSION["user"]["_id"])));
	$liuyan = array("_id"=>time(),"hostType"=>"fahuodan","hostId"=>$param["_id"],"type"=>"caozuorizhi"
			,"userId"=>$_SESSION["user"]["_id"],"neirong"=>"接管：略");//以后改成保存整个json到另外一个表，界面是点击打开就可以像普通单一样显示详情。
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}else if("huitui" == $param["caozuo"]){//
	$obj = coll("fahuodan")->findOne(array("_id"=>$param["_id"],"zhuangtai"=>$param["zhuangtai"]));
	if(empty($obj)){
		echo '{"success":true,"err":"后台数据异常，请刷新界面！"}';
		return;
	}
	array_pop($obj["liucheng"]);
	$lastLC = end($obj["liucheng"]);
	if($param["zhuangtai"] == "对单"){
		unset($obj["duidanzhe"]);
	}
	$obj["zhuangtai"] = $lastLC["dongzuo"];//刚好状态与流程动作一一对应	
	coll("fahuodan")->save($obj);
	if($obj["zhuangtai"] == "接单"){
		coll("huowu")->update(array("fahuodan"=>$param["_id"]),array('$unset'=>array("beihuo"=>1)),array("multiple"=>true));
	}
	statExpired();
	echo '{"success":true}';
}else if("duidan" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"对单","time"=>time());
	coll("fahuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"申请对单")
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("duidanzhe"=>$_SESSION["user"]["_id"],"zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("shouhuo" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"收货","time"=>time());
	coll("fahuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"对单","ludanzhe"=>$_SESSION["user"]["_id"])
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("zhuanggui" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"装柜","time"=>time());
	coll("fahuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"收货","ludanzhe"=>$_SESSION["user"]["_id"])
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("shenqingshenjie" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请审结","time"=>time());
	coll("fahuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>array('$in'=>array("装柜","作废")),"ludanzhe"=>$_SESSION["user"]["_id"])
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("shenjie" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审结","time"=>time());
	coll("fahuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"申请审结","ludanzhe"=>array('$ne'=>$_SESSION["user"]["_id"]))
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$fhd = coll("fahuodan")->findOne($query);
	$cur = coll("huowu")->find(array("fahuodan"=>$param["_id"]));
	$fhd["huowu"] = c2a($cur);
	if(!empty($fhd["liushuizhang"])){
		$fhd["liushuizhang"] = coll("liushuizhang")->findOne(array("_id"=>$fhd["liushuizhang"]["_id"]));
	}
	echo  jsonEncode($fhd);
}else if("chaxun" == $param["caozuo"]){
	$cmd = $param["option"]["cmd"];
	$query = array("type"=>"fahuodan");
	if("daijiedan" == $cmd){
		$query["zhuangtai"] = "上传";
	}else if("daiduidan" == $cmd){
		$query["zhuangtai"] = "申请对单";
		$query["ludanzhe"] = array('$ne'=>$_SESSION["user"]["_id"]);
	}else if("daishenjie" == $cmd){
		$query["zhuangtai"] = "申请审结";
		$query["ludanzhe"] = array('$ne'=>$_SESSION["user"]["_id"]);
	}else if("wodedailudan" == $cmd){
		$query["ludanzhe"] = $_SESSION["user"]["_id"];
		$query["zhuangtai"] = "接单";
	}else if("wodedaiduidan" == $cmd){
		$query["ludanzhe"] = $_SESSION["user"]["_id"];
		$query["zhuangtai"] = "申请对单";
	}else if("wodeyiduidan" == $cmd){
		$query["ludanzhe"] = $_SESSION["user"]["_id"];
		$query["zhuangtai"] = array('$ne'=>"审结");
		$query["liucheng.dongzuo"] = array('$in'=>array("对单","作废"));
	}else if("wodedaifukuan" == $cmd){
		$query["ludanzhe"] = $_SESSION["user"]["_id"];
		$query["liucheng.dongzuo"] = "对单";
		$query["liushuizhang.yifu"] = array('$ne'=>true);
	}else if("wodedaishenjie" == $cmd){
		$query["ludanzhe"] = $_SESSION["user"]["_id"];
		$query["zhuangtai"] = "申请审结";
	}
	
	if(isset($param["option"]["fukuan"])){
		if($param["option"]["fukuan"] == "未记账"){
			$query["liushuizhang"] = array('$exists'=>false);	
		}else if($param["option"]["fukuan"] == "已记账"){
			$query["liushuizhang"] = array('$exists'=>true);	
			$query["liushuizhang.yifu"] = false;
		}else if($param["option"]["fukuan"] == "已付款"){
			$query["liushuizhang.yifu"] = true;
		}
	}
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["gonghuoshang"])){
		$query["gonghuoshang._id"] = $param["option"]["gonghuoshang"];
	}
	if(isset($param["option"]["ludanzhe"])){
		$query["ludanzhe"] = $param["option"]["ludanzhe"];
	}
	if(isset($param["option"]["duidanzhe"])){
		$query["duidanzhe"] = $param["option"]["duidanzhe"];
	}
	//var_dump($query);
	$cur = coll("fahuodan")->find($query,array("neirong"=>0))->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("chaxunforyanhuodan" == $param["caozuo"]){
	$yhdId = $param["option"]["yhdId"];
	$query = array();
	if($yhdId){
		$query = array("_id"=>array('$lt'=>$yhdId));
	}
	$cur = coll("fahuodan")->find($query,array("zhuangtai"=>1,"gonghuoshang"=>1,"huowu"=>1))->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("baocun" == $param["caozuo"]){	
	$fahuodan = $param["fahuodan"];
	$id = $fahuodan["_id"];
	$old = coll("fahuodan")->findOne(array("_id"=>$id,"ludanzhe"=>$_SESSION["user"]["_id"]));
	if(empty($old["ludanzhe"])){
		echo '{"success":true,"err":"数据不一致，请刷新界面！"}';
		return;
	}
	
	$ver = getId("huowuversion");//用它来识别出已被删除货物。
	foreach($fahuodan["huowu"] as $huowu){
		$hwId = $huowu["_id"];
		unset($huowu["_id"]);
		$huowu["ver"] = $ver;
		coll("huowu")->update(array("_id"=>$hwId),array('$set'=>$huowu),array("upsert"=>true));//考虑到有注释可能从验货单填入，不能直接save
	}
	coll("huowu")->remove(array("fahuodan"=>$id,"ver"=>array('$ne'=>$ver)));
	
	unset($fahuodan["huowu"]);
	unset($fahuodan["liucheng"]);
	unset($fahuodan["_id"]);
	unset($fahuodan["liushuizhang"]);
	coll("fahuodan")->update(array("_id"=>$id),array('$set'=>$fahuodan));
	echo '{"success":true}';
}else if("chaliushui" == $param["caozuo"]){
	$query = array();
	if($param["option"]){
		$query = array("_id"=>array('$lt'=>$param["option"]));
	}
	$query["zhuangtai"] = array('$ne'=>"作废");
	$cur = coll("liushuizhang")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}