<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$yuangao = getJson();
$yuangao["shangchuanshijian"] = time();
$d = date("ymd",$yuangao["shangchuanshijian"]);
$n = coll("yuangao")->count(array("_id"=>array('$regex'=>"^".$d."")));
$yuangao["_id"] = $d.".".($n+1);
$yuangao["liucheng"] = array();
$yuangao["liucheng"][] = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"上传","time"=>time());
$yuangao["zhuangtai"] = "上传";
coll("yuangao")->save($yuangao);
echo jsonEncode($yuangao);