<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if(isset($param["_id"])){//
	$one = coll("yangban")->findAndModify(array("_id"=>$param["_id"]),array('$set'=>Array("access"=>time())));			
	if($one){
		$cur = coll("yangban")->find(array("zhongguoxinghao"=>$one["zhongguoxinghao"]),array("_id"=>1,"shangjia"=>1,"jiage"=>1));
		if($cur->count()>1){
			$one["beixuan"] = c2a($cur);
		}
	}
	echo jsonEncode($one);
}else if(isset($param["caozuo"]) && "sfchongfu" == $param["caozuo"]){
	$one = coll("yangban")->findOne(array("_id"=>$param["bianhao"]));
	if($one){
		echo '{"chongfu":true}';
	}else{
		echo '{"chongfu":false}';
	}
}else{//
	$query = array();
	if(!empty($param["option"])){
		if(!empty($param["option"]["bianhao"])){
			$query["_id"] = array('$regex'=>$param["option"]["bianhao"]);
		}else if(!empty($param["option"]["shangjia"])){
			//$query["shangjia.mingchen"] = array('$regex'=>$param["option"]["shangjia"]);
			$query["shangjia.py"]=strtoupper($param["option"]["shangjia"]);
		}else if(!empty($param["option"]["taixing"])){
			$query["taiguoxinghao"] = array('$regex'=>$param["option"]["taixing"]);
		}else if(!empty($param["option"]["zhongxing"])){
			$query["zhongguoxinghao"] = array('$regex'=>$param["option"]["zhongxing"]);
		}
	}
	$cur = coll("yangban")->find($query,array("beizhu"=>0))->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
	
	echo  cur2json($cur);
	
}