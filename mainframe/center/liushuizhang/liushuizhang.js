$(function(){
	/* 
	流程：制单 申请付款 付款 审结
{
 _id:"xxx",
 zhuangtai:"xx",//记账(删除) 付款（作废） 申请复核（回退） 作废（回退） 复核（回退） 
 jine:1211,//金额
 yifu:true,//通过该属性标识是否已付款，而不是根据日期判定
 fukuanriqi:"xx",//付款日期
 jizhangren:12,//记账人
 fukuanfang:"1",//付款方
 fukuanfangname:"1",//付款方名称，增加这个是为了方便在列表中显示。
 shoukuanfang:"1",//收款方
 shoukuanfangname:"xx",//收款方名称
 fukuanzhanghu:"xxx",//付款账户，这只是用于显示
 fukuanzhanghao:"xxx",//付款账号，fukuangfang+fukuangfangzhanghao 这是账户的唯一id
 shoukuanzhanghu:"xxx",//收款账户
 shoukuanzhanghao:"xxx",//收款帐号
 yinhangliushui:"xxx",//非必填属性，指对应的银行账户里面的流水号。如果是我司到我司流水，可以两个都填进去。
 kemu:"xx",//科目
 beizhu:"xxx",//备注
 zhaiyao:"xxx",//摘要 一行之内的，可以在报表里显示的。
 
 shouxufei:3,//手续费
 huilv:2.1,//汇率
 zhuanrujine:23.1,//转入金额
 fukuanzhanghaoyue:2323.1,//付款帐号余额
 shoukuanzhanghaoyue:2321.3,//收款帐号余额
 lastupdatetime:123213213,//最近更新时间
 
 shenqings:[],//付款申请，从fahuodan表关联，不保存
 shenqingsyibian:true//客户端用于通知是否改了申请，不保存
}
流水号
状态
金额
付款日期
记账人
付款方 
收款方
付款帐号 可以没帐号 如现金支付 利息
收款帐号 可以没帐号 如现金支付 银行手续费
科目：泰国进账 货款 开票 薪金 办公费（水电交通通信购买办公用品物业管理维修） 社保费 租金 运费 活动费 银行手续费 利息 贷款 还贷 代付 其它 个人消费 
备注

付款申请 待审核申请 已审核申请 付款待审核 查询流水 流水统计
	*/
	$('#currLocation', window.parent.document).text("流水账管理");
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	$("#lsz_liushuihao").click(function(){
		if($(this).val() != ""){
			window.open("liushuizhang.html?showId="+$(this).val(),"_blank");
		}
	});
	$(".tip").click(function(){
		tip($(this),$(this).attr("title"));
	});
	$("#xinzengliushui").click(function(){
		postJson("liushuizhang.php",{caozuo:"xinjian"},function(res){
			listliushuizhang(0);
		});	
	});
	$(".sq_shanchu").click(function(){
		$(this).parent().remove();
		refreshShengqingCount();
	});
	$(".tr_shenqing #sq_bianhao").click(function(){
		var bh = $(this).text();
		if(bh.indexOf("SQ")==0){
			window.open("shenqing.html?showId="+bh,"_blank");
		}else{
			window.open("../fahuodan/fahuodan.html?showId="+bh,"_blank");
		}
	});	
	function refreshShengqingCount(){
		var sum = 0;
		$(".tr_shenqing").each(function(i){
			$(this).find("#sq_index").text(i+1);
			sum += parseFloat(tr.find("#sq_jine").text());
		});
		$("#selNum").text($(".tr_shenqing").length);
		$("#selSum").text(sum);
	}
	function tianjiashenqingTR(sq){
		var tr = tr_shenqing.clone(true); 
		tr.find("#sq_bianhao").text(sq._id);
		tr.find("#sq_shoukuanren").text(sq.gonghuoshang.mingchen);
		tr.find("#sq_jine").text(sq.zongjine);
		tr.find("#sq_kemu").text(sq.kemu);
		tr.find("#sq_shenqingzhe").text(getUserName(sq.ludanzhe));
		tr.find("#sq_duidanzhe").text(getUserName(sq.duidanzhe));
		tr.find("#sq_shoukuanzhanghu").text(sq.shoukuanzhanghu);
		tr.css("background-color",toggle("#fff","#eee"));
		$("#tb_shenqing").append(tr);
		refreshShengqingCount();
	}
	function isDupShenqing(id){
		var ret = false;
		$(".tr_shenqing").each(function(i){
			if($(this).find("#sq_bianhao").text() == id){
				ret = true;
				return false;
			}
		});
		return ret;
	}
	function tianjiashenqing(){
		var limit = 20;
		setSelector(event,function(page,option,callback){
			postJson("liushuizhang.php",{caozuo:"chashenqing",offset:page*limit,limit:limit,option:option},function(shenqings){
				callback(shenqings);
			});
		},["_id","ludanzhe","duidanzhe","zongjine","kemu","gonghuoshang.mingchen"],function(sq){//选择
			if(!isDupShenqing(sq._id)){
				tianjiashenqingTR(sq);
			}else{
				tip(null,"请不要重复选择付款申请！",1500);
			}
		},"");		
	}
	$("#tianjiashenqing").click(tianjiashenqing);
	$("#jisuanhuilv").click(function(){
		var jine = parseFloat($("#lsz_jine").val().trim());
		var huilv = parseFloat($("#lsz_huilv").val().trim());
		var zhuanrujine = parseFloat($("#lsz_zhuanrujine").val().trim());
		var i = 0;
		if(isNaN(jine)){i++};
		if(isNaN(huilv)){i++};
		if(isNaN(zhuanrujine)){i++};
		if(i>1){
			tip($(this),"金额、汇率、转入金额 三者必须输入两者才能就算",1500);
			return;
		}
		if(isNaN(zhuanrujine)){
			$("#lsz_zhuanrujine").vals(round(jine * huilv,2));
		}else if(isNaN(huilv)){
			$("#lsz_huilv").vals(round(zhuanrujine/jine,2));
		}else if(isNaN(jine)){
			$("#lsz_jine").vals(round(zhuanrujine/huilv,2));
		}
		
	});
	$("#hexiao").click(function(){
		$("#hexiaoliushui").toggle();
	});
	$("#th_leibie").kemu(["科目"]).bind("input",function(){listliushuizhang(0);})
	$("#lsz_kemu").kemu();
	$("#th_shoukuanfang").click(function(event){
 		var limit = 20;
 		setSelector(event,function(page,option,callback1){
 				postJson("../contact/lianxiren.php",{caozuo:"chalianxiren",offset:page*limit,limit:limit,option:option},function(vendors){
 					callback1(vendors);
 				});
 			},["_id","mingchen"],function(lianxiren){
 				$(this).data("lxrId",lianxiren._id);
				$(this).val(lianxiren.mingchen);
				listliushuizhang(0);
 			},"",function(){
 				$(this).val("收款方");
 				listliushuizhang(0);
			});
 	});
	$("#th_fukuanfang").click(function(event){
 		var limit = 20;
 		setSelector(event,function(page,option,callback1){
 				postJson("../contact/lianxiren.php",{caozuo:"chalianxiren",offset:page*limit,limit:limit,option:option},function(vendors){
 					callback1(vendors);
 				});
 			},["_id","mingchen"],function(lianxiren){
 				$(this).data("lxrId",lianxiren._id);
				$(this).val(lianxiren.mingchen);
				listliushuizhang(0);
 			},"",function(){
 				$(this).val("付款方");
 				listliushuizhang(0);
			});
 	});
	var users = getUsers();users.unshift({"user_name":"记账人","_id":"-1"});
	$("#th_jizhangren").myselector(users,"user_name").bind("input",function(){
		listliushuizhang(0);
	});
	$("#th_zhuangtai").bind("input",function(){
		listliushuizhang(0);
	});
	$("#th_bianhao").datepicker().change(function(){
		$(this).val("LSZ"+date2id($(this).val()));
		listliushuizhang(0);
	});
	/*$("#th_zhifuriqi").datepicker().change(function(){
		listliushuizhang(0);
	});*/
	function sel_lianxiren(event){
		var thatInput = $(this);
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("lianxiren.php",{offset:page*limit,limit:limit,option:option},function(lianxirens){
					callback(lianxirens);
				});
			},["_id","mingchen","shangjia.mingchen"],function(lianxiren){//选中回调
				if(lianxiren._id != thatInput.data("_id")){
					thatInput.siblings(".plainInput").val("");
				}
				thatInput.data("_id",lianxiren._id);
				if(lianxiren.leixing == "geren" && lianxiren.shangjia){
					thatInput.val(lianxiren.mingchen+"("+lianxiren.shangjia.mingchen+")");
				}else{
					thatInput.val(lianxiren.mingchen);
				}
			},"",function(){//清空回调
					thatInput.removeData("_id");
					thatInput.val("");
					thatInput.siblings(".plainInput").val("");
			});
	}
	function sel_zhanghu(event){
		var thatInput = $(this);
		var contactId = thatInput.siblings(".plainInput").data("_id");
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("zhanghu.php",{offset:page*limit,limit:limit,option:contactId},function(zhanghus){
					callback(zhanghus);
				});
			},["yinhang","huming","zhanghao"],function(zhanghu){
					thatInput.val(zhanghu.yinhang+" "+zhanghu.zhanghao+"("+zhanghu.huming+")");
					thatInput.data("zhanghao",zhanghu.zhanghao);
			});
	}
	function isEqualShengqings(sqs1,sqs2){
		if(sqs1.length != sqs2.length){
			return false;
		}
		var ret = true;
		each(sqs1,function(i,sq){
			if(sqs2.indexOf(sq)<0){
				ret = false;
				return false;
			}
		});
		return ret;
	}
	function baocun(){
		currLSZ.fukuanriqi = $("#lsz_fukuanriqi").val().trim();
		currLSZ.kemu = $("#lsz_kemu").val().trim();
		currLSZ.zhaiyao = $("#lsz_zhaiyao").val().trim();
		currLSZ.yinhangliushui = $("#lsz_yinhangliushui").text().trim();
		currLSZ.jine = parseFloat3($("#lsz_jine").val().trim());
		currLSZ.shouxufei = parseFloat3($("#lsz_shouxufei").val().trim());
		if($("#hexiaoliushui").css("display") == "none"){
			currLSZ.huilv = undefined;
			currLSZ.zhuanrujine = undefined;
		}else{
			currLSZ.huilv = parseFloat3($("#lsz_huilv").val().trim());
			currLSZ.zhuanrujine = parseFloat3($("#lsz_zhuanrujine").val().trim());
		}
		
		currLSZ.fukuanfang = $("#lsz_fukuanfang").data("_id");
		currLSZ.fukuanfangname = $("#lsz_fukuanfang").val().trim();
		currLSZ.fukuanzhanghu = $("#lsz_fukuanzhanghu").val().trim();
		currLSZ.fukuanzhanghao = $("#lsz_fukuanzhanghu").data("zhanghao");
		currLSZ.shoukuanfang =  $("#lsz_shoukuanfang").data("_id");
		currLSZ.shoukuanfangname =  $("#lsz_shoukuanfang").val().trim();
		currLSZ.shoukuanzhanghu = $("#lsz_shoukuanzhanghu").val().trim();
		currLSZ.shoukuanzhanghao = $("#lsz_shoukuanzhanghu").data("zhanghao");
		if(""!=currLSZ.fukuanriqi){//同一个账号不允许自己转给自己。
			if(currLSZ.fukuanfang == currLSZ.shoukuanfang && currLSZ.fukuanzhanghao == currLSZ.shoukuanzhanghao){
				tip(null,"同一账户不能给自己转账！",1500);
				return;
			}
		}
		var shenqings = [];
		$(".tr_shenqing").each(function(i){
			shenqings.push($(this).find("#sq_bianhao").text());
		});
		if(!isEqualShengqings(shenqings,currLSZ.shenqings)){
			currLSZ.shenqingsyibian = true;
			currLSZ.shenqings = shenqings;
		}else{
			currLSZ.shenqingsyibian = false;
		}
		currLSZ.beizhu = beizhuEditor.editorVal();
		postJson("liushuizhang.php",{caozuo:"baocun",liushuizhang:currLSZ},function(res){
			if(res.success !== false){
				tip($("#baocun"),"保存成功！",1500);
				showDetailById(currLSZ._id);
			}
		});
	}
	$("#baocun").click(baocun);
	$("#fangqi").click(function(){showDetailById(currLSZ._id);}); 
	$(".list").dblclick(function(){$(this).val("");});
	$("#bianji").click(edit);
	function cz_zuofei(){
		ask($(this),"一旦作废，关联的申请将被解除，即使回退也无法回复。确实要作废该流水吗？",function(){
			postJson("liushuizhang.php",{caozuo:"zuofei",_id:currLSZ._id},function(res){
				showDetailById(currLSZ._id);
			});
		});
	}
	$("#cz_zuofei").click(cz_zuofei);
	function cz_shanchu(){
		postJson("liushuizhang.php",{caozuo:"shanchu",_id:currLSZ._id},function(res){
			listliushuizhang(0);
		});
	}
	$("#cz_shanchu").click(cz_shanchu);
	function cz_huitui(){
		var that = $(this);
		postJson("liushuizhang.php",{caozuo:"huitui",_id:currLSZ._id,zhuangtai:currLSZ.zhuangtai},function(res){
			if(res.err){
				tip(that,res.err,1500);
			}else{
				showDetailById(currLSZ._id);
			}
		});
	}
	$("#cz_huitui").click(cz_huitui);
	function cz_fukuan(){
		if("none" == $("#bianji").css("display")){
			tip($(this),"请先退出编辑状态！",1500);
			return;
		}
		if(!currLSZ.jine){
			tip($(this),"还没设置有效金额！",1500);
			return;
		}
		if(!currLSZ.fukuanzhanghao){
			tip($(this),"还没设置付款帐号！",1500);
			return;
		}
		if(!currLSZ.shoukuanzhanghao){
			tip($(this),"还没设置收款帐号！",1500);
			return;
		}
		if(!currLSZ.fukuanriqi){
			tip($(this),"还没设置付款日期！",1500);
			return;
		}
		postJson("liushuizhang.php",{caozuo:"fukuan",_id:currLSZ._id},function(res){
			showDetailById(currLSZ._id);
		});
	}
	$("#cz_fukuan").click(cz_fukuan);
	function cz_shenqingfuhe(){
		postJson("liushuizhang.php",{caozuo:"shenqingfuhe",_id:currLSZ._id},function(res){
			if(res.err){
				tip($("#cz_shenqingfuhe"),res.err,1500);
			}else{
				showDetailById(currLSZ._id);
			}
		});
	}
	$("#cz_shenqingfuhe").click(cz_shenqingfuhe);
	function cz_fuhe(){
		postJson("liushuizhang.php",{caozuo:"fuhe",_id:currLSZ._id},function(res){
			if(res.err){
				tip($("#cz_fuhe"),res.err,1500);
			}else{
				showDetailById(currLSZ._id);
			}
		});
	}
	$("#cz_fuhe").click(cz_fuhe);
	//翻页处理
	$("#prevPage").click(function(){
		listliushuizhang($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listliushuizhang($("#pager").data("offset")+1);
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
	function sel_liushuizhang(){
		showDetailById($(this).data("_id"));
		$(".tr_selected").removeClass("tr_selected");
		$(this).addClass("tr_selected");
	}
	$(".tr_liushuizhang").click(sel_liushuizhang);
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	//记账 付款 申请复核 复核 作废
	function statusColor(status,color){
		if(status == "记账"){//红色
			return "#FF4500";
		}
		if(status == "付款"||status == "作废"){//粉红
			return "#FFB6C1";
		}
		if(status == "申请复核"){//黄色
			return "FFFF00";
		}
		if(status == "复核"){
			return color;
		}
	}
	//解释查询条件
	function getOptions(){
		var ret = {};
		var bh = $("#th_bianhao").val().trim();
		if("" != bh && "编号" != bh){
			ret.bianhao = bh+"0";
		}
		var zt = $("#th_zhuangtai").val().trim();
		if("" != zt && "状态" != zt){
			ret.zhuangtai = zt;
		}
		var fkf = $("#th_fukuanfang").val().trim();
		if("" != fkf && "付款方" != fkf){
			ret.fukuanfang = $("#th_fukuanfang").data("lxrId");
		}
		var skf = $("#th_shoukuanfang").val().trim();
		if("" != skf && "收款方" != skf){
			ret.shoukuanfang = $("#th_shoukuanfang").data("lxrId");
		}
/*		var zfrq = $("#th_zhifuriqi").val().trim();
		if("" != zfrq && "支付日期" != zfrq){
			ret.zhifuriqi = zfrq;
		}*/
		var km = $("#th_leibie").val().trim();
		if("" != km && "科目" != km){
			ret.kemu = km;
		}
		var jzr = $("#th_jizhangren").val().trim();
		if("" != jzr && "记账人" != jzr){
			ret.jizhangren = getUserIdByName(jzr);
		}
		return ret;
	}
		//列出原稿
	function listliushuizhang(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var option = $.extend({cmd:cmd},getOptions());
		postJson("liushuizhang.php",{caozuo:"chaxun",offset:offset*limit,limit:limit,option:option},function(liushuizhangs){
			$("#liushuizhangtable .tr_liushuizhang").remove();
			each(liushuizhangs,function(n,liushuizhang){
				tr = tr_liushuizhang.clone(true);
				tr.data("_id",liushuizhang._id);
				tr.find("#td_bianhao").text(liushuizhang._id);
				tr.find("#td_zhuangtai").text(liushuizhang.zhuangtai);
				tr.find("#td_jizhangren").text(getUser(liushuizhang.jizhangren).user_name);
				tr.find("#td_fukuanfang").text(liushuizhang.fukuanfangname?liushuizhang.fukuanfangname:"");
				tr.find("#td_shoukuanfang").text(liushuizhang.shoukuanfangname?liushuizhang.shoukuanfangname:"");
				tr.find("#td_jine").text(liushuizhang.jine);
				//tr.find("#td_zhifuriqi").text(liushuizhang.fukuanriqi);
				tr.find("#td_leibie").text(liushuizhang.kemu);
				if(liushuizhang.zhaiyao){
					tr.find("#td_zhaiyao").text(liushuizhang.zhaiyao).attr("title",liushuizhang.zhaiyao);
				}
				
				var color = toggle("#fff","#eee");
				tr.css("background-color",color);
				tr.find("#td_bianhao").css("background-color",statusColor(liushuizhang.zhuangtai,color));
				if(inLiucheng(liushuizhang.liucheng,"作废")){
					tr.css("text-decoration","line-through");
				}
				$("#liushuizhangtable").append(tr);
			});
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else{				
				//调整左侧宽度以便显示完整的列表
				$("#tableheader").click();
				if(liushuizhangs.length>0){
					$(".ui-layout-center").show();
					$(".tr_liushuizhang").get(0).click();
				}else{
					$(".ui-layout-center").hide();
				}
			}
			if(offset<=0){
				$("#prevPage").css("color","gray");
			}else{
				$("#prevPage").css("color","blue");
			}
			if(liushuizhangs.length<limit){
				$("#nextPage").css("color","gray");
			}else{
				$("#nextPage").css("color","blue");
			}
		});
	}
	function edit(){
		editing = true;
		$("#hexiao").show();
		$("#jisuanhuilv").show();
		$(".plainInput").removeAttr("readonly");
		$(".forselect").attr("readonly","readonly");
		$("#lsz_fukuanriqi").datepicker();
		$("#lsz_yinhangliushui").attr("contenteditable","true");
		$("#liushuizhangmingxi").find(".plainBtn").show();
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
		beizhuEditor.editorWritable();
		$("#lsz_fukuanfang").unbind("click").click(sel_lianxiren);
		$("#lsz_shoukuanfang").unbind("click").click(sel_lianxiren);
		$("#lsz_shoukuanzhanghu").click(sel_zhanghu);
		$("#lsz_fukuanzhanghu").click(sel_zhanghu);
		$(".sq_shanchu").show();
		$("#tianjiashenqing").show();
	}
	function readOnly(){
		editing = false;
		$("#hexiao").hide();		
		$("#lsz_yinhangliushui").removeAttr("contenteditable");
		$("#jisuanhuilv").hide();
		$("#lsz_fukuanriqi").datepicker("destroy");
		$(".plainInput").attr("readonly","readonly"); 
		$(".sq_shanchu").hide();
		$("#tianjiashenqing").hide();
		beizhuEditor.editorReadonly();
		if(kebianji){
			$("#bianji").show();
		}else{
			$("#bianji").hide();
		}
		$("#fangqi").hide();$("#baocun").hide();
		$("#lsz_fukuanfang").unbind("click").click(function(){
			if($(this).data("_id")){
				window.open("../contact/contact.html?showId="+$(this).data("_id"),"_blank");
			}
		});
		$("#lsz_shoukuanfang").unbind("click").click(function(){
			if($(this).data("_id")){
				window.open("../contact/contact.html?showId="+$(this).data("_id"),"_blank");
			}
		});
		$("#lsz_fukuanzhanghu").unbind("click");
		$("#lsz_shoukuanzhanghu").unbind("click");
	}
	function setContactName(input,lxrId){
		if(lxrId){
			postJson("../contact/contacts.php",{_id:lxrId},function(lxr){
				input.vals(lxr.mingchen);
			});
		}
	}	
	function showDetail(lsz){
		currLSZ = lsz;
		$("#liucheng").show().liucheng(getTheUser(),lsz);		
		
		$("#lsz_liushuihao").val(lsz._id);
		$("#lsz_jine").vals(lsz.jine);
		$("#lsz_shouxufei").vals(lsz.shouxufei);
		$("#lsz_fukuanriqi").vals(lsz.fukuanriqi);
		$("#lsz_kemu").vals(lsz.kemu);
		$("#lsz_zhaiyao").vals(lsz.zhaiyao);
		$("#lsz_yinhangliushui").text(lsz.yinhangliushui?lsz.yinhangliushui:"");
		setContactName($("#lsz_fukuanfang"),lsz.fukuanfang);
		$("#lsz_fukuanfang").data("_id",lsz.fukuanfang);
		$("#lsz_fukuanzhanghu").vals(lsz.fukuanzhanghu);
		$("#lsz_fukuanzhanghu").data("zhanghao",lsz.fukuanzhanghao);
		setContactName($("#lsz_shoukuanfang"),lsz.shoukuanfang);
		$("#lsz_shoukuanfang").data("_id",lsz.shoukuanfang);
		$("#lsz_shoukuanzhanghu").vals(lsz.shoukuanzhanghu);
		$("#lsz_shoukuanzhanghu").data("zhanghao",lsz.shoukuanzhanghao);
		if(lsz.zhuanrujine){
			$("#hexiaoliushui").show();
			$("#lsz_huilv").vals(lsz.huilv);
			$("#lsz_zhuanrujine").vals(lsz.zhuanrujine);
		}else{
			$("#hexiaoliushui").hide();
			$("#lsz_huilv").vals("");
			$("#lsz_zhuanrujine").vals("");
		}
		var sum = 0;
		$(".tr_shenqing").remove();
		each(lsz.shenqings,function(i,sq){
			var tr = tr_shenqing.clone(true);
			tr.find("#sq_index").text(i+1);
			tr.find("#sq_bianhao").text(sq._id);
			tr.find("#sq_shoukuanren").text(sq.gonghuoshang.mingchen);
			tr.find("#sq_jine").text(sq.zongjine);
			sum += sq.zongjine;
			tr.find("#sq_kemu").text(sq.kemu);
			tr.find("#sq_shenqingzhe").text(getUserName(sq.ludanzhe));
			tr.find("#sq_duidanzhe").text(getUserName(sq.duidanzhe));
			tr.find("#sq_shoukuanzhanghu").text(sq.shoukuanzhanghu?sq.shoukuanzhanghu:"");
			tr.css("background-color",toggle("#fff","#eee"));
			$("#tb_shenqing").append(tr);
		});
		$("#selNum").text(lsz.shenqings.length);
		$("#selSum").text(sum);
		
		beizhuEditor.editorVal(lsz.beizhu);
		liuyanElm.shuaxinliebiao({hostId:currLSZ._id,hostType:"liushuizhang"});
		readOnly();
	}
	
	function showDetailById(_id){
		postJson("liushuizhang.php",{caozuo:"getbyid",_id:_id},function(lsz){
			showDetail(lsz);			
		});
	}

	jQuery.fn.liucheng = function(theUser,liushuizhang){
		var that = this.empty();
		this.data("_id",liushuizhang._id);
		kebianji = false;
		each(liushuizhang.liucheng,function(n,item){
			var tmpl = liuchengItem.clone(true);
			$("#lc_bianhao",tmpl).text(n+1);
			var usr = getUser(item.userId);
			$("#lc_touxiang",tmpl).attr("src",usr.photo);
			$("#lc_mingchen",tmpl).text(usr.user_name);
			$("#lc_dongzuo",tmpl).text(item.dongzuo);
			$("#lc_shijian",tmpl).text(new Date(item.time*1000).format("yyyy-MM-dd hh:mm"));
			if("记账" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","正在记账，可修改账单内容，甚至删除账单！");
				if((liushuizhang.liucheng.length - 1) == n && theUser._id == item.userId){
					kebianji = true;
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_fukuan",caozuoItem).show();
					$("#cz_shanchu",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("付款" == item.dongzuo){
				kebianji = false;
				("#lc_tr_panel",tmpl).attr("title","已经付款！");
				if((liushuizhang.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_shenqingfuhe",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("作废" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已付款，等待复核。钱很可能已实际付出但之前的对单出错导致需要修改，也可能是错点了“付款”按钮。为了避免删除付款记录，所以一旦“付款”，就不能删除，只能作废处理。");
				if((liushuizhang.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_shenqingfuhe",caozuoItem).show();
					$("#cz_huitui",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			//记账(删除) 付款（作废） 申请复核（回退） 作废（回退） 复核（回退） 
			}else if("申请复核" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","钱已付出或已作废，申请复核！");
				if((liushuizhang.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id != item.userId){
						$("#cz_fuhe",caozuoItem).show();
					}
					if(theUser._id == currLSZ.jizhangren){
						$("#cz_huitui",caozuoItem).show();
					}
					$("table",tmpl).append(caozuoItem);
				}
			//记账(删除) 付款（作废） 申请复核（回退） 作废（回退） 复核（回退） 
			}else if("复核" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已通过复核！");
				if((liushuizhang.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true); 
					$("#cz_huitui",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}
			that.append(tmpl);
		});
	}
	
	///////////////////////////////初始化/////////////////////////////////////////////
	function _chushihua_(){} 
	var limit=20;
	var currLSZ = null;
	var kebianji=false;
	var editing = false;
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	var caozuoTmpl = $("#lc_caozuo").detach();
	var liuchengItem = $("#liuchengItem").detach();
	var tr_liushuizhang = $(".tr_liushuizhang").detach();
	var tr_shenqing = $(".tr_shenqing").detach();
	
	$("#sel_ctnr").draggable();
	var liuyanElm = $("#liuyan").liuyan({hostType:"liushuizhang",});
	
	var beizhuEditor = $("#beizhu").myeditor(765,300);
	beizhuEditor.editorReadonly();
	
	var cmd = getUrl().cmd?getUrl().cmd:"";
	if("chaxun" == cmd){		
		$("#xinzengliushui").show();
		$('#currLocation', window.parent.document).text("财账/流水");
	}else	if("daifukuanliushui"== cmd){
		$('#currLocation', window.parent.document).text("财账/待付款流水");
		$("#th_zhuangtai").val("记账").attr("readonly","readonly");
	}else if("daifuheliushui"== cmd){
		$('#currLocation', window.parent.document).text("财账/待复核流水");
		$("#th_zhuangtai").val("申请复核").attr("readonly","readonly");
		$("#ctr_sel").show();
	}
	listliushuizhang(0,getUrl().showId);
	
	 	//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){
		if(layout.state.west.innerWidth < $("#liushuizhangtable").width()){
			layout.sizePane("west",$("#liushuizhangtable").width()+20);
		}
	});
	$("#detailheader").click(function(){
		if(layout.state.center.innerWidth < $("#detailtable").width()){
			layout.sizePane("west",$("body").width()-$("#detailtable").width()-100);
		}
	}).dblclick(function(){layout.toggle("west");clearSelection();});
});