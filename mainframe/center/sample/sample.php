<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$yangban = getJson();
$yangban["access"] = time();
coll("yangban")->save($yangban);
echo '{"success":true}';