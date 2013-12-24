$(function(){
	/*
	{	_id:"FHD131008.1",
		liucheng:[{userId:3,dongzuo:"录单",time:1322}],
		zhuangtai:"录单",
		gonghuoshang:{_id:"SJ131110",mingchen:"大大"},
		huowu:[
			{guige:"xxx",danwei:"码",danjia:23.1,beizhu:"xxx",mingxi:[{shuliang:23,jianshu:2},...],dingdan:[{_id:"xx",guige:"xx",}shuliang:22,danwei:"xx",danjia:22]}
			...
		],
		yunfei:23.2,
		qitafei:[{beizhu:"xxx",jine:22}],
		neirong:"xxx",
		zhuanzhang:"xxx",
		ludanzhe:1,
		duidanzhe:2,
		fuhezhe:3,
		shouhuoriqi:1232
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
	*/
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	function sel_huowu(){
		var huowu = $(this).data("huowu");
		console.log(huowu);
		var tr_huowu = dingdanhuowu.clone(true);
		tr_huowu.find("#dingdanhao").text($(this).data("dingdanId"));
		tr_huowu.find("#guige1").text(huowu.guige);
		tr_huowu.find("#shuliang1").text(huowu.shuliang);
		tr_huowu.find("#danwei1").text(huowu.danwei);
		tr_huowu.find("#danjia1").text(huowu.danjia);
		tr_huowu.find("#jine1").text(huowu.danwei*huowu.danjia);
		$("#tb_dingdan").append(tr_huowu);
		$("#sel_ctnr").hide();
	}
	$(".tmpl_huowu").click(sel_huowu);
	function guanbi_sel_huowu(){
		$("#sel_huowu").hide();
	}
	$("#guanbi_sel_huowu").click(guanbi_sel_huowu);
	function zhankai(event){
		postJson("../dingdan/dingdans.php",{_id:$(this).parents("tr").data("_id")},function(dd){
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
	$("#zhankai").click(zhankai);
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

	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	function editable(){
		editing = true;
	}
	function readonly(){
		editing = false;
	}
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
		$("#fhd_zonge").val("0");
	}
	function readOnly(){
		$("#fhd_gonghuoshang").css("cursor","default").unbind("click").val(currFHD.gonghuoshang?currFHD.gonghuoshang.mingchen:"");
		zonge();
	}
	function edit(){
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
 		$("#fhd_gonghuoshang").css("cursor","pointer").xuanzeshangjia("",function(vendor){
 			currFHD.gonghuoshang = {_id:vendor._id,mingchen:vendor.mingchen};
 		});
	}
	function showDetail(fhd){
		currFHD = fhd;
		$("#liucheng").show().liucheng(getTheUser(),fhd);
		$("#fhd_bianhao").val(currFHD._id);
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
	
	$("#th_bianhao").datepicker().change(function(){$(this).val("FHD"+date2id($(this).val()))});
	var liuyanElm = $("#liuyan").liuyan({hostType:"yangban",});
	listfahuodan(0,getUrl().showId);
	
});