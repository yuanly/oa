<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinjian" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"新建","time"=>time());
	$tuishui = array("gendanyuan"=>$_SESSION["user"]["_id"],"zhuangtai"=>"新建","liucheng"=>array($liucheng));
	$d = "TS".date("ymd",time());
	$n = coll("tuishui")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$tuishui["_id"] = $d.".".($n+1);
	coll("tuishui")->save($tuishui);
	echo '{"success":true}';
}else if("chaxun" == $param["caozuo"]){
	$query = array();	
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["guihao"])){
		$query["huogui.guihao"] = $param["option"]["guihao"];
	}
	$cur = coll("tuishui")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$ts = coll("tuishui")->findOne($query);
	echo  jsonEncode($ts);
}else if("zhuanggui" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"装柜","time"=>time());
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"装柜")));
	echo '{"success":true}';
}else if("baoguan" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"报关","time"=>time());
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"报关")));
	echo '{"success":true}';
}else if("fukuan" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"付款","time"=>time());
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"付款")));
	echo '{"success":true}';
}else if("kaipiao" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"开票","time"=>time());
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"开票")));
	echo '{"success":true}';
}else if("danzheng" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"单证","time"=>time());
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"单证")));
	echo '{"success":true}';
}else if("tuishui" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"退税","time"=>time());
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"退税")));
	echo '{"success":true}';
}else if("quxiao" == $param["caozuo"]){
	$tuishui = coll("tuishui")->findOne(array("_id"=>$param["_id"]));
	$len = count($tuishui["liucheng"]);
	$zhuangtai = $tuishui["liucheng"][$len -2]["dongzuo"];
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>$zhuangtai),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("jieguan" == $param["caozuo"]){
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$set'=>array("gendanyuan"=>$_SESSION["user"]["_id"])));
	echo '{"success":true}';
}else if("chazhuangguidan" == $param["caozuo"]){
	$query = array();
	if($param["option"]){
		$query = array("_id"=>array('$lte'=>$param["option"]));
	}
	$query["zhuangtai"] = array('$ne'=>"作废");
	$cur = coll("zhuangguidan")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("baocun" == $param["caozuo"]){
	$tuishui = $param["tuishui"];
	coll("tuishui")->save($tuishui);
	echo '{"success":true}';
}