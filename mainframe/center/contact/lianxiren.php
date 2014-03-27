<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("chashangjia" == $param["caozuo"]){
	$query = array("leixing"=>"商家");
	if(!empty($param["option"])){
		$query["py"] = strtoupper($param["option"]);
	}
	$cur = coll("contact")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("chalianxiren" == $param["caozuo"]){
	$query = array();
	if(!empty($param["option"])){
		$query["py"] = strtoupper($param["option"]);
	}
	$cur = coll("contact")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}