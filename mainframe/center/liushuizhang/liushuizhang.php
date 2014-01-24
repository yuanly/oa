<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinjian" == $param["caozuo"]){
	$liucheng = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"记账","time"=>time());
	$liushuizhang = array("liucheng"=>array($liucheng),"zhuangtai"=>"记账","jizhangren"=>(int)$_SESSION["user"]["_id"]);	
	$d = "LSZ".date("ymd",time());
	$n = coll("liushuizhang")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$liushuizhang["_id"] = $d.".".($n+1);
	coll("liushuizhang")->save($liushuizhang);
	echo '{"success":true}';
}else if("chaxun" == $param["caozuo"]){
	$query = array();
	$cur = coll("liushuizhang")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("zuofei" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	$liushuizhang = coll("liushuizhang")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"作废")));
	echo '{"success":true}';
}else if("shenqingshenhe" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"申请审核","time"=>time());
	$liushuizhang = coll("liushuizhang")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"申请审核")));
	echo '{"success":true}';
}else if("quxiaoshenqingshenhe" == $param["caozuo"]){
	coll("liushuizhang")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"记账"),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("shenhe" == $param["caozuo"]){
	$liucheng = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"审核","time"=>time());
	$liushuizhang = coll("liushuizhang")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"审核","shenhezhe"=>(int)$_SESSION["user"]["_id"])));
	echo '{"success":true}';
}else if("quxiaoshenhe" == $param["caozuo"]){
	coll("liushuizhang")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"申请审核"),'$unset'=>array("shenhezhe"=>1),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$zgd = coll("liushuizhang")->findOne($query);
	$cur = coll("huowu")->find(array("liushuizhang"=>$param["_id"]))->sort(array("zgdIdx"=>1));
	$zgd["huowu"] = c2a($cur);
	echo  jsonEncode($zgd);
}else if("baocun" == $param["caozuo"]){
	$liushuizhang = $param["liushuizhang"];	
	coll("huowu")->update(array("liushuizhang"=>$liushuizhang["_id"]),array('$unset'=>array("liushuizhang"=>1)),array("multiple"=>true));
	foreach($liushuizhang["huowu"] as $huowu){
		coll("huowu")->update(array("_id"=>$huowu["_id"]),array('$set'=>array("liushuizhang"=>$liushuizhang["_id"],"zgdIdx"=>$huowu["zgdIdx"])));
	}
	unset($liushuizhang["huowu"]);
	coll("liushuizhang")->save($liushuizhang);
	echo '{"success":true}';
}