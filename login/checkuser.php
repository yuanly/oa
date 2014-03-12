<?php /* Created on: 2008-01-05 */ 
include("../util.php");	 
session_start(); 
 
//如果帐号密码正确则进入主界面
//否则回到登录页面
if(isset($_REQUEST["user_id"])){
	$user_id = trim($_REQUEST["user_id"]);
}
if(isset($_REQUEST["password"])){
	$password = trim($_REQUEST["password"]);
}

if (!check_user(urldecode($user_id), $password)){
	logColl()->save(array("action"=>"checkuser","user"=>$_SESSION['user']["mingchen"],"result"=>"fail"));
	echo "false";
}else{
	logColl()->save(array("action"=>"checkuser","user"=>$_SESSION['user']["mingchen"],"result"=>"success","time"=>date("Y/m/d H:i:s",time())));
	echo "true";
}


function check_user($user_id, $password){
	unset($_SESSION["rand"]);
	unset($_SESSION["no_access_ctrl"]);
	//$doc = userColl()->findOne(array("_id"=>(int)$user_id));
	$doc = coll("contact")->findOne(array("_id"=>$user_id));
	if($doc && (!isset($doc["password"]) || $doc["password"]==$password)){
		$doc["user_name"]=$doc["mingchen"];
		$_SESSION['user']=$doc;
		return true;
	}
	return false;
}
?>
