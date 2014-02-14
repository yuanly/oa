<?php
include("../../../util.php");
session_start();
checkuser();
  
$newId = $_REQUEST["newId"];
$replies = newsReplyColl()->find(array("newId"=>(int)$newId))->sort(array("_id"=>1));
coll("news")->update(array("_id"=>(int)$newId),array('$inc'=>array("read"=>1)));
echo json_encode(c2a($replies));
	