<?php /* Created on: 2008-01-06 */ 

include_once("JSON.php");

date_default_timezone_set("Asia/Shanghai");

function docRoot(){
	return "/oa/";
}
/*
 * 返回mongodb collection
 */
function isMasterDB(){
	$db = new MongoClient();
	$result = $db->myDb->command(array("isMaster" => 1));
	return $result["ismaster"];
}
function coll($cn){
	$db = new MongoClient();
	return $db->oa->selectCollection($cn);
}
function statExpired(){
	coll("config")->update(array("_id"=>"stat"),array('$set'=>array("expired"=>true)));
}
function vendorColl(){
	$db = new MongoClient();
	return $db->oa->vendor;
}
function userColl(){
// 	return (new MongoClient())->oa->user;
	$db = new MongoClient();
	return $db->oa->user;
}
function attachColl(){
	$db = new MongoClient();
	return $db->oa->attach;
}

function logColl(){
	$db = new MongoClient();
	return $db->log->log;
}
function newsColl(){
	$db = new MongoClient();
	return $db->oa->news;
}
function newsReplyColl(){
	$db = new MongoClient();
	return $db->oa->newsReply;
}
/*建索引
 * newsColl()->ensureIndex(array("time"=>1));
 */
function getId($name){
	$db = new MongoClient();
	$idColl = $db->oa->id;
	$retVal = $idColl->findAndModify(
			array("_id"=>1),
			array('$inc'=>array($name=>1)),
			array($name=>1),
			array("new"=>true,"upsert"=>true));
	return (int)$retVal[$name];
}
function c2a($cur){
	$a = array();
	if(!$cur){
		return $a;
	}
	while($cur->hasNext()){
		$a[] = $cur->getNext();
	}
	return $a;
}
function cur2obj($cur){
	$res = array();
	foreach($cur as $doc){
		$res[] = $doc;
	}
	return $res;
}
function cur2json($cur){
	$res = array();
	foreach($cur as $doc){
		$res[] = $doc;
	}
	return jsonEncode($res);
}
function getJson(){
	return json_decode($_REQUEST["json"],true);
}
function jsonEncode($obj){
	$json = new Services_JSON();
	return $json->encode($obj);
}
function jsonDecode($str){
	$json = new Services_JSON();
	return $json->decode($str);
}

function getMonthStartTime($m){
	return strtotime(date("Y", time())."/{$m}/01 00:00:00");;
}
function getMonthEndTime($m){
		if($m < 12){
			return strtotime(date("Y", time())."/".($m+1)."/01 00:00:00");
		}else{
			return strtotime(date("Y", time())."/{$m}/31 23:59:59");
		}
}

