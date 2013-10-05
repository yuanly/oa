<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$yuangao = getJson();
$yuangao["shangchuanshijian"] = time();
$d = date("y/m/d",$yuangao["shangchuanshijian"]);
$n = coll("yuangao")->count(array("_id"=>"/^".$d."/"));
$yuangao["_id"] = $d."_".($n+1);
coll("yuangao")->save($yuangao);
echo jsonEncode($yuangao);