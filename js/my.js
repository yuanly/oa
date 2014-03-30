/*供共享的方法放这里*/
 
 //http://localhost:81/oa/mainframe/center/news/ 其中oa就是appName。也是文档根目录
 var appName = "oa";
 
 
 function getDocRoot(){
 	return "/"+appName+"/";
 }
 
 function getAppPath(){//skin.js
 	var i = location.href.lastIndexOf("/");
 	var path = location.href.slice(0, i+1);
 	return path;
 }
 /*根据图片id获取图片链接*/
 function getImgUrl(id){
 	return getDocRoot()+"uploader/server/down.php?id="+id;
 }

function inLiucheng(liucheng,dongzuo){
	var ret = false;
	each(liucheng,function(i,lc){
		if(lc.dongzuo == dongzuo){
			ret = true;
			return false;
		}
	});
	return ret;
}
function addQuyulist(){
	if($("#quyulist").length==0){
		$("body").append('<datalist id="quyulist">\
				<option value="花都"/>\
				<option value="中大"/>\
				<option value="惠东"/>\
				<option value="工厂"/>\
				<option value="新濠畔"/>\
				<option value="代付"/>\
				<option value="其它"/>\
			</datalist>');
		}
}
 var logger={
 		level:1,//0 debug 1 info 2 warn 3 error
 		setLevel:function(lv){
 			logger.level = lv;
 		},
 		isDebug:function(){
 			if(0 == logger.level){
 				return true;
 			}
 			return false;
 		},
 		debug:function(target,e){
 			if(logger.level<=0){
 				log("[debug]"+target,e);
 			}
 		},
 		info:function(target,e){
 			if(logger.level<=1){
 				log("[info]"+target,e);
 			}
 		},
 		warn:function(target,e){
 			if(logger.level<=2){
 				log("[warn]"+target,e);
 			}
 		},
 		error:function(target,e){
 			if(logger.level<=3){
 				log("[error]"+target,e);
 			}
 		}
 };
 /**
  * 用logger，不要直接用log
  * 控制台日志，代替console.log。考虑到有的浏览器不支持console。
  * @param target
  * @param e
  */ 
 function log(target,e){
 	try{
 		$("#console").prepend(JSON.stringify(target)+"<hr/>");
 		if(e){
 			$("#console").prepend("event:"+JSON.stringify(e)+"<hr/>");
 		}
 		if(isIE6()){
 			return;
 		}
 		if(isChrome()){
 			console.log(target); 
 			if(e) {console.log("event:"+e);}
 		}else{
 			console.log(JSON.stringify(target));
 			if(e) {console.log(JSON.stringify(e));}
 		}
 	}catch(ex){}
 }
 //用于拼音首字母过滤，只留下大写字母其他字符扔掉
 	function filterAZ(s){
 		s = s.toUpperCase();
		var ret="";
		for(var i=0;i<s.length;i++){
			if(s.charAt(i)>='A' && s.charAt(i)<='Z'){
				ret += s.charAt(i);
			}
		}
		return ret;
	}
	
 function isHtml5(){
 	if(isOldIE()){
 		return false;
 	}
 	return !!(document.createElement('audio').canPlayType);
 }
 function isChrome(){
 	try{
 		if(-1 != navigator.userAgent.indexOf("Chrome")){
 			return true;
 		}
 	}catch(e){}
 	return false;
 }
 function isQQBrowser(){
 	try{
 		if(-1 != navigator.userAgent.indexOf("QQBrowser")){
 			return true;
 		}
 	}catch(e){}
 	return false;
 }
 function isIE6(){
 	if($.browser.msie && Number($.browser.version)<=6){
 		return true;
 	}
 	return false;
 }
 //
 function isFloat(str){
 	if(isNaN(str)){
 		return false;
 	}
 	if(str != (""+parseFloat(str))){
 		return false;
 	}
 	return true;
 }
 function isIE7(){
 	if($.browser.msie && Number($.browser.version)>6 && Number($.browser.version)<=7){
 		return true;
 	}
 	return false;
 }
 //ie 6 7 8
 function isOldIE(){
 	if($.browser.msie && Number($.browser.version)<9){
 		return true;
 	}
 	return false;
 }
 /**
 * 把当前页面的url转换成json对象
 */
 function getUrl(){
 	return url2obj(location.href);
 }
 /*
 * 把url解释成json
 */
 function url2obj(asURL){
 	var obj = {};
 	var j = asURL.indexOf("?");
 	/*
 	var i = asURL.lastIndexOf("/");
 	if(-1 == j){
 		obj.File = asURL.slice(i+1);
 		return obj;
 	}
 	obj.File = asURL.slice(i+1,j);
 	*/
 	if(-1 == j) {
 		obj.File = asURL.substring(asURL.lastIndexOf("/") + 1);
 		return obj;
 	}
 	var j = asURL.indexOf("?");
 	var tmp = asURL.substring(0, j);
 	obj.File = tmp.substring(tmp.lastIndexOf("/")+1);
 //////////////////////////////////////////////////////
 	var name,val;
 	while(-1 != j){	
 		i = asURL.indexOf("=",j);
 		name = asURL.slice(j+1,i);
 		j = asURL.indexOf("&",i);
 		if(-1 == j)
 			val = asURL.slice(i+1);
 		else
 			val = asURL.slice(i+1,j);
 		obj[name]= decodeURIComponent(val);
 	}
 	return obj;
 }
 /*
 * jquery的$.each不对传入的变量做检查，这里改之。
 */
 function each(arr,fn){
 	if(!(arr instanceof Array)){
 		return;
 	}
 	return $.each(arr,fn);
 }
 
 /**
 jQuery cookie是个很好的cookie插件，大概的使用方法如下
 example $.cookie(’name’, ‘value’);
 设置cookie的值，把name变量的值设为value
 example $.cookie(’name’, ‘value’, {expires: 7, path: ‘/’, domain: ‘jquery.com’, secure: true});
 新建一个cookie 包括有效期 路径 域名等
 example $.cookie(’name’, ‘value’);
 新建cookie
 example $.cookie(’name’, null);
 删除一个cookie
 var account= $.cookie('name');
 取一个cookie(name)值给myvar
  */
 jQuery.cookie = function(name, value, options) {
     if (typeof value != 'undefined') { // name and value given, set cookie
         options = options || {};
         if (value === null) {
             value = '';
             options.expires = -1;
         }
         var expires = '';
         if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
             var date;
             if (typeof options.expires == 'number') {
                 date = new Date();
                 date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
             } else {
                 date = options.expires;
             }
             expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
         }
         var path = options.path ? '; path=' + options.path : '';
         var domain = options.domain ? '; domain=' + options.domain : '';
         var secure = options.secure ? '; secure' : '';
         document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
     } else { // only name given, get cookie
         var cookieValue = null;
         if (document.cookie && document.cookie != '') {
             var cookies = document.cookie.split(';');
             for (var i = 0; i < cookies.length; i++) {
                 var cookie = jQuery.trim(cookies[i]);
                 // Does this cookie string begin with the name we want?
                 if (cookie.substring(0, name.length + 1) == (name + '=')) {
                     cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                     break;
                 }
             }
         }
         return cookieValue;
     }
 };
 String.prototype.getSplitOne = function (index,splitstr) {
 	var str = this;
 	try {
 		var arrs = str.split(splitstr);
 		if (arrs.length < index + 1)
 			index = arrs.length-1;
 		if (index < 0) index = 0;
 		var returnStr = str.split(splitstr)[index];
 		while (returnStr.length < 1 && index > 0) {
 			index --;
 			returnStr = str.split(splitstr)[index];
 		}
 		return returnStr;
 	} catch(e) {
 		return "";	
 	}
 }
 function getPhoneNumber(strText){
 	  var re =  /\d+[-]{0,1}\d+/g;
    var oArray = strText.match(re);
    var ret = "";
    for(var i=0; i<oArray.length; i++){
        if(oArray[i].length>ret.length){
        	ret = oArray[i];
        }
    }
    return ret;
	}
 String.prototype.colorHex = function(){
 	var that = this;
 	if(/^(rgb|RGB)/.test(that)){
 		var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
 		var strHex = "#";
 		for(var i=0; i<aColor.length; i++){
 			var hex = Number(aColor[i]).toString(16);
 			if(hex === "0"){
 				hex += hex;	
 			}
 			strHex += hex;
 		}
 		if(strHex.length !== 7){
 			strHex = that;	
 		}
 		return strHex;
 	}else if(reg.test(that)){
 		var aNum = that.replace(/#/,"").split("");
 		if(aNum.length === 6){
 			return that;	
 		}else if(aNum.length === 3){
 			var numHex = "#";
 			for(var i=0; i<aNum.length; i+=1){
 				numHex += (aNum[i]+aNum[i]);
 			}
 			return numHex;
 		}
 	}else{
 		return that;	
 	}
 };
 var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
 String.prototype.colorRgb = function(){
 	var sColor = this.toLowerCase();
 	if(sColor && reg.test(sColor)){
 		if(sColor.length === 4){
 			var sColorNew = "#";
 			for(var i=1; i<4; i+=1){
 				sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));	
 			}
 			sColor = sColorNew;
 		}
 		var sColorChange = [];
 		for(var i=1; i<7; i+=2){
 			sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));	
 		}
 		return "RGB(" + sColorChange.join(",") + ")";
 	}else{
 		return sColor;	
 	}
 };
 String.prototype.colorRgbEx = function(){
 	var sColor = this.toLowerCase();
 	if(sColor && reg.test(sColor)){
 		if(sColor.length === 4){
 			var sColorNew = "#";
 			for(var i=1; i<4; i+=1){
 				sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));	
 			}
 			sColor = sColorNew;
 		}
 		var sColorChange = [];
 		for(var i=1; i<7; i+=2){
 			sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));	
 		}
 		return sColorChange.join(",");
 	}else{
 		return sColor;	
 	}
 };
 String.prototype.trim = function()
 {
     return this.replace(/(^\s*)|(\s*$)/g, "");
 };
 String.prototype.isNumber = function()
 {
 	return !isNaN(this);
 };
 
 /**
  * 区分半角全角的字符串长度计算。全角算两个
  * @returns
  */
 String.prototype.lenReg = function(){
     return this.replace(/[^\x00-\xFF]/g,'**').length;
 };
 /**
  * 区分半角全角的字符串长度计算。英文算半个
  * @returns
  */
 String.prototype.lenHan = function(){
     return this.lenReg()/2;
 };
 /**
  * 根据lenReg截取字符串
  * @param len
  */
 String.prototype.truncate = function(len){
 	var str = this;
 	while(str.lenHan() > len){
 		str = str.slice(0,-1);
 	}
 	return str;
 };
 
