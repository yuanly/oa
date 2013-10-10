<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if(isset($param["_id"])){//修改
	if("禁用"==$param["status"]){
		userColl()->update(array("_id"=>$param["_id"]),array('$set'=>array("ban"=>true)));
	}else{
		userColl()->update(array("_id"=>$param["_id"]),array('$unset'=>array("ban"=>1)));
	}
	echo '{"success":true}';	
}else{//列表
	$cur = userColl()->find(array(),array("password"=>0));
	$rows = cur2obj($cur);
	echo jsonEncode(array("users"=>$rows));
}