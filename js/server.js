/**
 * 
 */

function ajaxSend(url, data, success, method, async) {
	$.ajax({
		url: url,
		data: data,
		dataType: "json",
		type : method || "GET",
		async : async || false,
		success: success,
		error : function(jqxhr, status, exText){
			console.log("服务器异常， 请稍后重试！");
		}
	});
}
function post(url, data, success) {
	$.ajax({
		url: url,
		data: data,
		dataType: "json",
		type : "POST",
		async : true,
		success: success,
		error : function(jqxhr, status, exText){
			console.log(JSON.stringify(jqxhr));
			console.log("服务器异常， 请稍后重试！");
		}
	});
}
function postJsonSync(url, data, success) {
	data = "json="+encodeURIComponent(JSON.stringify(data));
	$.ajax({
		url: url,
		data: data,
		dataType: "json",
		type : "POST",
		async : false,
		success: function(obj){
			if(obj.redirect){
				window.top.location.href = obj.redirect;
			}
			success(obj);
		},
		error : function(jqxhr, status, exText){
			console.log("服务器异常， 请联系技术人员！");
		}
	});
}
function postJson(url, data, success) {
	data = "json="+encodeURIComponent(JSON.stringify(data));
	$.ajax({
		url: url,
		data: data,
		dataType: "json",
		type : "POST",
		async : true,
		success: function(obj){
			if(obj.redirect){
				window.top.location.href = obj.redirect;
			}
			if(obj.success === false){
				tip(null,"服务器异常， 请联系技术人员！",1500);
			}else{
				success(obj);
			}
		},
		error : function(jqxhr, status, exText){
			console.log("服务器异常， 请联系技术人员！");
			tip(null,"服务器异常， 请联系技术人员！",1500);
		}
	});
}
var server = {
	debug:false,
	user:null,

	loginPage:/**
	获取登录页面需要的信息：用户，图片。
	 * @returns {___anonymous91_1939}
	 */
	function(){
		if(server.debug){
			return {"users":[
			             	{"_id":1,"role":"root","user_name":"yuanly","bg":"landscape","photo":"/oa/logo/yuanly_yuanly_200807091.JPG"},
			            	{"user_name":"伍珊","bg":"gqj","photo":"/oa/logo/wushan_1.jpg"},
			            	{"user_name":"陈敏贤","photo":"/oa/logo/noface.jpg"},
			            	{"_id":4,"user_name":"伍伦","role":"manager","photo":"/oa/logo/wulun_1.JPG"},
			            	{"_id":5,"user_name":"朱佩霞","photo":"/oa/logo/zhupeixia_1.jpg"},
			            	{"user_name":"陈少霞 ","photo":"/oa/logo/noface.jpg"},
			            	{"_id":6,"user_name":"燕和","role":"root","photo":"/oa/logo/燕和_yanhe.jpg"},
			            	{"user_name":"叶燕羽","photo":"/oa/logo/叶燕羽_3.jpg"},
			            	{"user_name":"王彭晶","photo":"/oa/logo/noface.jpg"},
			            	{"user_name":"陈焕珊","photo":"/oa/logo/noface.jpg"},
			            	{"user_name":"江雅丽","photo":"/oa/logo/noface.jpg"},
			            	{"user_name":"胡嘉湲","photo":"/oa/logo/胡嘉湲_IMG_20120120_214736__编辑.jpg"},
			            	{"user_name":"梁珍","photo":"/oa/logo/noface.jpg"},
			            	{"user_name":"卢培成","photo":"/oa/logo/noface.jpg"},
			            	{"user_name":"张建新","photo":"/oa/logo/noface.jpg"},
			            	{"user_name":"黄嘉惠","photo":"/oa/logo/noface.jpg"}],
			            "background":["/oa/desktop/changlong/IMG_1.JPG","/oa/desktop/changlong/IMG_2.JPG","/oa/desktop/changlong/IMG_3.JPG"],
			            "roll":["\/oa\/desktop\/roll\/DSC08615 (Custom).JPG","\/oa\/desktop\/roll\/DSC08616 (Custom).JPG","\/oa\/desktop\/roll\/DSC08617 (Custom).JPG","\/oa\/desktop\/roll\/DSC08621 (Custom).JPG","\/oa\/desktop\/roll\/DSC08622 (Custom).JPG","\/oa\/desktop\/roll\/DSC08623 (Custom).JPG","\/oa\/desktop\/roll\/DSC08624 (Custom).JPG","\/oa\/desktop\/roll\/DSC08625 (Custom).JPG","\/oa\/desktop\/roll\/DSC08626 (Custom).JPG","\/oa\/desktop\/roll\/DSC08627 (Custom).JPG"],
			            "cul":"专注成就深度，专业成就品质"};
		}
		
		var ret = null;
		ajaxSend("./login.php",null,function(result){
			ret = result;
		},"POST");
		return ret;
	},
	login:function(user_id,password){
		var ret = false;
		ajaxSend("./checkuser.php",{"user_id":encodeURIComponent(user_id),"password":password},function(result){
			ret = result;
		},"POST");
		return ret;
	},
	getTheUser:function(callback){
		if(this.user){
			callback(this.user);
		}else{
			post("./mainframe.php",{"cmd":"getUser"},function(resp){
				this.user = resp;
				callback(this.user);
			});	
		}
	},
	postNew:function(theNew,callback){
		postJson("./postnew.php",theNew,callback);
	},
	getnews:function(page,type,callback){
		post("./getnews.php",{"page":page,"type":type},callback);
	},
	replyNew:function(reply,callback){
		postJson("./replynew.php",reply,callback);
	},
	getNewsReplies:function(newId,callback){
		post("./getnewsreplies.php",{"newId":newId},callback);
	}
};