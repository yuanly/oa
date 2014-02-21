<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$contact = getJson();
if(isset($contact["_id"])){//修改
	$contact["access"] = time();
	coll("contact")->save($contact);//在客户端确保对象各属性被完整回传
	/*
	$_id = $contact["_id"];
	unset($contact["_id"]);
	//var_dump($contact);
	coll("contact")->update(array("_id"=>$_id),array('$set'=>$contact));	
	*/
	echo '{"success":true}';
}else{//新增
	$contact["_id"] = "LXR".getId("contact");
	$contact["access"] = time();
	coll("contact")->save($contact);
	echo '{"success":true}';
}