/*
* round(12.345,2)=12.35
*/
round = function(v,l){
	if(isNaN(v)){
		return 0;
	}
	var e = 1;
	for(var i=0;i<l;i++){
		e = e*10;
	}
	return Math.round(v*e)/e;
}
 /*
 Date.prototype.format = function(format)
 {
     var o = {
     "M+" : this.getMonth()+1, //month
     "d+" : this.getDate(),    //day
     "h+" : this.getHours(),   //hour
     "m+" : this.getMinutes(), //minute
     "s+" : this.getSeconds(), //second
     "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
     "S" : this.getMilliseconds() //millisecond
     }
     if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
     (this.getFullYear()+"").substr(4 - RegExp.$1.length));
     for(var k in o)if(new RegExp("("+ k +")").test(format))
     format = format.replace(RegExp.$1,
     RegExp.$1.length==1 ? o[k] :
     ("00"+ o[k]).substr((""+ o[k]).length));
     return format;
 }
 */
 /*日期格式化*/
  Date.prototype.format = function(format) {  
     /* 
      * eg:format="yyyy-MM-dd hh:mm:ss"; 
      */  
     var o = {  
         "M+" : this.getMonth() + 1, // month  
         "d+" : this.getDate(), // day  
         "h+" : this.getHours(), // hour  
         "m+" : this.getMinutes(), // minute  
         "s+" : this.getSeconds(), // second  
         "q+" : Math.floor((this.getMonth() + 3) / 3), // quarter  
         "S" : this.getMilliseconds()  
         // millisecond  
     }  
   
     if (/(y+)/.test(format)) {  
         format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4  
                         - RegExp.$1.length));  
     }  
   
     for (var k in o) {  
         if (new RegExp("(" + k + ")").test(format)) {  
             format = format.replace(RegExp.$1, RegExp.$1.length == 1  
                             ? o[k]  
                             : ("00" + o[k]).substr(("" + o[k]).length));  
         }  
     }  
     return format;  
 } ;
 /**
  * 克隆一个javascript对象。但Object.prototype.*跟juery冲突，改用下面的方法。
  */
 clone = function(src)
 {
 	return $.extend(true,{},src); 
 };
