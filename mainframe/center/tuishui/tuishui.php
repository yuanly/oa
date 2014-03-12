<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinjian" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"新建","time"=>time());
	$tuishui = array("gendanyuan"=>$_SESSION["user"]["_id"],"zhuangtai"=>"新建","liucheng"=>array($liucheng));
	$d = "TS".date("ymd",time());
	$n = coll("tuishui")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$tuishui["_id"] = $d.".".($n+1);
	$cfg = coll("config")->findOne(array("_id"=>"zuixinhuilv"));
	$tuishui["huilv"]=$cfg["zuixinhuilv"];
	$cfg = coll("config")->findOne(array("_id"=>"zengzhishuilv"));
	$tuishui["zengzhishuilv"]=$cfg["zengzhishuilv"];
	$cfg = coll("config")->findOne(array("_id"=>"tuishuilv"));
	$tuishui["tuishuilv"]=$cfg["tuishuilv"];
	coll("tuishui")->save($tuishui);
	statExpired();
	echo '{"success":true}';
}else if("chaxun" == $param["caozuo"]){
	$query = array();	
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["guihao"])){
		$query["huogui.guihao"] = $param["option"]["guihao"];
	}
	$cur = coll("tuishui")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("chaxun2" == $param["caozuo"]){
	$query = array("zhuangtai"=>array('$ne'=>"作废"));	
	if(!empty($param["option"])){
		$query["_id"] = array('$lt'=>$param["option"]);
	}
	$cur = coll("tuishui")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$ts = coll("tuishui")->findOne($query);
	echo  jsonEncode($ts);
}else if("zhuanggui" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"装柜","time"=>time());
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"装柜")));
	statExpired();
	echo '{"success":true}';
}else if("baoguan" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"报关","time"=>time());
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"报关")));
	echo '{"success":true}';
}else if("fukuan" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"付款","time"=>time());
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"付款")));
	statExpired();
	echo '{"success":true}';
}else if("kaipiao" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"开票","time"=>time());
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"开票")));
	statExpired();
	echo '{"success":true}';
}else if("danzheng" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"单证","time"=>time());
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"单证")));
	statExpired();
	echo '{"success":true}';
}else if("tuishui" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"退税","time"=>time());
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"退税")));
	statExpired();
	echo '{"success":true}';
}else if("quxiao" == $param["caozuo"]){
	$tuishui = coll("tuishui")->findOne(array("_id"=>$param["_id"]));
	$len = count($tuishui["liucheng"]);
	$zhuangtai = $tuishui["liucheng"][$len -2]["dongzuo"];
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhuangtai"=>$zhuangtai),'$pop'=>array("liucheng"=>1)));
	statExpired();
	echo '{"success":true}';
}else if("jieguan" == $param["caozuo"]){
	coll("tuishui")->update(array("_id"=>$param["_id"]),array('$set'=>array("gendanyuan"=>$_SESSION["user"]["_id"])));
	echo '{"success":true}';
}else if("chazhuangguidan" == $param["caozuo"]){
	$query = array();
	if($param["option"]){
		$query = array("_id"=>array('$lte'=>$param["option"]));
	}
	$query["zhuangtai"] = array('$ne'=>"作废");
	$cur = coll("zhuangguidan")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("baocun" == $param["caozuo"]){
	$tuishui = $param["tuishui"];
	coll("tuishui")->save($tuishui);
	echo '{"success":true}';
}else if("chadailishang" == $param["caozuo"]){
	$query = array("leixing"=>"商家");
	if($param["option"]){
		$query["mingchen"] = array('$regex'=>$param["option"]);
	}
	$cur = coll("contact")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("chazhanghao" == $param["caozuo"]){
	$query = array("_id"=>$param["lxrId"]);
	$lxr = coll("contact")->findOne($query);
	if(isset($lxr["zhanghuliebiao"])){
		echo  jsonEncode($lxr["zhanghuliebiao"]);
	}else{
		echo "[]";
	}
}else if("getyue" == $param["caozuo"]){
	echo getBalance($param["lxrId"],$param["zhanghao"]);
}else if("chaliushui" == $param["caozuo"]){
	$query = array();
	if($param["option"]){
		$query = array("_id"=>array('$lt'=>$param["option"]));
	}
	$query["zhuangtai"] = array('$ne'=>"作废");
	$cur = coll("liushuizhang")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("zuofei" == $param["caozuo"]){
	$zuofeiliucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	$tuishui = coll("tuishui")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zuofeiliucheng),'$set'=>array("zhuangtai"=>"作废")));
	statExpired();
	echo '{"success":true}';
}else if("tongji" == $param["caozuo"]){
	$query = array("zhuangtai"=>array('$ne'=>"作废"));	
	if(isset($param["option"]["kaishibianhao"])){
		$query["_id"]['$gte'] = $param["option"]["kaishibianhao"];
	}
	if(isset($param["option"]["jieshubianhao"])){
		$query["_id"]['$lte'] = $param["option"]["jieshubianhao"];
	}
	if(isset($param["option"]["liwai"])){
		$query["_id"]['$nin'] = $param["option"]["liwai"];
	}
	$cur = coll("tuishui")->find($query);
	echo  cur2json($cur);
}else if("huilvfactor" == $param["caozuo"]){//这里根据预先推定好的公式计算出汇率调整比例
	$z = coll("config")->findOne(array("_id"=>"zengzhishuilv"));
	$t = coll("config")->findOne(array("_id"=>"tuishuilv"));
	$v = (1+$z["zengzhishuilv"]/100)/(1+$z["zengzhishuilv"]/100-$t["tuishuilv"]/100);
	echo $v;
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
