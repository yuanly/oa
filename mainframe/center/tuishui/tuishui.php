<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinjian" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"新建","time"=>time());
	$tuishui = array("gendanyuan"=>$_SESSION["user"]["_id"],"zhuangtai"=>"新建","liucheng"=>array($liucheng));
	$d = "TS".date("ymd",time());
	$n = coll("tuishui")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$tuishui["_id"] = $d.".".($n+1);
	coll("tuishui")->save($tuishui);
	echo '{"success":true}';
}else if("chaxun" == $param["caozuo"]){
	$query = array();	
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["guihao"])){
		$query["huogui.guihao"] = $param["option"]["guihao"];
	}
	$cur = coll("tuishui")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$ts = coll("tuishui")->findOne($query);
	echo  jsonEncode($ts);
}