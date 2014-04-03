<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("liebiao" == $param["caozuo"]){
	$cur = coll("dingdan")->find(array("yuangao"=>$param["_id"]))->sort(array("taiguobianhao"=>1));
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
	if(empty($dingdan["_id"])){
		$dingdan["_id"] = "DD".date("ymd",time());
		$n = coll("dingdan")->count(array("_id"=>array('$regex'=>"^".$dingdan["_id"])));
		$dingdan["_id"] .=".".($n+1);
	}else{//有_id说明是“修改”操作。要考虑比人已经接管的情况。
		$one = coll("dingdan")->findOne(array("_id"=>$dingdan["_id"],"zhuangtai"=>"录单"));
		if(empty($one)){
			echo '{"success":true,"err":"数据不一致，可能已被接管，请刷新界面!"}';
			return;
		}
	}
	$i = 1;
	foreach($dingdan["huowu"] as $k=>$huowu){
		$dingdan["huowu"][$k]["id"] = $dingdan["_id"]."HW".$i;
		$i ++; 
	}
	if(isset($dingdan["beizhu"])){// && $dingdan["beizhu"]){
		$liuyan = array("hostType"=>"dingdan","hostId"=>$dingdan["_id"],"type"=>"ludanliuyan","_id"=>time(),"userId"=>$_SESSION["user"]["_id"],"neirong"=>$dingdan["beizhu"]);
		coll("liuyan")->remove(array("hostType"=>"dingdan","hostId"=>$dingdan["_id"],"type"=>"ludanliuyan"));
		coll("liuyan")->save($liuyan);
		unset($dingdan["beizhu"]);
	}
	$dingdan["zhuangtai"] = "录单";
	$dingdan["mandan"] = false;
	$dingdan["liucheng"][]=array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"录单","time"=>time());
	coll("dingdan")->save($dingdan);
	foreach($dingdan["huowu"] as $huowu){
		$gg = $huowu["taiguoguige"];
		$pos = strpos($gg,"#");
		if($pos!==false){
			$gg = trim(substr($gg,$pos+1));
		}
		coll("taiguige")->save(array("_id"=>$gg));
		$gg = $huowu["guige"];
		$pos = strpos($gg,"#");
		if($pos!==false){
			$gg = trim(substr($gg,$pos+1));
		}
		coll("zhongguige")->save(array("_id"=>$gg));
	}
	echo '{"success":true}';
}else if("shanchu" == $param["caozuo"]){
	$dd = coll("dingdan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"录单"),null,null,array("remove"=>true));
	if(empty($dd)){
		echo '{"success":true,"err":"数据不一致，请刷新界面!"}';
		return;	
	}
	coll("liuyan")->remove(array("hostType"=>"dingdan","hostId"=>$param["_id"]));
	echo '{"success":true}';
}else if("shenqingshenhe" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请审核","time"=>time());
	$dd = coll("dingdan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"录单"),
			array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])),null,array("new"=>true));
	if(empty($dd)){
		echo '{"success":true,"err":"数据不一致，请刷新界面!"}';
		return;
	}
	statExpired();
	echo jsonEncode($dd);
}else if("quxiaoshenqing" == $param["caozuo"]){
	$obj = coll("dingdan")->findOne(array("_id"=>$param["_id"],"zhuangtai"=>"申请审核"));
	if(empty($obj)){
		echo '{"success":true,"err":"后台数据异常，请刷新界面！"}';
		return;
	}
	array_pop($obj["liucheng"]);
	$lastLC = end($obj["liucheng"]);
	$obj["zhuangtai"] = $lastLC["dongzuo"];//刚好状态与流程动作一一对应	
	coll("dingdan")->save($obj);
	statExpired();
	echo jsonEncode($obj);
}else if("shenhe" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审核","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"],"zhuangtai"=>"申请审核"),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("getbyid" == $param["caozuo"]){
	$dd = coll("dingdan")->findOne(array("_id"=>$param["_id"]));
	$ludanliuyan = coll("liuyan")->findOne(array("hostId"=>$dd["_id"],"hostType"=>"dingdan","type"=>"ludanliuyan"));
	if($ludanliuyan){
		$dd["ludanbeizhu"]=$ludanliuyan["neirong"];
	}
	echo jsonEncode($dd);
}