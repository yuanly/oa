<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if(isset($param["_id"])){//特定联系人详情
	$one = coll("yangban")->findAndModify(array("_id"=>$param["_id"]),array('$set'=>Array("access"=>time())));			
	echo jsonEncode($one);
}else{//商家列表
	$query = array();
	if(!empty($param["option"])){
		if(!empty($param["option"]["bianhao"])){
			$query["_id"] = array('$regex'=>$param["option"]["bianhao"]);
		}else if(!empty($param["option"]["shangjia"])){
			$query["shangjia.mingchen"] = array('$regex'=>$param["option"]["shangjia"]);
		}else if(!empty($param["option"]["taixing"])){
			$query["taiguoxinghao"] = array('$regex'=>$param["option"]["taixing"]);
		}else if(!empty($param["option"]["zhongxing"])){
			$query["zhongguoxinghao"] = array('$regex'=>$param["option"]["zhongxing"]);
		}
	}
	$cur = coll("yangban")->find($query,array("beizhu"=>0))->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
	
	echo  cur2json($cur);
	
}