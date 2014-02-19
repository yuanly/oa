<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("getdingdanbeizhu" == $param["caozuo"]){
	$jiedanliucheng = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"接单","time"=>time());
	$one = coll("props")->findOne(array("key"=>"queshengbeizhu"));
	if(!empty($one)){
		$beizhu=$one["value"];//q缺省备注
	}else{
		$beizhu="";
	}
	$dingdan = coll("dingdan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"审核"),array('$set'=>array("zhuangtai"=>"接单","gendanyuan"=>(String)$_SESSION["user"]["_id"],"beizhu"=>$beizhu),'$push'=>array("liucheng"=>$jiedanliucheng)));
	unset($dingdan["liucheng"]);unset($dingdan["zhuangtai"]);
	$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$param["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>"接单：".jsonEncode($dingdan));
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}else if("tijiaodingdanbeizhu" == $param["caozuo"]){
	$dingdan = $param["dingdan"];
	coll("dingdan")->save($dingdan);
	echo '{"success":true}';
}
