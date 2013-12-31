<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("shangchuan" == $param["caozuo"]){
	$shangchuanliucheng = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"上传","time"=>time());
	$fahuodan = $param["fahuodan"];
	$fahuodan["zhuangtai"] = "上传";
	$fahuodan["liucheng"][] = $shangchuanliucheng;
	$d = "FHD".date("ymd",time());
	$n = coll("fahuodan")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$fahuodan["_id"] = $d.".".($n+1);
	coll("fahuodan")->save($fahuodan);
	echo '{"success":true}';
}else if("ludan" == $param["caozuo"]){
	$ludanliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"录单","time"=>time());
	$fahuodan = coll("fahuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$ludanliucheng),'$set'=>array("zhuangtai"=>"录单")));
	echo '{"success":true}';
}else if("zuofei" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	$fahuodan = coll("fahuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"作废")));
	echo '{"success":true}';
}else if("duidan" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"对单","time"=>time());
	$fahuodan = coll("fahuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"对单")));
	echo '{"success":true}';
}else if("fukuan" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"付款","time"=>time());
	$fahuodan = coll("fahuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"付款")));
	echo '{"success":true}';
}else if("fahuo" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"发货","time"=>time());
	$fahuodan = coll("fahuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"发货")));
	echo '{"success":true}';
}else if("fuhe" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"复核","time"=>time());
	$fahuodan = coll("fahuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"复核")));
	echo '{"success":true}';
}else if("shenqingduidan" == $param["caozuo"]){
	$shenqingduidanliucheng  = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"申请对单","time"=>time());
	$fahuodan = coll("fahuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$shenqingduidanliucheng),'$set'=>array("zhuangtai"=>"申请对单")));
	echo '{"success":true}';
}else if("quxiaoshenqingduidan" == $param["caozuo"]){
	coll("fahuodan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"录单"),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$fhd = coll("fahuodan")->findOne($query);
	echo  jsonEncode($fhd);
}else if("chaxun" == $param["caozuo"]){
	$query = array();
	$cur = coll("fahuodan")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("baocun" == $param["caozuo"]){
	$fahuodan = $param["fahuodan"];
	$id = $fahuodan["_id"];
	unset($fahuodan["liucheng"]);
	unset($fahuodan["_id"]);
	coll("fahuodan")->update(array("_id"=>$id),array('$set'=>$fahuodan));
	foreach($fahuodan["huowu"] as $huowu){
		if($huowu["dingdan"]){
			foreach($huowu["dingdan"] as $dingdan){
				coll("dingdan")->update(array("_id"=>$dingdan["dingdanId"]),array('$addToSet'=>array("fahuodans"=>$id)));
			}
		}
	}
	echo '{"success":true}';
}