<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$param = getJson();
if("chaxun" == $param["caozuo"]){
	$query = array();	
	if(isset($param["option"]["bianhao"])){
		$query["_id"] = array('$lt'=>$param["option"]["bianhao"]);
	}
	if(isset($param["option"]["gonghuoshang"])){
		$query["gonghuoshang._id"] = $param["option"]["gonghuoshang"];
	};
	if(isset($param["option"]["yangban"])){
		$query["yangban._id"] = $param["option"]["yangban"];
	}
	if(isset($param["option"]["quyu"])){
		$query["gonghuoshang.quyu"] = $param["option"]["quyu"];
	}
	if(isset($param["option"]["kehu"])){
		$query["kehu"] = $param["option"]["kehu"];
	}
	if(isset($param["option"]["dingdan"])){
		$query["dingdanhuowu"] = array('$regex'=>"^".$param["option"]["dingdan"]);
	}
	if(isset($param["option"]["zhuangtai"])){
		if("已装柜" == $param["option"]["zhuangtai"]){
			$query["zhuangguidan"] = array('$exists'=>true);
		}else if("未装柜" == $param["option"]["zhuangtai"]){
			$query["zhuangguidan"] = array('$exists'=>false);
		}else if("未备货" == $param["option"]["zhuangtai"]){
			$query["beihuo"] = array('$exists'=>false);
		}else if("未检验" == $param["option"]["zhuangtai"]){
			$query["beihuo"] = array('$exists'=>true);
			$query["yanhuodan.zhuangtai"] = array('$exists'=>false);//array('$ne'=>true);
		}else{
			$query["beihuo"] = array('$exists'=>true);
			$query["yanhuodan.zhuangtai"] = $param["option"]["zhuangtai"];
		}
	}
		
	$cur = coll("huowu")->find($query)->sort(array("_id"=>-1))->skip($param["offset"])->limit($param["limit"]);
	echo  cur2json($cur);
}else if("chadingdanhuowu" == $param["caozuo"]){
	$ddhw = $param["dingdanhuowu"];
	$hw = coll("huowu")->findOne(array("dingdanhuowu"=>$ddhw));
	if(empty($hw)){
		echo '{"success":true}';
	}else{
		echo '{"success":true,"fahuodan":"'.$hw["fahuodan"].'"}';
	}
}