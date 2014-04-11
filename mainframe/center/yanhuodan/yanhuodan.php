<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinjian" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"制单","time"=>time());
	$yanhuodan = array("zhidanzhe"=>$_SESSION["user"]["_id"],"zhuangtai"=>$liucheng["dongzuo"],"liucheng"=>array($liucheng));
	$d = "YHD".date("ymd",time());
	$n = coll("yanhuodan")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$yanhuodan["_id"] = $d.".".($n+1);
	coll("yanhuodan")->save($yanhuodan);
	statExpired();
	echo '{"success":true}';
}else if("chaxun" == $param["caozuo"]){
	$query = array();
	if(isset($param["option"]["zhuangtai"])){
		$query["zhuangtai"] = $param["option"]["zhuangtai"];
	}
	
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["zhidanzhe"])){
		$query["zhidanzhe"] = $param["option"]["zhidanzhe"];
	}
	if(isset($param["option"]["shoulizhe"])){
		$query["shoulizhe"] = $param["option"]["shoulizhe"];
	}
	if(isset($param["option"]["shenhezhe"])){
		$query["shenhezhe"] = $param["option"]["shenhezhe"];
	}
	$cur = coll("yanhuodan")->find($query,array("yanhuoshougao"=>0))->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("shenqingshouli" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请受理","time"=>time());
	coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"制单","zhidanzhe"=>$_SESSION["user"]["_id"])
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("huitui" == $param["caozuo"]){
	$obj = coll("yanhuodan")->findOne(array("_id"=>$param["_id"],"zhuangtai"=>$param["zhuangtai"]));
	if(empty($obj)){
		echo '{"success":false,"err":"数据异常，请刷新页面！"}';
		return;
	}
	array_pop($obj["liucheng"]);
	$lastLC = end($obj["liucheng"]);
	$obj["zhuangtai"] = $lastLC["dongzuo"];//刚好状态与流程动作一一对应	
	if($param["zhuangtai"] == "审核"){
		unset($obj["shenhezhe"]);
	}
	if($param["zhuangtai"] == "受理"){
		unset($obj["shoulizhe"]);
	}
	coll("yanhuodan")->save($obj);
	statExpired();
	echo '{"success":true}';
}else if("shanchu" == $param["caozuo"]){
	if(coll("huowu")->count(array("yanghuodan._id"=>$param["_id"]))>0){
		echo '{"success":true,"err":"数据不一致，请刷新界面!"}';
		return;	
	}
	$yhd = coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"制单"),null,null,array("remove"=>true));
	if(empty($yhd)){
		echo '{"success":true,"err":"数据不一致，请刷新界面!"}';
		return;	
	}
	coll("liuyan")->remove(array("hostType"=>"yanhuodan","hostId"=>$param["_id"]));
	statExpired();
	echo '{"success":true}';
}else if("shouli" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"受理","time"=>time());
	coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"申请受理")
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("shoulizhe"=>$_SESSION["user"]["_id"],"zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("jieguan" == $param["caozuo"]){
	coll("yanhuodan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhidanzhe"=>$_SESSION["user"]["_id"])));
	$liuyan = array("_id"=>time(),"hostType"=>"yanhuodan","hostId"=>$param["_id"],"type"=>"caozuorizhi"
			,"userId"=>$_SESSION["user"]["_id"],"neirong"=>"接管：略");//以后改成保存整个json到另外一个表，界面是点击打开就可以像普通单一样显示详情。
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}else if("shenqingshenhe" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请审核","time"=>time());
	coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"受理","shoulizhe"=>$_SESSION["user"]["_id"])
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("shenhe" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审核","time"=>time());
	coll("yanhuodan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"申请受理")
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("shenhezhe"=>$_SESSION["user"]["_id"],"zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
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
