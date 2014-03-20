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
	$query = array("zhuangtai"=>array('$in'=>array("上传","接稿","申请审结","审结")));//排除“删除”
	if("jiegao" == $param["option"]["cmd"]){
		$query = array("zhuangtai"=>"上传");
	}else if("ludan" == $param["option"]["cmd"]){
		$query = array("zhuangtai"=>"接稿");
	}else if("shenjie" == $param["option"]["cmd"]){
		$query = array("zhuangtai"=>"申请审结");
	}else if($param["option"]["weishenjie"]){
		$query = array("zhuangtai"=>array('$in'=>array("上传","接稿","申请审结")));//排除“删除”和“审结”
	}else if($param["option"]["shangchuanshijian"]){
		$query["shangchuanshijian"] = array('$lte'=>$param["option"]["shangchuanshijian"]);
	}
	$cur = coll("yuangao")->find($query,array("neirong"=>0,"shenjieshuoming"=>0))->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	
	echo  cur2json($cur);
	
}