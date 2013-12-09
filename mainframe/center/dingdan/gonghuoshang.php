<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
$query = array();
$query["mingchen"] = array('$regex'=>$param["option"]);
$cur = coll("vendor")->find($query,array("beizhu"=>0))->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);

echo  cur2json($cur);
	