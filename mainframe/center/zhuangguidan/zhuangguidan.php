<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("xinjian" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"制单","time"=>time());
	$zhuangguidan = array("zhidanzhe"=>$_SESSION["user"]["_id"],"zhuangtai"=>$liucheng["dongzuo"],"liucheng"=>array($liucheng));
	$d = "ZGD".date("ymd",time());
	$n = coll("zhuangguidan")->count(array("_id"=>array('$regex'=>"^".$d."")));
	$zhuangguidan["_id"] = $d.".".($n+1);
	coll("zhuangguidan")->save($zhuangguidan);
	statExpired();
	echo '{"success":true}';
}else if("chaxun" == $param["caozuo"]){
	$query = array();
	$cmd = $param["option"]["cmd"];
	if("daishenhe" == $cmd){
		$query["zhuangtai"] = "申请审核";
	}else if("zhidan" == $cmd){
		$query["zhuangtai"] = "制单";
	}else if(isset($param["option"]["zhuangtai"])){
		$query["zhuangtai"] = $param["option"]["zhuangtai"];
	}
	
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["guihao"])){
		$query["guihao"] = array('$lte'=>$param["option"]["guihao"]);
	}
	if(isset($param["option"]["zhidanzhe"])){
		$query["zhidanzhe"] = $param["option"]["zhidanzhe"];
	}
	if(isset($param["option"]["jiaodanzhe"])){
		$query["jiaodanzhe"] = $param["option"]["jiaodanzhe"];
	}
	if(isset($param["option"]["zhuangguiriqi"])){
		$query["zhuangguiriqi"] = array('$lt'=>$param["option"]["zhuangguiriqi"]);
	}
	if(isset($param["option"]["shenhezhe"])){
		$query["shenhezhe"] = $param["option"]["shenhezhe"];
	}
	$cur = coll("zhuangguidan")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("shenqingshouli" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"申请受理","time"=>time());
	$zhuangguidan = coll("zhuangguidan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>"申请受理")));
	statExpired();
	echo '{"success":true}';
}else if("huitui" == $param["caozuo"]){	
	$obj = coll("zhuangguidan")->findOne(array("_id"=>$param["_id"],"zhuangtai"=>$param["zhuangtai"]));
	if(empty($obj)){
	echo '{"success":false}';
	}
	array_pop($obj["liucheng"]);
	$lastLC = end($obj["liucheng"]);
	$obj["zhuangtai"] = $lastLC["dongzuo"];//刚好状态与流程动作一一对应	
	if($param["zhuangtai"] == "审核"){
		unset($obj["shenhezhe"]);
	}
	if($param["zhuangtai"] == "交单"){
		unset($obj["jiaodanzhe"]);
	}
	coll("zhuangguidan")->save($obj);
	statExpired();
	echo '{"success":true}';
}else if("shanchu" == $param["caozuo"]){
	if(coll("huowu")->count(array("zhuangguidan"=>$param["_id"]))>0){//如果别人接管订单做了处理，而当前用户一直不刷新界面，这种情况就会出现
		echo '{"success":true,"err":"数据不一致，请刷新界面！"}';
		return;
	}
	//coll("zhuangguidan")->remove(array("_id"=>$param["_id"]));
	$zgd = coll("zhuangguidan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"制单"),null,null,array("remove"=>true));
	if(empty($zgd)){
		echo '{"success":true,"err":"数据不一致，请刷新界面！"}';
		return;	
	}
	coll("liuyan")->remove(array("hostType"=>"zhuangguidan","hostId"=>$param["_id"]));
	statExpired();
	echo '{"success":true}';
}else if("jieguan" == $param["caozuo"]){
	coll("zhuangguidan")->update(array("_id"=>$param["_id"]),array('$set'=>array("zhidanzhe"=>$_SESSION["user"]["_id"])));
	$liuyan = array("_id"=>time(),"hostType"=>"zhuangguidan","hostId"=>$param["_id"],"type"=>"caozuorizhi"
			,"userId"=>$_SESSION["user"]["_id"],"neirong"=>"接管：略");//以后改成保存整个json到另外一个表，界面是点击打开就可以像普通单一样显示详情。
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}else if("jiaodan" == $param["caozuo"]){
	$liucheng  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"交单","time"=>time());
	coll("zhuangguidan")->findAndModify(array("_id"=>$param["_id"])
		,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"],"jiaodanzhe"=>$_SESSION["user"]["_id"])));
	statExpired();
	echo '{"success":true}';
}else if("shenhe" == $param["caozuo"]){
	$liucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审核","time"=>time());
	coll("zhuangguidan")->findAndModify(array("_id"=>$param["_id"])
			,array('$push'=>array("liucheng"=>$liucheng),'$set'=>array("zhuangtai"=>$liucheng["dongzuo"],"shenhezhe"=>$_SESSION["user"]["_id"])));
	statExpired();
	echo '{"success":true}';
}else if("getbyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$zgd = coll("zhuangguidan")->findOne($query);
	$cur = coll("huowu")->find(array("zhuangguidan"=>$param["_id"]));//->sort(array("zgdIdx"=>1));
	$zgd["huowu"] = c2a($cur);
	echo  jsonEncode($zgd);
}else if("getbyidforchina" == $param["caozuo"]){//需要关联上商家电话
	$query = array("_id"=>$param["_id"]);
	$zgd = coll("zhuangguidan")->findOne($query);
	$cur = coll("huowu")->find(array("zhuangguidan"=>$param["_id"]));//->sort(array("zgdIdx"=>1));
	$zgd["huowu"] = c2a($cur);
	$ghsIds = [];
	foreach($zgd["huowu"] as $hw){
		$ghsIds[] = $hw["gonghuoshang"]["_id"];
	}
	$ghsIds = array_unique($ghsIds);
	$zgd["gonghuoshangs"] = [];
	foreach($ghsIds as $ghsId){
		$ghs = coll("contact")->findOne(array("_id"=>$ghsId),array("dianhualiebiao"=>1));
		if($ghs){
			$zgd["gonghuoshangs"][] =$ghs;
		}
	}
	echo  jsonEncode($zgd);
}else if("getbyidfortai" == $param["caozuo"]){//打印泰国装柜表，用到很多关联信息，这里先关联好
	$query = array("_id"=>$param["_id"]);
	$zgd = coll("zhuangguidan")->findOne($query);
	$cur = coll("huowu")->find(array("zhuangguidan"=>$param["_id"]),array("yanhuodan"=>0,"guige"=>0));//->sort(array("zgdIdx"=>1));
	$zgd["huowu"] = c2a($cur);
	$ghsIds = [];
	$ddIds = [];
	$ybIds = [];
	foreach($zgd["huowu"] as $hw){
		$ghsIds[] = $hw["gonghuoshang"]["_id"];
		$ddIds[] = substr($hw["dingdanhuowu"],0,stripos($hw["dingdanhuowu"],"H"));
		if(!empty($hw["yangban"]["_id"])){
			$ybIds[] = $hw["yangban"]["_id"];
		}
	}
	$ghsIds = array_unique($ghsIds);
	$ddIds == array_unique($ddIds);
	$ybIds =  array_unique($ybIds);
	$zgd["gonghuoshangs"] = [];
	foreach($ghsIds as $ghsId){
		$ghs = coll("contact")->findOne(array("_id"=>$ghsId),array("bianma"=>1));
		if($ghs){
			$zgd["gonghuoshangs"][] =$ghs;
		}
	}
	$zgd["dingdans"] = [];
	foreach($ddIds as $ddId){
		$dd = coll("dingdan")->findOne(array("_id"=>$ddId),array("huowu"=>1,"taiguoyuangao"=>1,"taiguobianhao"=>1,"taiguoyangban"=>1));
		if($dd){
			$zgd["dingdans"][] = $dd;
		}
	}
	$zgd["yangbans"] = [];
	foreach($ybIds as $ybId){
		$yb = coll("yangban")->findOne(array("_id"=>$ybId),array("taiguoxinghao"=>1,"jianmashu"=>1,"jiandanwei"=>1));
		if($yb){
			$zgd["yangbans"][] = $yb;
		}
	}
	echo  jsonEncode($zgd);
}else if("getdaifubyid" == $param["caozuo"]){
	$query = array("_id"=>$param["_id"]);
	$zgd = coll("zhuangguidan")->findOne($query);
	$cur = coll("huowu")->find(array("zhuangguidan"=>$param["_id"],"daifudanhao"=>array('$exists'=>true),"kehu"=>$param["kehu"]));
	$zgd["huowu"] = c2a($cur);
	echo  jsonEncode($zgd);
}else if("baocun" == $param["caozuo"]){
	$zhuangguidan = $param["zhuangguidan"];	
	coll("huowu")->update(array("zhuangguidan"=>$zhuangguidan["_id"]),
			array('$unset'=>array("zhuangguidan"=>1)),array("multiple"=>true));
	foreach($zhuangguidan["huowu"] as $huowu){
		coll("huowu")->update(array("_id"=>$huowu["_id"]),array('$set'=>array("zhuangguidan"=>$zhuangguidan["_id"],"zgdIdx"=>$huowu["zgdIdx"])));
	}
	unset($zhuangguidan["huowu"]);
	coll("zhuangguidan")->save($zhuangguidan);
	echo '{"success":true}';
}else if("getdingdanbyid" == $param["caozuo"]){
	$one = coll("dingdan")->findOne(array("_id"=>$param["_id"]));
	if(!empty($one["gonghuoshang"])&&!empty($one["gonghuoshang"]["_id"])){//重新关联出完整的样板
		$one["gonghuoshang"] = coll("contact")->findOne(array("_id"=>$one["gonghuoshang"]["_id"]));
	}
	echo jsonEncode($one);
}else if("chalianxiren" == $param["caozuo"]){
	$one = coll("contact")->findOne(array("_id"=>$param["lxrId"]));
	echo jsonEncode($one);
}
