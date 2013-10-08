<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if(isset($param["_id"])){//
	$one = coll("yuangao")->findOne(array("_id"=>$param["_id"]));
	echo jsonEncode($one);
}else{//
	$query = array("zhuangtai"=>array('$ne'=>"删除"));
	/*
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
	*/
	$cur = coll("yuangao")->find($query,array("neirong"=>0,"shenjieshuoming"=>0))->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	
	echo  cur2json($cur);
	
}