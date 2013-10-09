$(function(){
	//{_id:"20131008_1",liucheng:[{userId:3,dongzuo:"上传",time:1322}],shangchuanzhe:3,shangchuanshijian:1312322,jiegaozhe:2,zhuangtai:"上传",shenjiezhe:5,shenjieshijian:133423,neirong:"xsdf",shenjieshuoming:"dsdsdfa"}
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function tijiaoyuangao(){
		var yuangao = {shangchuanzhe:getTheUser()._id,neirong:editor.editorVal()};
		postJson("./yuangao.php",{caozuo:"shangchuan",yuangao:yuangao},function(yg){
			//showDetail(yg);
			listYuangao(0);
		});
	}
	$("#tijiao").click(tijiaoyuangao);
	$(".tr_yuangao").click(function(){
		showDetailById($(this).data("_id"));
	});
	//翻页处理
	$("#prevPage").click(function(){
		listYuangao($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listYuangao($("#pager").data("offset")+1);
	});
	function cz_anniu(){
		$(this).parents("table").find("#lc_caozuo").toggle();
		if($(this).attr("src").indexOf("up")>-1){
			$(this).attr("src","../../../img/down.png");
		}else{
			$(this).attr("src","../../../img/up.png");
		}
	}
	$("#lc_anniu").click(cz_anniu);
	function cz_shanchu(){
		var _id = $("#liucheng").data("_id");
		postJson("yuangao.php",{caozuo:"shanchu",_id:_id},function(res){
			listYuangao(0);
		});
	}
	$("#cz_shanchu").click(cz_shanchu);
	function cz_jiegao(){
		//接稿：增加流程项，设置基本属性
		postJson("yuangao.php",{caozuo:"jiegao",_id:$("#liucheng").data("_id")},function(res){
			showDetailById($("#liucheng").data("_id"));
		});
	}
	$("#cz_jiegao").click(cz_jiegao);
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
		//列出原稿
	function listYuangao(offset){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		postJson("yuangaos.php",{offset:offset*limit,limit:limit,option:{"shangchuanshijian":1234,
																																		"weishenjie":true}},function(yuangaos){
			$("#yuangaotable .tr_yuangao").remove();
			each(yuangaos,function(n,yuangao){
				tr = tr_yuangao.clone(true);
				tr.data("_id",yuangao._id);
				tr.find("#td_bianhao").text(yuangao._id);
				tr.find("#td_shangchuanzhe").text(getUser(yuangao.shangchuanzhe).user_name);
				tr.find("#td_shangchuanshijian").text(new Date(yuangao.shangchuanshijian*1000).format("yy/MM/dd hh:mm"));
				tr.find("#td_jiegaozhe").text(yuangao.jiegaozhe?getUser(yuangao.jiegaozhe).user_name:"");
				tr.find("#td_shenjiezhe").text(yuangao.shenjiezhe?getUser(yuangao.shenjiezhe).user_name:"");
				tr.find("#td_shenjieshijian").text(yuangao.shenjieshijian?new Date(yuangao.shenjieshijian*1000).format("yy/MM/dd hh:mm"):"");
				
				tr.css("background-color",toggle("#fff","#eee"));
				
				$("#yuangaotable").append(tr);
			});
			if(yuangaos.length>0){//将列表第一个商家显示在右边的商家详情表单
				showDetailById(yuangaos[0]._id);
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
		});
	}
	
	function showDetail(yg){
		$("#shangchuan").hide();
		$("#liucheng").show().liucheng(getTheUser(),yg);
		$("#xianshi").show().empty().html(yg.neirong).prepend("<div style='background-color:#eee'>原稿</div>");
		if(yg.shenjieshuoming){
			$("#xianshi").append("<p style='background-color:#eee'>审结说明</p>");
			$("#xianshi").append("<div id='shenjieshuoming'></div>");
			$("#xianshi #shenjieshuoming").html(yg.shenjieshuoming);
		}
		//订单列表 TODO ...
	}
	function showDetailById(_id){
		postJson("yuangaos.php",{_id:_id},function(yg){
			showDetail(yg);
		});
	}
	function shangchuanmoshi(){
		$("#liucheng").hide();
		$("#xianshi").hide();
		$("#shangchuan").show();
		editor.editorVal("");
	}
	jQuery.fn.liucheng = function(theUser,yuangao){
		var that = this.empty();
		this.data("_id",yuangao._id);
		each(yuangao.liucheng,function(n,item){
			var tmpl = liuchengItem.clone(true);
			$("#lc_bianhao",tmpl).text(n+1);
			var usr = getUser(item.userId);
			$("#lc_touxiang",tmpl).attr("src",usr.photo);
			$("#lc_mingchen",tmpl).text(usr.user_name);
			$("#lc_dongzuo",tmpl).text(item.dongzuo);
			$("#lc_shijian",tmpl).text(new Date(item.time*1000).format("yyyy-MM-dd hh:mm"));
			if("上传" == item.dongzuo){				
				if(yuangao.liucheng.length == 1){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == item.userId){
						$("#cz_shanchu",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}else{
						$("#cz_jiegao",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}
				}
			}else if("接稿" == item.dongzuo){
				if("审结" != yuangao.liucheng[yuangao.liucheng.length-1].dongzuo){
					if(theUser._id != item.userId){
						var caozuoItem = caozuoTmpl.clone(true);
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						$("#cz_jieguan",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}else{
						if("申请审结" != yuangao.liucheng[yuangao.liucheng.length-1].dongzuo){
							var caozuoItem = caozuoTmpl.clone(true);
							$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
							$("#cz_ludan",caozuoItem).show();
							$("#cz_shenqingshenhe",caozuoItem).show();
							$("#cz_shenqingshenjie",caozuoItem).show();
							$("table",tmpl).append(caozuoItem);
						}
					}
				}
			}else if("申请审核" == item.dongzuo){
				var caozuoItem = caozuoTmpl.clone(true);
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				if(theUser._id == item.userId){
						$("#cz_quxiaoshenqingshenhe",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
				}else{
						$("#cz_shenhe",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
				}
			}else if("申请审结" == item.dongzuo){
				var caozuoItem = caozuoTmpl.clone(true);
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				if(theUser._id == item.userId){
						$("#cz_quxiaoshenqingshenjie",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
				}else{
						$("#cz_shenjie",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
				}
			}
			that.append(tmpl);
		});
	}
	
	///////////////////////////////初始化/////////////////////////////////////////////
	var limit=20;
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	var caozuoTmpl = $("#lc_caozuo").detach();
	var liuchengItem = $("#liuchengItem").detach();
	var tr_yuangao = $(".tr_yuangao").detach();
	
	//$("#liucheng").liucheng(getTheUser(),{liucheng:[{userId:6,dongzuo:"上传",time:new Date().getTime()/1000}]});
	var editor = $("#bianjikuang").myeditor(800,600).editorWritable();
	
	$("#shangchuanyuangao").click(function(){shangchuanmoshi();});
		//设置头部点击处理（放到当前面板） 
	$("#tableheader").click(function(){
		layout.sizePane("west",$("#yuangaotable").width()+20);
	}); 
	$("#detailHandle").click(function(){
		layout.sizePane("west",$("body").width()-$(this).width()-100);
	});
	
	listYuangao(0);
});