<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("shangchuan" == $param["caozuo"]){
	$shangchuanliucheng = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"上传","time"=>time());
	$fahuodan = $param["fahuodan"];
	$fahuodan["zhuangtai"] = "上传";
	$fahuodan["liucheng"][] = $shangchuanliucheng;
	$d = "FHD".date("ymd",time());
	$n = coll("fahuodan")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$fahuodan["_id"] = $d.".".($n+1);
	coll("fahuodan")->save($fahuodan);
	echo '{"success":true}';
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$fhd = coll("fahuodan")->findOne($query);
	echo  jsonEncode($fhd);
}else if("chaxun" == $param["caozuo"]){
	$query = array();
	$cur = coll("fahuodan")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}