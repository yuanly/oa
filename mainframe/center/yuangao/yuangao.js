﻿$(function(){
/*
{	_id:"xx",
	liucheng:[{userId:3,dongzuo:"上传",time:1322}],
	jiegaozhe:"xx",
	shenjiezhe:"xx",
	zhuangtai:"xx",
	shangchuanshijian:12312,
	shenjieshijian:123213232,
	neirong:"xx"
}
*/
	//{_id:"20131008_1",liucheng:[{userId:3,dongzuo:"上传",time:1322}],
	//shangchuanzhe:3,shangchuanshijian:1312322,jiegaozhe:2,zhuangtai:"上传",shenjiezhe:5,
	//shenjieshijian:133423,neirong:"xsdf",shenjieshuoming:"dsdsdfa"}
	//{yuangao:currYG._id,kehu:$("#ld_kehu").val().trim(),yangban:{taiguoxinghao:$("#ld_yangban").text().trim()},huowu:[]};
	//原稿有时候有泰国编号！！！TODO 
	$('#currLocation', window.parent.document).text("原稿管理");
	
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function tijiaoyuangao(){
		var yuangao = {shangchuanzhe:getTheUser()._id,neirong:editor.editorVal()};
		var that = $(this);
		if("" == yuangao.neirong){
			tip(that,"原稿内容不能为空！",1500);
			return;
		}
		that.data("waiting",true);
		postJson("./yuangao.php",{caozuo:"shangchuan",yuangao:yuangao},function(yg){
			that.data("waiting",false);
			//showDetail(yg);
			listYuangao(0);			
		});
	}
	$("#lb_bianhao").click(function(){
		window.open("../dingdan/dingdan.html?showId="+$(this).text(),"_blank");
	});
	$("#tijiao").click(tijiaoyuangao);
	$(".tr_yuangao").click(function(){
		showDetailById($(this).data("_id"));
		$(".tr_selected").removeClass("tr_selected");
		$(this).addClass("tr_selected");
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
	function cz_ludan(){
		$("#ludan").show();
		//var danwei = $("#ld_danwei","#ludan").val();
		$(".plainInput","#ludan").val("");
		$(".myinput","#ludan").text("");
		//$("#ld_danwei","#ludan").val(danwei);
		$("#ld_yangban").val("");
		
		$(".ld_huowu","#ludan").remove();
		$("#tr_tianjiahuowu").before(tr_huowu.clone(true));
		//$("#ld_xuhao","#ludan").data("xuhao",1);
		$("#ld_beizhu_xianshi").show();
		$("#ld_beizhu").val("");
		$("#ld_beizhu_waibu").hide();
		$("#ld_tijiaodingdan").data("waiting",false);
	}
	$("#cz_ludan").click(cz_ludan);
	function cz_beizhu(){
		$("#beizhu").show();
		if(currYG.beizhu){
			beizhueditor.editorVal(currYG.beizhu);
		}
	}
	$("#cz_beizhu").click(cz_beizhu);
	$("#tijiaobeizhu").click(function(){
		if("" == beizhueditor.editorVal()){
			$("#beizhu").hide();
			return;
		}
		postJson("yuangao.php",{caozuo:"beizhu",_id:currYG._id,beizhu:beizhueditor.editorVal()},function(res){
			currYG.beizhu = beizhueditor.editorVal();
			$("#beizhu").hide();
		});
	});
	function cz_jieguan(){
		postJson("yuangao.php",{caozuo:"jieguan",_id:currYG._id},function(res){
			showDetailById(currYG._id);
		});
	}
	$("#cz_jieguan").click(cz_jieguan);
	function cz_shenqingshenjie(){
		postJson("yuangao.php",{caozuo:"shenqingshenjie",_id:currYG._id},function(res){
			showDetailById(currYG._id);
		});
	}
	$("#cz_shenqingshenjie").click(cz_shenqingshenjie);
	function cz_quxiaoshenqingshenjie(){
		postJson("yuangao.php",{caozuo:"quxiaoshenqingshenjie",_id:currYG._id},function(res){
			showDetailById(currYG._id);
		});
	}
	$("#cz_quxiaoshenqingshenjie").click(cz_quxiaoshenqingshenjie);
	function cz_shenjie(){
		var that = $(this);
		postJson("yuangao.php",{caozuo:"shenjie",_id:currYG._id},function(res){
			if(res.err == "订单未审核"){
				tip(that,"必须审核完所有订单，才能审结原稿！",2000);
				return;
			}
			showDetailById(currYG._id);
		})
	}
	$("#cz_shenjie").click(cz_shenjie);
	function ld_tianjia(){
		var huowu = tr_huowu.clone(true);
		huowu.find("#hw_xuhao").text($(".ld_huowu").length+1);
		$(this).parents("tr").before(huowu);
	}
	$("#ld_tianjia","#ludan").click(ld_tianjia);
	function hw_shanchu(){
		$(this).parents("tr").remove();
		$(".ld_huowu").each(function(n,item){
			$("#hw_xuhao",this).data("xuhao",n+1);
			$("#hw_xuhao",this).text((n+1)+".");
		});
		$("#ld_xuhao").dataInc("xuhao",-1).text($("#ld_xuhao").data("xuhao")+".");
	}
	$("#hw_shanchu").click(hw_shanchu);
	function ld_beizhu(){
		$("#ld_beizhu_waibu").show();
		$(this).hide();
	}
	$("#ld_beizhu_xianshi").click(ld_beizhu);
	function tijiaodingdan(){
		if($(this).data("waiting")){
			return;
		}
		if("" == $("#ld_kehu").val().trim()){
			tip($(this),'"客户"不能为空！',1500);
			return;
		}
		if("" == $("#ld_yangban").text().trim()){
			tip($(this),'"样板"不能为空！',1500);
			return;
		}
		if($("#ld_xuhao").data("xuhao") == 0){
			tip($(this),'货物条目不能为空！',1500);
			return;
		}
		var dingdan = {yuangao:currYG._id,kehu:$("#ld_kehu").val().trim(),yangban:{taiguoxinghao:$("#ld_yangban").text().trim()},huowu:[]};
		var ok = true;
		$(".ld_huowu").each(function(n,hw){
			var huowu = {guige:$("#hw_guige",hw).text().trim(),shuliang:$("#hw_shuliang",hw).text().trim(),danwei:$("#hw_danwei",hw).val().trim()};
			if(huowu.guige == ""){
				tip($(this).find("#hw_guige"),"规格不能留空！",1500);
				ok = false;
				return false;
			}
			if(!isFloat(huowu.shuliang)){
				tip($(this).find("#hw_shuliang"),"数量不是有效数字！",1500);
				ok = false;
				return false;
			}
			if(huowu.danwei == ""){
				tip($(this).find("#hw_danwei"),"单位不能留空！",1500);
				ok = false;
				return false;
			}
			dingdan.huowu.push(huowu);
		}); 
		if(!ok){
			return false;
		}
		if("" != $("#ld_beizhu").val().trim()){
			dingdan.beizhu = $("#ld_beizhu").val().trim();
		}
		var that = $(this);
		that.data("waiting",true);
		postJson("dingdan.php",{caozuo:"ludan",dingdan:dingdan},function(res){
			that.data("waiting",false);
			tip(that,"成功提交订单！",1500); 
			shuaxindingdanliebiao();
			$("#ludan").hide();
		});
	}
	$("#ld_tijiaodingdan").click(tijiaodingdan);
	function lb_shanchudingdan(){
		postJson("dingdan.php",{caozuo:"shanchu",_id:$(this).parents("#lb_dingdan").data("dingdanId")},function(res){
			shuaxindingdanliebiao();
		});
	}
	$("#lb_shanchu").click(lb_shanchudingdan);
	function lb_shenqingshenhe(){
		postJson("dingdan.php",{caozuo:"shenqingshenhe",_id:$(this).parents("#lb_dingdan").data("dingdanId")},function(res){
			shuaxindingdanliebiao();
		});
	}
	$("#lb_shenqingshenhe").click(lb_shenqingshenhe);
	function lb_quxiaoshenqing(){
		postJson("dingdan.php",{caozuo:"quxiaoshenqing",_id:$(this).parents("#lb_dingdan").data("dingdanId")},function(res){
			shuaxindingdanliebiao();
		});
	}
	$("#lb_quxiaoshenqing").click(lb_quxiaoshenqing);
	function lb_shenhe(){
		postJson("dingdan.php",{caozuo:"shenhe",_id:$(this).parents("#lb_dingdan").data("dingdanId")},function(res){
			shuaxindingdanliebiao();
		});
	}
	$("#lb_shenhe").click(lb_shenhe);
	function option_weishenjie(){
		$("#option_shangchuanshijian").val("");
		listYuangao(0);
	}
	$("#option_weishenjie").change(option_weishenjie);	
	
	$("#option_shangchuanshijian").datepicker();
	$("#option_shangchuanshijian").focus(function(){$("#option_weishenjie").removeAttr("checked")}).change(function(){
		listYuangao(0);
	});
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
		//列出原稿
	function listYuangao(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var isWeishenjie = false;
		if($("#option_weishenjie").attr("checked")){
			isWeishenjie = true;
		}
		var shangchuanshijian = date2Int($("#option_shangchuanshijian").val());
		if(shangchuanshijian>0){
			shangchuanshijian = shangchuanshijian/1000 + 24*3600;
		}
		var cmd = getUrl().cmd?getUrl().cmd:"";
		postJson("yuangaos.php",{offset:offset*limit,limit:limit,option:{cmd:cmd,"shangchuanshijian":shangchuanshijian,
																																		"weishenjie":isWeishenjie}},function(yuangaos){
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
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else if(yuangaos.length>0){//将列表第一个商家显示在右边的商家详情表单
				$(".ui-layout-center").show();
				$(".tr_yuangao").get(0).click();
			}else{
				$(".ui-layout-center").hide();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
		});
	} 
	function showDetail(yg){
		currYG = yg;
		$("#shangchuan").hide();
		$("#liucheng").show().liucheng(getTheUser(),yg);
		$("#xianshi").show().empty().html(yg.neirong).prepend("<div style='background-color:#eee'>原稿&nbsp;&nbsp;<a href='yuangao.html?showId="+yg._id+"' target=_blank>"+yg._id+"</a></div>");
		if(yg.shenjieshuoming){
			$("#xianshi").append("<p style='background-color:#eee'>备注</p>");
			$("#xianshi").append("<div id='xs_beizhu'></div>");
			$("#xianshi #xs_beizhu").html(yg.beizhu);
		} 	
		$("#ludan").hide();
		shuaxindingdanliebiao();
		liuyanElm.shuaxinliebiao({hostId:currYG._id,hostType:"yuangao"});
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
					//$("#lb_xuhao",hwelm).text((n+1)+".");
					$("#lb_xuhao",hwelm).text(hw.id);
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
		$(".ui-layout-center").show();
		$("#liucheng").hide();
		$("#xianshi").hide();
		$("#dingdanliebiao").hide();
		$("#shangchuan").show();
		editor.editorVal("");		
		$("#tijiao").data("waiting",false);
		liuyanElm.clearliuyan();
	}
	$("#shangchuanyuangao").click(function(){shangchuanmoshi();});
		//设置头部点击处理（放到当前面板） 
	$("#tableheader").click(function(){
		layout.sizePane("west",$("#yuangaotable").width()+20);
	}); 
	$("#detailHandle").click(function(){
		layout.sizePane("west",$("body").width()-$(this).width()-100);
	});
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
				("#lc_tr_panel",tmpl).attr("title","客户经理已上传原稿，还没被录单员接稿处理！");
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
				("#lc_tr_panel",tmpl).attr("title","录单员已接受原稿，正在进行录单！");
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
							//$("#cz_beizhu",caozuoItem).show();
							$("table",tmpl).append(caozuoItem);
						}
					}
				}
			}else if("申请审结" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","录单员已经完成录单，申请他人帮忙对所有订单进行审核！");
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
	var currYG = null;
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	var caozuoTmpl = $("#lc_caozuo").detach();
	var liuchengItem = $("#liuchengItem").detach();
	var tr_yuangao = $(".tr_yuangao").detach();
	var tr_huowu = $(".ld_huowu").detach();
	var lb_hw = $("#lb_hw").detach();
	var lb_dingdan = $("#lb_dingdan").detach();
	
	//$("#liucheng").liucheng(getTheUser(),{liucheng:[{userId:6,dongzuo:"上传",time:new Date().getTime()/1000}]});
	var beizhueditor = $("#beizhu_editor").myeditor(800,200).editorWritable();
	
	if(getUrl().cmd){
		$("#optioncontainer").hide(); 
	}
	var liuyanElm = $("#liuyan").liuyan({hostType:"yuangao",});
	listYuangao(0,getUrl().showId);
	var editor = $("#bianjikuang").myeditor(800,600).editorWritable();
	
		//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){
		if(layout.state.west.innerWidth < $("#yuangaotable").width()){
			layout.sizePane("west",$("#yuangaotable").width()+20);
		}
	});
	/*
	$(".detailheader").click(function(){
		layout.sizePane("west",$("body").width()-$("#tb_huowu").width()-300);
	});
	*/
	$(".detailheader").dblclick(function(){layout.toggle("west");clearSelection();});
});