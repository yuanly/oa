<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinjian" == $param["caozuo"]){
	$liucheng = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"新建","time"=>time());
	$yanhuodan = array("chuangjianzhe"=>(int)$_SESSION["user"]["_id"],"zhuangtai"=>"新建","liucheng"=>array($liucheng));
	$d = "YHD".date("ymd",time());
	$n = coll("yanhuodan")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$yanhuodan["_id"] = $d.".".($n+1);
	coll("yanhuodan")->save($yanhuodan);
	echo '{"success":true}';
}else if("chaxun" == $param["caozuo"]){
	$query = array();
	$cur = coll("yanhuodan")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("ludan" == $param["caozuo"]){
	$ludanliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"录单","time"=>time());
	$yanhuodan = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$ludanliucheng),'$set'=>array("zhuangtai"=>"录单")));
	echo '{"success":true}';
}else if("zuofei" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	$yanhuodan = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"作废")));
	echo '{"success":true}';
}else if("duidan" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"对单","time"=>time());
	$yanhuodan = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"对单")));
	echo '{"success":true}';
}else if("fukuan" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"付款","time"=>time());
	$yanhuodan = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"付款")));
	echo '{"success":true}';
}else if("fahuo" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"发货","time"=>time());
	$yanhuodan = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"发货")));
	echo '{"success":true}';
}else if("fuhe" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"复核","time"=>time());
	$yanhuodan = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"复核")));
	echo '{"success":true}';
}else if("shenqingduidan" == $param["caozuo"]){
	$shenqingduidanliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"申请对单","time"=>time());
	$yanhuodan = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$shenqingduidanliucheng),'$set'=>array("zhuangtai"=>"申请对单")));
	echo '{"success":true}';
}else if("quxiaoshenqingduidan" == $param["caozuo"]){
	coll("yanhuodan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"录单"),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$fhd = coll("yanhuodan")->findOne($query);
	echo  jsonEncode($fhd);
}else if("baocun" == $param["caozuo"]){
	$yanhuodan = $param["yanhuodan"];
	$id = $yanhuodan["_id"];
	coll("yanhuodan")->update(array("_id"=>$id),array('$set'=>array("huowu"=>$yanhuodan["huowu"])));
	echo '{"success":true}';
}