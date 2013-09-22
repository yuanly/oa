<?php
include("./util.php");

$doc = userColl()->findOne(array("user_name"=>"yuanlsy"));
echo true;