/*
{
	_id:"xx",
	access:111232,
	mingchen:"xxx",
	py:["xx"],
	bianma:"xx",//几个英文字母缩写，打印柜单时候用到
	quyu:"xx",//区域，如“花都”“中大”,有时需要按区域搜索商家
	dizhi:"xxx",
	beizhu:"xxx",
	dianhualiebiao:["","",...],
	zhanghuliebiao:[{zhanghao:,huming:,yinhang:,wangdian:},...],
	shangjia:{_id:"xx",mingchen:"xx",py:[]},	//如果是商家类型，则填自己
	leixing:"xx",//geren（个人） shangjia（商家）
	yanyuodizhi:"xxx",//商家才需要
	zhiwu:"xxx"//个人才需要
}
商家作为特殊的联系人。
*/

$(function(){
	$('#currLocation', window.parent.document).text("联系人");

	var currContact = null;
	var limit = 35;
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});

	//删除电话
	$("#tel_tmpl > span").click(function(){
		$(this).parent().remove();
	});
	//删除帐号
	$("#zhanghu_tmpl > span").click(function(){
		$(this).parent().remove();
	});
	//银行选中
	//$("#zhanghu_tmpl > #yinhang").click(function(event){
//	function yinhangclickhandler(event){
//		setSelector2(event,["农业银行","建设银行","工商银行","光大银行","商业银行","农商银行","交通银行","中国银行"],function(yinhang){
//			$(this).val(yinhang);
//		});
//	}

		//设置记录点击处理，在模板被剥离前。
	$(".tr_contact").click(function(){		
		$(".selected").removeClass("selected");
		$(this).addClass("selected");
		showDetail($(this).data("_id"));
	});
	var tr_contact = $(".tr_contact").detach();
	//剥离动态模板。注：剥离必须在以上事件设置之后进行。
	var telTmpl = $("#tel_tmpl").detach();