/*
* 在$.data()为数值类型的情况，对值做加法操作(传负值相当减法）
*/
jQuery.fn.dataInc = function(name,value){
	this.data(name,this.data(name)+value);
	return this;
} 
 /**
  * 在内容框中居中
  */
 jQuery.fn.contentCenter=function(fixed){
 	var left = Math.floor(($("#player_div").width()-this.width())/2)+$("#player_div").offset().left;
 	this.center(fixed).css("left",left+"px");
 	return this;
 };
 /**
  * 把元素移到屏幕正中
  */
 jQuery.fn.center = function (fixed) {
 	this.css("z-index",111);
 	if(fixed){
 	    this.css("top", ( $(window).height() - this.height() ) / 2 + "px");
 	    this.css("left", ( $(window).width() - this.width() ) / 2 + "px");
 	}else{
 	   this.css("position","absolute");
 //	   alert($(window).scrollTop())
 	   this.css("top", ( $(window).height() - this.height() ) / 2+$(window).scrollTop() + "px");
 	   this.css("left", ( $(window).width() - this.width() ) / 2+$(window).scrollLeft() + "px");
 	}
     return this;
 };
 
 jQuery.fn.modal = function(){
 	this.css("z-index",110);
 	$("#top_bar_div").append('<div id="modal" style="position:absolute;top:0px;left:0px;width:3000px;height:3000px;"></div>');
 	if($.browser.msie && !isIE6()){
 		$("#modal").css({"filter":"alpha(opacity=0)","background-color":"white"});
 	}
 	$("body").css("overflow","hidden");
 	return this;
 };
 jQuery.fn.unmodal = function(){
 	$("body").css("overflow","auto");
 	$("#modal").remove();
 	return this;
 };
 
 jQuery.fn.vals = function(v){
 	if("undefined" == typeof v || null == v){
 		$(this).val("");
 	}else{
 		$(this).val(v);
 	}
 	return this;
 }
 //有trim
 jQuery.fn.changexx = function(callback){
 	this.keyup(function(event){
 		if($(this).data("lastValue") != $(this).val()){
 			$(this).data("lastValue",$(this).val()) ;
 			callback();
 		}
 	});
 	return this;
 } 
 //没trim
 jQuery.fn.changex = function(callback){
 	this.keyup(function(event){
 		if($(this).data("lastValue") != $(this).val().trim()){
 			$(this).data("lastValue",$(this).val().trim()) ;
 			callback();
 		}
 	});
 	return this;
 }
 /**
  * 自定义的confirm方法
  * elm:不提供则居中，否则就在elm旁边
  * msg：要提示的信息
  * @param callback 点确定后调用的方法
  * @param location {left:23,top:23}精确控制消息框的位置
  */
 function ask(elm,msg,callback,location){
 	$("body").find("#yuanliyusask").remove();
 	$("body").append('<div class="yuanliyusask" id="yuanliyusask" style="position:absolute;z-index:100"></div>');
 	 
 	$("#yuanliyusask").append(
 		'<div id="ask_box" class="circle_border_8" style="background-color:white;border:5px solid #ddd;padding:10px;">\
 			<table>\
 				<tr style="vertical-align:top">\
 					<td><img src="'+getDocRoot()+'img/help.png" style="vertical-align:-7px;margin-right:10px"/></td>\
 					<td><span id="msg_box"></span></td>\
 				</tr>\
 			</table>\
 			<div style="margin-top:20px;border:0px solid red;text-align:center">\
 				<input id="ok" type="button" value="确定" class="circle_border_2" style="background-color:#88e802;border:none;width:70px;height:24px;color:white;cursor:pointer"/>\
 				&nbsp;\
 				<input id="cancel" type="button" value="取消" class="circle_border_2" style="background-color:#F5F5F5;border:none;width:70px;height:24px;cursor:pointer"/>\
 			</div> \
 		</div>'
 	); 
 	if($.browser.msie && $.browser.version<9){//没有圆角，没有阴影
 		$("#yuanliyusask #ok").css("border-right","2px solid #ddd").css("border-bottom","2px solid #aaa");
 		$("#yuanliyusask #cancel").css("border-right","2px solid #ddd").css("border-bottom","2px solid #aaa");
 	}
 	$("#yuanliyusask #msg_box").html(msg);
 	$("#yuanliyusask #ok").click(function(){
 		$("#yuanliyusask").remove();
 		callback();
 	});
 	$("#yuanliyusask #cancel").click(function(){
 		$("#yuanliyusask").remove();
 	});
 
 	if(location){
 		$("#yuanliyusask").css({"left":location.left,"top":location.top});
 	}else if(!elm){
 		$("#yuanliyusask").center();
 	}else{
 		$("#yuanliyusask").css({"left":elm.offset().left,"top":elm.offset().top+elm.height()/2});
 	};
 }
 /**
  * 自定义的prompt
  * @param elm
  * @param msg
  * @param callback
  * @param location
  */
 function ask2(elm,msg,callback,location){
 	$("body").find("#yuanliyusask").remove();
 	$("body").append('<div class="yuanliyusask" id="yuanliyusask" style="position:absolute;z-index:100"></div>');
 	 
 	$("#yuanliyusask").append(
 		'<div id="ask_box" class="circle_border_8" style="background-color:white;border:5px solid #ddd;padding:10px;">\
 			<table>\
 				<tr style="vertical-align:top;">\
 					<td><span id="msg_box"></span></td>\
 				</tr>\
 				<tr>\
 					<td><input id="answer" type="text" style="width:100%"/></td>\
 				</tr>\
 			</table>\
 			<div id="bts" style="margin-top:15px;border:0px solid red;text-align:center">\
 				<input id="ok" type="button" value="确定" class="circle_border_2" style="background-color:#88e802;border:none;width:70px;height:24px;color:white;cursor:pointer"/>\
 				&nbsp;\
 				<input id="cancel" type="button" value="取消" class="circle_border_2" style="background-color:#F5F5F5;border:none;width:70px;height:24px;cursor:pointer"/>\
 			</div> \
 		</div>'
 	); 
 	if($("#yuanliyusask table").width()<$("#yuanliyusask #bts").width()){
 		$("#yuanliyusask table").width($("#yuanliyusask #bts").width());
 	}
 	if($.browser.msie && $.browser.version<9){//没有圆角，没有阴影
 		$("#yuanliyusask #ok").css("border-right","2px solid #ddd").css("border-bottom","2px solid #aaa");
 		$("#yuanliyusask #cancel").css("border-right","2px solid #ddd").css("border-bottom","2px solid #aaa");
 	}
 	$("#yuanliyusask #msg_box").html(msg);
 	$("#yuanliyusask #ok").click(function(){
 		var answer = $("#yuanliyusask #answer").val();
 		$("#yuanliyusask").remove();
 		callback(answer);
 	});
 	$("#yuanliyusask #cancel").click(function(){
 		$("#yuanliyusask").remove();
 	});
 
 	if(location){
 		$("#yuanliyusask").css({"left":location.left,"top":location.top});
 	}else if(!elm){
 		$("#yuanliyusask").center();
 	}else{
 		$("#yuanliyusask").css({"left":elm.offset().left,"top":elm.offset().top+elm.height()/2});
 	};
 	$("#yuanliyusask #answer").focus();
 }
 /**
  * 自定义alert
  * @param elm
  * @param msg
  * @param callback
  * @param location
  */
 function ask3(elm,msg,location){
 	$("body").find("#yuanliyusask").remove();
 	$("body").append('<div class="yuanliyusask" id="yuanliyusask" style="position:absolute;z-index:100"></div>');
 	 
 	$("#yuanliyusask").append(
 		'<div id="ask_box" class="circle_border_8" style="background-color:white;border:5px solid #ddd;padding:10px;">\
 			<table>\
 				<tr style="vertical-align:top">\
 					<td><img src="'+getDocRoot()+'img/warning.png"style="vertical-align:-7px;margin-right:10px"/></td>\
 					<td><span id="msg_box"></span></td>\
 				</tr>\
 			</table>\
 			<div style="margin-top:20px;border:0px solid red;text-align:center">\
 				<input id="ok" type="button" value="确定" class="circle_border_2" style="background-color:#88e802;border:none;width:70px;height:24px;color:white;cursor:pointer"/>\
 			</div> \
 		</div>'
 	).draggable(); 
 	if($.browser.msie && $.browser.version<9){//没有圆角，没有阴影
 		$("#yuanliyusask #ok").css("border-right","2px solid #ddd").css("border-bottom","2px solid #aaa");
 		$("#yuanliyusask #cancel").css("border-right","2px solid #ddd").css("border-bottom","2px solid #aaa");
 	}
 	$("#yuanliyusask #msg_box").html(msg);
 	$("#yuanliyusask #ok").click(function(){
 		$("#yuanliyusask").remove();
 	});
 	if(location){
 		$("#yuanliyusask").css({"left":location.left,"top":location.top});
 	}else if(!elm){
 		$("#yuanliyusask").center();
 	}else{
 		$("#yuanliyusask").css({"left":elm.offset().left,"top":elm.offset().top+elm.height()/2});
 	};
 }
 
 function getNow(){
 	return new Date().getTime();
 } 
 /**
  * 显示提示
  * elm:不提供则居中，否则就在elm旁边
  * msg：要提示的信息
  * timeout：不提供则一直显示，否则只显示timeout时间，然后fadeout。随时点击都可以消失。
  * location:{left:23,top:23}精确控制消息框的位置
  * trytip:当为true时，只有没有其他地方正在使用tip才弹出tip
  */
 function tip(elm,msg,timeout,location,trytip){
 	if(trytip && $("body").find("#yuanliyustip").length>0){
 		return ;
 	}
 	$("body").find("#yuanliyustip").remove();
 	$("body").append('<div class="yuanliyustip" id="yuanliyustip" title="点击隐藏"></div>');
 	$("#yuanliyustip").click(function(){
 		$(this).remove();
 	});
 	$("#yuanliyustip").html(msg);
 	if(location){
 		$("#yuanliyustip").css({"left":location.left,"top":location.top});
 	}else if(!elm){
 		$("#yuanliyustip").center();
 	}else{
 		$("#yuanliyustip").css({"left":elm.offset().left,"top":elm.offset().top+elm.height()/2});
 	}
 	if(timeout){
 		setTimeout(function(){
 			$("#yuanliyustip").fadeOut(800);
 			setTimeout(function(){
 				$("#yuanliyustip").remove();
 			},800);
 		},timeout);
 	}else{
 		$("#yuanliyustip").mouseout(function(){
 			$(this).fadeOut(500);
 			setTimeout(function(){
 				$("#yuanliyustip").remove();
 			},500);
 		});
 	}
 	return $("#yuanliyustip");
 }
 /**
  * 同tip，但id不同，这样就不会被untip关闭。主要用于替代原来吴明礼的WinMesg，显示后台出错信息。
  * @param elm
  * @param msg
  * @param timeout
  * @param location
  * @param trytip
  * @returns
  */
 function tip2(elm,msg,timeout,location,trytip){
 	if(trytip && $("body").find("#yuanliyustip2").length>0){
 		return ;
 	}
 	$("body").find("#yuanliyustip2").remove();
 	$("body").append('<div class="yuanliyustip2" id="yuanliyustip2" title="点击隐藏"></div>');
 	$("#yuanliyustip2").click(function(){
 		$(this).remove();
 	});
 	$("#yuanliyustip2").html(msg);
 	if(location){
 		$("#yuanliyustip2").css({"left":location.left,"top":location.top});
 	}else if(!elm){
 		$("#yuanliyustip2").center();
 	}else{
 		$("#yuanliyustip2").css({"left":elm.offset().left,"top":elm.offset().top+elm.height()/2});
 	}
 	if(timeout){
 		setTimeout(function(){
 			$("#yuanliyustip2").fadeOut(800);
 			setTimeout(function(){
 				$("#yuanliyustip2").remove();
 			},800);
 		},timeout);
 	}else{
 		$("#yuanliyustip2").mouseout(function(){
 			$(this).fadeOut(500);
 			setTimeout(function(){
 				$("#yuanliyustip2").remove();
 			},500);
 		});
 	}
 	return $("#yuanliyustip2");
 }
 /*每次调用返回值在left和right之间切换*/
 var toggle_trigger=false;
 function toggle(left,right){
 	toggle_trigger = !toggle_trigger;
 	if(toggle_trigger){
 		return left;
 	}
 	return right;
 }
 /**
  * 关闭tip()打开的提示
  */
 function untip(){
 	$("body").find("#yuanliyustip").remove();
 }
 /**
  * @deprecated 用tip
  * @param msg
  * @param x
  * @param y
  * @param timeout
  */
 function showTip(msg,x,y,timeout){
 	if(!timeout){
 		timeout=2000;
 	}
 	$("#comm_messager").html(msg).css({"left":x,"top":y}).show().fadeOut(timeout);	
 }
 
 
 /**
  * 用二分法判断一个元素是否在数组中。数组必须是预先按从小到大排序好的。
  * @param str 可以用> 比较大小的类型
  */
 Array.prototype.contains = function(str){
 	var start = 0;
 	var end = this.length-1;
 	var curr = end;
 	if(end<0){
 		return false;
 	};
 	do{
 		if(this[curr] == str){
 			return true;
 		}
 		if(this[curr]>str){
 			end = curr;
 			curr = start + Math.floor((end - start)/2);
 		}else{
 			start = curr;
 			curr = start + Math.floor((end - start)/2);
 		};
 //		console.log("curr="+curr+" start="+start+" end="+end);
 	}while(curr>start);
 	if(this[end] == str||this[start] == str){//当end-start=1 时curr永远到不了end，所以这里再判断一下。
 		return true;
 	}
 	return false; 
 };
 Array.prototype.remove=function(e){ 
 	var l = this.length;
 	for(var i=0;i<l;i++){ 
 		if(this[0]!=e){ 
 			this.push(this.shift());
 		}else{
 			this.shift();
 		}
 	}
 	return this;
 };
 Array.prototype.add = function(e){
 	this.push(e);
 	this.sort();
 };
 /**
  * 
  * @param e
  * @param callback callback(a,b)当a b相当时返回true
  * @returns {Number}
  */
 Array.prototype.indexOf2 = function(e,callback){
 	var ret = -1;
 	each(this,function(i,n){
 //		console.log("i:"+i+" n:"+JSON.stringify(n)+" e:"+e)
 		if(callback(n,e)){
 			ret = i;
 			return false;
 		}
 	});
 	return ret;
 };
 /**
  * javascript1.8内置该函数，但很多浏览器不是这个版本
  */
 Array.prototype.indexOf = function(e,from){
     from = from || 0;
 	//if(this.indexOf) return this.indexOf(e,from);
     var len = this.length;    
     
     if (from < 0) from += len;  
 
     for (; from < len; from++){  
         if (from in this && this[from] === e){  
             return from;
         }
     }  
     return -1; 
 };
 
 var gLastRequest = 0;
 var gRequestCount = 0;
 var gTimeoutJob=null;
 /**
  * 返回距离发起下一次耗资源请求所需要等待的时间，控制用户请求频率
  */
 function getInterval(){
 	if(null != gTimeoutJob){
 		clearTimeout(gTimeoutJob);
 		gTimeoutJob = null;
 	}
 	var nw = new Date().getTime();
 	var d = nw - gLastRequest;
 	gLastRequest = nw;
 	if(d>15000){
 		gRequestCount = 0;
 		return 0;
 	}
 	gRequestCount ++;
 	if(d>5000){
 		return 0;
 	}
 	var ret = ((gRequestCount>10?10:gRequestCount)/4*1000 - d/2);
 	if(ret<0){
 		ret = 0;
 	}
 	return ret;
 };
 
 function isCtrlKey(key){
 	switch(key){
 	case 37:
 	case 38:
 	case 39:
 	case 40:
 	case 13:
 	case 8:
 	case 17:
 	case 16:
 	case 9:
 		return true;
 	default:
 		return false;
 	}
 }
 //格式化样板为：“中国型号（泰国型号）”的格式
	function formatYangban(yangban){
		if(yangban){
			var yb = "("+(yangban.taiguoxinghao?yangban.taiguoxinghao:"-")+")";
			if(yangban.zhongguoxinghao){
				yb = yangban.zhongguoxinghao+yb;
			}
			return yb;
		}else{
			return ""
		}
	}
 
 function random(min,max){
 	if(typeof min == "number"){
 		return Math.floor((max-min+1) * Math.random())+min;
 	}else{
 		return Math.floor((max+1) * Math.random());
 	}
 }
 //商家选择。把input元素设置成支持弹出商家选择框的控件
 jQuery.fn.xuanzeshangjia = function(vendors_php,callback,clearCallback){
 	if(!vendors_php){
 		vendors_php = "../contact/lianxiren.php";
 	}	
 	this.click(function(event){
 		var limit = 20;
 		setSelector(event,function(page,option,callback1){
 				postJson(vendors_php,{caozuo:"chashangjia",offset:page*limit,limit:limit,option:option},function(vendors){
 					callback1(vendors);
 				});
 			},["_id","mingchen"],function(vendor){
 				$(this).val(vendor.mingchen)
 				$(this).data("shangjia",vendor);
 				callback.call(event.target,vendor);
 				$(this).change();
 			},"",clearCallback
 		);
 	});
 	return this;
 } 
 
 jQuery.fn.xuanlianxiren = function(event,callback,clearCallback){
 	this.click(function(event){
 		var limit = 20;
 		setSelector(event,function(page,option,callback1){
 				postJson("../contact/lianxiren.php",{caozuo:"chalianxiren",offset:page*limit,limit:limit,option:option},function(vendors){
 					callback1(vendors);
 				});
 			},["_id","mingchen"],function(vendor){
 				callback.call(event.target,vendor);
 				$(this).change();
 			}
 		);
 	});
 	return this;
 }
 /*
 * 下拉列表，不带输入框的选择框
 */
 function list(event,items,obj2str,callback){
 	var selector_tmpl = $('<div id="selector">\
 			<div id="mengban" style="position:absolute;top:0px;left:0px;width:100%;height:100%;z-index:100;background-color:rgba(250,250,255,.4);"></div>\
 			<div id="panel" style="position:absolute;z-index:101;background-color:white;padding:5px;border:1px solid gray">\
 				<table></table>\
 				<div style="text-align:center"><span style="color:blue;cursor:pointer;" id="guanbi">关闭</span></div>\
 			</div>\
 		</div>');	
 	$("body").append(selector_tmpl);
 	var panel = selector_tmpl.find("#panel");
 	panel.find("table").empty();
 	each(items,function(n,obj){
 		var tr = $("<tr></tr>");
 		tr.data("background-color",toggle("#ffeeff","#eeffff"));
 		tr.css("background-color",tr.data("background-color")).css("cursor","pointer");
 		tr.append("<td>"+obj2str(obj)+"</td>");
 		panel.find("table").append(tr);
 		tr.mouseover(function(){
 			tr.css("background-color","yellow");
 		}).mouseout(function(){
 			tr.css("background-color",tr.data("background-color"));
 		}).click(function(){
 			selector_tmpl.remove();
 			callback.call(event.target,obj);
 		});
 	});
 	panel.find("#guanbi").click(function(){
 		selector_tmpl.remove();
 	}).mouseover(function(){$(this).css("color","red");}).mouseout(function(){$(this).css("color","blue");});
 	panel.css("top",event.clientY).css("left",event.clientX-panel.width()>10?event.clientX-panel.width():10);
 }
 /*
 * 带查询的选择框
 * event 点击事件，用来获取鼠标位置
 * getObjs(page,option,function(resp)) 获取列表对象的函数
 * fields 字符串数据，指定需要显示的对象的属性
 * callback(resp) 将选中的对象返回给调用者
 * option 过滤输入框的初始值
 * qingkongcallback 点击清空时回调//“清空”与“关闭”的差别仅在于调这个回调，用户在这个回调里实现清空。
 * datepick 指定option作为编码（时间）选择器，datepicker参数是回调函数设置选择日期后输入框中的值。参见liushuizhang.js
 */
 function setSelector(event,getObjs,fields,callback,option,qingkongcallback,datepick){
 		var selector_tmpl = $('<div id="selector">\
 			<div id="mengban" style="position:absolute;top:0px;left:0px;width:100%;height:100%;z-index:100;background-color:rgba(250,250,255,.4);"></div>\
 			<div id="panel" style="min-width:250px;position:absolute;z-index:101;background-color:white;padding:5px;padding-top:2px;border:1px solid gray">\
 				<input id="option" type="text" size=20 /> <div style="float:right;display:inline-block"><span style="color:blue;cursor:pointer;" id="qingkong">&nbsp;清空|</span><span style="color:blue;cursor:pointer;" id="guanbi">关闭&nbsp;</span></div>\
 				<table></table>\
 				<div style="text-align:center;padding-top:5px;width:200px"><span id="pager" style="cursor:pointer;color:blue">更多...</span></div>\
 			</div>\
 		</div>');
 		
 	$("body").append(selector_tmpl);
 	var panel = selector_tmpl.find("#panel");
 	panel.draggable();
 	if(option){
 		panel.find("#option").val(option);
 	}
 	panel.find("#pager").data("page",0);
 	if(datepick){
 		panel.find("#option").datepicker().change(function(){
 			datepick();
 			panel.find("#pager").data("page",0);
	 		listObjs();
 		});
 	}else{
	 	panel.find("#option").changexx(function(){
	 		panel.find("#pager").data("page",0);
	 		listObjs();
	 	});
	}
 	var listObjs=function(){
 		panel.find("table").empty();
 		getObjs(panel.find("#pager").data("page"),panel.find("#option").val().trim(),function(objs){
 			each(objs,function(n,obj){
 				var tr = $("<tr></tr>");
 				tr.data("background-color",toggle("#ffeeff","#eeffff"));
 				tr.css("background-color",tr.data("background-color")).css("cursor","pointer");
 				each(fields,function(m,field){
 					tr.append("<td nowrap>"+getField(obj,field)+"</td>");
 				});
 				panel.find("table").append(tr);
 				tr.mouseover(function(){
 					tr.css("background-color","yellow");
 				}).mouseout(function(){
 					tr.css("background-color",tr.data("background-color"));
 				}).click(function(){
 					selector_tmpl.remove();
 					callback.call(event.target,obj);
 				});
 			});
 		});
 	}
 	listObjs();
 	panel.find("#pager").click(function(){
 		panel.find("#pager").data("page",panel.find("#pager").data("page")+1);
 		listObjs();
 	}).mouseover(function(){$(this).css("color","red");}).mouseout(function(){$(this).css("color","blue");});
 	panel.find("#guanbi").click(function(){
 		selector_tmpl.remove();
 	}).mouseover(function(){$(this).css("color","red");}).mouseout(function(){$(this).css("color","blue");});
 	panel.find("#qingkong").click(function(){
 		selector_tmpl.remove();
 		if(qingkongcallback){
	 		qingkongcallback.call(event.target);
	 	}
 	}).mouseover(function(){$(this).css("color","red");}).mouseout(function(){$(this).css("color","blue");});
 	panel.css("top",event.clientY).css("left",event.clientX-panel.width()>10?event.clientX-panel.width():10);
 }
 //getFields(dingdan,"shangjia.mingchen");
 function getField(obj,fields){
 	return _getField(obj,fields.split("."));
 }
 function _getField(obj,fields){
 		var ret = obj;
 		for(var i=0;i<fields.length;i++){
 			ret = ret[fields[i]];
 			if(!ret){
 				return "";
 			}
 		}
 		return ret;
 }
 
 /*
 * 带输入框的选择框
 * 
 */
 function setSelector2(event, items, callback){
 	var selector_tmpl = $('<div id="selector">\
 			<div id="mengban" style="position:absolute;top:0px;left:0px;width:100%;height:100%;z-index:100;background-color:rgba(250,250,255,.4);"></div>\
 			<div id="panel" style="position:absolute;z-index:101;background-color:white;padding:5px;border:1px solid gray">\
 				<input id="option" type="text" size=1/>\
 				<table></table>\
 				<div style="text-align:center"><span style="color:blue;cursor:pointer;" id="guanbi">关闭</span></div>\
 			</div>\
 		</div>');	
 	$("body").append(selector_tmpl);
 	var panel = selector_tmpl.find("#panel");
 	panel.find("table").empty();
 	each(items,function(n,obj){
 		var tr = $("<tr></tr>");
 		tr.data("background-color",toggle("#ffeeff","#eeffff"));
 		tr.css("background-color",tr.data("background-color")).css("cursor","pointer");
 		tr.append("<td>"+obj+"</td>");
 		panel.find("table").append(tr);
 		tr.mouseover(function(){
 			tr.css("background-color","yellow");
 		}).mouseout(function(){
 			tr.css("background-color",tr.data("background-color"));
 		}).click(function(){
 			selector_tmpl.remove();
 			callback.call(event.target,obj);
 		});
 	});
 	panel.find("#option").css("width","100%").keydown(function(event){
 		if(event.keyCode == 13 && $(this).val().trim() != ""){
 			selector_tmpl.remove();
 			callback.call(event.target,$(this).val().trim());
 		}
 	});
 	panel.find("#guanbi").click(function(){
 		selector_tmpl.remove();
 	}).mouseover(function(){$(this).css("color","red");}).mouseout(function(){$(this).css("color","blue");});
 	panel.css("top",event.clientY).css("left",event.clientX-panel.width()>10?event.clientX-panel.width():10);
 }
 //设置日历控件语言为中文
 jQuery(function($){
 	$.datepicker.regional['zh-CN'] = {clearText: '清除', clearStatus: '清除已选日期',
 		closeText: '关闭', closeStatus: '不改变当前选择',
 		prevText: '&lt;上月', prevStatus: '显示上月',
 		nextText: '下月&gt;', nextStatus: '显示下月',
 		currentText: '今天', currentStatus: '显示本月',
 		monthNames: ['一月','二月','三月','四月','五月','六月',
 		'七月','八月','九月','十月','十一月','十二月'],
 		monthNamesShort: ['一','二','三','四','五','六',
 		'七','八','九','十','十一','十二'],
 		monthStatus: '选择月份', yearStatus: '选择年份',
 		weekHeader: '周', weekStatus: '年内周次',
 		dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
 		dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
 		dayNamesMin: ['日','一','二','三','四','五','六'],
 		dayStatus: '设置 DD 为一周起始', dateStatus: '选择 m月 d日, DD',
 		dateFormat: 'yy/mm/dd', firstDay: 1, 
 		initStatus: '请选择日期', isRTL: false};
 	$.datepicker.setDefaults($.datepicker.regional['zh-CN']);
 });

 
 function parseInt2(str){
 	var ret = parseInt(str);
 	if(isNaN(ret)){
 		return undefined;
 	}
 	return ret;
 }
