		$(function(){
			//从服务器获取全部用户信息
			var content = server.loginPage();
			each(content.users,function(n,usr){
				if(!isNaN(usr.photo)){
					usr.photo = getImgUrl(usr.photo);
				}else if(!usr.photo){
					usr.photo="../logo/noface.jpg";
				}else{
					usr.photo = "/oa/logo/"+usr.photo;
				}
			});
			localStorage.setItem("users",JSON.stringify(content.users));
			//设置当前用户
			var lastUser = getLastUser();
			
			$("#theusername").text(lastUser.user_name);
			$("#theuser").attr("src",lastUser.photo);
			//设置全部用户
			usertable = $("#users table").remove();  
			each(content.users,function(n,user){
				if(!user.ban){
					var atable =  usertable.clone();
					if("yuanly" == user.user_name){
						user.user_name = "袁立宇";
					}
					$("#username",atable).text(user.user_name);
					$("#userhead",atable).attr("src",user.photo);
					$("#users").append("&nbsp;").append(atable); 
					atable.click(function(){
						$("#theusername").text(user.user_name);
						$("#theuser").attr("src",user.photo);
						setLastUser(user);
						setBG(user);
						lastUser=user;
						$("#users").hide();
						$("#password").focus();
					});
				}
			});
			
			setBG(lastUser);
			//设置背景图片
			function setBG(theuser){
				if(theuser.bg){
					$("body").css("background-image","url(image/"+theuser.bg+"/"+random(1,15)+".jpg)");
				}else{
					$("body").css("background-image","url(image/landscape/"+random(1,15)+".jpg)");
				}
			}
			$("#theuser").parent().click(function(){
				$("#users").show();	
			});
			//聚焦到密码框
			$("#password").focus();
			//登录
			$("#loginicon").click(function(){
				var password = $.trim($("#password").val());
				if(server.login(lastUser._id,password)){
					setTheUser(lastUser);
					window.open("../mainframe/mainframe.html","_self");
				}else{
					tip(null,"登录失败！",2);
				}
			});
			
			$("#password").keypress(function(event){
				if(13 == event.keyCode){
					$("#loginicon").click();
				}
			});
		});