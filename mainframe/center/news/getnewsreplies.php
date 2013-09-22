<?php
include("../../../util.php");
session_start();
checkuser();
  
$newId = $_REQUEST["newId"];
$replies = newsReplyColl()->find(array("newId"=>(int)$newId))->sort(array("_id"=>1));
echo json_encode(c2a($replies));
	