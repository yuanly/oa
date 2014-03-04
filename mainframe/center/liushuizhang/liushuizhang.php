<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinjian" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"记账","time"=>time());
	$liushuizhang = array("liucheng"=>array($liucheng),"zhuangtai"=>"记账","jizhangren"=>$_SESSION["user"]["_id"]);	
	$d = "LSZ".date("ymd",time());
	$n = coll("liushuizhang")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$liushuizhang["_id"] = $d.".".($n+1);
	$zhongtai = coll("config")->findOne(array("_id"=>"zhongtai"));
	$liushuizhang["fukuanfang"] = $zhongtai["zhongtai"]["_id"];
	$liushuizhang["fukuanfangname"] = $zhongtai["zhongtai"]["mingchen"];
	coll("liushuizhang")->save($liushuizhang);
	echo '{"success":true}';
}else if("chaxun" == $param["caozuo"]){
	$query = array();
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["zhuangtai"])){
		$query["zhuangtai"] = $param["option"]["zhuangtai"];
	}
	if(isset($param["option"]["fukuanfang"])){
		$query["fukuanfang"] = $param["option"]["fukuanfang"];
	}
	if(isset($param["option"]["shoukuanfang"])){
		$query["shoukuanfang"] = $param["option"]["shoukuanfang"];
	}
	if(isset($param["option"]["zhifuriqi"])){
		$query["fukuanriqi"] = array('$lte'=>$param["option"]["zhifuriqi"]);
	}
	if(isset($param["option"]["kemu"])){
		$query["kemu"] = $param["option"]["kemu"];
	}
	if(isset($param["option"]["jizhangren"])){
		$query["jizhangren"] = $param["option"]["jizhangren"];
	}
	$cur = coll("liushuizhang")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("zuofei" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	$liushuizhang = coll("liushuizhang")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"作废")));
	echo '{"success":true}';
}else if("shenqingshenhe" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请审核","time"=>time());
	$liushuizhang = coll("liushuizhang")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"申请审核")));
	echo '{"success":true}';
}else if("quxiaoshenqingshenhe" == $param["caozuo"]){
	coll("liushuizhang")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"记账"),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("shenhe" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审核","time"=>time());
	$liushuizhang = coll("liushuizhang")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"审核","shenhezhe"=>$_SESSION["user"]["_id"])));
	echo '{"success":true}';
}else if("quxiaoshenhe" == $param["caozuo"]){
	coll("liushuizhang")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"申请审核"),'$unset'=>array("shenhezhe"=>1),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$lsz = coll("liushuizhang")->findOne($query);
	echo  jsonEncode($lsz);
}else if("baocun" == $param["caozuo"]){
	$liushuizhang = $param["liushuizhang"];	
	coll("liushuizhang")->save($liushuizhang);
	echo '{"success":true}';
}