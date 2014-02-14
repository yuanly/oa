<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("shanchu" == $param["caozuo"]){
	$_id = $param["_id"];
	coll("news")->remove(array("_id"=>$_id));
	coll("newsReply")->remove(array("newId"=>$_id));	
	echo '{"success":true}';
}else if("gaileixing" == $param["caozuo"]){
	$_id = $param["_id"];
	$leixing = $param["leixing"];
	coll("news")->update(array("_id"=>$_id),array("type"=>$leixing));
	echo '{"success":true}';
}