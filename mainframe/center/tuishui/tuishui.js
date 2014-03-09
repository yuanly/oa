$(function(){
	/*
	{	_id:"TS131008.1",
		liucheng:[...],
		gendanyuan:"xx",
		zhuangtai:"xx",
		huogui:{_id:"xx",guihao:"xx",zhuangguiriqi:"xx"},
		guandan:{hetonghao:"xx",pinming:"xx",jine:3423,shuliang:3432,baoguanriqi:"xx",jidanriqi:"xxx",shoudanriqi:"xx"},
		dailishang:{_id:"xx",mingchen:"xx",renminbizhanghao:"xxx",meijinzhanghao:"xx"},
		fapiaos:[{kaipiaoqiye:{_id:"xx",mingchen:"xx"},shuihao:"xx",pinming:"xx",mishu:332,danjia:23.2,jine:232.2,kaipiaoriqi:"xx",shoupiaoriqi:"xx",fukuanliushui:"xx",beizhu:"xx"},...],
		huilv:6.2,
		hexiaos:[{shouhuiliushui:"xx",shouhuiriqi:"xx",meijinjine:23,hexiaoliushui:"xx",heixiaoriqi:"xx",renminbijine:32,huilvpaijia:2.3,shijihuilv:2.3},...],
		tuishui:{liushui:"xx",riqi:"xx",jine:32,shuilv:32},
		dailifei:{liushui:"xx",riqi:"xx",jine:32,beizhu:"xx"}
		}
	*/
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	$("#th_bianhao").datepicker().change(function(){
		$(this).val("TS"+date2id($(this).val()));
		listtuishui(0);
	});
	$("#fp_mishu").blur(function(){daikaimishu();});
	$("#fp_jine").blur(function(){daikaijine();yingtuishuie();});
	function sel_kaipiaoqiye(){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("tuishui.php",{caozuo:"chadailishang",offset:page*limit,limit:limit,option:option},function(shangjias){
					callback(shangjias);
				});
			},["_id","mingchen"],function(shangjia){//selected
				$(this).text(shangjia.mingchen).data("lxrId",shangjia._id);
			},"",function(){//clear
				$(this).text("").removeData("lxrId");
			});
	}
	function sel_shouhuiliushui(event){
		var shoukuanfang = $("#dls_dailishang").data("lxrId");
		if(!shoukuanfang){
			tip($(this),"请先设置代理商！",1500);
			return;
		}
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("tuishui.php",{caozuo:"chaliushui",offset:page*limit,limit:limit,option:option},function(liushuis){
					callback(liushuis);
				});
			},["_id","fukuanfangname","kemu","jine","shoukuanfangname","fukuanriqi","fahuodan"],function(liushui){//选中回调				
				$(this).text(liushui._id);
				$(this).parent().find("#hx_shouhuiriqi").text(liushui.fukuanriqi?liushui.fukuanriqi:"");
				$(this).parent().find("#hx_meijinjine").text(liushui.jine?liushui.jine:"");
				if(liushui.kemu != "收汇"){
					tip($(this),"注意，该流水科目不是 收汇！！！",1500);
				}
				if(shoukuanfang != liushui.shoukuanfang){
					tip($(this),"注意，该流水收款方不是指定代理商！！！",1500);
				}
				meijinhuizong();
			},"",function(){//清空回调
				$(this).text("");
				$(this).parent().find("#hx_shouhuiriqi").text("");
				$(this).parent().find("#hx_meijinjine").text("");
				meijinhuizong();
			},function(){//过滤框是日期选择时，在选中日期后的回调。
				$("#panel #option").val("LSZ"+date2id($("#panel #option").val()+"0"));
				});
	}
	function sel_hexiaoliushui(event){
		var daili = $("#dls_dailishang").data("lxrId");
		if(!daili){
			tip($(this),"请先设置代理商！",1500);
			return;
		}
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("tuishui.php",{caozuo:"chaliushui",offset:page*limit,limit:limit,option:option},function(liushuis){
					callback(liushuis);
				});
			},["_id","fukuanfangname","kemu","jine","shoukuanfangname","fukuanriqi","fahuodan"],function(liushui){//选中回调				
				$(this).text(liushui._id);
				$(this).parent().find("#hx_hexiaoriqi").text(liushui.fukuanriqi?liushui.fukuanriqi:"");
				$(this).parent().find("#hx_renminbijine").text(liushui.jine?liushui.jine:"");
				$(this).parent().find("#hx_shijihuilv").text(liushui.huilv?liushui.huilv:"");
				if(liushui.kemu != "核销"){
					tip($(this),"注意，该流水科目不是 核销！！！",1500);
				}
				if(daili != liushui.shoukuanfang || daili != liushui.fukuanfang){
					tip($(this),"注意，该流水付款方或收款方不是指定代理商！！！",1500);
				}
				renminbihuizong();
			},"",function(){//清空回调
				$(this).text("");
				$(this).parent().find("#hx_hexiaoriqi").text("");
				$(this).parent().find("#hx_renminbijine").text("");
				$(this).parent().find("#hx_shijihuilv").text("");
				renminbihuizong();
			},function(){//过滤框是日期选择时，在选中日期后的回调。
				$("#panel #option").val("LSZ"+date2id($("#panel #option").val()+"0"));
				});
	}	
	function sel_tuishuiliushui(event){
		var daili = $("#dls_dailishang").data("lxrId");
		if(!daili){
			tip($(this),"请先设置代理商！",1500);
			return;
		}
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("tuishui.php",{caozuo:"chaliushui",offset:page*limit,limit:limit,option:option},function(liushuis){
					callback(liushuis);
				});
			},["_id","fukuanfangname","kemu","jine","shoukuanfangname","fukuanriqi","fahuodan"],function(liushui){//选中回调				
				$(this).text(liushui._id);
				$("#ts_riqi").text(liushui.fukuanriqi?liushui.fukuanriqi:"");
				$("#ts_jine").text(liushui.jine?liushui.jine:"");
				if(liushui.kemu != "退税"){
					tip($(this),"注意，该流水科目不是 退税！！！",1500);
				}
				if(daili != liushui.shoukuanfang || daili != liushui.fukuanfang){
					tip($(this),"注意，该流水付款方或收款方不是指定代理商！！！",1500);
				}
			},"",function(){//清空回调
				$(this).text("");
				$("#ts_riqi").text("");
				$("#ts_jine").text("");
			},function(){//过滤框是日期选择时，在选中日期后的回调。
				$("#panel #option").val("LSZ"+date2id($("#panel #option").val()+"0"));
				});
	}	
	function sel_dailifeiliushui(event){
		var daili = $("#dls_dailishang").data("lxrId");
		if(!daili){
			tip($(this),"请先设置代理商！",1500);
			return;
		}
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("tuishui.php",{caozuo:"chaliushui",offset:page*limit,limit:limit,option:option},function(liushuis){
					callback(liushuis);
				});
			},["_id","fukuanfangname","kemu","jine","shoukuanfangname","fukuanriqi","fahuodan"],function(liushui){//选中回调				
				$(this).text(liushui._id);
				$("#dlf_riqi").text(liushui.fukuanriqi?liushui.fukuanriqi:"");
				$("#dlf_jine").text(liushui.jine?liushui.jine:"");
				if(liushui.kemu != "代理费"){
					tip($(this),"注意，该流水科目不是 代理费！！！",1500);
				}
				if(daili != liushui.shoukuanfang || daili != liushui.fukuanfang){
					tip($(this),"注意，该流水付款方或收款方不是指定代理商！！！",1500);
				}
			},"",function(){//清空回调
				$(this).text("");
				$("#dlf_riqi").text("");
				$("#dlf_jine").text("");
			},function(){//过滤框是日期选择时，在选中日期后的回调。
				$("#panel #option").val("LSZ"+date2id($("#panel #option").val()+"0"));
				});
	}	
	function sel_fukuanliushui(event){
		var shoukuanfang = $(this).parent().find("#fp_kaipiaoqiye").data("lxrId");
		if(!shoukuanfang){
			tip($(this),"请先设置开票企业！",1500);
			return;
		}
		var fukuanfang = $("#dls_dailishang").data("lxrId");
		if(!fukuanfang){
			tip($(this),"请先设置代理商！",1500);
			return;
		}
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("tuishui.php",{caozuo:"chaliushui",offset:page*limit,limit:limit,option:option},function(liushuis){
					callback(liushuis);
				});
			},["_id","fukuanfangname","kemu","jine","shoukuanfangname","fukuanriqi","fahuodan"],function(liushui){//选中回调				
				$(this).text(liushui._id);
				if(liushui.kemu != "开票"){
					tip($(this),"注意，该流水科目不是 开票！！！",1500);
				}
				if(fukuanfang != liushui.fukuanfang){
					tip($(this),"注意，该流水付款方不是指定代理商！！！",1500);
				}
				if(shoukuanfang != liushui.shoukuanfang){
					tip($(this),"注意，该流水收款方不是指定开票企业！！！",1500);
				}
			},"",function(){//清空回调
				$(this).text("");
			},function(){//过滤框是日期选择时，在选中日期后的回调。
				$("#panel #option").val("LSZ"+date2id($("#panel #option").val()+"0"));
				});
	}
	$("#fp_fukuanliushui").click(sel_fukuanliushui);
	function link_liushui(){
		if("" != $(this).text().trim()){
			window.open("../liushuizhang/liushuizhang.html?showId="+$(this).text(),"_blank");
		}		
	}
	function sel_dailishang(){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("tuishui.php",{caozuo:"chadailishang",offset:page*limit,limit:limit,option:option},function(shangjias){
					callback(shangjias);
				});
			},["_id","mingchen"],function(shangjia){//selected
				$("#dls_dailishang").text(shangjia.mingchen).data("lxrId",shangjia._id);
				$("#dls_rmbyue").html("&nbsp;").removeData("zhanghao");
				$("#dls_mjyue").html("&nbsp;").removeData("zhanghao");
			},"",function(){//clear
				$("#dls_dailishang").html("&nbsp;").removeData("lxrId");
				$("#dls_rmbyue").html("&nbsp;").removeData("zhanghao");
				$("#dls_mjyue").html("&nbsp;").removeData("zhanghao");
			});
	}
	function link_shangjia(){
		if($(this).data("lxrId")){
			window.open("../contact/contact.html?showId="+$(this).data("lxrId"),"_blank");
		}
	}
	$("#hx_tianjiaxinhang").click(function(){
		var tr = tmpl_tr_hexiao.clone(true);
		tr.find(".hx_shouhuiriqi").datepicker({dateFormat:"yy-mm-dd"});
		tr.find(".hx_hexiaoriqi").datepicker({dateFormat:"yy-mm-dd"});
		$("#hx_table").append(tr);
	});
	$("#fp_tianjiaxinhang").click(function(){
		var tr = tmpl_tr_fapiao.clone(true);
		tr.find(".fp_kaipiaoriqi").datepicker({dateFormat:"yy-mm-dd"});
		tr.find(".fp_shoupiaoriqi").datepicker({dateFormat:"yy-mm-dd"});
		$("#fp_table").append(tr);
	});
	$("#fp_shanchubenhang").click(function(){
		$(this).parent().parent().remove();
	});
	$("#hx_shanchubenhang").click(function(){
		$(this).parent().parent().remove();
	});
	$("#hx_shangyi").click(function(){
		var prev = $(this).parent().parent().prev(".tr_hexiao").detach();
		if(prev.length == 1){
			$(this).parent().parent().after(prev); 
		}
	});
	$("#fp_shangyi").click(function(){
		var prev = $(this).parent().parent().prev(".tr_fapiao").detach();
		if(prev.length == 1){
			$(this).parent().parent().after(prev); 
		}
	});
	
	function sel_zhanghao(){
		if($("#dls_dailishang").data("lxrId")){
			var limit = 20;
			setSelector(event,function(page,option,callback){
					postJson("tuishui.php",{caozuo:"chazhanghao",offset:page*limit,limit:limit,lxrId:$("#dls_dailishang").data("lxrId")},function(zhanghaos){
						callback(zhanghaos);
					});
				},["yinhang","huming","zhanghao","wangdian"],function(zhanghao){//selected
					setYue($(this),zhanghao.zhanghao);
				},"",function(){//clear
					$(this).html("&nbsp;").removeData("zhanghao");
				});			
		}
	}
	$("#gd_baoguanriqi").datepicker();
	function sel_zhuangguidan(){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("tuishui.php",{caozuo:"chazhuangguidan",offset:page*limit,limit:limit,option:option},function(zhuangguidans){
					callback(zhuangguidans);
				});
			},["_id","zhuangtai","guihao","zhuangguiriqi"],function(zhuangguidan){//selected
				$("#hg_zhuangguidan").text(zhuangguidan._id);
				$("#hg_guihao").text(zhuangguidan.guihao);
				$("#hg_zhuangguiriqi").text(zhuangguidan.zhuangguiriqi);
			},$("#hg_zhuangguidan").text(),function(){//clear
				$("#hg_zhuangguidan").html("&nbsp;");
				$("#hg_guihao").text("");
				$("#hg_zhuangguiriqi").text("");
			},function(){//datepick
			$("#panel #option").val("ZGD"+date2id($("#panel #option").val()+"0"));
			});
	}
	function link_zhuangguidan(){
		window.open("../zhuangguidan/zhuangguidan.html?showId="+$(this).text(),"_blank");
	}
	function baocun(){
		var ok = true;
		if("" != $("#hg_zhuangguidan").text().trim()){
			currTS.huogui = {_id:$("#hg_zhuangguidan").text().trim(),guihao:$("#hg_guihao").text().trim(),zhuangguiriqi:$("#hg_zhuangguiriqi").text().trim()};
		}else{
			currTS.huogui = undefined;
		}
		var guandan = {};
		guandan.hetonghao = $("#gd_hetonghaoma").text().trim();
		guandan.chanpinmingchen = $("#gd_chanpinmingchen").text().trim();
		if("" != $("#gd_jine").text().trim()){
			guandan.jine = parseFloat($("#gd_jine").text().trim());
			if(isNaN(guandan.jine)){
				tip($("#gd_jine"),"关单 金额 不是有效实数！",1500);
				return;
			}
		}
		if("" != $("#gd_shuliang").text().trim()){
			guandan.shuliang = parseFloat($("#gd_shuliang").text().trim());
			if(isNaN(guandan.shuliang)){			
				tip($("#gd_shuliang"),"关单 数量 不是有效实数！",1500);
				return;
			}
		}
		guandan.baoguanriqi = $("#gd_baoguanriqi").val().trim();
		guandan.jidanriqi = $("#gd_jidanriqi").val().trim();
		guandan.shoudanriqi = $("#gd_shoudanriqi").val().trim();
		currTS.guandan = guandan;
		
		if($("#dls_dailishang").data("lxrId")){
			var dailishang = {};
			dailishang._id = $("#dls_dailishang").data("lxrId");
			dailishang.mingchen = $("#dls_dailishang").text();
			if($("#dls_rmbyue").data("zhanghao")){
				dailishang.renminbizhanghao = $("#dls_rmbyue").data("zhanghao");
			}
			if($("#dls_mjyue").data("zhanghao")){
				dailishang.meijinzhanghao = $("#dls_mjyue").data("zhanghao");
			}
			currTS.dailishang = dailishang;
		}else{
			currTS.dailishang = undefined;
		}
		
		if($(".tr_fapiao").length>0){
			var fapiaos = [];
			$(".tr_fapiao").each(function(i,tr){
				var fapiao  = {};
				if($(tr).find("#fp_kaipiaoqiye").data("lxrId")){
					fapiao.kaipiaoqiye = {_id:$(tr).find("#fp_kaipiaoqiye").data("lxrId"),mingchen:$(tr).find("#fp_kaipiaoqiye").text()};
				}
				fapiao.shuihao = $(tr).find("#fp_shuihao").text().trim();
				fapiao.pinming = $(tr).find("#fp_pinming").text().trim();
				if("" != $(tr).find("#fp_mishu").text().trim()){
					fapiao.mishu = parseFloat($(tr).find("#fp_mishu").text().trim());
					if(isNaN(fapiao.mishu)){
						ok = false;					
						tip($(tr).find("#fp_mishu"),"发票 米数 不是有效实数！",1500);
						return false;
					}
				}
				if("" != $(tr).find("#fp_jine").text().trim()){
					fapiao.jine = parseFloat($(tr).find("#fp_jine").text().trim());
					if(isNaN(fapiao.jine)){
						ok = false;					
						tip($(tr).find("#fp_jine"),"发票 金额 不是有效实数！",1500);
						return false;
					}
				}
				fapiao.kaipiaoriqi = $(tr).find(".fp_kaipiaoriqi").val();
				fapiao.shoupiaoriqi = $(tr).find(".fp_shoupiaoriqi").val();
				fapiao.fukuanliushui = $(tr).find("#fp_fukuanliushui").text();
				fapiao.beizhu = $(tr).find("#fp_beizhu").text().trim();
				fapiaos.push(fapiao);
			});
			if(!ok){
				return;
			}
			currTS.fapiaos = fapiaos;
		}else{
			currTS.fapiaos = undefined;
		}
		currTS.huilv = parseFloat($("#fp_huilv").text().trim());
		if(!currTS.huilv){
			currTS.huilv = undefined;
		}
		var hexiaos = [];
		$(".tr_hexiao").each(function(i,tr){
			var hx = {}
			hx.shouhuiliushui = $(tr).find("#hx_shouhuiliushui").text();
			hx.shouhuiriqi = $(tr).find("#hx_shouhuiriqi").text();
			hx.meijinjine = parseFloat2($(tr).find("#hx_meijinjine").text());
			hx.hexiaoliushui = $(tr).find("#hx_hexiaoliushui").text();
			hx.hexiaoriqi =$(tr).find("#hx_hexiaoriqi").text();
			hx.renminbijine = parseFloat2($(tr).find("#hx_renminbijine").text());
			hx.shijihuilv = parseFloat2($(tr).find("#hx_shijihuilv").text());
			hx.huilvpaijia = parseFloat2($(tr).find("#hx_huilvpaijia").text());
			if("" != $(tr).find("#hx_huilvpaijia").text() && undefined == hx.huilvpaijia){
				tip($(tr).find("#hx_huilvpaijia"),"汇率牌价必须是有效实数！",1500);
				ok = false;
				return false;
			}
			hexiaos.push(hx);
		});
		if(!ok){
			return;
		}
		if(hexiaos.length>0){
			currTS.hexiaos = hexiaos;
		}else{
			currTS.hexiaos = undefined;
		}
		
		var tuishui = {};
		tuishui.liushui = $("#ts_liushui").text();
		tuishui.riqi = $("#ts_riqi").text();
		tuishui.jine = parseFloat2($("#ts_jine").text());
		tuishui.shuilv = parseFloat2($("#ts_shuilv").text());
		if(!isNaN(tuishui.shuilv) && (tuishui.shuilv <=0 ||tuishui.shuilv>=100)){
			tip($("#ts_shuilv"),"税率必须为大于0小于100的实数！",1500);
			return;
		}
		currTS.tuishui = tuishui;

		var dailifei = {};
		dailifei.liushui = $("#dlf_liushui").text();
		dailifei.riqi = $("#dlf_riqi").text();
		dailifei.jine = parseFloat2($("#dlf_jine").text());
		dailifei.beizhu = $("#dlf_beizhu").text().trim();
		currTS.dailifei = dailifei;
				
		postJson("tuishui.php",{caozuo:"baocun",tuishui:currTS},function(res){
			showDetailById(currTS._id);
		});		
	}
	function already(dongzuo){
		var ret = false;
		each(currTS.liucheng,function(i,lc){
			if(dongzuo == lc.dongzuo){
				ret = true;
				return false;
			}
		});
		return ret;
	}
	$("#fp_div").find(".fp_shoupiaoriqi").datepicker({dateFormat:"yy-mm-dd"});
	$("#fp_div").find(".fp_kaipiaoriqi").datepicker({dateFormat:"yy-mm-dd"});
	$("#hx_div").find(".hx_shouhuiliushui").unbind("click").click(sel_shouhuiliushui);
	$("#hx_div").find(".hx_hexiaoliushui").unbind("click").click(sel_hexiaoliushui);
	function edit(){
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
		if(!already("装柜")){
			$("#hg_zhuangguidan").unbind("click").css("color","blue").click(sel_zhuangguidan);
		}
		if(!already("报关")){
			$("#div_guandan").find(".myinput").attr("contenteditable","true");
			$("#div_guandan").find(".plainInput").removeAttr("readonly").datepicker({dateFormat:"yy-mm-dd"});
		}
		if(!already("付款")){
			$("#dls_dailishang").unbind("click").css("color","blue").click(sel_dailishang);
			$("#dls_rmbyue").unbind("click").click(sel_zhanghao);
			$("#dls_mjyue").unbind("click").click(sel_zhanghao);
		
			$("#fp_div").find(".plainBtn").show();
			$("#fp_div").find(".fp_kaipiaoqiye").unbind("click").click(sel_kaipiaoqiye);
			$("#fp_div").find(".editable").attr("contenteditable","true");
			$("#fp_div").find(".fp_kaipiaoriqi").datepicker({dateFormat:"yy-mm-dd"});
			$("#fp_div").find(".fp_fukuanliushui").unbind("click").click(sel_fukuanliushui);
			$("#fp_huilv").attr("contenteditable","true");
		}
		if(!already("开票")){
			$("#fp_div").find(".fp_shoupiaoriqi").datepicker({dateFormat:"yy-mm-dd"});
		}
		if(!already("单证")){
			$("#hx_div").find(".plainBtn").show();
			$("#hx_div").find(".hx_shouhuiliushui").unbind("click").click(sel_shouhuiliushui);
			$("#hx_div").find(".hx_hexiaoliushui").unbind("click").click(sel_hexiaoliushui);
			$("#hx_div").find("#hx_huilvpaijia").attr("contenteditable","true");
		}
		
		$("#ts_liushui").unbind("click").click(sel_tuishuiliushui);
		$("#ts_shuilv").attr("contenteditable","true");
		
		$("#dlf_liushui").unbind("click").click(sel_dailifeiliushui);
		$("#dlf_beizhu").attr("contenteditable","true");
	}
	
	$("#bianji").click(edit);
	$("#baocun").click(baocun);
	$("#fangqi").click(function(){showDetailById(currTS._id);});
	function readOnly(){
		$("#fangqi").hide();$("#baocun").hide();
		$("#hg_zhuangguidan").css("color","#660033").unbind("click").click(link_zhuangguidan);
		$("#div_guandan").find(".myinput").removeAttr("contenteditable");
		$("#div_guandan").find(".plainInput").attr("readonly","readonly").datepicker("destroy");
		$("#dls_dailishang").css("color","#660033").unbind("click").click(link_shangjia);
		$("#dls_rmbyue").unbind("click");
		$("#dls_mjyue").unbind("click");
		$("#fp_div").find(".plainBtn").hide();
		$("#fp_div").find(".fp_kaipiaoqiye").unbind("click").click(link_shangjia);
		$("#fp_div").find(".editable").removeAttr("contenteditable");
		$("#fp_div").find(".fp_kaipiaoriqi").datepicker("destroy");
		$("#fp_div").find(".fp_shoupiaoriqi").datepicker("destroy");
		
		$(".tr_fapiao").each(function(i,tr){
			$(tr).find("#fp_kaipiaoriqi").datepicker("destroy");
			$(tr).find("#fp_shoupiaoriqi").datepicker("destroy");
		});
			
		$("#fp_div").find(".fp_fukuanliushui").unbind("click").click(link_liushui);
		$("#fp_huilv").removeAttr("contenteditable");
		
		$("#hx_div").find(".plainBtn").hide();
		$("#hx_div").find(".hx_shouhuiliushui").unbind("click").click(link_liushui);
		$("#hx_div").find(".hx_hexiaoliushui").unbind("click").click(link_liushui);
		$("#hx_div").find("#hx_huilvpaijia").removeAttr("contenteditable");
		$("#ts_liushui").unbind("click").click(link_liushui);
		$("#ts_shuilv").removeAttr("contenteditable");
		$("#dlf_liushui").unbind("click").click(link_liushui);
		$("#dlf_beizhu").removeAttr("contenteditable");
	}
	//翻页处理
	$("#prevPage").click(function(){
		listtuishui($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listtuishui($("#pager").data("offset")+1);
	});
	//流程下拉按钮
	function cz_anniu(){
		$(this).parents("#lc_tb_in").find("#lc_caozuo").toggle();
		if($(this).attr("src").indexOf("up")>-1){
			$(this).attr("src","../../../img/down.png");
		}else{
			$(this).attr("src","../../../img/up.png");
		}
	}
	$("#lc_anniu").click(cz_anniu);
	//列表记录选择
	function sel_tuishui(){
		showDetailById($(this).data("_id"));
		$(".tr_selected").removeClass("tr_selected");
		$(this).addClass("tr_selected");
	}
	$(".tr_tuishui").click(sel_tuishui);
	function cz_zhuanggui(){
		if(!currTS.huogui){
			tip($(this),"必须先设置货柜信息！",1500);
			return;
		}
		postJson("tuishui.php",{caozuo:"zhuanggui",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_zhuanggui").click(cz_zhuanggui);
	function cz_baoguan(){
		if(!currTS.guandan){
			tip($(this),"必须先设置关单信息！",1500);
			return;
		}
		if(currTS.guandan.baoguanriqi == ""){
			tip($(this),"必须先设置报关日期！",1500);
			return;
		}
		if(!currTS.guandan.jine){
			tip($(this),"必须先设置金额！",1500);
			return;
		}
		if(!currTS.guandan.jine){
			tip($(this),"必须先设置数量！",1500);
			return;
		}
		postJson("tuishui.php",{caozuo:"baoguan",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_baoguan").click(cz_baoguan);
	function cz_fukuan(){
		var ok=true;
		each(currTS.fapiaos,function(i,fp){
			if(fp.fukuanliushui == ""){
				ok = false;
				return false;
			}
		});
		if(!ok){
			tip($(this),"必须先设置全部发票付款流水！",1500);
			return;
		}
		var zongmishu = 0;
		each(currTS.fapiaos,function(i,fp){
			zongmishu += fp.mishu;
		});
		if(zongmishu + 10 < currTS.guandan.shuliang){
			tip($(this),"待开票数量太大！",1500);
			return;			
		} 
		postJson("tuishui.php",{caozuo:"fukuan",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_fukuan").click(cz_fukuan);
	function cz_kaipiao(){
		var ok=true;
		each(currTS.fapiaos,function(i,fp){
			if(fp.shoupiaoriqi == ""){
				ok = false;
				return false;
			}
		});
		if(!ok){
			tip($(this),"必须先设置全部发票收票日期！",1500);
			return;
		}
		postJson("tuishui.php",{caozuo:"kaipiao",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_kaipiao").click(cz_kaipiao);
	function cz_danzheng(){
		postJson("tuishui.php",{caozuo:"danzheng",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_danzheng").click(cz_danzheng);
	function cz_tuishui(){
		postJson("tuishui.php",{caozuo:"tuishui",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_tuishui").click(cz_tuishui);
	function cz_quxiao(){
		postJson("tuishui.php",{caozuo:"quxiao",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_quxiao").click(cz_quxiao);
	function cz_jieguan(){
		postJson("tuishui.php",{caozuo:"jieguan",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_jieguan").click(cz_jieguan);
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	function getOptions(){
		var ret = {};
		var bh = $("#th_bianhao").val().trim();
		if("" != bh && "编号" != bh){
			ret.bianhao = bh+"0";
		}
		return ret;
	}
 	function listtuishui(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var cmd = getUrl().cmd?getUrl().cmd:"";
		var option = $.extend({cmd:cmd},getOptions());
		postJson("tuishui.php",{caozuo:"chaxun",offset:offset*limit,limit:limit,option:option},function(tuishuis){
			$("#tuishuitable .tr_tuishui").remove();
			each(tuishuis,function(n,tuishui){
				tr = tr_tuishui.clone(true);
				tr.data("_id",tuishui._id);
				tr.find("#td_bianhao").text(tuishui._id);
				tr.find("#td_gendanyuan").text(getUserName(tuishui.gendanyuan));
				tr.find("#td_guihao").text(tuishui.huogui?tuishui.huogui.guihao:"");
				tr.find("#td_zhuangguiriqi").text(tuishui.huogui?tuishui.huogui.zhuangguiriqi:"");
				tr.find("#td_baoguanriqi").text((tuishui.guandan && tuishui.guandan.baoguanriqi)?tuishui.guandan.baoguanriqi:"");
				tr.find("#td_zhuangtai").text(tuishui.zhuangtai);
				tr.find("#td_shuliang").text((tuishui.guandan && tuishui.guandan.shuliang)?tuishui.guandan.shuliang:"");
				tr.find("#td_jine").text((tuishui.guandan && tuishui.guandan.jine)?tuishui.guandan.jine:"");
				tr.find("#td_dailishang").text(tuishui.dailishang?tuishui.dailishang.mingchen:"");
				
				tr.css("background-color",toggle("#fff","#eee"));
				if(tuishui.zhuangtai == "作废"){
					tr.css("text-decoration","line-through");
				}
				$("#tuishuitable").append(tr);
			});
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else if(tuishuis.length>0){
				$(".tr_tuishui").get(0).click();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
		});
	} 
	function daikaijine(){
		if(currTS.huilv && currTS.guandan && currTS.guandan.jine){
			var jine = currTS.guandan.jine * currTS.huilv;
			var fpjine = 0;
			$(".tr_fapiao").each(function(i,tr){
				var jine = parseFloat($(tr).find("#fp_jine").text());
				if(!isNaN(jine)){
					fpjine += jine;
				}
			});
			$("#fp_daikaijine").text(jine - fpjine);
		}else{
			$("#fp_daikaijine").text("");
		}
	}
	function daikaimishu(){
		if(currTS.guandan.shuliang){
			var fpmishu = 0;
			$(".tr_fapiao").each(function(i,tr){
				var mishu = parseFloat($(tr).find("#fp_mishu").text());
				if(!isNaN(mishu)){
					fpmishu += mishu;
				}
			});
			$("#fp_daikaimishu").text(currTS.guandan.shuliang - fpmishu);
		}else{
			$("#fp_daikaimishu").text("");
		}
	}
	function meijinhuizong(){
		var sum = 0;
		$(".tr_hexiao").each(function(i,tr){
			var jine = parseFloat($(tr).find("#hx_meijinjine").text());
			if(!isNaN(jine)){
				sum += jine;
			}
		});
		$("#hx_meijinhuizong").text(sum);
	}
	function renminbihuizong(){
		var sum = 0;
		$(".tr_hexiao").each(function(i,tr){
			var jine = parseFloat($(tr).find("#hx_renminbijine").text());
			if(!isNaN(jine)){
				sum += jine;
			}
		});
		$("#hx_renminbihuizong").text(sum);
	}
	function showDetail(ts){
		currTS = ts;
		$("#liucheng").show().liucheng(getTheUser(),ts);
		if(ts.huogui){
			$("#hg_zhuangguidan").text(ts.huogui._id);
			$("#hg_guihao").text(ts.huogui.guihao);
			$("#hg_zhuangguiriqi").text(ts.huogui.zhuangguiriqi);
		}else{
			$("#hg_zhuangguidan").html("&nbsp;");
			$("#hg_guihao").text("");
			$("#hg_zhuangguiriqi").text("");
		}
		if(currTS.guandan){
			var guandan = currTS.guandan;
			$("#gd_hetonghaoma").text(guandan.hetonghao);
			$("#gd_chanpinmingchen").text(guandan.chanpinmingchen);
			$("#gd_jine").text(guandan.jine?guandan.jine:"");
			$("#gd_shuliang").text(guandan.shuliang?guandan.shuliang:"");
			$("#gd_baoguanriqi").vals(guandan.baoguanriqi);
			$("#gd_jidanriqi").vals(guandan.jidanriqi);
			$("#gd_shoudanriqi").vals(guandan.shoudanriqi);
		}
		if(currTS.dailishang){
			$("#dls_dailishang").text(currTS.dailishang.mingchen).data("lxrId",currTS.dailishang._id);
			if(currTS.dailishang.renminbizhanghao){				
				setYue($("#dls_rmbyue"),currTS.dailishang.renminbizhanghao);
			}else{
				$("#dls_rmbyue").html("&nbsp;").removeData("zhanghao");
			}
			if(currTS.dailishang.meijinzhanghao){
				setYue($("#dls_mjyue"),currTS.dailishang.meijinzhanghao);
			}else{
				$("#dls_mjyue").html("&nbsp;").removeData("zhanghao");
			}
		}else{
			$("#dls_dailishang").html("&nbsp;").removeData("lxrId");
			$("#dls_rmbyue").html("&nbsp;").removeData("zhanghao");
			$("#dls_mjyue").html("&nbsp;").removeData("zhanghao");
		}
	
		$(".tr_fapiao").remove();
		if(currTS.fapiaos){
			each(currTS.fapiaos,function(i,fapiao){
				var tr = tmpl_tr_fapiao.clone(true);
				if(fapiao.kaipiaoqiye){
					tr.find("#fp_kaipiaoqiye").text(fapiao.kaipiaoqiye.mingchen).data("lxrId",fapiao.kaipiaoqiye._id);
				}
				tr.find("#fp_shuihao").text(fapiao.shuihao);
				tr.find("#fp_pinming").text(fapiao.pinming);
				tr.find("#fp_mishu").text(fapiao.mishu?fapiao.mishu:"");
				tr.find("#fp_jine").text(fapiao.jine?fapiao.jine:"");
				tr.find(".fp_kaipiaoriqi").vals(fapiao.kaipiaoriqi);
				tr.find(".fp_shoupiaoriqi").vals(fapiao.shoupiaoriqi);
				tr.find("#fp_fukuanliushui").text(fapiao.fukuanliushui);
				tr.find("#fp_beizhu").text(fapiao.beizhu);
				$("#fp_table").append(tr);
			});			
		}
		if(currTS.huilv){
			$("#fp_huilv").text(currTS.huilv);
		}else{
			$("#fp_huilv").text("");
		}
		daikaijine();
		daikaimishu();
		$(".tr_hexiao").remove();
		each(currTS.hexiaos,function(i,hx){
			var tr = tmpl_tr_hexiao.clone(true);
			tr.find("#hx_shouhuiliushui").text(hx.shouhuiliushui);
			tr.find("#hx_shouhuiriqi").text(hx.shouhuiriqi);
			tr.find("#hx_meijinjine").text(hx.meijinjine?hx.meijinjine:"");
			tr.find("#hx_hexiaoliushui").text(hx.hexiaoliushui);
			tr.find("#hx_hexiaoriqi").text(hx.hexiaoriqi);
			tr.find("#hx_renminbijine").text(hx.renminbijine?hx.renminbijine:"");
			tr.find("#hx_shijihuilv").text(hx.shijihuilv?hx.shijihuilv:"");
			tr.find("#hx_huilvpaijia").text(hx.huilvpaijia?hx.huilvpaijia:"");
			$("#hx_table").append(tr);
		});
		meijinhuizong();
		renminbihuizong();
		
		if(currTS.tuishui){
			var ts = currTS.tuishui;
			$("#ts_liushui").text(ts.liushui);
			$("#ts_riqi").text(ts.riqi);
			$("#ts_jine").text(ts.jine?ts.jine:"");
			$("#ts_shuilv").text(ts.shuilv?ts.shuilv:"");
		}else{
			$("#ts_liushui").html("&nbsp;");
			$("#ts_riqi").text("");
			$("#ts_jine").text("");
			$("#ts_shuilv").text("");
		}
		yingtuishuie();

		if(currTS.dailifei){
			var dlf = currTS.dailifei;
			$("#dlf_liushui").text(dlf.liushui);
			$("#dlf_riqi").text(dlf.riqi);
			$("#dlf_jine").text(dlf.jine?dlf.jine:"");
			$("#dlf_beizhu").text(dlf.beizhu);
		}else{
			$("#dlf_liushui").html("&nbsp;");
			$("#dlf_riqi").text("");
			$("#dlf_jine").text("");
			$("#dlf_beizhu").text("");
		}
				
		liuyanElm.shuaxinliebiao({hostId:currTS._id,hostType:"tuishui"});
		readOnly();	
	}
	function yingtuishuie(){
		$("#ts_yingtuishuie").text("");
		var shuilv = parseFloat($("#ts_shuilv").text().trim());
		if(isNaN(shuilv) || shuilv >= 100 || shuilv <= 0){
			return;
		}
		var jine = 0;
		$(".tr_fapiao").each(function(i,tr){
			var je = parseFloat($(tr).find("#fp_jine").text().trim());
			if(!isNaN(je)){
				jine += je;
			}
		});
		$("#ts_yingtuishuie").text(round(jine*shuilv/117,2));
	}
	$("#ts_shuilv").blur(function(){yingtuishuie();});
	function setYue(elm,zhanghao){
		elm.data("zhanghao",zhanghao);
		postJson("tuishui.php",{caozuo:"getyue",lxrId:$("#dls_dailishang").data("lxrId"),zhanghao:zhanghao},function(yue){
			elm.text(yue);
		});
	}
	function showDetailById(_id){
		postJson("tuishui.php",{caozuo:"getbyid",_id:_id},function(ts){
			showDetail(ts);
		});
	}
	jQuery.fn.liucheng = function(theUser,tuishui){
		var that = this.empty();
		$("#bianji").show();
		this.data("_id",tuishui._id);
		each(tuishui.liucheng,function(n,item){
			var tmpl = liuchengItem.clone(true);
			$("#lc_bianhao",tmpl).text(n+1);
			var usr = getUser(item.userId);
			$("#lc_touxiang",tmpl).attr("src",usr.photo);
			$("#lc_mingchen",tmpl).text(usr.user_name);
			$("#lc_dongzuo",tmpl).text(item.dongzuo);
			$("#lc_shijian",tmpl).text(new Date(item.time*1000).format("yyyy-MM-dd hh:mm"));
			if("新建" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已建立退税单证记录，等待装柜并录入货柜信息！");
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				if(currTS.gendanyuan == theUser._id){
					$("#cz_dayin",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show();
					if((tuishui.liucheng.length - 1) == n){
						$("#cz_zhuanggui",caozuoItem).show();
					}
				}else{
					$("#cz_jieguan",caozuoItem).show();
				}
				$("table",tmpl).append(caozuoItem);
			}else if("装柜" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已装柜并录入装柜信息，等待报关并录入报关信息！");
				if((tuishui.liucheng.length - 1) == n && currTS.gendanyuan == theUser._id){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_baoguan",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("报关" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已报关并录入报关信息，等待代理商向开票厂家付清全部开票货款！（需要我们在代理商的人民币或美金账户有足够多的余额）");
				if((tuishui.liucheng.length - 1) == n && currTS.gendanyuan == theUser._id){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_fukuan",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("付款" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已付清全部开票货款，等待开票企业开票并将全部发票寄给代理商！");
				if((tuishui.liucheng.length - 1) == n && currTS.gendanyuan == theUser._id){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_kaipiao",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("开票" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","全部发票已经收齐，等待收齐全部单证（如核销单。实际情况可能不需要等核销单代理商就给我们算退税，此时就当已经收齐，直接进入下一流程。）！");
				if((tuishui.liucheng.length - 1) == n && currTS.gendanyuan == theUser._id){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_danzheng",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("单证" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","全部单证已经收齐，等待代理商给我们算退税（即把退税额算进代理商的人民币账户余额）！");
				if((tuishui.liucheng.length - 1) == n && currTS.gendanyuan == theUser._id){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_tuishui",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("退税" == item.dongzuo){
				$("#bianji").hide();
				("#lc_tr_panel",tmpl).attr("title","代理商已经给我们算了退税！");
				if((tuishui.liucheng.length - 1) == n && currTS.gendanyuan == theUser._id){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}
			that.append(tmpl);
		});
	}
	///////////////////////////////初始化/////////////////////////////////////////////
	function _chushihua_(){} 
	var limit = 20;
	var currTS = null;
	 
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	
	var caozuoTmpl = $("#lc_caozuo").detach();
	var liuchengItem = $("#liuchengItem").detach();
	var tr_tuishui = $(".tr_tuishui").detach();
	var tmpl_tr_fapiao = $(".tr_fapiao").detach();
	var tmpl_tr_hexiao = $(".tr_hexiao").detach();
	 
 	var liuyanElm = $("#liuyan").liuyan({hostType:"tuishui",});
 	
//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){
		layout.sizePane("west",$("#tuishuitable").width()+20);
	});
	$(".detailheader").click(function(){
		layout.sizePane("west",$("body").width()-$("#fp_table").width()-100);
	});
	
	listtuishui(0);
});