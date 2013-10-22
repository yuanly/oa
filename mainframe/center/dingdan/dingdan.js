$(function(){
	/*
	{	_id:"DD131008.1",
		liucheng:[{userId:3,dongzuo:"录单",time:1322}],
		yuangao:YG131008.1,
		zhuangtai:"录单",
		kehu:"C",
		yangban:{_id:"YB223",taiguoxinghao:"xxx",zhongguoxinghao:""},
		gonghuoshang:"大大",
		gendanyuan:3,
		xiadanshijian:13223,
		beizhu:"xxx",
		huowu:[{guige:"xxx",shuliang:23,danwei:"KG"}...]}
	*/
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	//翻页处理
	$("#prevPage").click(function(){
		listDingdan($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listDingdan($("#pager").data("offset")+1);
	});
	//设置头部点击处理（放到当前面板） 
	$("#tableheader").click(function(){
		layout.sizePane("west",$("#dingdantable").width()+20);
	}); 
	$("#detailHandle").click(function(){
		layout.sizePane("west",$("body").width()-$(this).width()-100);
	});
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
		//列出原稿
	function listDingdan(offset){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var cmd = getUrl().cmd?getUrl().cmd:"";
		postJson("dingdans.php",{offset:offset*limit,limit:limit,option:{cmd:cmd}},function(dingdans){
			$("#dingdantable .tr_dingdan").remove();
			each(dingdans,function(n,dingdan){
				tr = tr_dingdan.clone(true);
				tr.data("_id",dingdan._id);
				tr.find("#td_bianhao").text(dingdan._id);
				tr.find("#td_kehu").text(dingdan.kehu);
				if(dingdan.yangban.zhongguoxinghao){
					tr.find("#td_yangban").text(dingdan.yangban.zhongguoxinghao);
				}else{
					tr.find("#td_yangban").text("("+dingdan.yangban.taiguoxinghao+")");
				}
				tr.find("#td_zhuangtai").text(dingdan.zhuangtai);				
				tr.find("#td_gendanyuan").text(dingdan.gendanyuan?getUser(dingdan.gendanyuan).user_name:"");
				tr.find("#td_gonghuoshang").text(dingdan.gonghuoshang?dingdan.gonghuoshang:"");
				tr.find("#td_xiadanriqi").text(dingdan.xiadanriqi?new Date(dingdan.xiadanriqi*1000).format("yy/MM/dd hh:mm"):"");
				
				tr.css("background-color",toggle("#fff","#eee"));
				
				$("#dingdantable").append(tr);
			});
			if(dingdans.length>0){
				$(".tr_dingdan").get(0).click();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
		});
	}
	
	function showDetail(yg){
		currYG = yg;
		$("#shangchuan").hide();
		$("#liucheng").show().liucheng(getTheUser(),yg);
		$("#xianshi").show().empty().html(yg.neirong).prepend("<div style='background-color:#eee'>原稿</div>");
		if(yg.shenjieshuoming){
			$("#xianshi").append("<p style='background-color:#eee'>审结说明</p>");
			$("#xianshi").append("<div id='shenjieshuoming'></div>");
			$("#xianshi #shenjieshuoming").html(yg.shenjieshuoming);
		}
		shuaxindingdanliebiao();
	}
	function shuaxindingdanliebiao(){
		var jiegaozheid = null;
		each(currYG.liucheng,function(n,liucheng){
			if(liucheng.dongzuo == "接稿"){
				jiegaozheid = liucheng.userId;
				return false;
			}		
		});
		$("#dingdanliebiao").empty().show();
		postJson("dingdan.php",{caozuo:"liebiao",_id:currYG._id},function(dingdans){
			each(dingdans,function(n,dingdan){
				var elm = lb_dingdan.clone(true);
				elm.data("dingdanId",dingdan._id);
				$("#lb_bianhao",elm).text(dingdan._id);
				$("#lb_kehu",elm).text(dingdan.kehu);
				$("#lb_yangban",elm).text(dingdan.yangban.taiguoxinghao);
				$("#lb_zhuangtai",elm).text(dingdan.zhuangtai);
				if(dingdan.zhuangtai == "录单" && getTheUser()._id == jiegaozheid){
					$("#lb_shanchu",elm).show();
					$("#lb_shenqingshenhe",elm).show();
				}
				if(dingdan.zhuangtai == "申请审核"){
					if(getTheUser()._id == jiegaozheid){
						$("#lb_quxiaoshenqing",elm).show();
					}else{
						$("#lb_shenhe",elm).show();
					}
				}
				if(dingdan.zhuangtai == "作废"){
					elm.find("div:first-child").css("background-color","#eee");
				}
				each(dingdan.huowu,function(n,hw){
					var hwelm = lb_hw.clone(true); 
					$("#lb_xuhao",hwelm).text((n+1)+".");
					$("#lb_guige",hwelm).text(hw.guige);
					$("#lb_shuliang",hwelm).text(hw.shuliang);
					$("#lb_danwei",hwelm).text(hw.danwei);
					elm.append(hwelm);
				});
				if(dingdan.ludanbeizhu){
					elm.append("<div style='margin:10px 0px 10px'><b>备注：</b>"+dingdan.ludanbeizhu+"</div>");
				}
				$("#dingdanliebiao").append(elm);
			});
			if(dingdans && dingdans.length>0){
				$("#dingdanliebiao").prepend("<p style='background-color:#eee'>已录订单</p>");
			}
		});
	}
	function showDetailById(_id){
		postJson("yuangaos.php",{_id:_id},function(yg){
			showDetail(yg);
		});
	}
	function shangchuanmoshi(){
		$("#liucheng").hide();
		$("#xianshi").hide();
		$("#dingdanliebiao").hide();
		$("#shangchuan").show();
		editor.editorVal("");		
		$("#tijiao").data("waiting",false);
	}
	$("#shangchuanyuangao").click(function(){shangchuanmoshi();});
		
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
						$("#cz_jiegao",caozuoItem).show();
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
	var currDD = null;
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	var caozuoTmpl = $("#lc_caozuo").detach();
	var liuchengItem = $("#liuchengItem").detach();
	var tr_dingdan = $(".tr_dingdan").detach();
	
	listDingdan(0);
});