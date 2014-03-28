<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

//保存|新增
$yangban = getJson();
$yangban["access"] = time();
if(empty($yangban["_id"])){
	$d = date("ymd",time());
	$n = coll("yangban")->count(array("_id"=>array('$regex'=>"^YB".$d."")));
	$yangban["_id"] = "YB".$d.".".($n+1);
}
coll("yangban")->save($yangban);
$jg = "";
foreach($yangban["jiage"] as $jiage){
	$jg = $jg."【".$jiage["beizhu"].$jiage["zhi"]."元】";
}
$str = "提交【编号：".$yangban["_id"]."，泰国型号：".$yangban["taiguoxinghao"]."，中国型号：".$yangban["zhongguoxinghao"].
		"，价格：".$jg."，单位：".$yangban["danwei"]."，商家：".getShangjia($yangban)."，议价者：".getYijiazhe($yangban).
		"，议价日期：".$yangban["yijiariqi"]."，状态：".$yangban["zhuangtai"]."，备注：<br/>".$yangban["beizhu"]."】";
$liuyan = array("_id"=>time(),"hostType"=>"yangban","hostId"=>$yangban["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>$str);
coll("liuyan")->save($liuyan);
echo '{"success":true}';

function getYijiazhe($yangban){
	if(empty($yangban["yijiazhe"])){
		return "";
	}else{
		return $yangban["yijiazhe"];
	}
}
function getShangjia($yangban){
	if(empty($yangban["shangjia"])){
		return "";
	}else{
		return $yangban["shangjia"]["mingchen"];
	}
}