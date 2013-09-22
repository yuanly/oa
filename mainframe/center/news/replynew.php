<?php
include("../util.php");
session_start();
checkuser();

$reply = getJson();
$reply["_id"] = getId("newsReply");
$reply["user"] = $_SESSION["user_id"];
$reply["time"] = time();
$ret = newsReplyColl()->save($reply);
if(!$ret["err"]){
	echo '{"success":true}';
}else{
	echo '{"success":false,"err":"'.$ret["err"].'"}';
}
	