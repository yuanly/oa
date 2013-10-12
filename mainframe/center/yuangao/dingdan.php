<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("shangchuan" == $param["caozuo"]){
	$yuangao = $param["yuangao"];
	$yuangao["shangchuanshijian"] = time();
	$d = "YG".date("ymd",$yuangao["shangchuanshijian"]);
	$n = coll("yuangao")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$yuangao["_id"] = $d.".".($n+1);
	$yuangao["liucheng"] = array();
	$yuangao["liucheng"][] = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"上传","time"=>time());
	$yuangao["zhuangtai"] = "上传";
	coll("yuangao")->save($yuangao);
	echo jsonEncode($yuangao);
}else if("shanchu" == $param["caozuo"]){	
	coll("yuangao")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"删除")));
	echo '{"success":true}';
}else if("jiegao" == $param["caozuo"]){
	$jiegaoliucheng = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"接稿","time"=>time());
	coll("yuangao")->update(array("_id"=>$param["_id"]),array('$set'=>array("jiegaozhe"=>(int)$_SESSION["user"]["_id"]),'$push'=>array("liucheng"=>$jiegaoliucheng)));
	echo '{"success":true}';
}