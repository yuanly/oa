﻿$(function(){
	/*
装柜单
{
 _id:"xxx",
 guihao:"xx",//如第N柜的N
 zhuangtai:"xx",
 zhuangguiriq:"2012-1-1",
 huowu:[{zgdId:"xx",guige:"xxx",danwei:"x",shuliang:22,jianshu:22,beizhu:"xxx"}...],
 liucheng:[制单 交单 审核 作废],
 jiaodanzhe:33,
 shenhezhe:22,
 zhuangguirenyuan:"xxx"//手写的一串名字，系统不做校验。
}
创建装柜单（如果是装柜时发货，也得先做好发货单才能建装柜单）
	编辑（包括新建和调整装柜单 对货物做分拆） 打印装柜单（随时都可以打印） 未申请审核可作废
已装柜（已装柜 申请审核，可以取消） 
审核确认 （可以取消）
打印给业务部门 
打印给老板（带成本）
	*/
	$('#currLocation', window.parent.document).text("装柜单管理");
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	$("th").attr("nowrap","true");
	$(".tr_huowu #td_yanhuodan").click(function(){
		window.open("../yanhuodan/yanhuodan.html?showId="+$(this).text(),"_blank");
	});
	$(".tr_huowu #td_dingdan").click(function(){
		var ddhwId = $(this).text();
		var ddId = ddhwId.substring(0,ddhwId.toUpperCase ().indexOf("HW"));
		window.open("../dingdan/dingdan.html?showId="+ddId,"_blank");
	});
	$("#th_bianhao").datepicker().change(function(){
		$(this).val("ZGD"+date2id($(this).val()));
		listzhuangguidan(0);
	});
	$("#th_guihao").change(function(){listzhuangguidan(0);});
	$("#th_zhuangtai").bind("input",function(){
		listzhuangguidan(0);
	});
	var users = getUsers();users.unshift({"user_name":"交单者"});
	$("#th_jiaodanzhe").myselector(users,"user_name").bind("input",function(){
		listzhuangguidan(0);
	});
	$("#th_zhuangguiriqi").datepicker().change(function(){
		listzhuangguidan(0);
	});
	users = getUsers();users.unshift({"user_name":"审核者"});
	$("#th_shenhezhe").myselector(users,"user_name").bind("input",function(){
		listzhuangguidan(0);
	});
	$("#huowutable").find("#td_huowubianhao").click(function(){
		var showId = $(this).text().substr(0,$(this).text().indexOf("HW"));
		window.open("../fahuodan/fahuodan.html?showId="+showId,"_blank");
	});
	$("#shangyi").click(function(){
		var curr = $(this).parents(".tr_huowu");
		var prev = curr.prev(".tr_huowu");
		if(prev.length>0){
			curr = curr.detach();
			prev.before(curr);
		}
	});
	function getDDID(ddhwId){
		return ddhwId.substring(0,ddhwId.toUpperCase ().indexOf("HW"));
	}
	function sel_huowu2(){
		var huowu = $(this).data("huowu");
		if(huowu.zhuangguidan){
			tip(null,"该货物已被选人柜单！",1500);
			return ;
		}
		var duplicate = false;
		$(".tr_huowu").each(function(i,hw){ 
			if(huowu._id == $(hw).data("huowu")._id){
				duplicate = true;
				return false;
			}
		});
		if(duplicate){
			tip(null,"重复货物！",1500);
			return ;
		}
		$("#sel_ctnr").hide();
		var tr_huowu = tmpl_tr_huowu.clone(true);
		tr_huowu.data("huowu",huowu);
		postJson("../dingdan/dingdans.php",{_id:getDDID(huowu.dingdanhuowu)},function(dd){
			tr_huowu.find("#td_kehu").text(dd.kehu);
		});
		tr_huowu.find("#td_huowubianhao").text(huowu._id);
		tr_huowu.find("#td_kehu").text(huowu.kehu);
		tr_huowu.find("#td_gonghuoshang").text(huowu.gonghuoshang.mingchen);
		tr_huowu.find("#td_yangban").text(huowu.yangban);
		tr_huowu.find("#td_guige").text(huowu.guige);
		tr_huowu.find("#td_danwei").text(huowu.danwei);
		tr_huowu.find("#td_shuliang").text(huowu.shuliang);
		tr_huowu.find("#td_jianshu").text(huowu.jianshu);
		tr_huowu.find("#td_zhu").text(huowu.zhu?huowu.zhu:"");
		if(huowu.yanhuodan){
			if(huowu.yanhuodan.zhuangtai == "不通过"){
				tr_huowu.find("#td_yanhuodan").html("<span style='font-size:0.6em;color:red'>"+huowu.yanhuodan._id+"</span>");
			}else if(huowu.yanhuodan.zhuangtai == "通过"){
				tr_huowu.find("#td_yanhuodan").html("<span style='font-size:0.6em;color:green'>"+huowu.yanhuodan._id+"</span>");
			}else{
				tr_huowu.find("#td_yanhuodan").html("<span style='font-size:0.6em;color:black'>"+huowu.yanhuodan._id+"</span>");
			}
		}
		tr_huowu.find("#td_dingdan").html("<font size=0.8em>"+huowu.dingdanhuowu+"</font>"); 
		$("#huowutable").append(tr_huowu);
	}
	$(".tmpl_fahuodanhuowu").click(sel_huowu2);
	function baocun(){
		var huowu = [];
		$(".tr_huowu").each(function(i,hw){
			var obj = $(hw).data("huowu");
			obj.zgdIdx = i;
		 	huowu.push(obj);
		}); 
		currZGD.huowu = huowu;
		currZGD.guihao = $("#zgd_guihao").val().trim();
		currZGD.zhuangguiriqi = $("#zgd_zhuangguiriqi").val().trim();
		currZGD.zhuangguirenyuan = $("#zhuangguirenyuan").text().trim();
		postJson("zhuangguidan.php",{caozuo:"baocun",zhuangguidan:currZGD},function(res){ 
			showDetailById(currZGD._id);
		});
	}
	$("#baocun").click(baocun);
	$("#fangqi").click(function(){showDetailById(currZGD._id);}); 
	function shanchuhuowu(){
		$(this).parents(".tr_huowu").remove();
	}
	$("#shanchuhuowu").click(shanchuhuowu); 
	$(".list").dblclick(function(){$(this).val("");});
	function showDingdan(){
		window.open("../dingdan/dingdan.html?showId="+$(this).text(),"_blank");
	}
	$("#dingdanhao").click(showDingdan);  
	 
	function sel_fahuodan_pager(){
		list_sel_huowu($("#sel_fahuodan_pager").data("offset")+1);
	}
	$("#sel_fahuodan_pager").click(sel_fahuodan_pager);
	function guanbi_sel_fahuodan(){
		$("#sel_ctnr").hide();
	}
	$("#guanbi_sel_fahuodan").click(guanbi_sel_fahuodan);
	function list_sel_huowu(offset){
		if(offset<0){
			return;
		}
		$("#sel_fahuodan_pager").data("offset",offset); 
		var fhdId = $("#opt_huowuId").val().trim();
		if(fhdId != ""){
			fhdId += "0";
		}
		postJson("../yanhuodan/yanhuodan.php",{caozuo:"chaxunhuowu",offset:offset*20,limit:20,option:{cmd:"",fhdId:fhdId}},function(huowus){
			$(".tmpl_fahuodanhuowu").remove();
			each(huowus,function(i,huowu){
				tr = tmpl_fahuodanhuowu.clone(true);
				tr.find("#td_huowubianhao").text(huowu._id);
				tr.find("#td_kehu").text(huowu.kehu);
				tr.find("#td_gonghuoshang").text(huowu.gonghuoshang?huowu.gonghuoshang.mingchen:"");
				tr.find("#td_guige").text(huowu.guige);
				tr.find("#td_danwei").text(huowu.danwei);
				tr.find("#td_shuliang").text(huowu.shuliang);
				tr.find("#td_jianshu").text(huowu.jianshu);
				tr.find("#td_zhu").text(huowu.zhu);
				if(huowu.yanhuodan){
					tr.find("#td_yanhuodan").text(huowu.yanhuodan._id);
				}
				if(huowu.zhuangguidan){
					tr.find("#td_zhuangguidan").text(huowu.zhuangguidan);
				}
				tr.data("huowu",huowu);
				tr.css("background-color",toggle("#fff","#eee"));
				$("#sel_fahuodan").append(tr);
			});
		});
	}
	function tianjiahuowu(){
		$("#sel_ctnr").show().center().css("top","50px");
		if($("#sel_fahuodan").find("tr").length == 1){
			list_sel_huowu(0);
		}
	}
	$("#tianjiahuowu").click(tianjiahuowu);
	$("#bianji").click(edit);
	function cz_zuofei(){
		if(!confirm("确定要作废该验货单吗？")){
			return;
		}
		postJson("zhuangguidan.php",{caozuo:"zuofei",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_zuofei").click(cz_zuofei);
	function cz_jiaodan(){
		postJson("zhuangguidan.php",{caozuo:"jiaodan",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_jiaodan").click(cz_jiaodan);
	function cz_shenqingshenhe(){
		postJson("zhuangguidan.php",{caozuo:"shenqingshenhe",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_shenqingshenhe").click(cz_shenqingshenhe);
	function cz_quxiaoshenqingshenhe(){
		postJson("zhuangguidan.php",{caozuo:"quxiaoshenqingshenhe",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		})
	}
	$("#cz_quxiaoshenqingshenhe").click(cz_quxiaoshenqingshenhe);
	function cz_quxiaoshenhe(){
		postJson("zhuangguidan.php",{caozuo:"quxiaoshenhe",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_quxiaoshenhe").click(cz_quxiaoshenhe);
	$("#cz_dayin").click(function(){
		window.open("dayin.html?showId="+currZGD._id,"_blank");
	});
	function cz_huitui(){
		postJson("zhuangguidan.php",{caozuo:"huitui",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_huitui").click(cz_huitui);
	function cz_shenhe(){
		postJson("zhuangguidan.php",{caozuo:"shenhe",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_shenhe").click(cz_shenhe);
	function cz_shenqingshouli(){
		postJson("zhuangguidan.php",{caozuo:"shenqingshouli",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
 $("#cz_shenqingshouli").click(cz_shenqingshouli);
	//翻页处理
	$("#prevPage").click(function(){
		listzhuangguidan($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listzhuangguidan($("#pager").data("offset")+1);
	});

	//流程下拉按钮
	function cz_anniu(){
		$(this).parents("table").find("#lc_caozuo").toggle();
		if($(this).attr("src").indexOf("up")>-1){
			$(this).attr("src","../../../img/down.png");
		}else{
			$(this).attr("src","../../../img/up.png");
		}
	}
	$("#lc_anniu").click(cz_anniu);
	//列表记录选择
	function sel_zhuangguidan(){
		showDetailById($(this).data("_id"));
		$(".tr_selected").removeClass("tr_selected");
		$(this).addClass("tr_selected");
	}
	$(".tr_zhuangguidan").click(sel_zhuangguidan);
	function setYanhuodizhi(){
		postJson("../vendor/vendors.php",{_id:currZGD.gonghuoshang._id},function(vendor){
			if(vendor.yanhuodizhi){
				$("#zgd_yanhuodizhi").val(vendor.yanhuodizhi);
			}else{
				$("#zgd_yanhuodizhi").val("");
			}
		});
	}
	$("#zgd_gonghuoshang").change(setYanhuodizhi);
	$("#opt_huowuId").change(function(){
		var zgdId = "FHD"+date2id($(this).val());
		$(this).val(zgdId);
		list_sel_huowu(0);
	});
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	//解释查询条件
	function getOptions(){
		var ret = {};
		var bh = $("#th_bianhao").val().trim();
		if("" != bh && "编号" != bh){
			ret.bianhao = bh+"0";
		}
		var gh = $("#th_guihao").val().trim();
		if("" != gh && "柜号" != gh){
			ret.guihao = gh;
		}
		var zt = $("#th_zhuangtai").val().trim();
		if("" != zt && "状态" != zt){
			ret.zhuangtai = zt;
		}
		var jdz = $("#th_jiaodanzhe").val().trim();
		if("" != jdz && "交单者" != jdz){
			ret.jiaodanzhe = getUserIdByName(jdz);
		} 		
		var zgrq = $("#th_zhuangguiriqi").val().trim();
		if("" != zgrq && "装柜日期" != zgrq){
			ret.zhuangguiriqi = zgrq+"0";
		}
		var shz = $("#th_shenhezhe").val().trim();
		if("" != shz && "审核者" != shz){
			ret.shenhezhe = getUserIdByName(shz);
		} 
		return ret;
	}
		//列出原稿
	function listzhuangguidan(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var cmd = getUrl().cmd?getUrl().cmd:"";
		var option = $.extend({cmd:cmd},getOptions());
		postJson("zhuangguidan.php",{caozuo:"chaxun",offset:offset*limit,limit:limit,option:option},function(zhuangguidans){
			$("#zhuangguidantable .tr_zhuangguidan").remove();
			each(zhuangguidans,function(n,zhuangguidan){
				var jiaodanzhe,shenhezhe;
				jiaodanzhe = zhuangguidan.jiaodanzhe?getUser(zhuangguidan.jiaodanzhe).user_name:"";
				shenhezhe = zhuangguidan.shenhezhe?getUser(zhuangguidan.shenhezhe).user_name:"";
				tr = tr_zhuangguidan.clone(true);
				tr.data("_id",zhuangguidan._id);
				tr.find("#td_bianhao").text(zhuangguidan._id);				
				tr.find("#td_guihao").text(zhuangguidan.guihao);
				tr.find("#td_zhuangtai").text(zhuangguidan.zhuangtai);
				tr.find("#td_jiaodanzhe").text(jiaodanzhe);
				tr.find("#td_zhuangguiriqi").text(zhuangguidan.zhuangguiriqi);
				tr.find("#td_shenhezhe").text(shenhezhe);
				
				tr.css("background-color",toggle("#fff","#eee"));
				if(zhuangguidan.zhuangtai == "作废"){
					tr.css("text-decoration","line-through");
				}
				$("#zhuangguidantable").append(tr);
			});
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else if(zhuangguidans.length>0){
				$(".tr_zhuangguidan").get(0).click();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
		});
	}
 
	function readOnly(){
		editing = false;
		$(".myinput").removeAttr("contenteditable");
		$("#zgd_gonghuoshang").css("cursor","default").unbind("click").val(currZGD.gonghuoshang?currZGD.gonghuoshang.mingchen:"");
		$("#zgd_yanhuodizhi").attr("readonly","readonly");
		$(".plainInput").attr("readonly","readonly"); 
		if(!currZGD.qitafei){
			$("#qita_div").hide();
		}else{
			$("#qita_div").show();
		}
		$("#zhuangguidanmingxi").find(".plainBtn").hide();
		if(kebianji){
			$("#bianji").show();
		}
		$("#fangqi").hide();$("#baocun").hide();
		$("#zgd_zhuangguiriqi").datepicker( "destroy" );
	}
	
	function edit(){
		editing = true;
		$(".myinput").attr("contenteditable","true");
		$("#zgd_yanhuodizhi").removeAttr("readonly");
		$(".plainInput").removeAttr("readonly");
		$("#zhuangguidanmingxi").find(".plainBtn").show();
 		$("#zgd_gonghuoshang").css("cursor","pointer").xuanzeshangjia("",function(vendor){
 			currZGD.gonghuoshang = {_id:vendor._id,mingchen:vendor.mingchen};
 		}).attr("readonly","readonly");
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
		$("#zgd_zhuangguiriqi").datepicker();
	}
	function showDetail(zgd){
		currZGD = zgd;
		$("#liucheng").show().liucheng(getTheUser(),zgd);
		$("#zgd_bianhao").val(currZGD._id);
		$("#zgd_guihao").val(currZGD.guihao);
		$("#zgd_zhuangguiriqi").val(currZGD.zhuangguiriqi);
		$("#zhuangguirenyuan").text(currZGD.zhuangguirenyuan);
		$(".tr_huowu").remove();
		each(zgd.huowu,function(i,huowu){
			var tr_huowu = tmpl_tr_huowu.clone(true);
			tr_huowu.data("huowu",huowu);
			tr_huowu.find("#td_huowubianhao").text(huowu._id);
			tr_huowu.find("#td_kehu").text(huowu.kehu?huowu.kehu:"");
			/*
			postJson("../dingdan/dingdans.php",{_id:getDDID(huowu.dingdanhuowu)},function(dd){
				tr_huowu.find("#td_kehu").text(dd.kehu);
			});
			*/
			tr_huowu.find("#td_gonghuoshang").text(huowu.gonghuoshang.mingchen);
			tr_huowu.find("#td_yangban").text(huowu.yangban);
			tr_huowu.find("#td_guige").text(huowu.guige);
			tr_huowu.find("#td_danwei").text(huowu.danwei);
			tr_huowu.find("#td_shuliang").text(huowu.shuliang);
			tr_huowu.find("#td_jianshu").text(huowu.jianshu);
			if(huowu.yanhuodan){
			if(huowu.yanhuodan.zhuangtai == "不通过"){
				tr_huowu.find("#td_yanhuodan").html("<span style='font-size:0.6em;color:red'>"+huowu.yanhuodan._id+"</span>");
			}else if(huowu.yanhuodan.zhuangtai == "通过"){
				tr_huowu.find("#td_yanhuodan").html("<span style='font-size:0.6em;color:green'>"+huowu.yanhuodan._id+"</span>");
			}else{
				tr_huowu.find("#td_yanhuodan").html("<span style='font-size:0.6em;color:black'>"+huowu.yanhuodan._id+"</span>");
			}
		}
		tr_huowu.find("#td_dingdan").html("<font size=0.8em>"+huowu.dingdanhuowu+"</font>");
			tr_huowu.find("#td_zhu").text(huowu.zhu?huowu.zhu:"");
			$("#huowutable").append(tr_huowu); 
		});

		liuyanElm.shuaxinliebiao({hostId:currZGD._id,hostType:"zhuangguidan"});
		readOnly();
	}
	
	function showDetailById(_id){
		postJson("zhuangguidan.php",{caozuo:"getbyid",_id:_id},function(zgd){
			showDetail(zgd);			
		});
	}

	jQuery.fn.liucheng = function(theUser,zhuangguidan){
		var that = this.empty();
		this.data("_id",zhuangguidan._id);
		each(zhuangguidan.liucheng,function(n,item){
			var tmpl = liuchengItem.clone(true);
			$("#lc_bianhao",tmpl).text(n+1);
			var usr = getUser(item.userId);
			$("#lc_touxiang",tmpl).attr("src",usr.photo);
			$("#lc_mingchen",tmpl).text(usr.user_name);
			$("#lc_dongzuo",tmpl).text(item.dongzuo);
			$("#lc_shijian",tmpl).text(new Date(item.time*1000).format("yyyy-MM-dd hh:mm"));
			if("制单" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","正在编制装柜单！");
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				$("#cz_dayin",caozuoItem).show();
				if((zhuangguidan.liucheng.length - 1) == n){
					kebianji = true;
					$("#cz_jiaodan",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show();
				}
				$("table",tmpl).append(caozuoItem);
			}else if("交单" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","装柜单完成编制，可以打印出来指导装柜！");
				kebianji = false;
				if((zhuangguidan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_huitui",caozuoItem).show();
					$("#cz_shenhe",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("受理" == item.dongzuo){//这个环境不要了
				if((zhuangguidan.liucheng.length - 1) == n && theUser._id == item.userId){
					kebianji = true;
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true); 
					$("#cz_shenqingshenhe",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("申请审核" == item.dongzuo){ 
				("#lc_tr_panel",tmpl).attr("title","已完成装柜，并根据实际装柜情况修正了装柜单，申请审核是否与实际装柜一致！");
				if((zhuangguidan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == item.userId){
						$("#cz_quxiaoshenqingshenhe",caozuoItem).show();
					}else{
						$("#cz_shenhe",caozuoItem).show();
					} 
					$("table",tmpl).append(caozuoItem); 
				} 
			}else if("审核" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","装柜单已被审核与实际装柜情况一致！");
				if((zhuangguidan.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true); 
					$("#cz_quxiaoshenhe",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}
			that.append(tmpl);
		});
	}
	
	///////////////////////////////初始化/////////////////////////////////////////////
	function _chushihua_(){} 
	var limit=20;
	var currZGD = null;
	var kebianji=true;
	var editing = false;
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	var caozuoTmpl = $("#lc_caozuo").detach();
	var liuchengItem = $("#liuchengItem").detach();
	var tr_zhuangguidan = $(".tr_zhuangguidan").detach();
	var tmpl_tr_huowu = $(".tr_huowu").detach();
	var tmpl_huowu = $(".tmpl_huowu").detach();
	var dingdanhuowu = $(".dingdanhuowu").detach();
	var currHuowu = null;
	var table_huowu = $(".huowu").clone(true);
	var tmpl_shuliangjianshu = $("#shuliangjianshu").clone(true);
	var tmpl_qitafeiyong = $(".qitafeiyong").detach();
	var tmpl_fahuodanhuowu = $(".tmpl_fahuodanhuowu").detach();
	
	
	$("#sel_ctnr").draggable();
	$("#opt_huowuId").datepicker();
	var liuyanElm = $("#liuyan").liuyan({hostType:"zhuangguidan",});
	listzhuangguidan(0,getUrl().showId);
	
		 	//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){		
		if(layout.state.west.innerWidth < $("#zhuangguidantable").width()){
			layout.sizePane("west",$("#zhuangguidantable").width()+20);
		}
	});
	$("#detailheader").click(function(){
		if(layout.state.center.innerWidth < $("#huowutable").width()){
			layout.sizePane("west",$("body").width()-$("#huowutable").width()-100);
		}
	});
});