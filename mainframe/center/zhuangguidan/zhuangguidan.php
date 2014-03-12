<?php
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
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["guihao"])){
		$query["guihao"] = array('$lte'=>$param["option"]["guihao"]);
	}
	if(isset($param["option"]["zhuangtai"])){
		$query["zhuangtai"] = $param["option"]["zhuangtai"];
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
	coll("zhuangguidan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"制单"),'$pop'=>array("liucheng"=>1),'$unset'=>array("jiaodanzhe"=>1)));
	statExpired();
	echo '{"success":true}';
}else if("zuofei" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	$zhuangguidan = coll("zhuangguidan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"作废")));
	statExpired();
	echo '{"success":true}';
}else if("jiaodan" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"交单","time"=>time());
	$zhuangguidan = coll("zhuangguidan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"交单","jiaodanzhe"=>$_SESSION["user"]["_id"])));
	statExpired();
	echo '{"success":true}';
}else if("shenqingshenhe" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请审核","time"=>time());
	$zhuangguidan = coll("zhuangguidan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"申请审核")));
	statExpired();
	echo '{"success":true}';
}else if("quxiaoshenqingshenhe" == $param["caozuo"]){
	coll("zhuangguidan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"受理"),'$pop'=>array("liucheng"=>1)));
	statExpired();
	echo '{"success":true}';
}else if("shenhe" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审核","time"=>time());
	$zhuangguidan = coll("zhuangguidan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"审核","shenhezhe"=>$_SESSION["user"]["_id"])));
	statExpired();
	echo '{"success":true}';
}else if("quxiaoshenhe" == $param["caozuo"]){
	coll("zhuangguidan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"申请审核"),'$unset'=>array("shenhezhe"=>1),'$pop'=>array("liucheng"=>1)));
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