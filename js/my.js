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
}

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
					<td><img src="./img/help.png"style="vertical-align:-7px;margin-right:10px"/></td>\
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
//function newPlainBtn(img,text,id,title){
//	var ret = $('<span class=plainBtn><img src="'+img+'" style="width:16px;height:16x;vertical-align:text-bottom;"/>'+text+'</span>');
//	if(id){
//		ret.attr("id",id);
//	}
//	if(title){
//		ret.attr("title",title);
//	}
//	return ret;
//}

function random(max,min){
	if(typeof min == "number"){
		return Math.floor((max-min+1) * Math.random())+min;
	}else{
		return Math.floor((max+1) * Math.random());
	}
}

/*
* 带查询的选择框
* event 点击事件，用来获取鼠标位置
* getObjs(page,option,function(resp)) 获取列表对象的函数
* fields 字符串数据，指定需要显示的对象的属性
* callback(resp) 将选中的对象返回给调用者
*/
function setSelector(event,getObjs,fields,callback){
		var selector_tmpl = $('<div id="selector">\
			<div id="mengban" style="position:absolute;top:0px;left:0px;width:100%;height:100%;z-index:100;background-color:rgba(250,250,255,.4);"></div>\
			<div id="panel" style="position:absolute;z-index:101;background-color:white;padding:5px;border:1px solid gray">\
				<input id="option" type="text" size=20 /> <span style="color:blue;cursor:pointer;float:right" id="guanbi">关闭</span>\
				<table></table>\
				<div style="text-align:center;padding-top:5px;width:200px"><span id="pager" style="cursor:pointer;color:blue">更多...</span></div>\
			</div>\
		</div>');
		
	$("body").append(selector_tmpl);
	var panel = selector_tmpl.find("#panel");
	panel.find("#pager").data("page",0);
	panel.find("#option").changex(function(){
		panel.find("#pager").data("page",0);
		listObjs();
	});
	var listObjs=function(){
		panel.find("table").empty();
		getObjs(panel.find("#pager").data("page"),panel.find("#option").val(),function(objs){
			each(objs,function(n,obj){
				var tr = $("<tr></tr>");
				tr.data("background-color",toggle("#ffeeff","#eeffff"));
				tr.css("background-color",tr.data("background-color")).css("cursor","pointer");
				each(fields,function(m,field){
					tr.append("<td>"+obj[field]+"</td>");
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
	panel.css("top",event.clientY).css("left",event.clientX-panel.width()>10?event.clientX-panel.width():10);
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
