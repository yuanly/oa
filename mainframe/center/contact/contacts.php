<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if(isset($param["_id"])){//特定联系人详情
	$one = coll("contact")->findAndModify(array("_id"=>$param["_id"]),array('$set'=>Array("access"=>time())));			
	echo jsonEncode($one);
}else{//商家列表
	$query = array();
	if(!empty($param["option"])){
		if(!empty($param["option"]["mingchen"])){
			$query["mingchen"] = array('$regex'=>$param["option"]["mingchen"]);
		}
		if(!empty($param["option"]["shangjia"])){
			$query["shangjia.mingchen"] = array('$regex'=>$param["option"]["shangjia"]);
		}
		if("y" == $param["option"]["onlyshangjia"]){
			$query["leixing"] = "商家";
		}
	}
	$cur = coll("contact")->find($query,array("beizhu"=>0))->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
	
	echo  cur2json($cur);
	
}