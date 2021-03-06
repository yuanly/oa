﻿$(function(){
	$(".tip").click(function(){
		tip($(this),$(this).attr("title"));
	});
	$("th").attr("nowrap","nowrap").css("cursor","pointer");
	$("td").attr("nowrap","nowrap");
	$("th").dblclick(function(){//双击列头删除该列
		var clz = $(this).attr("id");
		$("."+clz).remove();
		$(this).remove();
	});
	$("#dayin").click(function(){
		$("#zhanghuyue_ctr").hide();
		$("#div_options").hide();
		$("#title_div").show();
		$("#tb_liushui").attr("border","1").css("border-spacing","0px").css("border-collapse","collapse");
		$("#dayinfanhui").show();
	});
	$("#dayinfanhui").click(function(){
		if($("#zhanghuyue").text() != ""){
			$("#zhanghuyue_ctr").show();
		}
		$("#div_options").show();
		$("#title_div").hide();
		$("#tb_liushui").attr("border","0").css("border-spacing","0px").css("border-collapse","collapse");
		$(this).hide();
	});
	function sel_zhanghao(){
		var lxrId = $("#lianxiren").data("lxrId");
		if(lxrId){
			var limit = 20;
			setSelector(event,function(page,option,callback){
					postJson("../tuishui/tuishui.php",{caozuo:"chazhanghao",offset:page*limit,limit:limit,lxrId:lxrId},function(zhanghaos){
						callback(zhanghaos);
					});
				},["yinhang","huming","zhanghao","wangdian"],function(zhanghu){//selected
					$(this).text(zhanghu.yinhang+" "+zhanghu.zhanghao+"("+zhanghu.huming+")").data("zhanghao",zhanghu.zhanghao);
					postJson("liushuizhang.php",{caozuo:"chayue",lxrId:lxrId,zhanghao:zhanghu.zhanghao},function(res){
						$("#zhanghuyue_ctr").show();
						$("#zhanghuyue").text(res);
					});
				},"",function(){//clear
					$(this).html("&nbsp;").removeData("zhanghao");
					$("#zhanghuyue_ctr").hide();$("#zhanghuyue").text("");
				});
		}else{
			tip($(this),"请先选定联系人！",1500);
		}
	}
	$("#zhanghu").click(sel_zhanghao);
	$("#lianxiren").click(function(event){
 		var limit = 20;
 		setSelector(event,function(page,option,callback1){
 				postJson("../contact/lianxiren.php",{caozuo:"chalianxiren",offset:page*limit,limit:limit,option:option},function(vendors){
 					callback1(vendors);
 				});
 			},["_id","mingchen"],function(lianxiren){//选择
 				$(this).data("lxrId",lianxiren._id);
				$(this).text(lianxiren.mingchen);
				$("#zhanghu").html("&nbsp;").removeData("zhanghao");$("#zhanghuyue_ctr").hide();$("#zhanghuyue").text("");
 			},"",function(){//清空
				$(this).removeData("lxrId");
				$(this).html("&nbsp;");
				$("#zhanghu").html("&nbsp;").removeData("zhanghao");$("#zhanghuyue_ctr").hide();$("#zhanghuyue").text("");
			});
 	});
	$("#kaishiriqi").datepicker();
	$("#jieshuriqi").datepicker();
	$("#kemu").kemu();
	
	var tmpl_tr_header = $("#tr_header").clone(true);
	var tmpl_tr_liushui = $("#tr_liushui").detach();
	$("#tongji").click(function(){
		var option = {};
		option.lxrId = $("#lianxiren").data("lxrId");
		if(!option.lxrId){
			tip($(this),"必须指定商家！",1500);
			return;
		}
		if($("#zhanghu").data("zhanghao")){
			option.zhanghao = $("#zhanghu").data("zhanghao");
		}
		option.kaishiriqi = $("#kaishiriqi").val().trim();
		if("" == option.kaishiriqi){			
			tip($(this),"必须指定开始日期！",1500);
			return;
		}
		option.jieshuriqi = $("#jieshuriqi").val().trim();
		if("" == option.jieshuriqi){			
			tip($(this),"必须指定结束日期！",1500);
			return;
		}
		if(Date.parse(option.jieshuriqi) - Date.parse(option.kaishiriqi) > 365*24*3600000){
			tip($(this),"时间跨度不能超过一年！",1500);
			return;
		}
		if("" != $("#kemu").val().trim()){
			option.kemu = $("#kemu").val().trim();
		}
		option.zhuangtai = $("#zhuangtai").val();
		postJson("liushuizhang.php",{caozuo:"tongji",option:option},function(liushuis){
			$("#tr_header").remove()
			$("#tb_liushui").append(tmpl_tr_header.clone(true));
			$(".tr_liushui").remove();
			var number = 1;
			var zongzhichu = 0;
			var zongshouru = 0;
			var chushiyue = parseFloat($("#chushiyue").text().trim());
			if(isNaN(chushiyue)){
				chushiyue = 0;
				$("#chushiyue").text("0");
			}
			each(liushuis,function(i,liushui){
				var tr_liushui = tmpl_tr_liushui.clone(true);
				tr_liushui.find("#td_no").text(number++);
				tr_liushui.find("#td_bianhao").text(liushui._id);
				tr_liushui.find("#td_fukuanfang").text(liushui.fukuanfangname);
				tr_liushui.find("#td_fukuanzhanghu").text(liushui.fukuanzhanghu);
				tr_liushui.find("#td_shoukuanfang").text(liushui.shoukuanfangname);
				tr_liushui.find("#td_shoukuanzhanghu").text(liushui.shoukuanzhanghu);
				tr_liushui.find("#td_jine").text(roundFix(liushui.jine));
				tr_liushui.find("#td_shoukuanjine").text(roundFix(liushui.zhuanrujine?liushui.zhuanrujine:liushui.jine,2));
				tr_liushui.find("#td_shijihuilv").text(liushui.huilv?roundFix(liushui.huilv,2):"");
				tr_liushui.find("#td_shouxufei").text(liushui.shouxufei?roundFix(liushui.shouxufei,2):"");
				tr_liushui.find(".td_beizhu").text(liushui.zhaiyao?liushui.zhaiyao:"");
				if(!option.zhanghao){
					if(option.lxrId == liushui.fukuanfang){
						zongzhichu += liushui.jine+(liushui.shouxufei?liushui.shouxufei:0);
						if(option.lxrId == liushui.shoukuanfang){
							tr_liushui.find("#td_jine").css("color","black");
						}else{
							tr_liushui.find("#td_jine").css("color","red");
						}
					}
					if(option.lxrId == liushui.shoukuanfang){
						if(liushui.zhuanrujine){
							zongshouru += liushui.zhuanrujine;
						}else{
							zongshouru += liushui.jine;
						}
					}
				}else{//option.zhanghao
					if(option.lxrId == liushui.fukuanfang && liushui.fukuanzhanghao == option.zhanghao){
						zongzhichu += liushui.jine+(liushui.shouxufei?liushui.shouxufei:0);
						tr_liushui.find("#td_jine").css("color","red");
					}else {
						if(liushui.zhuanrujine){
							zongshouru += liushui.zhuanrujine;
						}else{
							zongshouru += liushui.jine;
						}
					}
				}
				tr_liushui.find("#td_yue").text(roundFix(zongshouru - zongzhichu + chushiyue,2));
				tr_liushui.find("#td_fukuanriqi").text(liushui.fukuanriqi);
				tr_liushui.find("#td_kemu").text(liushui.kemu); 
				
				tr_liushui.css("background-color",toggle("#fff","#eee"));
				$("#tb_liushui").append(tr_liushui);
			});
			$("#zongzhichu").text(roundFix(zongzhichu,2));
			$("#zongshouru").text(roundFix(zongshouru,2));
			$("#jingzhichu").text(roundFix(zongzhichu - zongshouru,2));
			if(zongzhichu - zongshouru>=0){
				$("#jingzhichu").css("color","red");
			}else{
				$("#jingzhichu").css("color","green");
			}
			 removeHuilv();
		});
	});
	function removeHuilv(){
		var remove=true;
		$(".td_shijihuilv").each(function(i,td){
			if($(td).text().trim() != ""){
				remove = false;
				return false;
			}
		});
		if(remove){
			$(".td_shijihuilv").remove();
			$("#td_shijihuilv").remove();
			$(".td_shoukuanjine").remove();
			$("#td_shoukuanjine").remove();
		}
	}
});