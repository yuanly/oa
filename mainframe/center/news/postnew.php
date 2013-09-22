<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$new = getJson();
$new["_id"] = getId("news");
$new["user"] = (int)$_SESSION["user"]["_id"];
$new["time"] = time();
$ret = newsColl()->save($new);
if(!$ret["err"]){
	echo '{"success":true}';
}else{
	echo '{"success":false,"err":"'.$ret["err"].'"}';
}