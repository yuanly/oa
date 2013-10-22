<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("shangchuan" == $param["caozuo"]){
	$yuangao = $param["yuangao"];
	$yuangao["shangchuanshijian"] = time();
	$d = "YG".date("ymd",$yuangao["shangchuanshijian"]);
	$n = coll("yuangao")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$yuangao["_id"] = $d.".".($n+1);
	$yuangao["liucheng"] = array();
	$yuangao["liucheng"][] = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"上传","time"=>time());
	$yuangao["zhuangtai"] = "上传";
	coll("yuangao")->save($yuangao);
	echo jsonEncode($yuangao);
}else if("shanchu" == $param["caozuo"]){
	coll("yuangao")->update(array("_id"=>$param["_id"],"zhuangtai"=>"上传"),array('$set'=>array("zhuangtai"=>"删除")));
	echo '{"success":true}';
}else if("jiegao" == $param["caozuo"]){
	$jiegaoliucheng = array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"接稿","time"=>time());
	coll("yuangao")->update(array("_id"=>$param["_id"],"zhuangtai"=>"上传"),array('$set'=>array("jiegaozhe"=>(int)$_SESSION["user"]["_id"],"zhuangtai"=>"接稿"),'$push'=>array("liucheng"=>$jiegaoliucheng)));
	echo '{"success":true}';
}else if("jieguan" == $param["caozuo"]){
	coll("yuangao")->update(array("_id"=>$param["_id"]),array('$set'=>array("jiegaozhe"=>(int)$_SESSION["user"]["_id"])));
	coll("yuangao")->update(array("_id"=>$param["_id"],"liucheng"=>array('$elemMatch'=>array("dongzuo"=>"接稿"))),array('$set'=>array('liucheng.$.userId'=>(int)$_SESSION["user"]["_id"])));
	coll("yuangao")->update(array("_id"=>$param["_id"],"liucheng"=>array('$elemMatch'=>array("dongzuo"=>"申请审结"))),array('$set'=>array('liucheng.$.userId'=>(int)$_SESSION["user"]["_id"])));
	echo '{"success":true}';
}else if("shenqingshenjie" == $param["caozuo"]){
	coll("yuangao")->update(array("_id"=>$param["_id"],"jiegaozhe"=>(int)$_SESSION["user"]["_id"]),array('$set'=>array("zhuangtai"=>"申请审结"),'$push'=>array("liucheng"=>array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"申请审结","time"=>time()))));
	coll("dingdan")->update(array("yuangao"=>$param["_id"],"zhuangtai"=>"录单"),array('$set'=>array("zhuangtai"=>"申请审核")),array("multiple"=>true));
	echo '{"success":true}';
}else if("quxiaoshenqingshenjie" == $param["caozuo"]){
	coll("yuangao")->update(array("_id"=>$param["_id"],"jiegaozhe"=>(int)$_SESSION["user"]["_id"]),array('$set'=>array("zhuangtai"=>"接稿"),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("shenjie" == $param["caozuo"]){
	$dd = coll("dingdan")->findOne(array("yuangao"=>$param["_id"],"zhuangtai"=>"申请审核"));
	if($dd){
		echo '{"err":"订单未审核"}';
	}else{
		$time = time();
		coll("yuangao")->update(array("_id"=>$param["_id"],"zhuangtai"=>"申请审结"),array('$pop'=>array("liucheng"=>1),'$set'=>array("shenjiezhe"=>(int)$_SESSION["user"]["_id"],"shenjieshijian"=>$time,"zhuangtai"=>"审结","shenjieshuoming"=>$param["shuoming"])));
		coll("yuangao")->update(array("_id"=>$param["_id"],"zhuangtai"=>"审结"),array('$push'=>array("liucheng"=>array("userId"=>(int)$_SESSION["user"]["_id"],"dongzuo"=>"审结","time"=>$time))));
		echo '{"success":true}';
	}
}