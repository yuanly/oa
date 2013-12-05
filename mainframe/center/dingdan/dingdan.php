﻿<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("jiedan" == $param["caozuo"]){
	$jiedanliucheng = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"接单","time"=>time());
	$one = coll("props")->findOne(array("key"=>"queshengbeizhu"));
	if(!empty($one)){
		$beizhu=$one["value"];//q缺省备注
	}else{
		$beizhu="";
	}
	$dingdan = coll("dingdan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"审核"),array('$set'=>array("zhuangtai"=>"接单","gendanyuan"=>(String)$_SESSION["user"]["_id"],"beizhu"=>$beizhu),'$push'=>array("liucheng"=>$jiedanliucheng)));
	unset($dingdan["liucheng"]);unset($dingdan["zhuangtai"]);
	$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$param["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>"接单：".jsonEncode($dingdan));
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}else if("baocun" == $param["caozuo"]){
	$dingdan = $param["dingdan"];
	coll("dingdan")->save($dingdan);
	echo '{"success":true}';
}else if("jieguan" == $param["caozuo"]){
	coll("dingdan")->update(array("_id"=>$param["_id"],"liucheng.dongzuo"=>"接单"),array('$set'=>array("liucheng.$.userId"=>(String)$_SESSION["user"]["_id"])));
	$dingdan = coll("dingdan")->findAndModify(array("_id"=>$param["_id"]),array('$set'=>array("gendanyuan"=>(String)$_SESSION["user"]["_id"])));
	$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$param["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>"接管：".jsonEncode($dingdan));
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}else if("zidan" == $param["caozuo"]){
	$dingdan = coll("dingdan")->findOne(array("_id"=>$param["_id"]),array("yuangao"=>1,"kehu"=>1,"gendanyuan"=>1,"zhangtai"=>1,"huowu"=>1,"liucheng"=>1));
	$count = coll("dingdan")->count(array("_id"=>array('$regex'=>"^".$dingdan["_id"])));
	$dingdan["fudan"] = $dingdan["_id"];
	$dingdan["_id"] = $dingdan["_id"]."_".$count;
	coll("dingdan")->save($dingdan);
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("zidan"=>$dingdan["_id"])));
	$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$dingdan["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>"生成子单：".jsonEncode($dingdan));
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}else if("xiadan" == $param["caozuo"]){
	$xiadan  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"下单","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$xiadan),'$set'=>array("zhuangtai"=>"下单")));
	echo '{"success":true}';
}else if("shendan" == $param["caozuo"]){
	$shendan  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"审单","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$shendan),'$set'=>array("zhuangtai"=>"审单")));
	echo '{"success":true}';
}else if("jie2dan" == $param["caozuo"]){
	$shendan  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"结单","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$shendan),'$set'=>array("zhuangtai"=>"结单")));
	echo '{"success":true}';
}else if("zuofei" == $param["caozuo"]){
	$shendan  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$shendan),'$set'=>array("zhuangtai"=>"作废")));
	echo '{"success":true}';
}