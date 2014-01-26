<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
$query = array();
if($param["option"]){
	$query = array("mingchen"=>array('$regex'=>$param["option"]));
}
$cur = coll("contact")->find($query)->skip($param["offset"])->limit($param["limit"]);
echo  cur2json($cur);