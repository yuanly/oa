<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if(empty($param["option"])){
	$query = array();
}else{
	if(isUpper($param["option"])){
		$query["py"] = upper($param["option"]);
	}else{
		$query["zhongguoxinghao"] = array('$regex'=>$param["option"]);
	}
}
//$query = array('$or'=>array(array("taiguoxinghao"=>array('$regex'=>$param["option"])),array("zhongguoxinghao"=>array('$regex'=>$param["option"]))));
$cur = coll("yangban")->find($query,array("beizhu"=>0))->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);

echo  cur2json($cur);