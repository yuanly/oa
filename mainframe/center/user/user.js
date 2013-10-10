
			$(function(){
				var theUser = getTheUser();
				//设置背景风格
				if(theUser.bg){
					$("#bgImg").css("background-image","url(../../../login/image/"+theUser.bg+"/"+random(1,15)+".jpg)");
				}else{
					$("bgImg").css("background-image","url(../../../login/image/landscape/"+random(1,15)+".jpg)");
				}
				
				//设置表单内容
				$("#userName").val(theUser.user_name); 
				$("#selRole > option[value="+(theUser.role?theUser.role:"operator")+"]").attr("selected",true);
				$("#portrait").attr("src",(theUser.photo?theUser.photo:(getDocRoot()+"logo/noface.jpg")));
				if("manager"==theUser.role || "root"==theUser.role){
					$("#newUser").show();
					$("#moreUser").show();
				}
				
				//更改背景风格
				$("#selBg").change(function(){
					$("#bgImg").css("background-image","url(../../../login/image/"+$(this).val()+"/"+random(1,15)+".jpg)");
				});
				
				//开启编辑模式
				$("#enableEdit").click(function(){
					$(".editable").removeAttr("disabled");	
					$("#submit").show();
					$(this).hide();
					$("#handle").text("编辑用户");
					$("#newUser").hide();
					$("#moreUser").hide();
				});
				//更改密码
				$("#changepassword").click(function(){
					if("none" == $("#submit").css("display")){
						return;
					}
					if("取消更改" != $(this).text()){
						$("#pwcontainer").show();
						$(this).text("取消更改");
					}else{
						$("#pwcontainer").hide();
						$(this).text("更改密码");
					}
				});
				//设置头像
				$("#portrait").click(function(){
					if("none" == $("#submit").css("display")){
						return;
					}
					var uploader1 = new qq.FileUploader({
     		                element: $("#file-uploader-demo2")[0],
     		                action: '../../../uploader/server/up.php',
     		                params:{'memo':'portrait'},
     		                debug: true,
     		                onComplete: function(id, fileName, respJson){
     		                	//{"id":16,"success":true}
     		                	$("#portrait").attr("src",getDocRoot()+"uploader/server/down.php?id="+respJson.id);
     		                	$("#portrait").data("imgId",respJson.id);
     		                },
     		            }); 
     			uploader1._button.getInput().click();
				});
				//新增用户
				$("#newUser").click(function(){
					$("#handle").text("新增用户");
					$("#userName").val("");
					$("#portrait").attr("src","../../../logo/noface.jpg");
					$("#selRole > option[value=operator]").attr("selected",true);
					$("#selBg > option[value=landscape]").attr("selected",true);
					$("#pwcontainer").show();
					$("#pwTrigger").hide();
					$(".editable").removeAttr("disabled");	
					$("#userName").removeAttr("disabled");
					$("#selRole").removeAttr("disabled");
					$("#submit").show();
					$("#enableEdit").hide();
					$(this).hide();
				});
				//提交
				$("#submit").click(function(){
					var usr = {};
					//密码校验
					if("none" != $("#pwcontainer").css("display")){
						if($("#newPassword").val().trim() != $("#verifyPassword").val().trim()){
							tip(null,"密码校验失败！",3);
							return;
						}
						usr.password = $("#newPassword").val().trim();
					}
					if("" == $("#userName").val().trim()){
						tip(null,"用户名称不能为空！",3);
						return;
					}
					usr.user_name = $("#userName").val().trim();
					usr.role = $("#selRole").val();
					usr.bg = $("#selBg").val();
					if($("#portrait").data("imgId")){
						usr.photo = $("#portrait").data("imgId");
					}
					if("编辑用户" == $("#handle").text()){
						usr._id = getTheUser()._id;
					}
					//console.log(usr);
					postJson("user.php",usr,function(res){
						if(res.success){
							if("编辑用户" == $("#handle").text()){
								tip(null,"成功更改用户信息！",3);
							}else{
								tip(null,"成功新增用户！",3);
							}
							$("#submit").hide();
						}else if(res.err){
							ask3(null,res.err);
						}else{
							ask3(null,"系统出错了，请联系技术人员！");
						}
					});
				});
				//”更多“ 在用户列表这设置用户状态：禁用 启用
				$("#moreUser").click(function(){
					window.location.href="users.html";
				}); 
			});