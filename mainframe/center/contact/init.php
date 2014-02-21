<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");

if(coll("contact")->count()>0){
	echo "已初始化！";
}elsee{
	coll("contact")->save(array("_id"=>"LXR0","mingchen"=>"中泰华伦进出口有限公司","leixing"=>"商家"));
	coll("contact")->save(array("_id"=>"LXR1","mingchen"=>"袁立宇","leixing"=>"个人","role"=>"root","password"=>"1","shangjia"=>array("_id"=>"LXR0","mingchen"=>"中泰华伦进出口有限公司")));
	echo "初始化完成！";
}