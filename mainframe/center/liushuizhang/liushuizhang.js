$(function(){
	/* 
{
 _id:"xxx",
 zhuangtai:"xx",
 jine:1211,
 fukuanriqi:"xx",
 jizhangren:12,
 fukuanfang:1,
 shoukuanfang:1,
 fukuanzhanghao:{},
 shoukuanzhanghao:{},
 leibie:"xx",
 beizhu:"xxx"
}
流水号
状体
金额
付款日期
记账人
付款方 
收款方
付款帐号 可以没帐号 如现金支付 利息
收款帐号 可以没帐号 如现金支付 银行手续费
类别：泰国进账 货款 开票 薪金 办公费（水电交通通信购买办公用品物业管理维修） 社保费 租金 运费 活动费 银行手续费 利息 贷款 还贷 代付 其它 个人消费 
备注
	*/
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
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
	function sel_huowu2(){
		$("#sel_ctnr").hide();
		var huowu = $(this).data("huowu");
		var duplicate = false;
		$(".tr_huowu").each(function(i,hw){ 
			if(huowu._id == $(hw).data("huowu")._id){
				duplicate = true;
				return false;
			}
		});
		if(duplicate){
			tip($("#tianjiahuowu"),"重复货物！",1500);
			return ;
		}
		var tr_huowu = tmpl_tr_huowu.clone(true);
		tr_huowu.data("huowu",huowu);
		tr_huowu.find("#td_huowubianhao").text(huowu._id);
		tr_huowu.find("#td_gonghuoshang").text(huowu.gonghuoshang.mingchen);
		tr_huowu.find("#td_guige").text(huowu.guige);
		tr_huowu.find("#td_danwei").text(huowu.danwei);
		tr_huowu.find("#td_shuliang").text(huowu.shuliang);
		tr_huowu.find("#td_jianshu").text(huowu.jianshu);
		tr_huowu.find("#td_zhu").text(huowu.zhu?huowu.zhu:"");
		each(huowu.yanhuodan,function(i,yanhuodan){
			tr.find("#td_yanhuodan").append("<span>"+yanhuodan+"</span>&nbsp;");
		});
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
		postJson("liushuizhang.php",{caozuo:"baocun",liushuizhang:currZGD},function(res){ 
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
		postJson("../yanhuodan/yanhuodan.php",{caozuo:"chaxunhuowu",offset:offset*20,limit:20,option:{cmd:"",fhdId:$("#opt_huowuId").val().trim()}},function(huowus){
			$(".tmpl_fahuodanhuowu").remove();
			each(huowus,function(i,huowu){
				tr = tmpl_fahuodanhuowu.clone(true);
				tr.find("#td_huowubianhao").text(huowu._id);
				tr.find("#td_gonghuoshang").text(huowu.gonghuoshang?huowu.gonghuoshang.mingchen:"");
				tr.find("#td_guige").text(huowu.guige);
				tr.find("#td_danwei").text(huowu.danwei);
				tr.find("#td_shuliang").text(huowu.shuliang);
				tr.find("#td_jianshu").text(huowu.jianshu);
				tr.find("#td_zhu").text(huowu.zhu);
				each(huowu.yanhuodan,function(i,yanhuodan){
					tr.find("#td_yanhuodan").append("<span>"+yanhuodan+"</span>&nbsp;");
				});
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
		postJson("liushuizhang.php",{caozuo:"zuofei",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_zuofei").click(cz_zuofei);
	function cz_jiaodan(){
		postJson("liushuizhang.php",{caozuo:"jiaodan",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_jiaodan").click(cz_jiaodan);
	function cz_shenqingshenhe(){
		postJson("liushuizhang.php",{caozuo:"shenqingshenhe",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_shenqingshenhe").click(cz_shenqingshenhe);
	function cz_quxiaoshenqingshenhe(){
		postJson("liushuizhang.php",{caozuo:"quxiaoshenqingshenhe",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		})
	}
	$("#cz_quxiaoshenqingshenhe").click(cz_quxiaoshenqingshenhe);
	function cz_quxiaoshenhe(){
		postJson("liushuizhang.php",{caozuo:"quxiaoshenhe",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_quxiaoshenhe").click(cz_quxiaoshenhe);
	function cz_huitui(){
		postJson("liushuizhang.php",{caozuo:"huitui",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_huitui").click(cz_huitui);
	function cz_shenhe(){
		postJson("liushuizhang.php",{caozuo:"shenhe",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_shenhe").click(cz_shenhe);
	function cz_shenqingshouli(){
		postJson("liushuizhang.php",{caozuo:"shenqingshouli",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
 $("#cz_shenqingshouli").click(cz_shenqingshouli);
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
				tr.find("#td_jizhangren").text(liushuizhang.jizhangren?getUser(liushuizhang.jizhangren).user_name:"");
				tr.find("#td_fukuanfang").text(liushuizhang.fukuanfang?getUser(liushuizhang.fukuanfang).user_name:"");
				tr.find("#td_shoukuanfang").text(liushuizhang.shoukuanfang?getUser(liushuizhang.shoukuanfang).user_name:"");
				tr.find("#td_jine").text(liushuizhang.jine);
				tr.find("#td_zhifuriqi").text(liushuizhang.zhifuriqi);
				tr.find("#td_leibie").text(liushuizhang.liebie);
				
				tr.css("background-color",toggle("#fff","#eee"));
				if(liushuizhang.zhuangtai == "作废"){
					tr.css("text-decoration","line-through");
				}
				$("#liushuizhangtable").append(tr);
			});
			if(showId){
				showDetailById(showId);
			}else if(liushuizhangs.length>0){
				$(".tr_liushuizhang").get(0).click();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
		});
	}
 
	function readOnly(){
		editing = false;
		$("#zgd_gonghuoshang").css("cursor","default").unbind("click").val(currZGD.gonghuoshang?currZGD.gonghuoshang.mingchen:"");
		$("#zgd_yanhuodizhi").attr("readonly","readonly");
		$(".plainInput").attr("readonly","readonly"); 
		if(!currZGD.qitafei){
			$("#qita_div").hide();
		}else{
			$("#qita_div").show();
		}
		$("#liushuizhangmingxi").find(".plainBtn").hide();
		if(kebianji){
			$("#bianji").show();
		}
		$("#fangqi").hide();$("#baocun").hide();
		$("#zgd_zhuangguiriqi").datepicker( "destroy" );
	}
	
	function edit(){
		editing = true;
		$("#zgd_yanhuodizhi").removeAttr("readonly");
		$(".plainInput").removeAttr("readonly");
		$("#liushuizhangmingxi").find(".plainBtn").show();
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
		$(".tr_huowu").remove();
		each(zgd.huowu,function(i,huowu){
			var tr_huowu = tmpl_tr_huowu.clone(true);
			tr_huowu.data("huowu",huowu);
			tr_huowu.find("#td_huowubianhao").text(huowu._id);
			tr_huowu.find("#td_gonghuoshang").text(huowu.gonghuoshang.mingchen);
			tr_huowu.find("#td_guige").text(huowu.guige);
			tr_huowu.find("#td_danwei").text(huowu.danwei);
			tr_huowu.find("#td_shuliang").text(huowu.shuliang);
			tr_huowu.find("#td_jianshu").text(huowu.jianshu);
			tr_huowu.find("#td_zhu").text(huowu.zhu?huowu.zhu:"");
			$("#huowutable").append(tr_huowu); 
		});

		liuyanElm.shuaxinliebiao({hostId:currZGD._id,hostType:"liushuizhang"});
		readOnly();
	}
	
	function showDetailById(_id){
		postJson("liushuizhang.php",{caozuo:"getbyid",_id:_id},function(zgd){
			showDetail(zgd);			
		});
	}

	jQuery.fn.liucheng = function(theUser,liushuizhang){
		var that = this.empty();
		this.data("_id",liushuizhang._id);
		each(liushuizhang.liucheng,function(n,item){
			var tmpl = liuchengItem.clone(true);
			$("#lc_bianhao",tmpl).text(n+1);
			var usr = getUser(item.userId);
			$("#lc_touxiang",tmpl).attr("src",usr.photo);
			$("#lc_mingchen",tmpl).text(usr.user_name);
			$("#lc_dongzuo",tmpl).text(item.dongzuo);
			$("#lc_shijian",tmpl).text(new Date(item.time*1000).format("yyyy-MM-dd hh:mm"));
			if("制单" == item.dongzuo){
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				$("#cz_dayin",caozuoItem).show();
				if((liushuizhang.liucheng.length - 1) == n){
					kebianji = true;
					$("#cz_jiaodan",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show();
				}
				$("table",tmpl).append(caozuoItem);
			}else if("交单" == item.dongzuo){
				kebianji = false;
				if((liushuizhang.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_huitui",caozuoItem).show();
					$("#cz_shenhe",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("受理" == item.dongzuo){
				if((liushuizhang.liucheng.length - 1) == n && theUser._id == item.userId){
					kebianji = true;
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true); 
					$("#cz_shenqingshenhe",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("申请审核" == item.dongzuo){ 
				if((liushuizhang.liucheng.length - 1) == n){
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
				if((liushuizhang.liucheng.length - 1) == n && theUser._id == item.userId){
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
	var tr_liushuizhang = $(".tr_liushuizhang").detach();
	var tmpl_tr_huowu = $(".tr_huowu").detach();
	var tmpl_huowu = $(".tmpl_huowu").detach();
	var dingdanhuowu = $(".dingdanhuowu").detach();
	var currHuowu = null;
	var table_huowu = $(".huowu").clone(true);
	var tmpl_shuliangjianshu = $("#shuliangjianshu").clone(true);
	var tmpl_qitafeiyong = $(".qitafeiyong").detach();
	var tmpl_fahuodanhuowu = $(".tmpl_fahuodanhuowu").detach();
	
	
	$("#sel_ctnr").draggable();
	$("#th_bianhao").datepicker().change(function(){$(this).val("zgd"+date2id($(this).val()))});
	$("#opt_huowuId").datepicker();
	var liuyanElm = $("#liuyan").liuyan({hostType:"liushuizhang",});
	listliushuizhang(0,getUrl().showId);
	
});