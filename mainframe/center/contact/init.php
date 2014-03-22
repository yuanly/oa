<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");

if(coll("contact")->count()>0){
	$db = new MongoClient();
	//$db->oa->createCollection("taiguige",array("capped"=>true,"max"=>100));
	$db->oa->command(array("create"=>"taiguige","capped"=>true,"size"=>1024*1024,"max"=>10));
	$db->oa->command(array("create"=>"zhongguige","capped"=>true,"size"=>1024*1024,"max"=>100));
	echo "已初始化！";
}else{
	$db = new MongoClient();
	$db->oa->command(array("create"=>"taiguige","capped"=>true,"size"=>1024*1024,"max"=>100));
	$db->oa->command(array("create"=>"zhongguige","capped"=>true,"size"=>1024*1024,"max"=>100));
	
	getId("contact");
	coll("contact")->save(array("_id"=>"LXR0","mingchen"=>"中泰华伦进出口有限公司","leixing"=>"商家"));//设置公司联系人
	getId("contact");
	coll("contact")->save(array("_id"=>"LXR1","mingchen"=>"袁立宇","leixing"=>"个人","role"=>"root","password"=>"1","shangjia"=>array("_id"=>"LXR0","mingchen"=>"中泰华伦进出口有限公司")));//设置系统管理员
	$zhongtai = coll("contact")->findOne(array("_id"=>"LXR0"));
	coll("config")->save(array("_id"=>"zhongtai","zhongtai"=>$zhongtai));//设置公司
	coll("config")->save(array("_id"=>"zengzhishuilv","zengzhishuilv"=>17));//设置增值税率
	coll("config")->save(array("_id"=>"tuishuilv","tuishuilv"=>16));//设置退税率
	coll("config")->save(array("_id"=>"zuixinhuilv","zuixinhuilv"=>6.1448));//设置缺省汇率
	coll("config")->save(array("_id"=>"dingdanbeizhu","beizhu"=>""));//设置缺省订单备注
	echo "初始化完成！";
}