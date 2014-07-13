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
}else if(isset($param["caozuo"]) && "sfchongfu" == $param["caozuo"]){//检查人工索引是否重复
	$one = coll("yangban")->findOne(array("index"=>mb_strtoupper($param["index"],"UTF-8")));	
	if($one){
		echo '{"success":true,"err":"编号重复，请重置！"}';
	}else{
		echo '{"success":true}';
	}
}else{//列表
	$query = array();
	if(!empty($param["option"])){
		if(!empty($param["option"]["bianhao"])){
			$query["index"] = array('$regex'=>upper($param["option"]["bianhao"]));
		}else if(!empty($param["option"]["shangjia"])){
			//$query["shangjia.mingchen"] = array('$regex'=>$param["option"]["shangjia"]);
			$query["shangjia.py"]=upper($param["option"]["shangjia"]);
		}else if(!empty($param["option"]["taixing"])){
			$query["taiguoxinghao"] = array('$regex'=>upper($param["option"]["taixing"]));
		}else if(!empty($param["option"]["zhongxing"])){
			if(isUpper($param["option"]["zhongxing"])){
				$query["py"] = upper($param["option"]["zhongxing"]);
			}else{
				$query["zhongguoxinghao"] = array('$regex'=>$param["option"]["zhongxing"]);
			}
		}
	}
	$cur = coll("yangban")->find($query,array("beizhu"=>0))->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
	
	echo  cur2json($cur);
	
}