function parseFloat3(str){
 	var ret = parseFloat(str);
 	if(isNaN(ret)){
 		return 0;
 	}
 	return ret;
 }
 function parseFloat2(str){
 	var ret = parseFloat(str);
 	if(isNaN(ret)){
 		return undefined;
 	}
 	return ret;
 }
 function getKemu(){
	return ["货款",
					"开票",
					"收汇",
					"核销",
					"退税",
					"快递费",
					"泰国进账",
					"薪金",
					"办公费",
					"社保",
					"租金",
					"运费",
					"活动费",
					"银行手续费",
					"代付",
					"利息",
					"贷款",
					"还贷",
					"个人消费",
					"代理费",
					"平帐",
					"备用1",
					"备用2",
					"其他"];
 }
 jQuery.fn.kemu = function(items){
 		var kms = getKemu();
 		if(items && items.length>0){
 			kms = items.concat(kms);
 		}
	 	return this.myselector(kms);	
	}
 //利用input的list属性，动态设置下拉框控件
 jQuery.fn.myselector = function(values,valueField,labelField){
 	var listId = this.attr("id")+"_list";
 	this.attr("list",listId);
 	var list = $("<datalist></datalist>").attr("id",listId);
 	var option;
 	each(values,function(n,value){
 		if(valueField){
 			option = $("<option value='"+value[valueField]+"'/>");
 		}else{
 			option = $("<option value='"+value+"'/>");
 		}
 		if(labelField){
 				option.attr("label",value[labelField]);
 		}		
 		list.append(option);
 	});
 	$("body").append(list);
 	//this.dblclick(function(){$(this).val("")});
 	return this;
 }
 jQuery.fn.userSelector = function(){
 	var listId = this.attr("id")+"_list";
 	this.attr("list",listId);
 	var list = $("<datalist></datalist>").attr("id",listId);
 	each(getUsers(),function(n,value){
 		list.append("<option value='"+value.user_name+"' label='"+value._id+"'/>");
 	});
 	//this.bind("input",function(){console.log($("#"+listId+" option:selected"))});
 	$("body").append(list);
 }
	function date2id(d){//2013/12/12 131212
		return d.substring(2,4)+d.substring(5,7)+d.substr(8)
	}
 function int2Date(i){
 	if("undefined" == typeof i){
 		return "";
 	}
 	var d = new Date(i);
 	return d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate();
 }
 //yyyy/mm/dd字符串转成毫秒数
 function date2Int(d){
 	try{
 		return Date.parse(d);
 	}
catch(e){
 		return 0;
 	} }
 /*
 option={width:1;docRoot:"../../../"}
 */
 jQuery.fn.liuyan = function(option){
 		var opt = $.extend({
 				docRoot:"../../../",
 				width:700,
 				height:200
 			},option);
 		//编辑器定义 “图片”和“地图”按钮
 	 var plugins={
 	   		map:{
 	   			c:'btnMap',
 	   			t:'插入地图',
 	   			e:function(){
 	   				var _this=this;
 	   				_this.saveBookmark();
 	   				_this.showIframeModal('Google 地图',opt.docRoot+'xheditor-1.2.1/demos/googlemap/googlemap.html',function(v){
 	   					_this.loadBookmark();
 	   					_this.pasteHTML('<img src="'+v+'" />');
 	   				},538,404);		
 	   			}
 	   		},
 	   		pic:{
 	   			c:'btnPic',
 	   			t:'插入图片',
 	   			e:function(){
 	   				editor.showModal("上传本地图片","<div id='file-uploader-demo2'></div>",120,50,function(){});
 	   				 var uploader2 = new qq.FileUploader({
 	   		                element: $("#file-uploader-demo2")[0],
 	   		                action: opt.docRoot+'uploader/server/up.php',
 	   		                params:{'memo':'new'},
 	   		                debug: true,
 	   		                onComplete: function(id, fileName, respJson){
 	   		                	var src = opt.docRoot+"uploader/server/down.php?id="+respJson.id;
 	   		                	//editor.pasteHTML("<img src="+opt.docRoot+"uploader/server/down.php?id="+respJson.id+"' style='max-width:400px;cursor:pointer'/>");
 	   		                	editor.pasteHTML("<a href='"+src+"' target=_blank ><img src='"+src+"' style='max-width:400px'/></a>");
 	   		                },
 	   		            });
 	   				editor.removeModal();
 	   				 uploader2._button.getInput().click();
 	   			}
 	   		},
 	   		attach:{
 	   			c:'btnAttach',
 	   			t:'插入附件',
 	   			e:function(){}
 	   		}
 	 };
 	var that = this;
 	this.empty().css("width","100%").attr("align","center").css("margin-top","80px").css("border","1px solid gray");
 	this.append("<div><span id='ly_liuyan' class='plainBtn'>留言</span></div>");
 	this.append("<div id='ly_editor' style='display:none'><textarea></textarea></div>");
 	this.append("<table id='ly_liebiao' style='font-size:14px;color:#008000;margin:10px'></table>");
 	this.append("<div><span class='plainBtn' id='ly_gengduo'>更多...</span></div>");
 	var editor = $("textarea",this).xheditor({plugins:plugins,
 		tools:'Fontface,FontSize,Bold,Italic,Underline,Strikethrough,FontColor,BackColor,Removeformat,|,Align,List,Outdent,Indent,|,Link,Unlink,Img,Hr,Emot,Table,|,Preview,Print,Fullscreen,|,map,|,pic,|,attach,|',
 		width:opt.width,height:opt.height});
 	$("#ly_editor",this).append("<div style='margin-top:10px'><span id='ly_tijiao' class='plainBtn' style='margin-right:50px'>提交</span><span id='ly_fangqi' class='plainBtn'>放弃</span></div>");
 	$("#ly_liuyan",this).click(function(){
 		$(this).hide();
 		$("textarea",that).val("");
 		$("#ly_editor",that).show();
 	});
 	$("#ly_fangqi",this).click(function(){
 		$("#ly_liuyan",that).show();
 		$("#ly_editor",that).hide();
 	});
 	$("#ly_tijiao",this).click(function(){
 		if($("textarea",that).val().trim() == ""){
 			tip($(this),"留言内容不能为空",1500);
 			return;
 		}
 		if(!opt.hostId || !getTheUser()||!opt.hostType){
 			return;
 		}
 		var obj ={
 			hostType:opt.hostType,
 			hostId:opt.hostId,
 			userId:getTheUser()._id,
 			type:"留言",
 			neirong:$("textarea",that).val().trim()
 			};
 		postJson(opt.docRoot+"liuyan/liuyan.php",obj,function(res){
 			tip(null,"成功提交留言！",2000);
 			$("#ly_liuyan",that).show();
 			$("#ly_editor",that).hide();
 			that.shuaxinliebiao();
 		});
 	});
 	function fanye(){
		postJson(opt.docRoot+"liuyan/liuyan.php",{page:$("#ly_gengduo",that).data("page"),limit:20,hostType:opt.hostType,hostId:opt.hostId},function(liuyans){
			if(liuyans.length<20){
				$("#ly_gengduo",that).hide();
			}else{
				$("#ly_gengduo",that).show();
			}
 			$("#ly_liebiao",that).empty();
 			each(liuyans,function(n,ly){
 				var tr = $('<tr>\
 				<td style="vertical-align:top">\
 					<div style="display:inline-block;border:3px solid #fff;width:50px;height:50px;border-radius:28px;box-shadow:0px 2px 1px rgba(128,128,128,.5);">\
 						<img id="d_head" style="width:48px;height:48px;border-radius:25px;"/>\
 					</div>\
 				</td>\
 				<td style="padding-left:10px;font-size:12px">姓名：<span id="d_name"></span>\
 					日期：<span id="d_date">2013-04-18</span>\
 					时间：<span id="d_time">17:23:32</span>\
 					<div style="font-size:16px;margin-bottom1:10px;color:black;background-color:#f6f6f6;padding:10px;margin-top:5px;border-radius:10px;line-height:1.75em" id="d_content">content</div>\
 				</td>\
 				</tr>');
 				
 				tr.find("#d_head").attr("src",getUser(ly.userId).photo);
				tr.find("#d_name").text(getUser(ly.userId).user_name);
				tr.find("#d_date").text(new Date(ly._id*1000).format("yyyy-MM-dd"));
				tr.find("#d_time").text(new Date(ly._id*1000).format("hh:mm:ss"));
				
				if(ly.neirong.length>100){
					tr.find("#d_content").html(ly.neirong.truncate(100)+"<span class='plainBtn'>...[+]</span>");
				}else{
					tr.find("#d_content").html(ly.neirong);
				}	
				tr.find("#d_content").click(function(){$(this).html(ly.neirong)});
 				$("#ly_liebiao",that).append(tr);	
			});

		});
 	};
	this.clearliuyan = function(){$("#ly_liebiao",that).empty();};
 	this.shuaxinliebiao = function(option){
 		if(option){
 			opt = $.extend(opt,option);
 		}
 		$("#ly_gengduo",that).data("page",0);
 		fanye();
 	};
 	this.setOption = function(option){
 		opt = $.extend(opt,option);
 	}
 	return this;
 }
 
 //封装xheditor封装 w:width h:height r:指当前脚本相对于root的路径（可选）
 jQuery.fn.myeditor = function (w,h,r) {
 	if("undefined" == typeof r){
 		r = "../../../";
 	}
 	
 	//编辑器定义 “图片”和“地图”按钮
 	 var plugins={
 	   		map:{
 	   			c:'btnMap',
 	   			t:'插入地图',
 	   			e:function(){
 	   				var _this=this;
 	   				_this.saveBookmark();
 	   				_this.showIframeModal('Google 地图',r+'xheditor-1.2.1/demos/googlemap/googlemap.html',function(v){
 	   					_this.loadBookmark();
 	   					_this.pasteHTML('<img src="'+v+'" />');
 	   				},538,404);		
 	   			}
 	   		},
 	   		pic:{
 	   			c:'btnPic',
 	   			t:'插入图片',
 	   			e:function(){
 	   				//editor.pasteHTML("<img src='../img/attach.jpg'/>");
 	   				var _this=this;
 	   				//editor.showModal("上传本地图片","<div id='file-uploader-demo2'></div>",120,50,function(){});
 	   				_this.showModal("上传本地图片","<div id='file-uploader-demo1'></div>",120,50,function(){});
 	   				 var uploader1 = new qq.FileUploader({
 	   		                element: $("#file-uploader-demo1")[0],
 	   		                action: r+'uploader/server/up.php',
 	   		                params:{'memo':'new'},
 	   		                debug: true,
 	   		                onComplete: function(id, fileName, respJson){
 	   		                	//{"id":16,"success":true}
 	   		                	var src = r+"uploader/server/down.php?id="+respJson.id;
 	   		                	//editor.pasteHTML("<a href='"+src+"' target=_blank ><img src='"+src+"' style='max-width:"+(w-20)+"px'/></a>");
 	   		                	_this.pasteHTML("<a href='"+src+"' target=_blank ><img src='"+src+"' style='max-width:"+Math.min(w-20,500)+"px'/></a>");
 	   		                },
 	   		            });
 	   				//editor.removeModal();
 	   				_this.removeModal();
 	   				 uploader1._button.getInput().click();
 	   			}
 	   		},
 	   		attach:{
 	   			c:'btnAttach',
 	   			t:'插入附件',
 	   			e:function(){}
 	   		}
 	 };
 	 
 	 this.empty();
 	 this.append('\
 	 			<div id="editor_div1" style="font-size:80%;width:'+w+'px;border:1px solid #ede;" ></div>\
 				<div id="editor_div2"><textarea></textarea></div>');
 	 //编辑器设置
   var editor = this.find("textarea").xheditor({plugins:plugins,
 		tools:'Fontface,FontSize,Bold,Italic,Underline,Strikethrough,FontColor,BackColor,Removeformat,|,Align,List,Outdent,Indent,|,Link,Unlink,Img,Hr,Emot,Table,|,Preview,Print,Fullscreen,|,map,|,pic,|,attach,|',
 		width:w,height:h});
 	return this;
 }
 jQuery.fn.editorWritable = function(){
 	this.find("#editor_div1").hide();
 	this.find("#editor_div2").show();
 	return this;
 };
 jQuery.fn.editorReadonly = function(){
 	this.find("#editor_div1").show();
 	this.find("#editor_div2").hide();
 	return this;
 };
 jQuery.fn.editorVal = function(v){
 	if(arguments.length==0){
 		return this.find("textarea").val().trim();
 	}else{
 		if("undefined" === typeof v){
 			v="";
 		}
 		this.find("#editor_div1").html(v);
 		this.find("textarea").val(v);
 		return this;
 	}
 }
 	function clearSelection() { //清楚双击选择
    if(document.selection && document.selection.empty) { 
        document.selection.empty(); 
    } 
    else if(window.getSelection) { 
        var sel = window.getSelection(); 
        sel.removeAllRanges(); 
    } 
	} 