<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("chaxun" == $param["caozuo"]){
	$day = $param["day"];
	$cur = coll("richeng")->find(array("_id"=>array('$gte'=>$day,'$lt'=>($day+14))));
	echo  cur2json($cur);
}else if("baocun" == $param["caozuo"]){
	$richeng = $param["richeng"];
	coll("richeng")->save($richeng);
	echo '{"success":true}';
}else if("rcorder" == $param["caozuo"]){
	coll("contact")->update(array("_id"=>$param["lxrId"]),array('$set'=>array("rcOrder"=>$param["rcOrder"])));
	echo '{"success":true}';
}else if("reorder" == $param["caozuo"]){
	$order = $param["order"];
	coll("contact")->update(array("_id"=>$order["id"]),array('$set'=>array("rcOrder"=>$order["lastOrder"])));
	coll("contact")->update(array("_id"=>$order["lastId"]),array('$set'=>array("rcOrder"=>$order["order"])));
	echo '{"success":true}';
}