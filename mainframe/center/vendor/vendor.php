<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$vendor = getJson();
if(isset($vendor["_id"])){//修改
	$_id = $vendor["_id"];
	unset($vendor["_id"]);
	$one = vendorColl()->findOne(array("mingchen"=>$vendor["mingchen"],"_id"=>array('$ne'=>$_id)));
	if($one){
		echo '{"err":"用户名已存在！"}';
		return;
	}
	$vendor["access"] = time();
	vendorColl()->update(array("_id"=>$_id),array('$set'=>$vendor));
	echo '{"success":true}';
}else{//新增
	//先确保名称不重复
	if(vendorColl()->findOne(array("mingchen"=>$vendor["mingchen"]))){
		echo '{"err":"用户名已存在！"}';
		return;
	}
	$vendor["_id"] = (int)getId("vendor");
	$vendor["access"] = time();
	vendorColl()->save($vendor);
	echo '{"success":true}';
}