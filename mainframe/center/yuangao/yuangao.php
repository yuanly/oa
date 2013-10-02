<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$yangban = getJson();
$yangban["access"] = time();
coll("yangban")->save($yangban);
$liuyan = array("_id"=>time(),"hostType"=>"yangban","hostId"=>$yangban["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>"提交：".jsonEncode($yangban));
coll("liuyan")->save($liuyan);
echo '{"success":true}';