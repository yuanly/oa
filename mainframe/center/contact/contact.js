$(function(){
	var currContact = null;
	var limit = 20;
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
	$("#zhanghu_tmpl > #yinhang").click(function(event){
		setSelector2(event,["农业银行","建设银行","工商银行","光大银行","商业银行","农商银行","交通银行","中国银行"],function(yinhang){
			$(this).val(yinhang);
		});
	});
	var telTmpl = $("#tel_tmpl").detach();
	var zhanghuTmpl = $("#zhanghu_tmpl").detach();
	
	//添加电话
	$("#jiadianhua").click(function(){
		$(this).before(telTmpl.clone(true));
	});
	//添加账户
	$("#jiazhanghu").click(function(){
		 var zh = zhanghuTmpl.clone(true);
		 zh.find(".handwrite").removeAttr("readonly");
		$(this).before(zh);
	});
	//商家选择
	$("#shangjia").click(function(event){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("../vendor/vendors.php",{offset:page*limit,limit:limit,option:option},function(vendors){
					callback(vendors);
				});
			},["_id","mingchen"],function(vendor){
				$("#shangjia").val(vendor.mingchen);
				$("#shangjia").data("vendor",vendor);
			}
		);
	});
	//岗位选中
	$("#gangwei").click(function(event){
		setSelector2(event,["司机","老板","财务","业务","经理"],function(gangwei){
			$("#gangwei").val(gangwei);
		});
	});
	//将一个联系人信息设置到详细表单中，并进入编辑状态。支持空联系人（即新增联系人）
	function editContact(contact){
		if(contact._id){
			$("#bianhao").text(contact._id);
		}else{
			$("#bianhao").text("【新增】");
		}
		$("#mingchen").val(contact.mingchen);
		$("#shangjia").val(contact.shangjia);
		$("#gangwei").val(contact.gangwei);
		$("#dizhi").val(contact.dizhi);
		$(".ui-layout-center").find(".handwrite").removeAttr("readonly");
		$("#beizhu2").hide();
		$("#taContainer").show();
		$("#beizhu").val(contact.beizhu);
		
		var jiadianhua = $("#jiadianhua").detach();
		$("#dianhualiebiao").empty();
		each(contact.dianhualiebiao,function(n,dianhua){
			var tel = telTmpl.clone(true);
			tel.find("input").val(dianhua);
			$("#dianhualiebiao").append(tel);
		});
		$("#dianhualiebiao").append(jiadianhua);
		
		var jiazhanghu = $("#jiazhanghu").detach();
		$("#zhanghuliebiao").empty();
		each(contact.zhanghuliebiao,function(n,zhanghu){
			var zhanghu = zhanghuTmpl.clone(true);
			zhanghu.find("#yinhang").val(zhanghu.yinhang);
			zhanghu.find("#wangdian").val(zhanghu.wangdian);
			zhanghu.find("#zhanghao").val(zhanghu.zhanghao);
			$("#zhanghuliebiao").append(zhanghu);
		});
		$("#zhanghuliebiao").append(jiazhanghu);
		
		$("#bianji").hide();
		$("#tijiao").show();
	} 
	editContact({});
	//编辑器定义  “图片”和“地图”按钮
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
	    editor = $("#beizhu").xheditor({plugins:plugins,
				tools:'Fontface,FontSize,Bold,Italic,Underline,Strikethrough,FontColor,BackColor,Removeformat,|,Align,List,Outdent,Indent,|,Link,Unlink,Img,Hr,Emot,Table,|,Preview,Print,Fullscreen,|,map,|,pic,|,attach,|',
				width:700,height:200});

	//设置记录点击处理，在模板被剥离前。
	$(".tr_contact").click(function(){
		showDetail($(this).data("_id"));
	});
	//获取并显示商家列表
	var tr_contact = $(".tr_contact").detach();
	listContacts(0);


	//处理“编辑”按钮
	$("#bianji").click(function(){
		$("#beizhu").val(currContact.beizhu);
		makeEditable(null);
	});
	
	
	//过滤条件变更处理
	$("#option").keyup(function(event){
		if($(this).data("lastValue") != $(this).val().trim()){
			$(this).data("lastValue",$(this).val().trim()) ;
			listContacts(0);
		}
	});
	//翻页处理
	$("#prevPage").click(function(){
		listContacts($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listContacts($("#pager").data("offset")+1);
	});
	//新增商家
	$("#newContact").click(function(){
		$("#bianhao").text("【新增】");
		$("#mingchen").val("");
		$("#dianhua").val("");
		$("#dizhi").val("");
		$("#beizhu").val("");
		makeEditable();
	});
	//提交
	$("#tijiao").click(function(){
			if("" == $("#mingchen").val().trim()){
				tip(null,"商家名称不能留空！",1500);
				return;
			}
		if("【新增】" == $("#bianhao").text()){		
			postJson("contact.php",form2Obj(),function(res){
				if(res.success == true){
					window.location.reload();
				}else{
					ask3(null,res.err);//可能是重名
				}
			});
		}else{
			var contact = form2Obj();
			contact._id = currContact._id;			
			postJson("contact.php",contact,function(res){
				if(res.success == true){
					currContact = contact;
					$("#beizhu2").html(contact.beizhu);
					$("#beizhu2").show();
					$("#taContainer").hide();
					$("#bianji").show();
					$("#tijiao").hide();
					tip(null,"成功修改商家信息！",3000);
				}else{
					ask3(null,res.err);//可能是重名
				}
			});
		}
	});
	//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){
		layout.sizePane("west",$("#contacttable").width()+20);
	});
	$("#detailheader").click(function(){
		console.log($("body").width());
		console.log($(this).width());
		console.log($("body").width()-$(this).width()-100);
		layout.sizePane("west",$("body").width()-$(this).width()-100);
	});
	//列出商家
	function listContacts(offset){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		postJson("contacts.php",{offset:offset*limit,limit:limit,option:$("#option").data("lastValue")},function(contacts){
			$("#contacttable .tr_contact").remove();
			each(contacts,function(n,contact){
				tr = tr_contact.clone(true);
				tr.data("_id",contact._id);
				tr.find("#td_bianhao").text(contact._id);
				tr.find("#td_mingchen").text(contact.mingchen);
				tr.find("#td_dianhua").text(contact.dianhua);
				tr.find("#td_dizhi").text(contact.dizhi);
				tr.css("background-color",toggle("#deedde","#dedeed"));
				$("#contacttable").append(tr);
			});
			if(contacts.length>0){//将列表第一个商家显示在右边的商家详情表单
				showDetail(contacts[0]["_id"]);
			}
		});
	}
	
	/*显示指定商家详情*/
	function showDetail(_id){
				postJson("contacts.php",{_id:_id},function(contact){
					obj2form(contact);
					$("#beizhu2").show();
					$("#taContainer").hide();
					$(".ui-layout-center .plainInput").attr("readonly",true);
					$("#bianji").show();
					$("#tijiao").hide();
				});
	}
	//将contact对象设置到表单
	function obj2form(contact){
		currContact = contact;
		$("#bianhao").text(contact._id);
		$("#mingchen").val(contact.mingchen);
		$("#dianhua").val(contact.dianhua);
		$("#dizhi").val(contact.dizhi);
		$("#beizhu2").html(contact.beizhu);
	//	$("#beizhu").val(contact.beizhu);
	}
	
	
	//将表单的内容转换为contact对象
	function form2Obj(){
			var contact = {};
			contact.mingchen = $("#mingchen").val().trim();
			contact.dianhua = $("#dianhua").val().trim();
			contact.dizhi = $("#dizhi").val().trim();
			contact.beizhu = $("#beizhu").val().trim();
			return contact;
	}
	//进入编辑状态
	function makeEditable(elm){	
			$("#beizhu2").hide();
			$("#taContainer").show();
			$(".ui-layout-center .plainInput").removeAttr("readonly");
			$("#bianji").hide();
			$("#tijiao").show();
	}
	
//	makeEditable();
});