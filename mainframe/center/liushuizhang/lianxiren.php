<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
$query = array();
if($param["option"]){
	//$query = array("mingchen"=>array('$regex'=>$param["option"]));
	$query  = array("py"=>upper($param["option"]));
}
$cur = coll("contact")->find($query)->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
echo  cur2json($cur);