<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$yangban = getJson();
$yangban["access"] = time();
coll("yangban")->save($yangban);
$jg = "";
foreach($yangban["jiage"] as $jiage){
	$jg = $jg."【".$jiage["beizhu"].$jiage["zhi"]."元】";
}
$str = "提交【编号：".$yangban["_id"]."，泰国型号：".$yangban["taiguoxinghao"]."，中国型号：".$yangban["zhongguoxinghao"].
		"，价格：".$jg."，单位：".$yangban["danwei"]."，商家：".$yangban["shangjia"]["mingchen"]."，议价者：".$yangban["yijiazhe"].
		"，议价日期：".$yangban["yijiariqi"]."，状态：".$yangban["zhuangtai"]."，备注：<br/>".$yangban["beizhu"]."】";
$liuyan = array("_id"=>time(),"hostType"=>"yangban","hostId"=>$yangban["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>$str);
coll("liuyan")->save($liuyan);
echo '{"success":true}';