function check_task(){//检查是否有需要告警的任务。
	$task=mysql_fetch_row(my_query("select count(*) from tb_task 
		where accepter='{$_SESSION["user_name"]}' and (UNIX_TIMESTAMP()-lastprocess)>alerttime
		 and status not in ('取消','完成')", __LINE__));	
		$_SESSION["HasTask"] = $task[0];
}

function checktask(){
	if($_SESSION["HasTask"]){
		echo "<br><center><a href='/mis/task/listtask.php?cmd=taskofme'>你有任务已过告警时间，请先对该任务进行处理！</a></center>";
		exit;
	}
}
	
function myslash($str){
	if (!get_magic_quotes_gpc()) {
		return addslashes($str);
	}else{
		return $str;
	}
}

function my_query($query,$ln){
	$result = mysql_query($query);
	if(!$result)  die("{'desc':'数据库异常：<br/>".mysql_error()."<br/>".$query."<br/>所在脚本：".$_SERVER['PHP_SELF']."<br/>行号：".$ln."'}");	
	return $result;
}

function checkuser_only(){
	session_start();
	checkuser();	
	session_write_close();
}
		
function checkuser(){
	if(empty($_SESSION["user"])){		
		//header("Location: ".docRoot()."login/login.html");
		
		echo '{"redirect":"'.docRoot().'login/login.html"}';
		exit;
		
		$_SESSION['user_name'] = "root";
		$_SESSION["user_id"] = 1;
		$_SESSION["role"] = "root";
		$_SESSION["phone"] = "13316097078";
	}
	date_default_timezone_set("Asia/Shanghai");
}

	
function NA($p){
	return (empty($p)?"N/A":$p);
}
function NA_date($d){
	return ($d == null ? "N/A":date("y/m/d H:i",$d));
}
function NA_date_ex($d){
	return ($d == null ? "N/A":date("Y/m/d H:i",$d));
}
function NA_date_ex2($d){
	return ($d == null ? "N/A":date("m/d H:i",$d));
}
function NA_day($d){
	return ($d == null ? "N/A":date("y/m/d",$d));
}
function NA_hour($d){
	return ($d == null ? "N/A":date("y/m/d-H",$d));
}
function NA_day_ex($d){//年份只有两位数时，strtotime会出错。
	return ($d == null ? "N/A":date("Y/m/d",$d));
}
function stt($d){//strtotime	   两位数的年份会出错
	$ret = strtotime($d);
		return ($ret?$ret:'null');
}

function mytime(){
//	return (time() + 57600);
	return time();
}

function ispost($p,$v){
	if(isset($_POST["{$p}"]) and ($_POST["{$p}"]==$v))
		return true;
	else
		return false;
}
function isget($p,$v){
	if(isset($_GET["{$p}"]) and ($_GET["{$p}"]==$v))
		return true;
	else
		return false;
}
function is_req($p,$v){
	if(isset($_REQUEST["{$p}"]) and ($_REQUEST["{$p}"]==$v))
		return true;
	else
		return false;
}
//操作成功提示
function succ_response($content){
    echo "<html>
	    <head>
	    <meta http-equiv='Content-Type' content='text/html; charset=gb2312'>
	    <title>操作成功</title>
	    <link rel='shortcut icon' href='../logo/zhongtailogo.ico'>
	    </head>
	    <body>
		    <div>
			    <p align='center'>{$content}</p>
			    <center><input type='button' value='关闭窗口' onclick='window.opener.history.go(0);window.close();'></center>
		    </div>
	    </body>
    </html>";
}
//操作失败提示
function fail_response($content){
    echo "<html>
	    <head>
	    <meta http-equiv='Content-Type' content='text/html; charset=gb2312'>
	    <title>操作失败</title>
	    <link rel='shortcut icon' href='../logo/zhongtailogo.ico'>
	    </head>
	    <body>
		    <div>
			    <p align='center'>{$content}</p>
			    <center><input type='button' value='关闭窗口' onclick='window.opener.history.go(0);window.close();'></center>
		    </div>
	    </body>
    </html>";
}
function succ_response_alt($content){
    echo "<html>";
	echo "<head>";
	echo "<meta http-equiv='Content-Type' content='text/html; charset=gb2312'>";
	echo "	</head>";
	echo "			<body>";
	echo "				<div>";
	echo	"<p align='center'>".$content."</p>";
	echo "				<center><input type='button' value='关闭窗口' onclick='window.close();'></center>";
	echo "				</div>";
	echo "			</body>";
	echo "		</html>";
}

function actionlogEx($action, $user,$target){
	$logsql = "insert into tb_actionlog values(null,".mytime().", '".$user."', '".$action."', '".$target."')";
	mysql_query($logsql) or die('数据库异常: <br/>' . mysql_error()."<br/>".$logsql);		 
}

function actionlog($action, $target){
	$logsql = "insert into tb_actionlog values(null,".mytime().", '".$_SESSION["user_name"]."', '".$action."', '".$target."')";
	mysql_query($logsql) or die('数据库异常: <br/>' . mysql_error()."<br/>".$logsql);		 
}
/*
为gears google Managed LocalServer准备。url是./gears/manifest.php的相对地址
*/
function action_log($url,$action,$target){
	my_query("update tb_url_version set version=version+1 where url='{$url}'",__LINE__);
	actionlog($action,$target);
}
function update_order_pages(){
	my_query("update tb_url_version set version=version+1 where url='../listorder.php'",__LINE__);
	my_query("update tb_url_version set version=version+1 where url='../buyorder.php'",__LINE__);	
	my_query("update tb_url_version set version=version+1 where url='../processorder.php'",__LINE__);	
	my_query("update tb_url_version set version=version+1 where url='../deliverorder.php'",__LINE__);	
	my_query("update tb_url_version set version=version+1 where url='../createorder.php'",__LINE__);	
}
//组合编辑下拉列表选择框  
function mycombox($id,$value,$input_width,$span_width,$select_width,$select_left,$query){
	$result = mysql_query($query) or die('数据库异常: <br/>' . mysql_error()."<br/>".$query);
	echo "<input name='{$id}' id='{$id}'  style='top:0px; width: {$input_width}px; height: 20px' value={$value}>";
	echo "<span style='top: 0px; width: {$span_width}px; height: 20px;overflow: hidden'>";
	echo "<select style='width: {$select_width}; margin-left:{$select_left}px;top: 0px; height: 20px' onChange=\"if(value){$id}.value=value;value=''\">";
	echo "<option value=''></option>";
		while ($line = mysql_fetch_array($result, MYSQL_NUM)) {	 
	    	echo "<option value='".$line[0]."'>".$line[0]."</option>";
		}
	echo "</select>";
	echo "</span>";
}
function my_combox_html($id,$value,$input_width,$span_width,$select_width,$select_left,$query){	
	$result = mysql_query($query) or die('数据库异常: <br/>' . mysql_error()."<br/>".$query);
	$ret = "<input name='{$id}' id='{$id}'  style='top:0px; width: {$input_width}px; height: 20px' value={$value}>
	  	<span style='top: 0px; width: {$span_width}px; height: 20px;overflow: hidden'>
		<select style='width: {$select_width}; margin-left:{$select_left}px;top: 0px; height: 20px' onChange=\"{$id}.value=value;value=''\">
		<option value=''></option>";
		while ($line = mysql_fetch_array($result, MYSQL_NUM)) {	 
	    	$ret .= "<option value='".$line[0]."'>".$line[0]."</option>";
		}
	$ret .= "</select></span>";
	return $ret;
} 
//判断是否为图像文件
function isImg($fn){
	$ret = preg_match("/.*\.jpg/i",$fn) 
		|| preg_match("/.*\.jpeg/i",$fn) 
		|| preg_match("/.*\.gif/i",$fn) 		
		|| preg_match("/.*\.png/i",$fn) 
		|| preg_match("/.*\.bmp/i",$fn);
	return $ret;
}
?>