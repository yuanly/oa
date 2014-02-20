<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("getdingdanbeizhu" == $param["caozuo"]){
	$beizhu = coll("config")->findOne(array("_id"=>"dingdanbeizhu"));
	echo jsonEncode($beizhu);
}else if("tijiaodingdanbeizhu" == $param["caozuo"]){
	$beizhu = $param["beizhu"];
	coll("config")->save(array("_id"=>"dingdanbeizhu","beizhu"=>$beizhu));
	echo '{"success":true}';
}
