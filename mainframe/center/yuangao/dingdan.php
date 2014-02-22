<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("liebiao" == $param["caozuo"]){
	$cur = coll("dingdan")->find(array("yuangao"=>$param["_id"],"zhuangtai"=>array('$ne'=>"删除")))->sort(array("_id"=>1));
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
	$i = 1;
	foreach($dingdan["huowu"] as $k=>$huowu){
		$dingdan["huowu"][$k]["id"] = $dingdan["_id"]."hw".$i;
		$i ++; 
	}
	if(isset($dingdan["beizhu"]) && $dingdan["beizhu"]){
		$liuyan = array("hostType"=>"dingdan","hostId"=>$dingdan["_id"],"type"=>"ludanliuyan","_id"=>time(),"userId"=>$_SESSION["user"]["_id"],"neirong"=>$dingdan["beizhu"]);
		coll("liuyan")->save($liuyan);
		unset($dingdan["beizhu"]);
	}
	$dingdan["zhuangtai"] = "录单";
	$dingdan["liucheng"][]=array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"录单","time"=>time());
	coll("dingdan")->save($dingdan);
	echo '{"success":true}';
}else if("shanchu" == $param["caozuo"]){
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"删除")));
	echo '{"success":true}';
}else if("shenqingshenhe" == $param["caozuo"]){
	$dingdan = coll("dingdan")->findAndModify(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"申请审核")));
	coll("kehu")->update(array("_id"=>$dingdan["kehu"]),array('$set'=>array("access"=>time())),array("upsert"=>true));
	echo '{"success":true}';
}else if("quxiaoshenqing" == $param["caozuo"]){
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"录单")));
	echo '{"success":true}';
}else if("shenhe" == $param["caozuo"]){
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"审核")));
	coll("dingdan")->update(array("_id"=>$param["_id"],"zhuangtai"=>"审核"),array('$push'=>array("liucheng"=>array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审核","time"=>time()))));
	echo '{"success":true}';
}