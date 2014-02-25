<?PHP
include("../util.php");
session_start();
session_unset();//清掉旧的会话信息   

header("Content-type: text/html; charset=utf-8");	

// $db = new MongoClient();
// $userColl = $db->oa->user;
// $query = array("_id"=>2);
// $doc = $userColl->findOne($query);
// var_dump($doc);
// return;
$result = array();
//获取用户（姓名+头像）；
$result["users"] = getUsers();
//获取背景照片；
$result["background"] = getBackgrounds();
//获取滚动图片；
//$result["roll"] = getRollingImg();
//获取企业文化标语；
$result["cul"] = getCulture();
$result["kehu"] = getKehu();
//print_r($result);
echo jsonEncode($result);

function getKehu(){
	//$cur = coll("kehu")->find()->sort(array("access"=>-1))->limit(20);
	$cur = coll("dingdan")->find(array(),array("_id"=>0,"kehu"=>1))->sort(array("access"=>-1))->limit(60);
	$res = array();
	foreach($cur as $doc){
		$res[] = $doc["kehu"];
	}
	return array_unique($res);
}
function getUsers(){
	//$cur = userColl()->find(array("ban"=>array('$exists'=>false)),array("password"=>0));
	//$cur = userColl()->find(array(),array("password"=>0));
	$zhongtai = coll("config")->findOne(array("_id"=>"zhongtai"));
	$cur = coll("contact")->find(array("shangjia._id"=>$zhongtai["zhongtai"]["_id"],"leixing"=>"个人"),array("mingchen"=>1,"bg"=>1,"photo"=>1,"role"=>1));
	$rows = cur2obj($cur);
	foreach($rows as &$value){
		$value["user_name"] = $value["mingchen"];
		if(!isset($value["photo"])){
			$value["photo"] = "../logo/noface.jpg";
		}
	}
	return $rows;
}
function getBackgrounds(){
	$imgs = array();
	$filelist = scandir("../desktop/changlong");
	for($i=0;$i<3;$i++){
		$imgfile = @$filelist[rand(2,count($filelist))];
		if(!isImg($imgfile)) $imgfile = "default.jpg";
		$imgs[] = "/oa/desktop/changlong/".$imgfile; 
	}
	return $imgs;
}

function getBackground(){
	$filelist = scandir("../desktop/changlong");
	$imgfile = @$filelist[rand(2,count($filelist))];
	if(!isImg($imgfile)) $imgfile = "5 (Small).png";
	return "/oa/desktop/changlong/".$imgfile;
}

function getRollingImg(){
	$filelist = scandir("../desktop/roll");
	$start = rand(2,count($filelist)-10);
	$result = array();
	for($i=0;$i<10;$i++){
		if(!isImg($filelist[$start+$i])){
			$result[] = "/oa/desktop/roll/DSC07843 (Small).JPG";
		}else{
			$result[] = "/oa/desktop/roll/".$filelist[$start+$i];
		}
	}
	return $result;
}

function getCulture(){
	$culture = Array("公司利益与个人利益并重",
	"学会用老板的眼光看企业",
	"对客户重要的事对公司同样重要",
	"规范就是权威，规范是一种精神",
	"有人负责我服从，无人负责我负责",
	"沟通能清除一切障碍，主动就是效率",
	"做事情应有计划、目标和时间",
	"做人要低调，做事要高调，不要颠倒过来",
	"专注成就深度，专业成就品质",
	"把简单的事情重复做对就是不简单",
	 "把权力和利益交给真正承担责任的人",
	 "知人者智，自知者明，胸怀博大，宽容异己",
	 "不学习实际是在选择落后和出局");
	 
	 return $culture[rand(0,12)];
}
?>