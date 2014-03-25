$(function(){
	/* 
	流程：制单 申请付款 付款 审结
{
 _id:"xxx",
 zhuangtai:"xx",//记账 付款 申请审核 审核
 jine:1211,
 fukuanriqi:"xx",
 jizhangren:12,
 fukuanfang:1,
 fukuanfangname:1,//增加这个是为了方便在列表中显示。
 shoukuanfang:1,
 shoukuanfangname:"xx",
 fukuanzhanghu:"xxx",//这只是用于显示
 fukuanfangzhanghao:"xxx",//fukuangfang+fukuangfangzhanghao 这是账户的唯一id
 shoukuanzhanghu:"xxx",
 shoukuanzhanghao:"xxx",
 kemu:"xx",
 beizhu:"xxx",
 fahuodan:"xxx"，//关联的发货单号，如果有。
 
 shouxufei:3,
 huilv:2.1,
 zhuanrujine:23.1,
 fukuanzhanghaoyue:2323.1,
 shoukuanzhanghaoyue:2321.3,
 lastupdatetime:123213213
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
	$("#th_zhifuriqi").datepicker().change(function(){
		listliushuizhang(0);
	});
	function sel_lianxiren(event){
		var thatInput = $(this);
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("lianxiren.php",{offset:page*limit,limit:limit,option:option},function(lianxirens){
					callback(lianxirens);
				});
			},["_id","mingchen","shangjia.mingchen"],function(lianxiren){
				if(lianxiren._id != thatInput.data("_id")){
					thatInput.siblings(".plainInput").val("");
				}
				thatInput.data("_id",lianxiren._id);
				if(lianxiren.leixing == "geren" && lianxiren.shangjia){
					thatInput.val(lianxiren.mingchen+"("+lianxiren.shangjia.mingchen+")");
				}else{
					thatInput.val(lianxiren.mingchen);
				}
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
	function baocun(){
		currLSZ.fukuanriqi = $("#lsz_fukuanriqi").val().trim();
		currLSZ.kemu = $("#lsz_kemu").val().trim();
		if($("#lsz_jine").val().trim() != ""){
			currLSZ.jine = parseFloat($("#lsz_jine").val().trim());
		}
		currLSZ.shouxufei = parseFloat2($("#lsz_shouxufei").val().trim());
		if(currLSZ.fukuanriqi != ""){
			if(isNaN(currLSZ.jine) || "" == currLSZ.kemu){
				tip(null,"已支付流水账的金额/科目不能为空！",1500);
				return;
			}
			if($("#lsz_fukuanfang").val().trim() == "" || $("#lsz_shoukuanfang").val().trim() == ""){
				tip(null,"已支付流水账的付款人/收款人不能为空！",1500);
				return;
			}
			if(!$("#lsz_shoukuanfangzhanghu").data("zhanghao") || !$("#lsz_fukuanfangzhanghu").data("zhanghao")){
				tip(null,"已支付流水账的账户不能为空！",1500);
				return;
			}
		}
		if($("#hexiaoliushui").css("display") == "none"){
				currLSZ.huilv = undefined;
				currLSZ.zhuanrujine = undefined;
		}else{
			if("" != $("#lsz_huilv").val().trim() || "" != $("#lsz_zhuanrujine").val().trim()){
				var huilv = parseFloat($("#lsz_huilv").val().trim());
				var zhuanrujine = parseFloat($("#lsz_zhuanrujine").val().trim());
				if(isNaN(huilv)){
					tip(null,"汇率不是有效数字！",1500);
					return;
				}
				if(isNaN(zhuanrujine)){
					tip(null,"转入金额不是有效数字！",1500);
					return;
				}
				currLSZ.huilv = huilv;
				currLSZ.zhuanrujine = zhuanrujine;
			}else{
				currLSZ.huilv = undefined;
				currLSZ.zhuanrujine = undefined;
			}
		}
		
		currLSZ.fukuanfang = $("#lsz_fukuanfang").data("_id");
		currLSZ.fukuanfangname = $("#lsz_fukuanfang").val().trim();
		currLSZ.fukuanfangzhanghu = $("#lsz_fukuanfangzhanghu").val().trim();
		currLSZ.fukuanfangzhanghao = $("#lsz_fukuanfangzhanghu").data("zhanghao");
		currLSZ.shoukuanfang =  $("#lsz_shoukuanfang").data("_id");
		currLSZ.shoukuanfangname =  $("#lsz_shoukuanfang").val().trim();
		currLSZ.shoukuanfangzhanghu = $("#lsz_shoukuanfangzhanghu").val().trim();
		currLSZ.shoukuanfangzhanghao = $("#lsz_shoukuanfangzhanghu").data("zhanghao");
		if(""!=currLSZ.fukuanriqi){//同一个账号不允许自己转给自己。
			if(currLSZ.fukuanfang == currLSZ.shoukuanfang && currLSZ.fukuanfangzhanghao == currLSZ.shoukuanfangzhanghao){
				tip(null,"账户不能给自己转账！",1500);
				return;
			}
		}
		currLSZ.beizhu = beizhuEditor.editorVal();
		//console.log(currLSZ);
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
		if(!confirm("确定要作废流水账吗？")){
			return;
		}
		postJson("liushuizhang.php",{caozuo:"zuofei",_id:currLSZ._id},function(res){
			showDetailById(currLSZ._id);
		});
	}
	$("#cz_zuofei").click(cz_zuofei);
	function cz_shenqingshenhe(){
		postJson("liushuizhang.php",{caozuo:"shenqingshenhe",_id:currLSZ._id},function(res){
			showDetailById(currLSZ._id);
		});
	}
	$("#cz_shenqingshenhe").click(cz_shenqingshenhe);
	function cz_quxiaoshenqingshenhe(){
		postJson("liushuizhang.php",{caozuo:"quxiaoshenqingshenhe",_id:currLSZ._id},function(res){
			showDetailById(currLSZ._id);
		})
	}
	$("#cz_quxiaoshenqing").click(cz_quxiaoshenqingshenhe);
	function cz_quxiaoshenhe(){
		postJson("liushuizhang.php",{caozuo:"quxiaoshenhe",_id:currLSZ._id},function(res){
			showDetailById(currLSZ._id);
		});
	}
	$("#cz_quxiaoshenhe").click(cz_quxiaoshenhe);
	function cz_shenhe(){
		postJson("liushuizhang.php",{caozuo:"shenhe",_id:currLSZ._id},function(res){
			showDetailById(currLSZ._id);
		});
	}
	$("#cz_shenhe").click(cz_shenhe);
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
		var zfrq = $("#th_zhifuriqi").val().trim();
		if("" != zfrq && "支付日期" != zfrq){
			ret.zhifuriqi = zfrq;
		}
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
		var cmd = getUrl().cmd?getUrl().cmd:"";
		var option = $.extend({cmd:cmd},getOptions());
		postJson("liushuizhang.php",{caozuo:"chaxun",offset:offset*limit,limit:limit,option:option},function(liushuizhangs){
			$("#liushuizhangtable .tr_liushuizhang").remove();
			each(liushuizhangs,function(n,liushuizhang){
				tr = tr_liushuizhang.clone(true);
				tr.data("_id",liushuizhang._id);
				tr.find("#td_bianhao").text(liushuizhang._id);
				tr.find("#td_zhuangtai").text(liushuizhang.zhuangtai);
				tr.find("#td_jizhangren").text(getUser(liushuizhang.jizhangren)?getUser(liushuizhang.jizhangren).user_name:"");
				tr.find("#td_fukuanfang").text(liushuizhang.fukuanfangname);
				tr.find("#td_shoukuanfang").text(liushuizhang.shoukuanfangname);
				tr.find("#td_jine").text(liushuizhang.jine);
				tr.find("#td_zhifuriqi").text(liushuizhang.fukuanriqi);
				tr.find("#td_leibie").text(liushuizhang.kemu);
				
				tr.css("background-color",toggle("#fff","#eee"));
				if(liushuizhang.zhuangtai == "作废"){
					tr.css("text-decoration","line-through");
				}
				$("#liushuizhangtable").append(tr);
			});
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else if(liushuizhangs.length>0){
				$(".ui-layout-center").show();
				$(".tr_liushuizhang").get(0).click();
			}else{
				$(".ui-layout-center").hide();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
		});
	}
	function edit(){
		editing = true;
		$("#hexiao").show();
		$("#jisuanhuilv").show();
		$(".plainInput").removeAttr("readonly");
		$("#lsz_fukuanriqi").datepicker();
		$("#liushuizhangmingxi").find(".plainBtn").show();
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
		beizhuEditor.editorWritable();
		if(!yizhifu){
			$("#lsz_fukuanfang").unbind("click").click(sel_lianxiren);
			$("#lsz_shoukuanfang").unbind("click").click(sel_lianxiren);
			$("#lsz_shoukuanfangzhanghu").click(sel_zhanghu);
			$("#lsz_fukuanfangzhanghu").click(sel_zhanghu);
		}else{
			$("#lsz_fukuanfang").attr("readonly","readonly");
			$("#lsz_shoukuanfang").attr("readonly","readonly");
			$("#lsz_shoukuanfangzhanghu").attr("readonly","readonly");
			$("#lsz_fukuanfangzhanghu").attr("readonly","readonly");
		}
	}
	function readOnly(){
		editing = false;
		$("#hexiao").hide();		
		$("#jisuanhuilv").hide();
		$("#lsz_fukuanriqi").datepicker("destroy");
		$(".plainInput").attr("readonly","readonly"); 
		beizhuEditor.editorReadonly();
		if(kebianji){
			$("#bianji").show();
		}
		$("#fangqi").hide();$("#baocun").hide();
		$("#lsz_fukuanfang").unbind("click").click(function(){window.open("../contact/contact.html?showId="+$(this).data("_id"),"_blank");});
		$("#lsz_shoukuanfang").unbind("click").click(function(){window.open("../contact/contact.html?showId="+$(this).data("_id"),"_blank");});
		$("#lsz_fukuanfangzhanghu").unbind("click");
		$("#lsz_shoukuanfangzhanghu").unbind("click");
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
		setContactName($("#lsz_fukuanfang"),lsz.fukuanfang);
		$("#lsz_fukuanfang").data("_id",lsz.fukuanfang);
		$("#lsz_fukuanfangzhanghu").vals(lsz.fukuanfangzhanghu);
		$("#lsz_fukuanfangzhanghu").data("zhanghao",lsz.fukuanfangzhanghao);
		setContactName($("#lsz_shoukuanfang"),lsz.shoukuanfang);
		$("#lsz_shoukuanfang").data("_id",lsz.shoukuanfang);
		$("#lsz_shoukuanfangzhanghu").vals(lsz.shoukuanfangzhanghu);
		$("#lsz_shoukuanfangzhanghu").data("zhanghao",lsz.shoukuanfangzhanghao);
		if(lsz.zhuanrujine){
			$("#hexiaoliushui").show();
			$("#lsz_huilv").vals(lsz.huilv);
			$("#lsz_zhuanrujine").vals(lsz.zhuanrujine);
		}else{
			$("#hexiaoliushui").hide();
			$("#lsz_huilv").vals("");
			$("#lsz_zhuanrujine").vals("");
		}
		beizhuEditor.editorVal(lsz.beizhu);
		liuyanElm.shuaxinliebiao({hostId:currLSZ._id,hostType:"liushuizhang"});
		readOnly();
		if(kebianji){
			$("#bianji").show();
		}else{
			$("#bianji").hide();
		}
		if(!lsz.fukuanriqi){
			yizhifu = false;
		}else{
			yizhifu = true;
		}
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
				("#lc_tr_panel",tmpl).attr("title","正在记账！");
				if((liushuizhang.liucheng.length - 1) == n && theUser._id == item.userId){
					kebianji = true;
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_shenqingshenhe",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show();
				}
				$("table",tmpl).append(caozuoItem);
			}else if("申请审核" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已完成记账，申请审核！");
				kebianji = false;
				if((liushuizhang.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == item.userId){
						$("#cz_quxiaoshenqing",caozuoItem).show();
					}else{
						$("#cz_shenhe",caozuoItem).show();
					}
					$("table",tmpl).append(caozuoItem);
				}
			}else if("审核" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已通过审核！");
				if((liushuizhang.liucheng.length - 1) == n && theUser._id == item.userId){
					kebianji = false;
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
	var currLSZ = null;
	var kebianji=false;
	var editing = false;
	var yizhifu = false;
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	var caozuoTmpl = $("#lc_caozuo").detach();
	var liuchengItem = $("#liuchengItem").detach();
	var tr_liushuizhang = $(".tr_liushuizhang").detach();
	var beizhuEditor = $("#beizhu").myeditor(765,100);
	beizhuEditor.editorReadonly();
	
	$("#sel_ctnr").draggable();
	var liuyanElm = $("#liuyan").liuyan({hostType:"liushuizhang",});
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