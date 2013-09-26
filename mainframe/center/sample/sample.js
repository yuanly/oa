$(function(){
	//{_id:"A232",taiguoxinghao:"",zhongguoxinghao:"",shangjia:{_id:1,mingchen:""},jiage:[beizhu:"",zhi:1.2],danwei:"",yijiazhe:2,yijiariqi:1222223,zhuantai:"",beizhu:""}
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	//新增样板
	function xinzengyangban(){
		obj2form({});
		bianji();
	}
	$("#xinzengyangban").click(xinzengyangban);
	
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
	//用参数对象更新表单的内容
	function obj2form(yangban){
		$("#xiangdan").data("yangban",yangban);
		$("#bianhao").vals(yangban._id);
		$("#taiguoxinghao").vals(yangban.taiguoxinghao);
		$("#zhongguoxinghao").vals(yangban.zhongguoxinghao);
		var jiage = "";
		each(yangban.jiage,function(n,jg){
			if(jg.beizhu){
				jiage += "("+jg.beizhu+":"+jg.zhi+"元) ";
			}else{
				jiage += "("+jg.zhi+"元) ";
			}
		});
		$("#jiage").val(jiage);
		$("#danwei").vals(yangban.danwei);
		if(yangban.shangjia){
			$("#shangjia").vals(yangban.shangjia.mingchen);
		}else{
			$("#shangjia").val("");
		}
		$("#yijiazhe").vals(getUser(yangban.yijiazhe));		
		$("#yijiariqi").val(int2Date(yangban.yijiariqi));
		$("#zhuangtai").vals(yangban.zhuangtai);
		$("#beizhu").editorVal(yangban.beizhu);
	}
	//读取表单内容，构造对象并返回
	function form2obj(){
		var yangban;
		return yangban
	}
	//进入编辑状态
	function bianji(){
		$(".plainInput").removeAttr("disabled");
		$("#beizhu").editorWritable();
		$("#bianji").hide();
		$("#tijiao").show();
	}
	//进入只读状态
	function zhidu(){
		$(".plainInput").attr("disabled",true);
		$("#beizhu").editorReadonly();
		$("#bianji").show();
		$("#tijiao").hide();
	}
	///////////////////////////////初始化/////////////////////////////////////////////
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	$(".plainInput").css("background-color","white");
	//定义议价日期 的 日期控件
	$("#yijiariqi").datepicker().attr("disabled",true);
	//定义备注 的 编辑器
	$("#beizhu").myeditor(700,200).editorReadonly();
	
	/*
	
	var currSample = null;
	var limit = 20;

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
	function yinhangclickhandler(event){
		setSelector2(event,["农业银行","建设银行","工商银行","光大银行","商业银行","农商银行","交通银行","中国银行"],function(yinhang){
			$(this).val(yinhang);
		});
	}

		//设置记录点击处理，在模板被剥离前。
	$(".tr_sample").click(function(){
		showDetail($(this).data("_id"));
	});
	var tr_sample = $(".tr_sample").detach();
	//剥离动态模板。注：剥离必须在以上事件设置之后进行。
	var telTmpl = $("#tel_tmpl").detach();
	$(".yinhang").click(yinhangclickhandler);
	var zhanghuTmpl = $("#zhanghu_tmpl").detach();
	
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
	//列出商家
	listSamples(0);
	
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
	function shangjiaclickhandler(event){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("../vendor/vendors.php",{offset:page*limit,limit:limit,option:option},function(vendors){
					callback(vendors);
				});
			},["_id","mingchen"],function(vendor){
				$("#shangjia").val(vendor.mingchen);
				$("#shangjia").data("shangjia",vendor);
			}
		);
	}
	//岗位选择
	function gangweiclickhandler(event){
		setSelector2(event,["司机","老板","财务","业务","经理"],function(gangwei){
			$("#gangwei").val(gangwei);
		});
	}
	//将sample对象设置到表单 支持空联系人（即新增联系人）
	function obj2form(sample){
		currSample = sample;
		if(sample._id){
			$("#bianhao").text(sample._id);
		}else{
			$("#bianhao").text("【新增】");
		};
		$("#mingchen").vals(sample.mingchen);
		if(sample.shangjia){
			$("#shangjia").vals(sample.shangjia.mingchen);
			$("#shangjia").data("shangjia",sample.shangjia);
		}else{
			$("#shangjia").val("");
		}
		$("#gangwei").vals(sample.gangwei);
		$("#dizhi").vals(sample.dizhi);
		$("#beizhu").vals(sample.beizhu);
		$("#beizhu2").html(sample.beizhu);
		
		var jiadianhua = $("#jiadianhua").detach();
		$("#dianhualiebiao").empty();
		each(sample.dianhualiebiao,function(n,dianhua){
			var tel = telTmpl.clone(true);
			tel.find("input").val(dianhua);
			$("#dianhualiebiao").append(tel);
		});
		$("#dianhualiebiao").append(jiadianhua);
		
		
		var jiazhanghu = $("#jiazhanghu").detach();
		$("#zhanghuliebiao").empty();
		each(sample.zhanghuliebiao,function(n,zhanghu){
			var zh = zhanghuTmpl.clone(true);
			zh.find("#yinhang").val(zhanghu.yinhang);
			zh.find("#wangdian").val(zhanghu.wangdian);
			zh.find("#huming").val(zhanghu.huming);
			zh.find("#zhanghao").val(zhanghu.zhanghao);
			$("#zhanghuliebiao").append(zh);
		});
		$("#zhanghuliebiao").append(jiazhanghu);
		
	}
	//进入编辑状态。
	function editSample(){
		$(".handwrite").removeAttr("readonly"); 
		$("#beizhu2").hide();
		$("#taContainer").show();
		$("#bianji").hide();
		$("#tijiao").show();
		$(".jian").show();
		$(".jia").show();
		
		$("#shangjia").click(shangjiaclickhandler);
		$("#gangwei").click(gangweiclickhandler);
		$(".yinhang").click(yinhangclickhandler);
	}
	//进入只读状态 
	function readonlySample(){
		$(".handwrite").attr("readonly",true); 
		$("#beizhu2").show();
		$("#taContainer").hide();
		$("#bianji").show();
		$("#tijiao").hide();
		$("#shangjia").unbind("click");
		$("#gangwei").unbind("click");
		$(".yinhang").unbind("click");
		$(".jian").hide();
		$(".jia").hide();
	}
		//新增联系人
	$("#newSample").click(function(){
		obj2form({})
		editSample();
	});
	//将表单的内容转换为sample对象
	function form2obj(){
			var sample = {};
			if("【新增】"!=$("#bianhao").text()){
				sample._id = $("#bianhao").text().trim();
			}
			sample.mingchen = $("#mingchen").val().trim();
			if($("#shangjia").data("shangjia")){
				sample.shangjia = {};
				sample.shangjia._id = $("#shangjia").data("shangjia")._id;
				sample.shangjia.mingchen = $("#shangjia").data("shangjia").mingchen;
			}
			sample.gangwei = $("#gangwei").val().trim();
			sample.dizhi = $("#dizhi").val().trim();
			sample.beizhu = $("#beizhu").val().trim();
			if($("#dianhualiebiao").find(".tel").length>0){ 
				sample.dianhualiebiao = [];
				$("#dianhualiebiao").find(".tel").each(function(n,tel){
					if("" != $(tel).find("input").val().trim()){
						sample.dianhualiebiao.push($(tel).find("input").val().trim());
					}
				});
			}
			if($("#zhanghuliebiao").find(".zhanghu").length>0){
				sample.zhanghuliebiao = [];
				$("#zhanghuliebiao").find(".zhanghu").each(function(n,zhanghu){
					if("" != $(zhanghu).find("#zhanghao").val().trim() && "" != $(zhanghu).find("#huming").val().trim()){
						var zh = {};
						zh.zhanghao = $(zhanghu).find("#zhanghao").val().trim();
						zh.huming =  $(zhanghu).find("#huming").val().trim();
						zh.yinhang =  $(zhanghu).find("#yinhang").val().trim();
						zh.wangdian =  $(zhanghu).find("#wangdian").val().trim();
						sample.zhanghuliebiao.push(zh);
					}
				});
			}
			
			return sample;
	}
		//提交
	$("#tijiao").click(function(){
		if("" == $("#mingchen").val().trim()){
			tip(null,"联系人名称不能留空！",1500);
			return;
		}
		var sample = form2obj();
		if("【新增】" == $("#bianhao").text()){		
			postJson("sample.php",sample,function(res){
				if(res.success == true){
					window.location.reload();
				}else{
					ask3(null,res.err);
				}
			});
		}else{
			postJson("sample.php",sample,function(res){
				if(res.success == true){
					obj2form(sample);
					readonlySample();
					tip(null,"成功修改联系人信息！",3000);
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
	function listSamples(offset){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		postJson("samples.php",{offset:offset*limit,limit:limit,option:{"shangjia":$("#shangjiaoption").data("lastValue"),"mingchen":$("#mingchenoption").data("lastValue")}},function(samples){
			$("#sampletable .tr_sample").remove();
			each(samples,function(n,sample){
				tr = tr_sample.clone(true);
				tr.data("_id",sample._id);
				tr.find("#td_bianhao").text(sample._id);
				tr.find("#td_mingchen").text(sample.mingchen);
				tr.find("#td_dianhua").text(showdianhuas(sample.dianhualiebiao));
				if(sample.shangjia){
					tr.find("#td_shangjia").text(sample.shangjia.mingchen);
				}
				tr.css("background-color",toggle("#deedde","#dedeed"));
				$("#sampletable").append(tr);
			});
			if(samples.length>0){//将列表第一个商家显示在右边的商家详情表单
				showDetail(samples[0]["_id"]);
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
		});
	}
		//显示指定商家详情
	function showDetail(_id){
		postJson("samples.php",{_id:_id},function(sample){
			obj2form(sample);
			readonlySample();
		});
	}
	//处理“编辑”按钮
	$("#bianji").click(function(){
		editSample();
	});
	//过滤条件变更处理
	$(".option").changex(function(){
		listSamples(0);
	});
	//翻页处理
	$("#prevPage").click(function(){
		listSamples($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listSamples($("#pager").data("offset")+1);
	});
	//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){
		layout.sizePane("west",$("#sampletable").width()+20);
	});
	$("#detailheader").click(function(){
		layout.sizePane("west",$("body").width()-$(this).width()-100);
	});
	
	*/
});