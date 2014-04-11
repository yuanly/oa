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
	$yuangao["liucheng"][] = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"上传","time"=>time());
	$yuangao["zhuangtai"] = "上传";
	coll("yuangao")->save($yuangao);
	statExpired();
	echo jsonEncode($yuangao);
}else if("shanchu" == $param["caozuo"]){
	//coll("yuangao")->remove(array("_id"=>$param["_id"],"zhuangtai"=>"上传"));
	$yg = coll("yuangao")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"上传"),null,null,array("remove"=>true));
	if(empty($yg)){
		echo '{"success":true,"err":"数据不一致，请刷新界面!"}';
		return;	
	}
	coll("liuyan")->remove(array("hostType"=>"yuangao","hostId"=>$param["_id"]));
	statExpired();
	echo '{"success":true}';
}else if("zuofei" == $param["caozuo"]){
	$count = coll("dingdan")->count(array("yuangao"=>$param["_id"],"liucheng.dongzuo"=>array('$ne'=>"作废")));
	if($count>0){
		echo '{"success":true,"err":"必须先把该原稿的所有订单删除或作废才能作废原稿！"}';
		exit;
	}
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	//coll("yuangao")->update(array("_id"=>$param["_id"],"jiegaozhe"=>$_SESSION["user"]["_id"],"zhuangtai"=>"接稿"),
	coll("yuangao")->update(array("_id"=>$param["_id"],"jiegaozhe"=>$_SESSION["user"]["_id"]),
								array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	statExpired();
	echo '{"success":true}';
}else if("jiegao" == $param["caozuo"]){
	$jiegaoliucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"接稿","time"=>time());
	coll("yuangao")->update(array("_id"=>$param["_id"],"zhuangtai"=>"上传"),array('$set'=>array("jiegaozhe"=>$_SESSION["user"]["_id"],"zhuangtai"=>"接稿"),'$push'=>array("liucheng"=>$jiegaoliucheng)));
	statExpired();
	echo '{"success":true}';
}else if("jieguan" == $param["caozuo"]){
	coll("yuangao")->update(array("_id"=>$param["_id"]),array('$set'=>array("jiegaozhe"=>$_SESSION["user"]["_id"])));
	//coll("yuangao")->update(array("_id"=>$param["_id"],"liucheng"=>array('$elemMatch'=>array("dongzuo"=>"接稿"))),array('$set'=>array('liucheng.$.userId'=>$_SESSION["user"]["_id"])));
	//coll("yuangao")->update(array("_id"=>$param["_id"],"liucheng"=>array('$elemMatch'=>array("dongzuo"=>"申请审结"))),array('$set'=>array('liucheng.$.userId'=>$_SESSION["user"]["_id"])));
	$liuyan = array("_id"=>time(),"hostType"=>"yuangao","hostId"=>$param["_id"],"type"=>"caozuorizhi"
			,"userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>"接管：略");
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}else if("shenqingshenjie" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请审结","time"=>time());
	coll("yuangao")->update(array("_id"=>$param["_id"],"jiegaozhe"=>$_SESSION["user"]["_id"],"zhuangtai"=>array('$in'=>array("接稿","作废")))
			,array('$set'=>array("zhuangtai"=>$liucheng["dongzuo"]),'$push'=>array("liucheng"=>$liucheng)));			
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请审核","time"=>time());
	coll("dingdan")->update(array("yuangao"=>$param["_id"],"zhuangtai"=>"录单"),
			array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])),array("multiple"=>true));
	statExpired();
	echo '{"success":true}';
}else if("huitui" == $param["caozuo"]){
	$obj = coll("yuangao")->findOne(array("_id"=>$param["_id"],"zhuangtai"=>$param["zhuangtai"]));
	if(empty($obj)){
		echo '{"success":false,"err":"数据异常，请刷新页面！"}';
		return;
	}
	array_pop($obj["liucheng"]);
	$lastLC = end($obj["liucheng"]);
	$obj["zhuangtai"] = $lastLC["dongzuo"];//刚好状态与流程动作一一对应	
	if($param["zhuangtai"] == "审结"){
		unset($obj["shenjiezhe"]);
	}
	coll("yuangao")->save($obj);
	statExpired();
	echo '{"success":true}';
}else if("shenjie" == $param["caozuo"]){
	$dd = coll("dingdan")->findOne(array("yuangao"=>$param["_id"],"zhuangtai"=>"申请审核"));
	if($dd){
		echo '{"err":"订单未审核"}';
	}else{
		$time = time();
		coll("yuangao")->update(array("_id"=>$param["_id"],"zhuangtai"=>"申请审结"),array('$pop'=>array("liucheng"=>1),'$set'=>array("shenjiezhe"=>$_SESSION["user"]["_id"],"shenjieshijian"=>$time,"zhuangtai"=>"审结")));
		coll("yuangao")->update(array("_id"=>$param["_id"],"zhuangtai"=>"审结"),array('$push'=>array("liucheng"=>array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审结","time"=>$time))));
		statExpired();
		echo '{"success":true}';
	}
}else if("beizhu" == $param["caozuo"]){
	coll("yuangao")->update(array("_id"=>$param["_id"]),array('$set'=>array("beizhu"=>$param["beizhu"])));
	echo '{"success":true}';
}else if("taiguoguige" == $param["caozuo"]){
	$cur = coll("taiguige")->find();	
	echo  cur2json($cur);
}else if("zhongguoguige" == $param["caozuo"]){
	$cur = coll("zhongguige")->find();	
	echo  cur2json($cur);
}else if("genggaitaiguodanhao" == $param["caozuo"]){
	$_id = $param["_id"];
	$danhao = $param["danhao"];
	coll("yuangao")->update(array("_id"=>$_id),array('$set'=>array("taiguobianhao"=>$danhao)));
	coll("dingdan")->update(array("yuangao"=>$_id),array('$set'=>array("taiguoyuangao"=>$danhao)),array("multiple"=>true));
	echo '{"success":true}';
}
