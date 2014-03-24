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
	//录单 审核 接单（作废 接管 慢单/取消慢单） 下单申请（回退） 下单审核（打印 回退） 下单（回退） 发货 审结（回退） 作废（审结 回退） 
	if("jiedan" == $cmd){
		$query["zhuangtai"] = "审核";
	}else if("wodexindan" == $cmd){
		$query["zhuangtai"] = array('$in'=>array("接单","下单申请","下单审核"));
		$query["mandan"] = false;
		$query["gendanyuan"] = $_SESSION["user"]["_id"];
	}else if("wodemandan" == $cmd){
		$query["zhuangtai"] = array('$in'=>array("接单","下单申请","下单审核"));
		$query["mandan"] = true;
		$query["gendanyuan"] = $_SESSION["user"]["_id"];
	}else if("wodeweifahuo" == $cmd){
		$query["zhuangtai"] = "下单";
		$query["gendanyuan"] = $_SESSION["user"]["_id"];
	}else if("wodedaishenjie" == $cmd){
		$query["zhuangtai"] = array('$in'=>array("作废","发货"));
		$query["gendanyuan"] = $_SESSION["user"]["_id"];
	}else if("daixiadanshenhe" == $cmd){
		$query["zhuangtai"] = "下单申请";
		$query["gendanyuan"] = array('$ne'=>$_SESSION["user"]["_id"]);
	}else if("daishenjie" == $cmd){
		$query["zhuangtai"] = array('$in'=>array("作废","发货"));
		$query["gendanyuan"] = array('$ne'=>$_SESSION["user"]["_id"]);
	}
	
		if(isset($param["option"]["bianhao"])){
			$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
		}
		if(isset($param["option"]["taiguodanhao"])){
			$query["taiguoyuangao"] = $param["option"]["taiguodanhao"];
		}
		if(isset($param["option"]["kehu"])){
			$query["kehu"] = $param["option"]["kehu"];
		}
		if(isset($param["option"]["yangban"])){
			$query["yangban.zhongguoxinghao"] = $param["option"]["yangban"];
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
		if(isset($param["option"]["quyu"])){
			$query["gonghuoshang.quyu"] = $param["option"]["quyu"];
		}
		if(isset($param["option"]["man"])){
			$query["mandan"] = $param["option"]["man"];
		}
	$cur = coll("dingdan")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	
	echo  cur2json($cur);
	
}