<?php
include("../../../util.php");
session_start();
checkuser();

$pagesize = 20;
$page = $_REQUEST["page"];
$type = $_REQUEST["type"];
if($type){
	$news = newsColl()->find(array("type"=>$type))->sort(array("time"=>-1))->skip($page * $pagesize)->limit($pagesize);
}else{
	$news = newsColl()->find()->sort(array("time"=>-1))->skip($page * $pagesize)->limit($pagesize);	
} 
echo json_encode(c2a($news));