<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
$version = $param["version"];
//{_id:"stat",version:323,expired:true,yuangao:32433,...} 每次流程变更就setExpired();
$stat = coll("config")->findOne(array("_id"=>"stat"));
if(empty($stat) || $stat["expired"] ){//更新stat
	$yuangao = coll("yuangao")->count(array("zhuangtai"=>array('$in'=>array("上传","接稿","申请审结"))));
	$dingdan = coll("dingdan")->count(array("zhuangtai"=>"审核"));
	$dingdan2 = coll("dingdan")->count(array("zhuangtai"=>array('$in'=>array("审核","接单","等版","子单","下单","审单"))));
	$fahuodan = coll("fanhuodan")->count(array("zhuangtai"=>"申请对单"));
	$fahuodan2 = coll("fanhuodan")->count(array("zhuangtai"=>array('$in'=>array("申请对单","对单","付款","发货"))));
	$yanhuodan = coll("yanhuodan")->count(array("zhuangtai"=>"申请审核"));
	$yanhuodan2 = coll("yanhuodan")->count(array("zhuangtai"=>array('$in'=>array("新建","申请受理","受理","申请审核"))));
	$zhuangguidan = coll("zhuangguidan")->count(array("zhuangtai"=>"申请审核"));
	$zhuangguidan2 = coll("zhuangguidan")->count(array("zhuangtai"=>array('$in'=>array("制单","交单","申请审核"))));
	$jizhang = coll("liushuizhang")->count(array("zhuangtai"=>"申请审核"));
	$tuishui = coll("tuishui")->count(array("zhuangtai"=>array('$in'=>array("新建","装柜","报关","付款","开票","单证"))));
	$stat = array("yuangao"=>$yuangao,
								"dingdan"=>$dingdan,
								"dingdan2"=>$dingdan2,
								"fahuodan"=>$fahuodan,
								"fahuodan2"=>$fahuodan2,
								"yanhuodan"=>$yanhuodan,
								"yanhuodan2"=>$yanhuodan2,
								"zhuangguidan"=>$zhuangguidan,
								"zhuangguidan2"=>$zhuangguidan2,
								"jizhang"=>$jizhang,
								"tuishui"=>$tuishui,
								"version"=>time(),
								"expired"=>false,
								"_id"=>"stat");
	coll("config")->save($stat);
}
echo jsonEncode($stat);


