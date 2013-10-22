<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if(isset($param["_id"])){//
	$one = coll("yuangao")->findOne(array("_id"=>$param["_id"]));
	echo jsonEncode($one);
}else{//
	$query = array();
	$cur = coll("dingdan")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	
	echo  cur2json($cur);
	
}