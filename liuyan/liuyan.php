<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../util.php");
session_start();
checkuser();

$liuyan = getJson();
if(isset($liuyan["page"])){
	$query = array("hostType"=>$liuyan["hostType"],"hostId"=>$liuyan["hostId"]);
	$cur = coll("liuyan")->find($query)->sort(array("_id"=>-1))->skip($liuyan["page"]*$liuyan["limit"])->limit($liuyan["limit"]);	
	echo  cur2json($cur);
}else{
	$liuyan["_id"] = time();
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}