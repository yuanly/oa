<?php
include("../../util.php");

$id = (int)$_REQUEST["id"];
$attach = attachColl()->findOne(array("_id"=>$id));
header("Content-type:".contentType($attach["filename"]));
echo $attach["file"]->bin;

//----------------------------------------------------
function contentType($filename){
	$ext = pathinfo($filename,PATHINFO_EXTENSION);
	if($ext){
		$ext = strtolower($ext);
		if(in_array($ext,array("jpg","jpeg","png","bmp","gif","tiff","tif"))){
			return "image/".$ext;
		}else if($ext == "doc"){
			return "application/msword";
		}else if($ext == "xls"){
			return "application/x-xls";
		}else if($ext == "rtf"){
			return "application/msword";
		}else if($ext == "txt"){
			return "text/plain";
		}
	}
	return "application/octet-stream";
}