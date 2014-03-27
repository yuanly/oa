<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
$query["zhongguoxinghao"] = array('$regex'=>upper($param["option"]));
//$query = array('$or'=>array(array("taiguoxinghao"=>array('$regex'=>$param["option"])),array("zhongguoxinghao"=>array('$regex'=>$param["option"]))));
$cur = coll("yangban")->find($query,array("beizhu"=>0))->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);

echo  cur2json($cur);