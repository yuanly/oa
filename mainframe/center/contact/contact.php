<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$contact = getJson();
if(isset($contact["_id"])){//ÐÞ¸Ä
	$_id = $contact["_id"];
	unset($contact["_id"]);
	$contact["access"] = time();
	coll("contact")->update(array("_id"=>$_id),array('$set'=>$contact));
	echo '{"success":true}';
}else{//ÐÂÔö
	$contact["_id"] = (int)getId("contact");
	$contact["access"] = time();
	coll("contact")->save($contact);
	echo '{"success":true}';
}