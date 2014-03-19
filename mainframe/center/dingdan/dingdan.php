<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("jiedan" == $param["caozuo"]){
	$jiedanliucheng = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"接单","time"=>time());
	$one = coll("config")->findOne(array("_id"=>"dingdanbeizhu"));
	if(!empty($one)){
		$beizhu=$one["beizhu"];//q缺省备注
	}else{
		$beizhu="";
	}
	$dingdan = coll("dingdan")->findAndModify(array("_id"=>$param["_id"],"zhuangtai"=>"审核"),array('$set'=>array("zhuangtai"=>"接单","gendanyuan"=>(String)$_SESSION["user"]["_id"],"beizhu"=>$beizhu),'$push'=>array("liucheng"=>$jiedanliucheng)));
	unset($dingdan["liucheng"]);unset($dingdan["zhuangtai"]);
	$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$param["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>"接单：".jsonEncode($dingdan));
	coll("liuyan")->save($liuyan);
	statExpired();
	echo '{"success":true}';
}else if("baocun" == $param["caozuo"]){
	$dingdan = $param["dingdan"];
	$old = coll("dingdan")->findOne(array("_id"=>$dingdan["_id"]),array("gendanyuan"=>1));
	if($_SESSION["user"]["_id"] != $old["gendanyuan"]){//因为有接管功能，所以保存的时候有可能跟单员已经改变
		echo '{"success":false}';
		return;
	}
	if(!empty($dingdan["gonghuoshang"])){
		coll("contact")->update(array("_id"=>$dingdan["gonghuoshang"]["_id"]),array('$set'=>array("access"=>time())));
	}
	if(!empty($dingdan["yangban"])){
		coll("yangban")->update(array("_id"=>$dingdan["yangban"]["_id"]),array('$set'=>array("access"=>time())));
	}
	coll("dingdan")->save($dingdan);
	echo '{"success":true}';
}else if("jieguan" == $param["caozuo"]){
	$dingdan = coll("dingdan")->findAndModify(array("_id"=>$param["_id"]),array('$set'=>array("gendanyuan"=>(String)$_SESSION["user"]["_id"])));
	$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$param["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>"接管：".jsonEncode($dingdan));
	coll("liuyan")->save($liuyan);
	echo '{"success":true}';
}else if("ludan" == $param["caozuo"]){
	$dingdan = coll("dingdan")->findOne(array("_id"=>$param["_id"]),array("yuangao"=>1,"kehu"=>1,"gendanyuan"=>1,"zhuangtai"=>1,"huowu"=>1,"liucheng"=>1));
	$count = coll("dingdan")->count(array("_id"=>array('$regex'=>"^".$dingdan["_id"])));
	$dingdan["fudan"] = $dingdan["_id"];
	$dingdan["_id"] = $dingdan["_id"]."_".$count;
	$liucheng = $dingdan["liucheng"];
	$dingdan["liucheng"] = array();
	foreach($liucheng as $i=>$v){
		$dingdan["liucheng"][] = $v;
		if($v["dongzuo"] == "接单"){
			break;
		}
	}
	coll("dingdan")->save($dingdan);
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("zidan"=>$dingdan["_id"])));
	$liuyan = array("_id"=>time(),"hostType"=>"dingdan","hostId"=>$dingdan["_id"],"type"=>"caozuorizhi","userId"=>(String)$_SESSION["user"]["_id"],"neirong"=>"生成子单：".jsonEncode($dingdan));
	coll("liuyan")->save($liuyan);
	echo '{"success":true,"id":'.$dingdan["_id"].'}';
}else if("xiadan" == $param["caozuo"]){
	$xiadan  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"下单","time"=>time());
	$dingdan = coll("dingdan")->findAndModify(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$xiadan),'$set'=>array("xiadanshijian"=>time(),"zhuangtai"=>"下单")));
	//coll("kehu")->update(array("_id"=>$dingdan["kehu"]),array('$set'=>array("access"=>time())),true,false);
	//coll("kehu")->update(array("_id"=>$dingdan["kehu"]),array('$set'=>array("access"=>time())),array("upsert"=>true));
	//coll("vendor")->update(array("_id"=>$dingdan["gonghuoshang"]["_id"]),array('$set'=>array("access"=>time())));
	statExpired();
	echo '{"success":true}';
}else if("shendan" == $param["caozuo"]){
	$shendan  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"审单","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$shendan),'$set'=>array("zhuangtai"=>"审单")));
	statExpired();
	echo '{"success":true}';
}else if("jie2dan" == $param["caozuo"]){
	$shendan  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"结单","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$shendan),'$set'=>array("zhuangtai"=>"结单")));
	statExpired();
	echo '{"success":true}';
}else if("zuofei" == $param["caozuo"]){
	$shendan  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"作废","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$shendan),'$set'=>array("zhuangtai"=>"作废")));
	statExpired();
	echo '{"success":true}';
}else if("dengban" == $param["caozuo"]){
	$dengban  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"等版","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$dengban),'$set'=>array("zhuangtai"=>"等版")));
	statExpired();
	echo '{"success":true}';
}else if("zidan" == $param["caozuo"]){
	$zidan  = array("userId"=>$_SESSION["user"]["_id"],"dongzuo"=>"子单","time"=>time());
	coll("dingdan")->update(array("_id"=>$param["_id"]),array('$push'=>array("liucheng"=>$zidan),'$set'=>array("zhuangtai"=>"子单")));
	statExpired();
	echo '{"success":true}';
}else if("gethuowubyid2" == $param["caozuo"]){
	$dingdan  = coll("dingdan")->findOne(array("huowu.id"=>$param["huowuId"]));
	foreach($dingdan["huowu"] as $huowu){
		if($huowu["id"] == $param["huowuId"]){
			$huowu["kehu"] = $dingdan["kehu"];
			$huowu["yangban"] = $dingdan["yangban"];
			echo jsonEncode($huowu);
			exit;
		}
	}
	echo '{"success":false}';
}else if("gethuowubyid" == $param["caozuo"]){//应该不需要了，改成gethuowubyid2，在fahuodan.js中调用
	$dingdan  = coll("dingdan")->findOne(array("huowu.id"=>$param["huowuId"]));
	foreach($dingdan["huowu"] as $huowu){
		if($huowu["id"] == $param["huowuId"]){
			echo jsonEncode($huowu);
			exit;
		}
	}
	echo '{"success":false}';
}else if("lianxiren" == $param["caozuo"]){
	$query  = array("leixing"=>"个人");
	if(""!=$param["option"]){
		$query = array("leixing"=>"个人","mingchen"=>array('$regex'=>$param["option"]));
	}
	$cur = coll("contact")->find($query)->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("shangjia" == $param["caozuo"]){
	$query  = array("leixing"=>"商家");
	if(""!=$param["option"]){
		$query = array("leixing"=>"商家","mingchen"=>array('$regex'=>$param["option"]));
	}
	$cur = coll("contact")->find($query)->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("huowu" == $param["caozuo"]){
	//$query = array("dingdanhuowu"=>'/^'.$param["_id"].'/');
	$query = array("dingdanhuowu"=>array('$regex'=>'^'.$param["_id"]));
	$cur = coll("huowu")->find($query);
	echo  cur2json($cur);
}
