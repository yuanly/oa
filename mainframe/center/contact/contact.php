<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$contact = getJson();
if(isset($contact["_id"])){//修改
	$contact["access"] = time();
	$old = coll("contact")->findOne(array("_id"=>$contact["_id"]));
	coll("contact")->save($contact);//在客户端确保对象各属性被完整回传
	//需要检查 mingchen py quyu 是否发生了改变，若变，则需要更新关联的样板和订单。
	if(!empty($old)){
		/*这个操作不是很妥，可能消耗很大！但要实现在其他表里能按这些属性搜索，貌似没有更好的办法。*/
		if($old["mingchen"] != $contact["mingchen"] || $old["quyu"] != $contact["quyu"]){
			$obj = array("_id"=>$old["_id"],"mingchen"=>$contact["mingchen"],"py"=>$contact["py"],"quyu"=>$contact["quyu"]);
			coll("yangban")->update(array("shangjia._id"=>$old["_id"]),array('$set'=>array("shangjia"=>$obj)),array("multiple"=>true));
			unset($obj["py"]);//订单不要py
			coll("dingdan")->update(array("gonghuoshang._id"=>$old["_id"]),array('$set'=>array("gonghuoshang"=>$obj)),array("multiple"=>true));
			coll("huowu")->update(array("gonghuoshang._id"=>$old["_id"]),array('$set'=>array("gonghuoshang"=>$obj)),array("multiple"=>true));
		}
	}
	echo '{"success":true}';
}else{//新增
	$contact["_id"] = "LXR".getId("contact");
	$contact["access"] = time();
	coll("contact")->save($contact);
	echo '{"success":true}';
}