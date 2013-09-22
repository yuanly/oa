<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if(isset($param["_id"])){//特定商家详情
	$one = vendorColl()->findAndModify(array("_id"=>$param["_id"]),array('$set'=>Array("access"=>time())));			
	echo jsonEncode($one);
}else{//商家列表
	if(!empty($param["option"])){
		$cur = vendorColl()->find(array("mingchen"=>array('$regex'=>$param["option"])),							array("beizhu"=>0))->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
	}else{
		$cur = vendorColl()->find(array(),							array("beizhu"=>0))->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
	}
	echo  cur2json($cur);
	
}