<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinjian" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"新建","time"=>time());
	$yanhuodan = array("chuangjianzhe"=>$_SESSION["user"]["_id"],"zhuangtai"=>"新建","liucheng"=>array($liucheng));
	$d = "YHD".date("ymd",time());
	$n = coll("yanhuodan")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$yanhuodan["_id"] = $d.".".($n+1);
	coll("yanhuodan")->save($yanhuodan);
	echo '{"success":true}';
}else if("chaxun" == $param["caozuo"]){
	$query = array();	
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["zhuangtai"])){
		$query["zhuangtai"] = $param["option"]["zhuangtai"];
	}
	if(isset($param["option"]["chuangjianzhe"])){
		$query["chuangjianzhe"] = $param["option"]["chuangjianzhe"];
	}
	if(isset($param["option"]["shoulizhe"])){
		$query["shoulizhe"] = $param["option"]["shoulizhe"];
	}
	if(isset($param["option"]["shenhezhe"])){
		$query["shenhezhe"] = $param["option"]["shenhezhe"];
	}
	$cur = coll("yanhuodan")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("shenqingshouli" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请受理","time"=>time());
	$yanhuodan = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"申请受理")));
	echo '{"success":true}';
}else if("quxiaoshenqingshouli" == $param["caozuo"]){
	coll("yanhuodan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"新建"),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("zuofei" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	$yanhuodan = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"作废")));
	echo '{"success":true}';
}else if("shouli" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"受理","time"=>time());
	$yanhuodan = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"受理")));
	echo '{"success":true}';
}else if("shenqingshenhe" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请审核","time"=>time());
	$yanhuodan = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"申请审核")));
	echo '{"success":true}';
}else if("quxiaoshenqingshenhe" == $param["caozuo"]){
	coll("yanhuodan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"受理"),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("shenhe" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审核","time"=>time());
	$yanhuodan = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"审核")));
	echo '{"success":true}';
}else if("quxiaoshenhe" == $param["caozuo"]){
	coll("yanhuodan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"申请审核"),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$fhd = coll("yanhuodan")->findOne($query);
	$cur = coll("huowu")->find(array("yanhuodan"=>$param["_id"]))->sort(array("yhdIdx"=>1));
	$zgd["huowu"] = c2a($cur);
	echo  jsonEncode($fhd);
}else if("baocun" == $param["caozuo"]){
	//huowu:{    yanhuodan:{_id:"xxx",index:1(在验货单中的位置),zhuangtai:"待查/通过/不通过",beizhu:[{riqi:"xxx",zhu:"xxx"},{}...]},}
	$yanhuodan = $param["yanhuodan"];	
	coll("huowu")->update(array("yanhuodan._id"=>$yanhuodan["_id"]),array('$unset'=>array("yanhuodan"=>1)),array("multiple"=>true));
	foreach($yanhuodan["huowu"] as $huowu){
		//yanghuodan{huowu:[{_id:"货物id",yanhuodan:{_id:"xxx",index:1,zhuangtai:"待查/通过/不通过",beizhu:[{riqi:"xxx",zhu:"xxx"},{}...]},}}]}
		coll("huowu")->update(array("_id"=>$huowu["_id"]),array('$set'=>array("yanhuodan"=>$huowu["yanhuodan"])));
	}
	unset($yanhuodan["huowu"]);
	coll("yanhuodan")->save($yanhuodan);
	echo '{"success":true}';
}else if("chaxunhuowu" == $param["caozuo"]){
	$fhdId = $param["option"]["fhdId"];
	$query = array();
	if($fhdId){
		$query = array("_id"=>array('$lt'=>$fhdId));
	}
	$cur = coll("huowu")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("huowu" == $param["caozuo"]){
	$query = array("yanhuodan._id"=>$param["_id"]);
	$cur = coll("huowu")->find($query);
	echo  cur2json($cur);
}
