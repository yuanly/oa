<?php
include("../../../util.php");
session_start();
checkuser();

$reply = getJson();
$reply["_id"] = getId("newsReply");
$reply["user"] = (int)$_SESSION["user"]["_id"];
$reply["time"] = time();
$ret = newsReplyColl()->save($reply);
if(!$ret["err"]){
	coll("news")->update(array("_id"=>$reply["newId"]),array('$set'=>array("last"=>time())));
	echo '{"success":true}';	
}else{
	echo '{"success":false,"err":"'.$ret["err"].'"}';
}
	