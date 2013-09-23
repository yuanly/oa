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
	if(!empty($param["option"])){
		if(!empty($param["option"]["mingchen"])){
			$cur = coll("contact")->find(array("mingchen"=>array('$regex'=>$param["option"]["mingchen"])),array("beizhu"=>0))->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
		}else if(!empty($param["option"]["shangjia"])){
			$cur = coll("contact")->find(array("shangjia"=>array('$regex'=>$param["option"]["shangjia"])),array("beizhu"=>0))->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
		}		
	}else{
		$cur = coll("contact")->find(array(),array("beizhu"=>0))->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
	}
	echo  cur2json($cur);
	
}