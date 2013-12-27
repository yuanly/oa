﻿$(function(){
	/*
	{	_id:"FHD131008.1",
		liucheng:[{userId:3,dongzuo:"录单",time:1322}],
		zhuangtai:"录单",
		gonghuoshang:{_id:"SJ131110",mingchen:"大大"},
		huowu:[
			{guige:"xxx",danwei:"码",danjia:23.1,beizhu:"xxx",mingxi:[{shuliang:23,jianshu:2},...],dingdan:[{_id:"xx",guige:"xx",}shuliang:22,danwei:"xx",danjia:22]}
			...
		],
		qitafei:[{shuoming:"xxx",jine:22}],
		neirong:"xxx",
		zhuanzhang:"xxx",
		ludanzhe:1,
		duidanzhe:2,
		fuhezhe:3,
		shouhuoriqi:1232,
		yanhuodizhi:"xxx"
	}
	规格         单位  单价   金额          订单号         规格           数量  单位 单价 金额
-----------  ----  ----- -------      ----------   ---------------   ------ ---- ---- ----
       数量：----- 件数：------       ----------   ---------------   ------ ---- ---- ----
       数量：----- 件数：------
备注：-------------------------------------------------------------------------------------

发货单：
上传原单 录单 对单 等待付款 已付款 已收货 复核

编号（基于日期，FHD131217.2）
供货商（名称 _id）
验货场所：（每个厂家增加验货场所）
货物（金额)（从订单关联而来，逐件登记，方便后面做柜单。规格*长度*件数 单价 金额）
运费，其他费用
总额
备注 
转账流水
留言
要考虑加工订单，原料直接发到加工厂。只要要付费就要生成发货单


验货单
柜单（给伍伦的柜单需要人工估算实际成本）

给订单加上成本栏（非必填）

验货改成无纸方式，先用手机或ipad下载发货单到本地html5存储（提供远程访问下载），验货结果以录音、拍照、录像等方式记录（用天天记事 evernote等工具，最后同步到网上）。
这是努力方向，但暂时先不借助外部服务，外部服务不是很可靠。打印一个表里面只有编号和验货结果/备注，货物详细信息留在手机里；验货结果拍照上传，再让某人确认。
	*/
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	function baocun(){
		if(("#fhd_zonge").val().trim() == ""){
			tip(("#fhd_zonge"),"无法计算总额，请确保所有栏目有效！",1500);
			return;
		}
		if($("#fhd_yanhuodizhi").val().trim() != ""){
			currFHD.yanhuodizhi = $("#fhd_yanhuodizhi").val().trim();
		}
		
		//TODO ...
	}
	$("#baocun").click(baocun);
	$("#fangqi").click(function(){showDetailById(currFHD._id);});
	$("#shanchuqita").click(function(){
		$(this).parents(".qitafeiyong").remove();
		jisuanzonge();
	});
	$("#qita_jine").change(function(){
		jisuanzonge();	
	});
	function zengjiaqitafeiyong(){
		$(this).before(tmpl_qitafeiyong.clone(true));
	}
	$("#zengjiaqitafeiyong").click(zengjiaqitafeiyong)
	function jisuanzonge(){
		var ze = 0;
		$(".huowu").each(function(i,huowu){
			ze += parseFloat($(huowu).find("#mx_jine").text());
			if(isNaN(ze)){
				return false;
			}
		});
		if(isNaN(ze)){
			return;
		}
		$(".qitafeiyong").each(function(i,feiyong){
			ze += parseFloat($(feiyong).find("#qita_jine").val());
			if(isNaN(ze)){
				return false;
			}
		});
		if(!isNaN(ze)){
			$("#fhd_zonge").val(round(ze,2));
		}else{
			$("#fhd_zonge").val("");
		}
	}
	function jisuanjine(){
		var tb = $(this).parents("#huowu");
		var danjia = parseFloat(tb.find("#mx_danjia").val());
		if(isNaN(danjia)){
			return;
		}
		var sum=0;
		tb.find(".shuliangjianshu").each(function(i,sljs){
			sum += parseFloat($(this).find(".shuliang").val()) * parseInt($(this).find(".jianshu").val());
			if(isNaN(sum)){
				return false;
			}
		});
		
		if(isNaN(sum)){
			tb.find("#mx_jine").text("");
			return;
		}
		sum = sum * danjia;
		tb.find("#mx_jine").text(round(sum,2));
		
		jisuanzonge();
	}
	$(".jinetrigger").change(jisuanjine);
	function zengjiajianshu(){
		$(this).before(tmpl_shuliangjianshu.clone(true));
	}
	$("#zengjiajianshu").click(zengjiajianshu);
	function shanchujianshu(){
		$(this).parent("div").remove();
	}
	$("#shanchujianshu").click(shanchujianshu);
	function shanchuhuowu(){
		$(this).parents(".huowu").remove();
		jisuanzonge();
	}
	$("#shanchuhuowu").click(shanchuhuowu);
	function tianjiahuowu(){
		$(this).before(table_huowu.clone(true));
	}
	$("#tianjiahuowu").click(tianjiahuowu);
	$(".list").dblclick(function(){$(this).val("");});
	function showDingdan(){
		window.open("../dingdan/dingdan.html?showId="+$(this).text(),"_blank");
	}
	$("#dingdanhao").click(showDingdan);
	function sel_huowu(){
		var huowu = $(this).data("huowu");
		var tr_huowu = dingdanhuowu.clone(true);
		tr_huowu.find("#dingdanhao").text($(this).data("dingdanId"));
		tr_huowu.find("#guige1").text(huowu.guige);
		tr_huowu.find("#shuliang1").text(huowu.shuliang);
		tr_huowu.find("#danwei1").text(huowu.danwei);
		tr_huowu.find("#danjia1").text(huowu.danjia);
		tr_huowu.find("#jine1").text(huowu.shuliang*huowu.danjia);
		currHuowu.find("#tr_tianjiadingdanhuowu").before(tr_huowu);
		if("" === currHuowu.find("#mx_guige").val().trim()){
			currHuowu.find("#mx_guige").val(huowu.guige);
			currHuowu.find("#mx_danwei").val(huowu.danwei);
			currHuowu.find("#mx_danjia").val(huowu.danjia).change();
		}
		$("#sel_ctnr").hide();
	}
	$(".tmpl_huowu").click(sel_huowu);
	function guanbi_sel_huowu(){
		$("#sel_huowu").hide();
	}
	$("#guanbi_sel_huowu").click(guanbi_sel_huowu);
	function zhankai(event){
		//postJson("../dingdan/dingdans.php",{_id:$(this).parents("tr").data("_id")},function(dd){
		postJson("../dingdan/dingdans.php",{_id:$(this).data("_id")},function(dd){
			var tb_huowu = $("#sel_huowu").find("table");
			tb_huowu.find(".tmpl_huowu").remove();
			for(var i=0;i<dd.huowu.length;i++){
				var huowu = tmpl_huowu.clone(true);
				huowu.data("huowu",dd.huowu[i]);huowu.data("dingdanId",dd._id);
				huowu.find("#mx_xuhao").text(i);
				huowu.find("#mx_guige").text(dd.huowu[i].guige);
				huowu.find("#mx_shuliang").text(dd.huowu[i].shuliang);
				huowu.find("#mx_danwei").text(dd.huowu[i].danwei);
				huowu.find("#mx_danjia").text(dd.huowu[i].danjia);
				huowu.find("#mx_jine").text(round(dd.huowu[i].shuliang*dd.huowu[i].danjia,2));
				huowu.css("background-color",toggle("#fff","#eee"));
				tb_huowu.append(huowu);
			}
		});
		$("#sel_huowu").show().css("top",event.clientY-40);
	}
	//$("#zhankai").click(zhankai);<td><span class="plainBtn" id="zhankai">[展开]</span>
	$(".tmpl_dingdan").click(zhankai)
	function sel_dingdan_pager(){
		list_sel_dingdan($("#sel_dingdan_pager").data("offset")+1);
	}
	$("#sel_dingdan_pager").click(sel_dingdan_pager);
	function guanbi_sel_dingdan(){
		$("#sel_ctnr").hide();
	}
	$("#guanbi_sel_dingdan").click(guanbi_sel_dingdan);
	function list_sel_dingdan(offset){
		if(offset<0){
			return;
		}
		$("#sel_dingdan_pager").data("offset",offset);
		postJson("../dingdan/dingdans.php",{offset:offset*20,limit:20,option:{cmd:"",gonghuoshang:currFHD.gonghuoshang._id}},function(dingdans){
			$("#sel_dingdan tr").remove();
			each(dingdans,function(n,dingdan){
				tr = tr_seldingdan.clone(true);
				tr.data("_id",dingdan._id);
				tr.find("#td_bianhao").text(dingdan._id);
				tr.find("#td_kehu").text(dingdan.kehu);
				if(dingdan.yangban){
					var yb = "("+dingdan.yangban.taiguoxinghao+")";
					if(dingdan.yangban.zhongguoxinghao){
						tr.find("#td_yangban").text(dingdan.yangban.zhongguoxinghao+yb);
					}else{
						tr.find("#td_yangban").text(yb);
					}
				}
				tr.find("#td_zhuangtai").text(dingdan.zhuangtai);				
				tr.find("#td_gendanyuan").text(dingdan.gendanyuan?getUser(dingdan.gendanyuan).user_name:"");
				tr.find("#td_gonghuoshang").text(dingdan.gonghuoshang?dingdan.gonghuoshang.mingchen:"");
				
				tr.css("background-color",toggle("#fff","#eee"));
				if(dingdan.zhuangtai == "作废"){
					tr.css("text-decoration","line-through");
				} 
				$("#sel_dingdan").append(tr);
			});
		});
	}
	function tianjiadingdanhuowu(){
		if(!currFHD.gonghuoshang){
			tip($(this),"必须先选定供货商！",1500);
			return;
		}
		currHuowu = $(this).parents(".huowu");
		$("#sel_ctnr").show().center().css("top","50px");
		if($("#sel_dingdan").find("tr").length == 0){
			list_sel_dingdan(0);
		}
	}
	$("#tianjiadingdanhuowu").click(tianjiadingdanhuowu);
	$("#bianji").click(edit);
	function cz_zuofei(){
		postJson("fahuodan.php",{caozuo:"zuofei",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_zuofei").click(cz_zuofei);
	function cz_quxiaoshenqingduidan(){
		postJson("fahuodan.php",{caozuo:"quxiaoshenqingduidan",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_quxiaoshenqingduidan").click(cz_quxiaoshenqingduidan);
	function cz_shenqingduidan(){
		postJson("fahuodan.php",{caozuo:"shenqingduidan",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_shenqingduidan").click(cz_shenqingduidan);
	function cz_ludan(){
		postJson("fahuodan.php",{caozuo:"ludan",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_ludan").click(cz_ludan);
	//翻页处理
	$("#prevPage").click(function(){
		listfahuodan($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listfahuodan($("#pager").data("offset")+1);
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
	function sel_fahuodan(){
		showDetailById($(this).data("_id"));
		$(".tr_selected").removeClass("tr_selected");
		$(this).addClass("tr_selected");
	}
	$(".tr_fahuodan").click(sel_fahuodan);
	function setYanhuodizhi(){
		postJson("../vendor/vendors.php",{_id:currFHD.gonghuoshang._id},function(vendor){
			if(vendor.yanhuodizhi){
				$("#fhd_yanhuodizhi").val(vendor.yanhuodizhi);
			}else{
				$("#fhd_yanhuodizhi").val("");
			}
		});
	}
	$("#fhd_gonghuoshang").change(setYanhuodizhi);
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	//解释查询条件
	function getOptions(){
		var ret = {};
		return ret;
	}
		//列出原稿
	function listfahuodan(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var cmd = getUrl().cmd?getUrl().cmd:"";
		var option = $.extend({cmd:cmd},getOptions());
		postJson("fahuodan.php",{caozuo:"chaxun",offset:offset*limit,limit:limit,option:option},function(fahuodans){
			$("#fahuodantable .tr_fahuodan").remove();
			each(fahuodans,function(n,fahuodan){
				tr = tr_fahuodan.clone(true);
				tr.data("_id",fahuodan._id);
				tr.find("#td_bianhao").text(fahuodan._id);
				tr.find("#td_gonghuoshang").text(fahuodan.gonghuoshang?fahuodan.gonghuoshang.mingchen:"");
				tr.find("#td_ludanzhe").text(fahuodan.ludanzhe?getUser(fahuodan.ludanzhe).user_name:"");
				tr.find("#td_duidanzhe").text(fahuodan.duidanzhe?getUser(fahuodan.duidanzhe).user_name:"");
				tr.find("#td_zhuangtai").text(fahuodan.zhuangtai);
				tr.find("#td_xiadanriqi").text(fahuodan.xiadanshijian?new Date(fahuodan.xiadanriqi*1000).format("yy/MM/dd hh:mm"):"");
				tr.find("#td_fuhezhe").text(fahuodan.fuhezhe?getUser(fahuodan.fuhezhe).user_name:"");
				
				tr.css("background-color",toggle("#fff","#eee"));
				if(fahuodan.zhuangtai == "作废"){
					tr.css("text-decoration","line-through");
				}
				$("#fahuodantable").append(tr);
			});
			if(showId){
				showDetailById(showId);
			}else if(fahuodans.length>0){
				$(".tr_fahuodan").get(0).click();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
		});
	}

	function zonge(){
		jisuanzonge();
	}
	function readOnly(){
		editing = false;
		$("#fhd_gonghuoshang").css("cursor","default").unbind("click").val(currFHD.gonghuoshang?currFHD.gonghuoshang.mingchen:"");
		yuandanEditor.editorReadonly();
		$("#fhd_yanhuodizhi").attr("readonly","readonly");
		$(".plainInput").attr("readonly","readonly");
		zonge();
		if(!currFHD.qitafei){
			$("#qita_div").hide();
		}else{
			$("#qita_div").show();
		}
		$(".plainBtn").hide();		
		$("#bianji").show();$("#fangqi").hide();$("#baocun").hide();
	}
	
	function edit(){
		editing = true;
		$("#fhd_yanhuodizhi").removeAttr("readonly");
		$(".plainInput").removeAttr("readonly");
		$(".plainBtn").show();
 		$("#fhd_gonghuoshang").css("cursor","pointer").xuanzeshangjia("",function(vendor){
 			currFHD.gonghuoshang = {_id:vendor._id,mingchen:vendor.mingchen};
 		});
 		$("#qita_div").show();
 		yuandanEditor.editorWritable();
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
	}
	function showDetail(fhd){
		currFHD = fhd;
		$("#liucheng").show().liucheng(getTheUser(),fhd);
		$("#fhd_bianhao").val(currFHD._id);
		$("#fhd_zhuanzhangliushui").val(currFHD.zhuanzhang?currFHD.zhuanzhang:"");
		$("#fhd_gonghuoshang").val(currFHD.gonghuoshang?currFHD.gonghuoshang.mingchen:"");
		$("#fhd_yanhuodizhi").val(currFHD.yanhuodizhi?currFHD.yanhuodizhi:"");
		yuandanEditor.editorVal(currFHD.neirong);
		readOnly();
	}
	
	function showDetailById(_id){
		postJson("fahuodan.php",{caozuo:"getbyid",_id:_id},function(dd){
			showDetail(dd);			
		});
	}

	jQuery.fn.liucheng = function(theUser,fahuodan){
		var that = this.empty();
		this.data("_id",fahuodan._id);
		each(fahuodan.liucheng,function(n,item){
			var tmpl = liuchengItem.clone(true);
			$("#lc_bianhao",tmpl).text(n+1);
			var usr = getUser(item.userId);
			$("#lc_touxiang",tmpl).attr("src",usr.photo);
			$("#lc_mingchen",tmpl).text(usr.user_name);
			$("#lc_dongzuo",tmpl).text(item.dongzuo);
			$("#lc_shijian",tmpl).text(new Date(item.time*1000).format("yyyy-MM-dd hh:mm"));
			if("上传" == item.dongzuo){
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				$("#cz_zuofei",caozuoItem).show();
				if((fahuodan.liucheng.length - 1) == n){
					$("#cz_ludan",caozuoItem).show();
				}
				$("table",tmpl).append(caozuoItem);
			}else if("录单" == item.dongzuo){
				if((fahuodan.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#bianji").show();
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_shenqingduidan",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("申请对单" == item.dongzuo){
				if((fahuodan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == item.userId){
						$("#cz_quxiaoshenqingduidan",caozuoItem).show();
					}else{
						$("#cz_duidan",caozuoItem).show();
					}
					$("table",tmpl).append(caozuoItem);
				}
			}
			that.append(tmpl);
		});
	}
	
	///////////////////////////////初始化/////////////////////////////////////////////
	function _chushihua_(){} 
	var limit=20;
	var currFHD = null;
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
	var tr_fahuodan = $(".tr_fahuodan").detach();
	var tr_seldingdan = $("#sel_dingdan tr").detach();
	var tmpl_huowu = $(".tmpl_huowu").detach();
	var dingdanhuowu = $(".dingdanhuowu").detach();
	var currHuowu = null;
	var table_huowu = $(".huowu").clone(true);
	var tmpl_shuliangjianshu = $("#shuliangjianshu").clone(true);
	var tmpl_qitafeiyong = $(".qitafeiyong").detach();
	
	var yuandanEditor = $("#yuandan").myeditor(700,300);
	yuandanEditor.editorReadonly();
	
	$("#th_bianhao").datepicker().change(function(){$(this).val("FHD"+date2id($(this).val()))});
	var liuyanElm = $("#liuyan").liuyan({hostType:"yangban",});
	listfahuodan(0,getUrl().showId);
	
});