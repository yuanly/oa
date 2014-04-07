<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$new = getJson();
$new["_id"] = getId("news");
$new["user"] = $_SESSION["user"]["_id"];
$new["time"] = time();
$new["last"] = $new["time"];
$new["read"] = 0;
$new["reply"] = 0;
$ret = newsColl()->save($new);
if(!$ret["err"]){
	statExpired();
	echo '{"success":true}';
}else{
	echo '{"success":false,"err":"'.$ret["err"].'"}';
}