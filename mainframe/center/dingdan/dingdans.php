﻿<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if(isset($param["_id"])){//
	$one = coll("dingdan")->findOne(array("_id"=>$param["_id"]));
	echo jsonEncode($one);
}else{//
	$cmd = $param["option"]["cmd"];
	$query = array();
	if("jiedan" == $cmd){
		$query["zhuangtai"] = "审核";
	}else if("xiadan" == $cmd){
		$query["zhuangtai"] = "接单";
		$query["gendanyuan"] = (String)$_SESSION["user"]["_id"];
	}else if("shendan" == $cmd){
		$query["zhuangtai"] = "下单";
		$query["gendanyuan"] = array('$ne'=>(String)$_SESSION["user"]["_id"]);
	}else if("jie2dan" == $cmd){
		$query["zhuangtai"] = "审单";
		$query["gendanyuan"] = (String)$_SESSION["user"]["_id"];
	}else if("wode" == $cmd){
		$query["gendanyuan"] = (String)$_SESSION["user"]["_id"];
	}
	
		if(isset($param["option"]["kehu"])){
			$query["kehu"] = $param["option"]["kehu"];
		}
		if(isset($param["option"]["yangban"])){
			$query["yangban.taiguoxinghao"] = $param["option"]["yangban"];
		}
		if(isset($param["option"]["zhuangtai"])){
			$query["zhuangtai"] = $param["option"]["zhuangtai"];
		}
		if(isset($param["option"]["gendanyuan"])){
			$query["gendanyuan"] = $param["option"]["gendanyuan"];
		}
		if(isset($param["option"]["gonghuoshang"])){
			$query["gonghuoshang._id"] = $param["option"]["gonghuoshang"];
		}
	$cur = coll("dingdan")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	
	echo  cur2json($cur);
	
}