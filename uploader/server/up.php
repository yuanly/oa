<?php

/**
 * collection<attach>{_id:"xx",filename:"xxx",time:nnn,user:"xxx",memo:"xx",file:binary}
 * 
 * Handle file uploads via XMLHttpRequest
 */

include("../../util.php");
// list of valid extensions, ex. array("jpeg", "xml", "bmp")
$allowedExtensions = array();
$allowedExtensions = array_map("strtolower", $allowedExtensions);
// max file size in bytes
$sizeLimit = 10 * 1024 * 1024;

checkServerSettings($sizeLimit);

$result = handleUpload($sizeLimit,$allowedExtensions);
echo jsonEncode($result);

//-----------------------------------
function handleUpload($sizeLimit,$allowedExtensions){
	$size = getSize();
	if ($size == 0) {
		return array('error' => 'File is empty');
	}
	
	if ($size > $sizeLimit) {
		return array('error' => 'File is too large');
	}
	$pathinfo = pathinfo(getName());
	$filename = $pathinfo['filename'];
	$ext = $pathinfo['extension'];
	
	if($allowedExtensions && !in_array(strtolower($ext), $allowedExtensions)){
		$these = implode(', ', $allowedExtensions);
		return array('error' => 'File has an invalid extension, it should be one of '. $these . '.');
	}
 
    $input = fopen("php://input", "r");
    $temp = tmpfile();
    $realSize = stream_copy_to_stream($input, $temp);
    fclose($input);   
    
    if ($realSize != $size){            
        return array('error' => 'real file size not equal content length!');
    }       
    fseek($temp, 0, SEEK_SET);
    
    $file =  new MongoBinData(stream_get_contents($temp));
 
    $id = getId("attach"); 
    $filename = getName(); 
    $time = time(); 
    $memo = $_REQUEST["memo"]; 
//     $user = $_SESSION["user_name"];
$user  = null;
    
    attachColl()->save(array("_id"=>$id,"filename"=>$filename,"time"=>$time,"memo"=>$memo,"user"=>$user,"file"=>$file));

    return array("id"=>$id,'success'=>true);
}
function getSize() {
	if (isset($_SERVER["CONTENT_LENGTH"])){
		return (int)$_SERVER["CONTENT_LENGTH"];
	} else {
		throw new Exception('Getting content length is not supported.');
	}
}
function getName() {
	return $_GET['qqfile'];
}
function toBytes($str){
	$val = trim($str);
	$last = strtolower($str[strlen($str)-1]);
	switch($last) {
		case 'g': $val *= 1024;
		case 'm': $val *= 1024;
		case 'k': $val *= 1024;
	}
	return $val;
}
function checkServerSettings($sizeLimit){
	$postSize = toBytes(ini_get('post_max_size'));
	$uploadSize = toBytes(ini_get('upload_max_filesize'));

	if ($postSize < $sizeLimit || $uploadSize < $sizeLimit){
		$size = max(1, $sizeLimit / 1024 / 1024) . 'M';
		die("{'error':'increase post_max_size and upload_max_filesize to $size'}");
	}
}