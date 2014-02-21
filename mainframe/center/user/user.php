<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$usr = getJson();
if(isset($usr["_id"])){//修改
	$_id = $usr["_id"];
	unset($usr["_id"]);
	coll("contact")->update(array("_id"=>$_id),array('$set'=>$usr));
}
/*
else{//新增
	//先确保名称不重复
	if(userColl()->findOne(array("user_name"=>$usr["user_name"]))){
		echo '{"err":"用户名已存在！"}';
		return;
	}
	$usr["_id"] = (int)getId("user");
	userColl()->save($usr);
	echo '{"success":true}';
}
*/