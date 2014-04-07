<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinjian" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"记账","time"=>time());
	$liushuizhang = array("liucheng"=>array($liucheng),"zhuangtai"=>$liucheng["dongzuo"],"jizhangren"=>$_SESSION["user"]["_id"]);	
	$d = "LSZ".date("ymd",time());
	$n = coll("liushuizhang")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$liushuizhang["_id"] = $d.".".($n+1);
	$zhongtai = coll("config")->findOne(array("_id"=>"zhongtai"));
	$liushuizhang["fukuanfang"] = $zhongtai["zhongtai"]["_id"];
	$liushuizhang["fukuanfangname"] = $zhongtai["zhongtai"]["mingchen"];
	$liushuizhang["fukuanriqi"] = "";//方便查待付流水
	$liushuizhang["yifu"] = false;
	$liushuizhang["shouxufei"]=0;
	coll("liushuizhang")->save($liushuizhang);
	statExpired();
	echo '{"success":true}';
}else if("daishenqingchuanjian" == $param["caozuo"]){
	$shenqings = $param["liushui"]["shenqings"];

	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"记账","time"=>time());
	$liushuizhang = array("liucheng"=>array($liucheng),"zhuangtai"=>$liucheng["dongzuo"]
												,"jine"=>$param["liushui"]["jine"],"jizhangren"=>$_SESSION["user"]["_id"]);	
	if(isset($param["liushui"]["kemu"])){
		$liushuizhang["kemu"] = $param["liushui"]["kemu"];
	}
	$zhongtai = coll("config")->findOne(array("_id"=>"zhongtai"));
	$liushuizhang["fukuanfang"] = $zhongtai["zhongtai"]["_id"];
	$liushuizhang["fukuanfangname"] = $zhongtai["zhongtai"]["mingchen"];	
	$sq = coll("fahuodan")->findOne(array("_id"=>$shenqings[0]));
	if(!empty($sq)){
		$liushuizhang["shoukuanfang"] = $sq["gonghuoshang"]["_id"];
		$liushuizhang["shoukuanfangname"] = $sq["gonghuoshang"]["mingchen"];
	}
	$liushuizhang["fukuanriqi"] = "";
	$liushuizhang["yifu"] = false;
	$liushuizhang["shouxufei"]=0;
	if(!lock()){
			echo '{"success":true,"err","锁冲突，请重试。若连续超过3次冲突请到“其他”模块进行解锁。"}';
			return;
	}
	if(coll("fahuodan")->count(array("_id"=>array('$in'=>$param["liushui"]["shenqings"]),"liushuizhang"=>array('$exists'=>false)))<count($param["liushui"]["shenqings"])){
		echo '{"success":true,"err":"数据冲突，请先刷新界面！"}';	
		unlock();
		return;
	}
	$d = "LSZ".date("ymd",time());
	$n = coll("liushuizhang")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$liushuizhang["_id"] = $d.".".($n+1);
	coll("liushuizhang")->save($liushuizhang);
	coll("fahuodan")->update(array("_id"=>array('$in'=>$param["liushui"]["shenqings"]))
			,array('$set'=>array("liushuizhang"=>array("_id"=>$liushuizhang["_id"],"yifu"=>false))),array("multiple"=>true));
	unlock();
	statExpired();
	echo '{"success":true,"_id":"'.$liushuizhang["_id"].'"}';
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
	/*if(isset($param["option"]["zhifuriqi"])){
		$query["fukuanriqi"] = array('$lte'=>$param["option"]["zhifuriqi"]);
	}*/
	if(isset($param["option"]["kemu"])){
		$query["kemu"] = $param["option"]["kemu"];
	}
	if(isset($param["option"]["jizhangren"])){
		$query["jizhangren"] = $param["option"]["jizhangren"];
	}
	if($param["option"]["cmd"] == "daifu"){
		$query["fukuanriqi"] = "";
	}
	$cur = coll("liushuizhang")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("shanchu" == $param["caozuo"]){
	if(!lock()){
			echo '{"success":true,"err","锁冲突，请重试。若连续超过3次冲突请到“其他”模块进行解锁。"}';
			return;
	}
	$one = coll("liushuizhang")->findOne(array("_id"=>$param["_id"],"jizhangren"=>$_SESSION["user"]["_id"],"zhuangtai"=>"记账"));
	if(empty($one)){
		echo '{"success":true}';
		unlock();
		return;
	}
	coll("fahuodan")->update(array("liushuizhang._id"=>$one["_id"])
			,array('$unset'=>array("liushuizhang"=>1)),array("multiple"=>true));
	$lsz = coll("liushuizhang")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"记账"),null,null,array("remove"=>true));
	unlock();
	if(empty($lsz)){
		echo '{"success":true,"err":"数据不一致，请刷新界面!"}';
		return;	
	}	
	coll("liuyan")->remove(array("hostType"=>"liushuizhang","hostId"=>$param["_id"]));
	statExpired();
	echo '{"success":true}';
}else if("huitui" == $param["caozuo"]){//
	$obj = coll("liushuizhang")->findOne(array("_id"=>$param["_id"],"zhuangtai"=>$param["zhuangtai"]));
	if(empty($obj)){
		echo '{"success":true,"err":"后台数据异常，请刷新界面！"}';
	}
	array_pop($obj["liucheng"]);
	$lastLC = end($obj["liucheng"]);
	$obj["zhuangtai"] = $lastLC["dongzuo"];//刚好状态与流程动作一一对应	
	coll("liushuizhang")->save($obj);
	statExpired();
	echo '{"success":true}';
}else if("fukuan" == $param["caozuo"]){
	if(!lock()){
			echo '{"success":true,"err","锁冲突，请重试。若连续超过3次冲突请到“其他”模块进行解锁。"}';
			return;
	}
	$ls = coll("liushuizhang")->findOne(array("_id"=>$param["_id"],"jizhangren"=>$_SESSION["user"]["_id"],"zhuangtai"=>"记账"));
	if(empty($ls)){
		echo '{"success":true,"err":"数据异常！"}';
		unlock();
		return;
	}
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"付款","time"=>time());
	$ls["liucheng"][] = $liucheng;
	$ls["zhuangtai"] = $liucheng["dongzuo"];
	$ls["yifu"] = true;
	//更新付款账户和收款账号余额
	$ls["fukuanzhanghaoyue"] = getBalance($ls["fukuanfang"],$ls["fukuanzhanghao"])-$ls["jine"]-$ls["shouxufei"];
	if(empty($ls["zhuanrujine"])){
		$skjine = $ls["jine"];
	}else{
		$skjine = $ls["zhuanrujine"];
	}
	$ls["shoukuanzhanghaoyue"] = getBalance($ls["shoukuanfang"],$ls["shoukuanzhanghao"])+$skjine;
	$ls["lastupdatetime"] = time();
	coll("liushuizhang")->save($ls);
	//更新所有关联的付款申请
	coll("fahuodan")->update(array("liushuizhang._id"=>$ls["_id"])
			,array('$set'=>array("liushuizhang.yifu"=>true)),array("multiple"=>true));
	unlock();
	statExpired();
	echo '{"success":true}';
}else if("shenqingfuhe" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请复核","time"=>time());
	$lsz = coll("liushuizhang")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>array('$in'=>array("付款","作废")),"jizhangren"=>$_SESSION["user"]["_id"])
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	if(empty($lsz)){
		echo '{"success":true,"err":"数据不一致，请刷新界面。"}';
		return;
	}
	statExpired();
	echo '{"success":true}';
}else if("fuhe" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"复核","time"=>time());
	$lsz = coll("liushuizhang")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"申请复核")
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"])));
	if(empty($lsz)){
		echo '{"success":true,"err":"数据不一致，请刷新界面。"}';
		return;
	}
	statExpired();
	echo '{"success":true}';
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$lsz = coll("liushuizhang")->findOne($query);
	if(!empty($lsz)){
		$cur = coll("fahuodan")->find(array("liushuizhang._id"=>$lsz["_id"]),array("neirong"=>0,"qitafei"=>0,"liucheng"=>0))->sort(array("_id"=>1));
		$lsz["shenqings"] = cur2obj($cur);
	}
	echo  jsonEncode($lsz);
}else if("baocun" == $param["caozuo"]){//要考虑关联的发货单的变化！
	$liushuizhang = $param["liushuizhang"];
	if(!lock()){
			echo '{"success":true,"err","锁冲突，请重试。若连续超过3次冲突请到“其他”模块进行解锁。"}';
			return;
	}
	$one = coll("liushuizhang")->findOne(array("_id"=>$liushuizhang["_id"],"zhuangtai"=>"记账"));
	if(empty($one)){
		echo '{"success":true,"err":"记账状态已发生变化，请刷新页面。"}';	
		unlock();
		return;
	}
	if($liushuizhang["shenqingsyibian"]){//由客户端告知是否已经修改了申请
		//删除已关联的
		coll("fahuodan")->update(array("liushuizhang._id"=>$one["_id"])
				,array('$unset'=>array("liushuizhang"=>1)),array("multiple"=>true));
		//按新数据重新关联
		if(!empty($liushuizhang["shenqings"])){
			coll("fahuodan")->update(array("_id"=>array('$in'=>$liushuizhang["shenqings"]))
					,array('$set'=>array("liushuizhang"=>array("_id"=>$liushuizhang["_id"],"yifu"=>false))),array("multiple"=>true));
		}
		unset($liushuizhang["shenqingsyibian"]);
	}
	unset($liushuizhang["shenqings"]);
	coll("liushuizhang")->save($liushuizhang);//还在“记账”阶段，不用考虑余额的事情。
	unlock();
	echo '{"success":true}';
}else if("zuofei" == $param["caozuo"]){//重算余额和去关联
	$cur = coll("fahuodan")->find(array("liushuizhang._id"=>$param["_id"]));
	$str = "作废,付款申请：";
	foreach($cur as $sq){
		if(empty($sq["kemu"])){
			$km = "货款";
		}else{
			$km = $sq["kemu"];
		}
		$str .= "<br/>".$sq["_id"]."，".$km.$sq["zongjine"]."元，".$sq["gonghuoshang"]["mingchen"]." 申请者ID：".$sq["ludanzhe"];
	}
	if(!lock()){
			echo '{"success":true,"err","锁冲突，请重试。若连续超过3次冲突请到“其他”模块进行解锁。"}';
			return;
	}
	$ls = coll("liushuizhang")->findOne(array("_id"=>$param["_id"],"zhuangtai"=>"付款","jizhangren"=>$_SESSION["user"]["_id"]));
	if( empty($ls)){
		echo '{"success":true,"err":"记账状态已发生变化，请刷新页面。"}';	
		unlock();
		return;
	}
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	$ls["liucheng"][]=$liucheng;
	$ls["zhuangtai"] = $liucheng["dongzuo"];
	//更新付款账户和收款账号余额
	$ls["fukuanzhanghaoyue"] = getBalance($ls["fukuanfang"],$ls["fukuanzhanghao"]) + $ls["jine"];
	if(empty($ls["zhuanrujine"])){
		$skjine = $ls["jine"];
	}else{
		$skjine = $ls["zhuanrujine"];
	}
	$ls["shoukuanzhanghaoyue"] = getBalance($ls["fukuanfang"],$ls["fukuanzhanghao"]) - $skjine;
	$ls["lastupdatetime"] = time();
	coll("liushuizhang")->save($ls);
	//删除所有关联的付款申请
	if($cur->count()>0){
		coll("fahuodan")->update(array("liushuizhang._id"=>$ls["_id"])
			,array('$unset'=>array("liushuizhang"=>1)),array("multiple"=>true));
	}
	unlock();
	$liuyan = array("_id"=>time(),"hostType"=>"liushuizhang","hostId"=>$param["_id"],"type"=>"caozuorizhi"
			,"userId"=>$_SESSION["user"]["_id"],"neirong"=>$str);
	coll("liuyan")->save($liuyan);
	statExpired();
	echo '{"success":true}';
}else if("tongji" == $param["caozuo"]){
	$query = array("yifu"=>true,"liucheng.dongzuo"=>array('$ne'=>"作废"),
			"fukuanriqi"=>array('$gte'=>$param["option"]["kaishiriqi"],'$lte'=>$param["option"]["jieshuriqi"]));
	if(isset($param["option"]["kemu"])){
		$query["kemu"] = $param["option"]["kemu"];
	}
	if(isset($param["option"]["zhanghao"])){
		$query['$or'] = array(array("fukuanfang"=>$param["option"]["lxrId"],"fukuanzhanghao"=>$param["option"]["zhanghao"]),
								 							array("shoukuanfang"=>$param["option"]["lxrId"],"shoukuanzhanghao"=>$param["option"]["zhanghao"]));
	}else{
		$query['$or'] = array(array("fukuanfang"=>$param["option"]["lxrId"]),
								 							array("shoukuanfang"=>$param["option"]["lxrId"]));
	}
	$cur = coll("liushuizhang")->find($query)->sort(array("_id",-1));
	echo  cur2json($cur);
}else if("chayue" == $param["caozuo"]){//出现死锁时调用
	echo getBalance($param["lxrId"],$param["zhanghao"]);	
}else if("unlock" == $param["caozuo"]){//出现死锁时调用
	unlock();
	echo '{"success":true}';
}

//帐号余额被记录在每一笔流水里。最新流水（根据lastupdatetime判断，包括作废的）就是最新的余额，这样可以保证更新流水和余额在一个事务里完成。
function getBalance($lxrId,$zhanghao){
	$cur = coll("liushuizhang")->find(array('$or'=>array(array("fukuanfang"=>$lxrId,"fukuanzhanghao"=>$zhanghao),array("shoukuanfang"=>$lxrId,"shoukuanzhanghao"=>$zhanghao))))->sort(array("lastupdatetime"=>-1))->limit(1);
	if($cur->hasNext()){
		$liushui = $cur->getNext();
	}else{
		return 0;
	}
	if(isset($liushui["lastupdatetime"])){
		if($liushui["fukuanfang"] == $lxrId && $liushui["fukuanzhanghao"] == $zhanghao){
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