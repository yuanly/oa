<?php
//error_log("Location: ".docRoot()."login/login.html",3,"d:/err.log");

include("../../../util.php");
session_start();
checkuser();

$contact = getJson();
if(isset($contact["_id"])){//�޸�
	$contact["access"] = time();
	$old = coll("contact")->findOne(array("_id"=>$contact["_id"]));
	coll("contact")->save($contact);//�ڿͻ���ȷ����������Ա������ش�
	//��Ҫ��� mingchen py quyu �Ƿ����˸ı䣬���䣬����Ҫ���¹���������Ͷ�����
	if(!empty($old)){
		/*����������Ǻ��ף��������ĺܴ󣡵�Ҫʵ�������������ܰ���Щ����������ò��û�и��õİ취��*/
		if($old["mingchen"] != $contact["mingchen"] || $old["quyu"] != $contact["quyu"]){
			$obj = array("_id"=>$old["_id"],"mingchen"=>$contact["mingchen"],"py"=>$contact["py"],"quyu"=>$contact["quyu"]);
			coll("yangban")->update(array("shangjia._id"=>$old["_id"]),array('$set'=>array("shangjia"=>$obj)),array("multiple"=>true));
			unset($obj["py"]);//������Ҫpy
			coll("dingdan")->update(array("gonghuoshang._id"=>$old["_id"]),array('$set'=>array("gonghuoshang"=>$obj)),array("multiple"=>true));
			coll("huowu")->update(array("gonghuoshang._id"=>$old["_id"]),array('$set'=>array("gonghuoshang"=>$obj)),array("multiple"=>true));
		}
	}
	echo '{"success":true}';
}else{//����
	$contact["_id"] = "LXR".getId("contact");
	$contact["access"] = time();
	coll("contact")->save($contact);
	echo '{"success":true}';
}