<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinjian" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"记账","time"=>time());
	$liushuizhang = array("liucheng"=>array($liucheng),"zhuangtai"=>"记账","jizhangren"=>$_SESSION["user"]["_id"]);	
	$d = "LSZ".date("ymd",time());
	$n = coll("liushuizhang")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$liushuizhang["_id"] = $d.".".($n+1);
	$zhongtai = coll("config")->findOne(array("_id"=>"zhongtai"));
	$liushuizhang["fukuanfang"] = $zhongtai["zhongtai"]["_id"];
	$liushuizhang["fukuanfangname"] = $zhongtai["zhongtai"]["mingchen"];
	coll("liushuizhang")->save($liushuizhang);
	echo '{"success":true}';
}else if("chaxun" == $param["caozuo"]){
	$query = array();
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["zhuangtai"])){
		$query["zhuangtai"] = $param["option"]["zhuangtai"];
	}
	if(isset($param["option"]["fukuanfang"])){
		$query["fukuanfang"] = $param["option"]["fukuanfang"];
	}
	if(isset($param["option"]["shoukuanfang"])){
		$query["shoukuanfang"] = $param["option"]["shoukuanfang"];
	}
	if(isset($param["option"]["zhifuriqi"])){
		$query["fukuanriqi"] = array('$lte'=>$param["option"]["zhifuriqi"]);
	}
	if(isset($param["option"]["kemu"])){
		$query["kemu"] = $param["option"]["kemu"];
	}
	if(isset($param["option"]["jizhangren"])){
		$query["jizhangren"] = $param["option"]["jizhangren"];
	}
	$cur = coll("liushuizhang")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("shenqingshenhe" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请审核","time"=>time());
	$liushuizhang = coll("liushuizhang")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"申请审核")));
	echo '{"success":true}';
}else if("quxiaoshenqingshenhe" == $param["caozuo"]){
	coll("liushuizhang")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"记账"),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("shenhe" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审核","time"=>time());
	$liushuizhang = coll("liushuizhang")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"审核","shenhezhe"=>$_SESSION["user"]["_id"])));
	echo '{"success":true}';
}else if("quxiaoshenhe" == $param["caozuo"]){
	coll("liushuizhang")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>"申请审核"),'$unset'=>array("shenhezhe"=>1),'$pop'=>array("liucheng"=>1)));
	echo '{"success":true}';
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$lsz = coll("liushuizhang")->findOne($query);
	echo  jsonEncode($lsz);
}else if("baocun" == $param["caozuo"]){//余额计算，要考虑并发和事务性
	$liushuizhang = $param["liushuizhang"];
	if(empty($liushuizhang["fukuanriqi"])){//不涉及余额，直接覆盖
		coll("liushuizhang")->save($liushuizhang);
	}else{
		if(!lock()){
				echo '{"success":false}';
				return;
		}
		$old = coll("liushuizhang")->findOne(array("_id"=>$liushuizhang["_id"]));
		if(!empty($old["fukuanriqi"])){
			$oldfukuanjine = $old["jine"];
			if(isset($old["zhuanrujine"])){
				$oldshoukuanjine = $old["zhuanrujine"];
			}else{
				$oldshoukuanjine = $old["jine"];
			}
		}else{
			$oldfukuanjine = 0;
			$oldshoukuanjine = 0;
		}
		$fukuanchae = $liushuizhang["jine"]-$oldfukuanjine;
		if(isset($liushuizhang["zhuanrujine"])){
			$shoukuanchae = $liushuizhang["zhuanrujine"] - $oldshoukuanjine;
		}else{
			$shoukuanchae = $liushuizhang["jine"] - $oldshoukuanjine;
		}
		$liushuizhang["fukuanzhanghaoyue"] = getBalance($liushuizhang["fukuanfang"],$liushuizhang["fukuanfangzhanghao"]) - $fukuanchae;
		$liushuizhang["shoukuanzhanghaoyue"] = getBalance($liushuizhang["shoukuanfang"],$liushuizhang["shoukuanfangzhanghao"]) + $shoukuanchae;
		$liushuizhang["lastupdatetime"] = time();
		coll("liushuizhang")->save($liushuizhang);
		unlock();
	}
	echo '{"success":true}';
}else if("zuofei" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	if(!lock()){
		echo '{"success":false}';
		return;
	}
	//$liushuizhang = coll("liushuizhang")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"作废")),null,array("new"=>true));
	$liushuizhang = coll("liushuizhang")->findOne(array("_id"=>$param["_id"]));
	$liushuizhang["liucheng"][] = $zuofeiliucheng;
	if(!empty($liushuizhang["fukuanriqi"])){
		$fukuanchae = $liushuizhang["jine"];
		if(isset($liushuizhang["zhuanrujine"])){
			$shoukuanfangchae = $liushuizhang["zhuanrujine"];
		}else{
			$shoukuanfangchae = $liushuizhang["jine"];
		}
		$liushuizhang["fukuanzhanghaoyue"] = getBalance($liushuizhang["fukuanfang"],$liushuizhang["fukuanfangzhanghao"]) + $fukuanchae;
		$liushuizhang["shoukuanzhanghaoyue"] = getBalance($liushuizhang["shoukuanfang"],$liushuizhang["shoukuanfangzhanghao"]) - $shoukuanchae;
		$liushuizhang["lastupdatetime"] = time();
		coll("liushuizhang")->save($liushuizhang);
	}
	unlock();
	echo '{"success":true}';
}else if("tongji" == $param["caozuo"]){
	$query = array('$or'=>array(array("fukuanfang"=>$param["option"]["lxrId"]),array("shoukuanfang"=>$param["option"]["lxrId"])),"fukuanriqi"=>array('$gte'=>$param["option"]["kaishiriqi"],'$lte'=>$param["option"]["jieshuriqi"]));
	if(isset($param["option"]["kemu"])){
		$query["kemu"] = $param["option"]["kemu"];
	}
	$query["zhuangtai"] = array('$ne'=>"作废");
	$cur = coll("liushuizhang")->find($query)->sort(array("_id",-1));
	echo  cur2json($cur);
}else if("unlock" == $param["caozuo"]){//出现死锁时调用
	unlock();
}

function getBalance($lxrId,$zhanghao){
	$cur = coll("liushuizhang")->find(array('$or'=>array(array("fukuanfang"=>$lxrId,"fukuanfangzhanghao"=>$zhanghao),array("shoukuanfang"=>$lxrId,"shoukuanfangzhanghao"=>$zhanghao))))->sort(array("lastupdatetime"=>-1))->limit(1);
	if($cur->hasNext()){
		$liushui = $cur->getNext();
	}else{
		return 0;
	}
	if(isset($liushui["lastupdatetime"])){
		if($liushui["fukuanfang"] == $lxrId && $liushui["fukuanfangzhanghao"] == $zhanghao){
			return $liushui["fukuanzhanghaoyue"];
		}else{
			return $liushui["shoukuanzhanghaoyue"];
		}
	}else{
		return 0;
	}
}

function lock(){
	$retval = coll("config")->findAndModify(array("_id"=>"locker"),array('$set'=>array("locked"=>true)),null,array("new"=>false,"upsert"=>true));
	if(isset($retval["locked"]) && $retval["locked"]){
		return false;
	}else{
		return true;
	}
}

function unlock(){
	coll("config")->update(array("_id"=>"locker"),array('$set'=>array("locked"=>false)));
}