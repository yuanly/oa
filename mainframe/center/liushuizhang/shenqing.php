<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinzengshenqing" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"制单","time"=>time());
	$shenqing["type"] = "shenqing";
	$shenqing["zhuangtai"] = "制单";
	$shenqing["ludanzhe"] = $_SESSION["user"]["_id"];
	$shenqing["liucheng"][] = $liucheng;
	$d = "SQ".date("ymd",time());
	$n = coll("shenqing")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$shenqing["_id"] = $d.".".($n+1);
	coll("fahuodan")->save($shenqing);
	statExpired();
	echo '{"success":true}';
}else if("shanchu" == $param["caozuo"]){
	coll("fahuodan")->remove(array("_id"=>$param["_id"],"zhuangtai"=>"制单"));
	statExpired();
	echo '{"success":true}';
}else if("chaxun" == $param["caozuo"]){
	$cmd = $param["option"]["cmd"];
	$query = array();
	if("dailudan" == $cmd){
		$query["zhuangtai"] = "上传";
	}else if("daiduidan" == $cmd){
		$query["zhuangtai"] = "申请对单";
	}else if(isset($param["option"]["zhuangtai"])){
		$query["zhuangtai"] = $param["option"]["zhuangtai"];
	}
	
	if(isset($param["option"]["fukuan"])){
		$query["liushuizhang"] = array('$exists'=>true);
	}
	
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["gonghuoshang"])){
		$query["gonghuoshang._id"] = $param["option"]["gonghuoshang"];
	}
	
	$cur = coll("fahuodan")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$sq = coll("fahuodan")->findOne($query);
	echo  jsonEncode($sq);
}else if("baocun" == $param["caozuo"]){	
	$shenqing = $param["shenqing"];
	$id = $shenqing["_id"];
	$old = coll("fahuodan")->findOne(array("_id"=>$id));
	if($old["ludanzhe"] !== $_SESSION["user"]["_id"] || $old["zhuangtai"] !== "制单"){
		echo '{"success":false}';
		return;
	}
	coll("fahuodan")->save($shenqing);
	echo '{"success":true}';
}else if("shenqingduidan" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请对单","time"=>time());
	coll("fahuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"制单","ludanzhe"=>$_SESSION["user"]["_id"])
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("duidan" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"对单","time"=>time());
	coll("fahuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"申请对单")
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("duidanzhe"=>$_SESSION["user"]["_id"],"zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("huitui" == $param["caozuo"]){//
	$obj = coll("fahuodan")->findOne(array("_id"=>$param["_id"],"zhuangtai"=>$param["zhuangtai"]));
	if(empty($obj)){
	echo '{"success":false}';
	}
	array_pop($obj["liucheng"]);
	$lastLC = end($obj["liucheng"]);
	if($param["zhuangtai"] == "对单"){
		unset($obj["duidanzhe"]);
	}
	$obj["zhuangtai"] = $lastLC["dongzuo"];//刚好状态与流程动作一一对应	
	coll("fahuodan")->save($obj);
	statExpired();
	echo '{"success":true}';
}