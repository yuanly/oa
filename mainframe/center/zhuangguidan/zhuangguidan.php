﻿<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinjian" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"制单","time"=>time());
	$zhuangguidan = array("chuangjianzhe"=>$_SESSION["user"]["_id"],"zhuangtai"=>"制单","liucheng"=>array($liucheng));
	$d = "ZGD".date("ymd",time());
	$n = coll("zhuangguidan")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$zhuangguidan["_id"] = $d.".".($n+1);
	coll("zhuangguidan")->save($zhuangguidan);
	statExpired();
	echo '{"success":true}';
}else if("chaxun" == $param["caozuo"]){
	$query = array();
	$cmd = $param["option"]["cmd"];
	if("daishenhe" == $cmd){
		$query["zhuangtai"] = "申请审核";
	}else if("zhidan" == $cmd){
		$query["zhuangtai"] = "制单";
	}else if(isset($param["option"]["zhuangtai"])){
		$query["zhuangtai"] = $param["option"]["zhuangtai"];
	}
	
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["guihao"])){
		$query["guihao"] = array('$lte'=>$param["option"]["guihao"]);
	}
	if(isset($param["option"]["jiaodanzhe"])){
		$query["jiaodanzhe"] = $param["option"]["jiaodanzhe"];
	}
	if(isset($param["option"]["zhuangguiriqi"])){
		$query["zhuangguiriqi"] = array('$lt'=>$param["option"]["zhuangguiriqi"]);
	}
	if(isset($param["option"]["shenhezhe"])){
		$query["shenhezhe"] = $param["option"]["shenhezhe"];
	}
	$cur = coll("zhuangguidan")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("shenqingshouli" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请受理","time"=>time());
	$zhuangguidan = coll("zhuangguidan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"申请受理")));
	statExpired();
	echo '{"success":true}';
}else if("huitui" == $param["caozuo"]){	
	$obj = coll("zhuangguidan")->findOne(array("_id"=>$param["_id"],"zhuangtai"=>$param["zhuangtai"]));
	if(empty($obj)){
	echo '{"success":false}';
	}
	array_pop($obj["liucheng"]);
	$lastLC = end($obj["liucheng"]);
	$obj["zhuangtai"] = $lastLC["dongzuo"];//刚好状态与流程动作一一对应	
	coll("zhuangguidan")->save($obj)
	statExpired();
	echo '{"success":true}';
}else if("shanchu" == $param["caozuo"]){
	if(coll("huowu")->count(array("zhuangguidan"=>$param["_id"]))>0){
		echo '{"success":false}';//这种情况不应该出现
		exit;
	}
	coll("zhuangguidan")->remove(array("_id"=>$param["_id"]));
	statExpired();
	echo '{"success":true}';
}else if("jiaodan" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"交单","time"=>time());
	$zhuangguidan = coll("zhuangguidan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"交单","jiaodanzhe"=>$_SESSION["user"]["_id"])));
	statExpired();
	echo '{"success":true}';
}else if("shenhe" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审核","time"=>time());
	$zhuangguidan = coll("zhuangguidan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"审核","shenhezhe"=>$_SESSION["user"]["_id"])));
	statExpired();
	echo '{"success":true}';
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$zgd = coll("zhuangguidan")->findOne($query);
	$cur = coll("huowu")->find(array("zhuangguidan"=>$param["_id"]))->sort(array("zgdIdx"=>1));
	$zgd["huowu"] = c2a($cur);
	echo  jsonEncode($zgd);
}else if("baocun" == $param["caozuo"]){
	$zhuangguidan = $param["zhuangguidan"];	
	coll("huowu")->update(array("zhuangguidan"=>$zhuangguidan["_id"]),array('$unset'=>array("zhuangguidan"=>1)),array("multiple"=>true));
	foreach($zhuangguidan["huowu"] as $huowu){
		coll("huowu")->update(array("_id"=>$huowu["_id"]),array('$set'=>array("zhuangguidan"=>$zhuangguidan["_id"],"zgdIdx"=>$huowu["zgdIdx"])));
	}
	unset($zhuangguidan["huowu"]);
	coll("zhuangguidan")->save($zhuangguidan);
	echo '{"success":true}';
}