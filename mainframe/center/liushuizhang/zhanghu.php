<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
$query = array("_id"=>$param["option"]);
$contact = coll("contact")->findOne($query);
if(isset($contact["zhanghuliebiao"])){
	echo  jsonEncode($contact["zhanghuliebiao"]);
}else{
	echo "[]";
}