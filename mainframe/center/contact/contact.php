<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$contact = getJson();
if(isset($contact["_id"])){//�޸�
	$contact["access"] = time();
	coll("contact")->save($contact);//�ڿͻ���ȷ����������Ա������ش�
	//TODO ��Ҫ��� mingchen py quyu �Ƿ����˸ı䣬���䣬����Ҫ���¹���������Ͷ�����
	echo '{"success":true}';
}else{//����
	$contact["_id"] = "LXR".getId("contact");
	$contact["access"] = time();
	coll("contact")->save($contact);
	echo '{"success":true}';
}