<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("liebiao" == $param["caozuo"]){
	$cur = coll("dingdan")->find(array("yuangao"=>$param["_id"],"zhuangtai"=>array('$ne'=>"shanchu")))->sort(array("_id"=>1));
	if(!$cur){
		echo "[]";
	}
	$a = array();
	foreach($cur as $dingdan){
		$ludanliuyan = coll("liuyan")->findOne(array("hostId"=>$dingdan["_id"],"hostType"=>"dingdan","type"=>"ludanliuyan"));
		if($ludanliuyan){
			$dingdan["ludanbeizhu"]=$ludanliuyan["neirong"];
		}
		$a[] = $dingdan;
	}
	echo jsonEncode($a);
}else if("ludan" == $param["caozuo"]){
	$dingdan = $param["dingdan"];
	$dingdan["_id"] = "DD".date("ymd",time());
	$n = coll("dingdan")->count(array("_id"=>array('$regex'=>"^".$dingdan["_id"])));
	$dingdan["_id"] .=".".($n+1);
	if(isset($dingdan["beizhu"]) && $dingdan["beizhu"]){
		$liuyan = array("hostType"=>"dingdan","hostId"=>$dingdan["_id"],"type"=>"ludanliuyan","_id"=>time(),"userId"=>(int)$_SESSION["user"]["_id"],"neirong"=>$dingdan["beizhu"]);
		coll("liuyan")->save($liuyan);
		unset($dingdan["beizhu"]);
	}
	$dingdan["zhuangtai"] = "录单";
	coll("dingdan")->save($dingdan);
	echo '{"success":true}';
}else if("shanchu" == $param["caozuo"]){
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"shanchu")));
	echo '{"success":true}';
}