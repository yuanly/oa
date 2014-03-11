<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("getdingdanbeizhu" == $param["caozuo"]){
	$beizhu = coll("config")->findOne(array("_id"=>"dingdanbeizhu"));
	echo jsonEncode($beizhu);
}else if("tijiaodingdanbeizhu" == $param["caozuo"]){
	$beizhu = $param["beizhu"];
	coll("config")->save(array("_id"=>"dingdanbeizhu","beizhu"=>$beizhu));
	echo '{"success":true}';
}else if("lianxirenliebiao" == $param["caozuo"]){
	$query  = array("leixing"=>"商家");
	if(""!=$param["option"]){
		$query = array("leixing"=>"商家","mingchen"=>array('$regex'=>$param["option"]));
	}
	$cur = coll("contact")->find($query)->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("getzhongtai" == $param["caozuo"]){
	$zhongtai = coll("config")->findOne(array("_id"=>"zhongtai"));
	echo jsonEncode($zhongtai);
}else if("savezhongtai" == $param["caozuo"]){
	$zhongtai = $param["zhongtai"];
	coll("config")->save(array("_id"=>"zhongtai","zhongtai"=>$zhongtai));
	echo '{"success":true}';
}else if("rizhi" == $param["caozuo"]){
	$cur = logColl()->find()->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}
