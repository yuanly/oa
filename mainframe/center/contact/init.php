<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");

if(coll("contact")->count()>0){
	echo "�ѳ�ʼ����";
}elsee{
	coll("contact")->save(array("_id"=>"LXR0","mingchen"=>"��̩���׽��������޹�˾","leixing"=>"�̼�"));
	coll("contact")->save(array("_id"=>"LXR1","mingchen"=>"Ԭ����","leixing"=>"����","role"=>"root","password"=>"1","shangjia"=>array("_id"=>"LXR0","mingchen"=>"��̩���׽��������޹�˾")));
	echo "��ʼ����ɣ�";
}