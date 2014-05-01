<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("chashangjia" == $param["caozuo"]){
	$query = array("leixing"=>"商家");
	if(!empty($param["option"])){
		if(isUpper($param["option"])){
			$query["py"] = upper($param["option"]);
		}else{
			$query["mingchen"] = array('$regex'=>$param["option"]);
		}
	}
	$cur = coll("contact")->find($query)->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("chalianxiren" == $param["caozuo"]){
	$query = array();
	if(!empty($param["option"])){
		if(isUpper($param["option"])){
			$query["py"] = upper($param["option"]);
		}else{
			$query["mingchen"] = array('$regex'=>$param["option"]);
		}
	}
	$cur = coll("contact")->find($query)->sort(array("access"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("chongming" == $param["caozuo"]){
	$contact = $param["contact"];
	$count = coll("contact")->count(array("mingchen"=>$contact["mingchen"]));
	if((empty($contact["_id"]) && $count>0) || ($count>1)){
		echo '{"success":true,"err":"重名了"}';
	}else{
		echo '{"success":true}';
	}
}else if("haiguanmajiancha" == $param["caozuo"]){
	if(empty($param["_id"])){
		if(coll("contact")->findOne(array("haiguanma"=>$param["haiguanma"]))){
			echo '{"success":true,"err":"海关码重复了！"}';
			return;
		}
	}else{
		if(coll("contact")->findOne(array("haiguanma"=>$param["haiguanma"],"_id"=>array('$ne'=>$param["_id"])))){
			echo '{"success":true,"err":"海关码重复了！"}';
			return;
		}
	} 
	echo '{"success":true}'; 
}else if("access" == $param["caozuo"]){
	coll("contact")->update(array("_id"=>$param["_id"]),array('$set'=>array("access"=>time())));
	echo '{"success":true}'; 
}