//$(".yinhang").click(yinhangclickhandler);
	
	//编辑器定义 “图片”和“地图”按钮
		 var plugins={
	     		map:{
	     			c:'btnMap',
	     			t:'插入地图',
	     			e:function(){
	     				var _this=this;
	     				_this.saveBookmark();
	     				_this.showIframeModal('Google 地图','../../../xheditor-1.2.1/demos/googlemap/googlemap.html',function(v){
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
	     				editor.showModal("上传本地图片","<div id='file-uploader-demo2'></div>",120,50,function(){});
	     				 var uploader1 = new qq.FileUploader({
	     		                element: $("#file-uploader-demo2")[0],
	     		                action: '../../../uploader/server/up.php',
	     		                params:{'memo':'new'},
	     		                debug: true,
	     		                onComplete: function(id, fileName, respJson){
	     		                	//{"id":16,"success":true}
	     		                	editor.pasteHTML("<img src='../../../uploader/server/down.php?id="+respJson.id+"'/>");
	     		                },
	     		            });
	     				editor.removeModal();
	     				 uploader1._button.getInput().click();
	     			}
	     		},
	     		attach:{
	     			c:'btnAttach',
	     			t:'插入附件',
	     			e:function(){}
	     		}
	     };
	    //编辑器设置
	    var editor = $("#beizhu").xheditor({plugins:plugins,
				tools:'Fontface,FontSize,Bold,Italic,Underline,Strikethrough,FontColor,BackColor,Removeformat,|,Align,List,Outdent,Indent,|,Link,Unlink,Img,Hr,Emot,Table,|,Preview,Print,Fullscreen,|,map,|,pic,|,attach,|',
				width:700,height:200});

	
	//添加电话
	$("#jiadianhua").click(function(){
		$(this).before(telTmpl.clone(true));
	});
	function tianjiazhanghu(){
		 var zh = zhanghuTmpl.clone(true);
		 zh.find(".handwrite").removeAttr("readonly");
		 zh.find(".yinhang").removeAttr("readonly");
		$(this).before(zh);
	}
	//添加账户
	$("#jiazhanghu").click(tianjiazhanghu);
	//商家选择
	function shangjiaclickhandler(event){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("lianxiren.php",{caozuo:"chashangjia",offset:page*limit,limit:limit,option:option},function(vendors){
					callback(vendors);
				});
			},["_id","mingchen"],function(vendor){//选中回调
				$("#shangjia").val(vendor.mingchen);
				$("#shangjia").data("shangjia",vendor);
				if("" == $("#dizhi").val().trim()){
					$("#dizhi").vals(vendor.dizhi);
				}
			},"",function(){//清空回调
				$("#shangjia").val("");
				$("#shangjia").removeData("shangjia");
			}
		);
	} 
	$("#jinshangjia").change(function(){
		listContacts(0);
		});
	//将contact对象设置到表单 支持空联系人（即新增联系人）
	function obj2form(contact){
		currContact = contact;
		if(contact._id){
			$("#bianhao").text(contact._id);
		}else{
			$("#bianhao").text("【新增】");
		};
		$("#leixing").vals(contact.leixing);
		$("#mingchen").vals(contact.mingchen);
		if(contact.shangjia){
			$("#shangjia").data("shangjia",contact.shangjia);
			$("#shangjia").vals(contact.shangjia.mingchen);
		}else{
			$("#shangjia").vals("");
		}
		$("#zhiwu").vals(contact.zhiwu);
		$("#yanhuodizhi").vals(contact.yanhuodizhi);
		$("#bianma").vals(contact.bianma);
		$("#quyu").vals(contact.quyu);
		if("个人" == contact.leixing){
			$("#tr_geren").show();
			$(".tr_shangjia").hide();
		}else if("商家" == contact.leixing){
			$("#tr_geren").hide();
			$(".tr_shangjia").show();
			$("#bianma").vals(contact.bianma);
			$("#quyu").vals(contact.quyu);
		}
		$("#dizhi").vals(contact.dizhi);
		$("#beizhu").vals(contact.beizhu);
		$("#beizhu2").html(contact.beizhu);
		
		var jiadianhua = $("#jiadianhua").detach();
		$("#dianhualiebiao").empty();
		each(contact.dianhualiebiao,function(n,dianhua){
			var tel = telTmpl.clone(true);
			tel.find("input").val(dianhua);
			$("#dianhualiebiao").append(tel);
		});
		$("#dianhualiebiao").append(jiadianhua);		
		
		$("#zhanghuliebiao").empty();
		each(contact.zhanghuliebiao,function(n,zhanghu){
			var zh = zhanghuTmpl.clone(true);
			zh.find("#yinhang").val(zhanghu.yinhang);
			zh.find("#wangdian").val(zhanghu.wangdian);
			zh.find("#huming").val(zhanghu.huming);
			zh.find("#zhanghao").val(zhanghu.zhanghao);
			$("#zhanghuliebiao").append(zh);
		});
		$("#zhanghuliebiao").append(jiazhanghu.clone(true));		
	}
	$("#leixing").bind("input",function(){
		if("个人" == $(this).val()){
			$("#tr_geren").show();$(".tr_shangjia").hide();
		}else if("商家" == $(this).val()){
			$("#tr_geren").hide();$(".tr_shangjia").show();
		}
	});
	//进入编辑状态。
	function editContact(){
		$(".handwrite").removeAttr("readonly"); 
		$("#beizhu2").hide();
		$("#taContainer").show();
		$("#bianji").hide();
		$("#tijiao").show();
		$("#fangqi").show();
		$(".jian").show();
		$(".jia").show();
		$(".plainInput").removeAttr("readonly");
		$(".zhanghao").attr("readonly","readonly");//帐号不能修改，只能删除后重新录入。涉及到记账流水已经绑定。可能需要人工迁移流水。
		$("#shangjia").click(shangjiaclickhandler); 
	}
	//进入只读状态 
	function readonlyContact(){
		$(".handwrite").attr("readonly",true); 
		$("#beizhu2").show();
		$("#taContainer").hide();
		$("#bianji").show();
		$("#tijiao").hide();
		$("#fangqi").hide();
		$("#shangjia").unbind("click");
		$("#zhiwu").unbind("click");
		$(".yinhang").unbind("click");
		$(".jian").hide();
		$(".jia").hide();
	}
	function newContact(){
		obj2form({})
		editContact();
	}
		//新增联系人
	$("#newContact").click(newContact);
	//将表单的内容转换为contact对象
	function form2obj(){
			var contact = currContact;
			if("【新增】"!=$("#bianhao").text()){
				contact._id = $("#bianhao").text().trim();
			}
			contact.leixing = $("#leixing").val().trim();
			contact.mingchen = $("#mingchen").val().trim();
			if("商家" == contact.leixing){
				contact.yanhuodizhi = $("#yanhuodizhi").val().trim();
				contact.zhiwu = undefined;contact.shangjia = undefined;
				contact.shangjia = {_id:contact._id,mingchen:contact.mingchen,py:contact.py};
				contact.bianma = $("#bianma").val().toUpperCase();
				contact.quyu = $("#quyu").val();
			}else if("个人" == contact.leixing){
				contact.yanhuodizhi = undefined;
				contact.zhiwu = $("#zhiwu").val().trim();
				var sj = $("#shangjia").data("shangjia");
				if(sj && ""!=$("#shangjia").val().trim()){
					contact.shangjia = {_id:sj._id,mingchen:sj.mingchen,py:sj.py};
				}else{
					contact.shangjia = undefined;
				}
			}
			contact.dizhi = $("#dizhi").val().trim();
			contact.beizhu = $("#beizhu").val().trim();
			if($("#dianhualiebiao").find(".tel").length>0){ 
				contact.dianhualiebiao = [];
				$("#dianhualiebiao").find(".tel").each(function(n,tel){
					if("" != $(tel).find("input").val().trim()){
						contact.dianhualiebiao.push($(tel).find("input").val().trim());
					}
				});
			}
			if($("#zhanghuliebiao").find(".zhanghu").length>0){
				contact.zhanghuliebiao = [];
				$("#zhanghuliebiao").find(".zhanghu").each(function(n,zhanghu){
					if("" != $(zhanghu).find("#zhanghao").val().trim() && "" != $(zhanghu).find("#huming").val().trim()){
						var zh = {};
						zh.zhanghao = $(zhanghu).find("#zhanghao").val().trim();
						zh.huming =  $(zhanghu).find("#huming").val().trim();
						zh.yinhang =  $(zhanghu).find("#yinhang").val().trim();
						zh.wangdian =  $(zhanghu).find("#wangdian").val().trim();
						contact.zhanghuliebiao.push(zh);
					}
				});
			}
			
			return contact;
	}
	//账号不能有重复
	function dupZhanghao(zhanghus){
		var ret = false;
		var ar = [];
		each(zhanghus,function(i,zh){
			if(zh.zhanghao == "" || ar.indexOf(zh.zhanghao)>=0){
				ret = true;
				return false;
			}
			ar.push(zh.zhanghao);
		});
		return ret;
	}
		//提交
	$("#tijiao").click(function(){
		if("" == $("#mingchen").val().trim()){
			tip($(this),"联系人名称不能留空！",1500);
			return;
		}
		var contact = form2obj();
		if(dupZhanghao(contact.zhanghuliebiao)){
			tip($(this),"帐号不能为空，且两个账户的账号不能相同！",1500);
			return;
		}
		contact.py = makePy(contact.mingchen);
		if(contact.shangjia && !contact.shangjia.py){
			contact.shangjia.py = makPy(contact.shangjia.mingchen)
		}
		if("【新增】" == $("#bianhao").text()){		
			postJson("contact.php",contact,function(res){
				if(res.success == true){
					//window.location.reload();
					tip(null,"成功增加联系人信息！",1500);
					listContacts(0);
				}else{
					ask3(null,res.err);
				}
			});
		}else{
			postJson("contact.php",contact,function(res){
				if(res.success == true){
					//obj2form(contact);
					//readonlyContact();
					tip(null,"成功修改联系人信息！",1500);
					listContacts(0);
				}else{
					ask3(null,res.err);
				}
			});
		}
	});
	
	function showdianhuas(dianhualiebiao){
		var s = "";
		each(dianhualiebiao,function(n,dianhua){
			s += "【" +dianhua+"】 "; 
		});
		return s;
	}
		//列出商家
	function listContacts(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var onlyshangjia = "n";
		if($("#jinshangjia").attr("checked")){
			onlyshangjia="y";
		}
		postJson("contacts.php",{offset:offset*limit,limit:limit,option:{"onlyshangjia":onlyshangjia,"shangjia":$("#shangjiaoption").data("lastValue"),"mingchen":$("#mingchenoption").data("lastValue")}},function(contacts){
			$("#contacttable .tr_contact").remove();
			each(contacts,function(n,contact){
				tr = tr_contact.clone(true);
				tr.data("_id",contact._id);
				tr.find("#td_bianhao").text(contact._id);
				tr.find("#td_mingchen").text(contact.mingchen);
				tr.find("#td_dianhua").text(showdianhuas(contact.dianhualiebiao));
				if(contact.shangjia){
					tr.find("#td_shangjia").text(contact.shangjia.mingchen).attr("title",contact.shangjia.mingchen);
				}
				//tr.css("background-color",toggle("#deedde","#dedeed"));
				tr.css("background-color",toggle("#fff","#eee"));
				$("#contacttable").append(tr);
			});
			if(showId){
				showDetail(showId);
				layout.close("west");
			}else if(contacts.length>0){//将列表第一个商家显示在右边的商家详情表单
				$(".ui-layout-center").show();
				$(".tr_contact").get(0).click();
			}else{
				$(".ui-layout-center").hide();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
			
			if(offset<=0){
				$("#prevPage").css("color","gray");
			}else{
				$("#prevPage").css("color","blue");
			}
			if(contacts.length<limit){
				$("#nextPage").css("color","gray");
			}else{
				$("#nextPage").css("color","blue");
			}
		});
	}
	$("#fangqi").click(function(){
		if("【新增】" != $("#bianhao").text().trim()){
			showDetail($("#bianhao").text().trim());	
		}else{
			$("#newContact").click();
		}
	});
		//显示指定商家详情
	function showDetail(_id){
		postJson("contacts.php",{_id:_id},function(contact){
			obj2form(contact);
			readonlyContact();
		});
	}
	//处理“编辑”按钮
	$("#bianji").click(function(){
		editContact();
	});
	//过滤条件变更处理
	$(".option").changex(function(){
		listContacts(0);
	});
	//翻页处理
	$("#prevPage").click(function(){
		listContacts($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listContacts($("#pager").data("offset")+1);
	});
	//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){
		layout.sizePane("west",$("#contacttable").width()+20);
	});
	$("#detailheader").click(function(){
		layout.sizePane("west",$("body").width()-$(this).width()-100);
	}).dblclick(function(){layout.toggle("west");clearSelection();});
	
	
	$(".list").dblclick(function(){$(this).val("");});
	var zhanghuTmpl = $("#zhanghu_tmpl").detach();
	var jiazhanghu = $("#jiazhanghu").detach();

	//列出商家
	listContacts(0,getUrl().showId);
});