$(function(){
	/*
验货单
{
 _id:"xxx",
 zhuangtai:"xx",
 //yanhuodans:["xxx","xxx",...],//根据验货单id反查
 huowu:[{yhdId:"xx",guige:"xxx",danwei:"x",shuliang:22,jianshu:22,beizhu:"xxx"}...],
 liucheng:[制单 接单 结单 作废],
 
}
A 新建验货单 ， 分配id 选择货物 从有未分配货物且已对单且未复核未作废[对单 发货 付款]的收货单里挑选货物，可以调整次序，使得与验货员验货次序一致
新建
制单 申请受理 取消申请
B 接受验货单 进行验货，打印验货单
受理
C 登记验货结果 将问题货物拆分出来并备注
申请审核 取消申请
D 标记验货单通过 
审核
作废
	*/
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	function baocun(){
		jisuanzonge();
		if($("#yhd_zonge").val().trim() == ""){
			tip($("#yhd_zonge"),"无法计算总额，请确保所有栏目有效！",1500);
			return;
		}
		if($("#yhd_yanhuodizhi").val().trim() != ""){
			currYHD.yanhuodizhi = $("#yhd_yanhuodizhi").val().trim();
		}
		if($("#yhd_zhuanzhangliushui").val().trim() != ""){
			currYHD.zhuanzhang = $("#yhd_zhuanzhangliushui").val().trim();
		}
		var huowu = [];
		$(".huowu").each(function(i,hw){
		 	var item = {};
		 	item.guige = $(hw).find("#mx_guige").val().trim();
		 	if("" == item.guige){
		 		tip($(hw).find("#mx_guige"),"规格不能为空！",2000);
		 		huowu = [];
		 		return false;
		 	}
		 	item.danwei = $(hw).find("#mx_danwei").val().trim();
		 	item.danjia = $(hw).find("#mx_danjia").val().trim();
		 	var mingxis = [];
		 	$(hw).find(".shuliangjianshu").each(function(j,mingxi){
		 		var mx = {};
		 		mx.shuliang = $(mingxi).find(".shuliang").val().trim();
		 		if(mx.shuliang == ""){
		 			tip($(mingxi).find(".shuliang"),"数量不能为空！",2000);
		 			mingxi = [];
		 			return false;
		 		}
		 		mx.jianshu = $(mingxi).find(".jianshu").val().trim();
		 		if(mx.jianshu == ""){
		 			tip($(mingxi).find(".jianshu"),"件数不能为空！",2000);
		 			mingxi = [];
		 			return false;
		 		}
		 		mingxis.push(mx);
		 	});
		 	if(mingxis.length == 0){
		 		huowu = [];
		 		return false;
		 	}
		 	item.mingxi = mingxis;
		 	var dingdan = [];
		 	$(hw).find(".dingdanhuowu").each(function(i,ddhw){
		 		dingdan.push($(ddhw).data("huowu"));
		 	});
		 	if(dingdan.length>0){
		 		item.dingdan = dingdan;
		 	}
		 	item.beizhu = $(hw).find("#beizhu").val().trim();
		 	huowu.push(item);
		});
		if(huowu.length == 0){
			return;
		}
		currYHD.huowu = huowu;
		var qita = [];
		$(".qitafeiyong").each(function(i,feiyong){
			var qtfy = {};
			qtfy.shuoming = $(feiyong).find("#qita_shuoming").val().trim();
			if("" == qtfy.shuoming){
					tip($(feiyong).find("#qita_shuoming"),"费用说明不能为空！",2000);
		 			return false;
			}
			qtfy.jine = $(feiyong).find("#qita_jine").val().trim();
			qita.push(qtfy);
		});
		if(qita.length>0){
			currYHD.qitafei = qita;
		}
		currYHD.neirong = yuandanEditor.editorVal();
		postJson("yanhuodan.php",{caozuo:"baocun",yanhuodan:currYHD},function(res){
			showDetailById(currYHD._id);
		});		
	}
	$("#baocun").click(baocun);
	$("#fangqi").click(function(){showDetailById(currYHD._id);});
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
			$("#yhd_zonge").val(round(ze,2));
		}else{
			$("#yhd_zonge").val("");
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
		tr_huowu.data("huowu",huowu);
		tr_huowu.find("#dingdanhao").text($(this).data("dingdanId"));
		tr_huowu.find("#guige1").text(huowu.guige);
		tr_huowu.find("#shuliang1").text(huowu.shuliang);
		tr_huowu.find("#danwei1").text(huowu.danwei);
		tr_huowu.find("#danjia1").text(huowu.danjia);
		tr_huowu.find("#jine1").text(huowu.shuliang*huowu.danjia);
		currHuowu.find("#tr_tianjiadingdanhuowu").before(tr_huowu);
		if("" === currHuowu.find("#mx_guige").val().trim()){
			currHuowu.find("#mx_guige").val(huowu.guige);
			console.log(huowu.danwei);
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
				dd.huowu[i].dingdanId = dd._id;
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
		postJson("../dingdan/dingdans.php",{offset:offset*20,limit:20,option:{cmd:"",gonghuoshang:currYHD.gonghuoshang._id}},function(dingdans){
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
		if(!currYHD.gonghuoshang){
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
		postJson("yanhuodan.php",{caozuo:"zuofei",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_zuofei").click(cz_zuofei);
	function cz_duidan(){
				postJson("yanhuodan.php",{caozuo:"duidan",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_duidan").click(cz_duidan);
	function cz_fukuan(){
		postJson("yanhuodan.php",{caozuo:"fukuan",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_fukuan").click(cz_fukuan);
	function cz_fahuo(){
		postJson("yanhuodan.php",{caozuo:"fahuo",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_fahuo").click(cz_fahuo);
	function cz_quxiaoshenqingduidan(){
		postJson("yanhuodan.php",{caozuo:"quxiaoshenqingduidan",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_quxiaoshenqingduidan").click(cz_quxiaoshenqingduidan);
	function cz_shenqingduidan(){
		postJson("yanhuodan.php",{caozuo:"shenqingduidan",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_shenqingduidan").click(cz_shenqingduidan);
	function cz_fuhe(){
		postJson("yanhuodan.php",{caozuo:"fuhe",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_fuhe").click(cz_fuhe);
	function cz_ludan(){
		postJson("yanhuodan.php",{caozuo:"ludan",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_ludan").click(cz_ludan);
	//翻页处理
	$("#prevPage").click(function(){
		listyanhuodan($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listyanhuodan($("#pager").data("offset")+1);
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
	function sel_yanhuodan(){
		showDetailById($(this).data("_id"));
		$(".tr_selected").removeClass("tr_selected");
		$(this).addClass("tr_selected");
	}
	$(".tr_yanhuodan").click(sel_yanhuodan);
	function setYanhuodizhi(){
		postJson("../vendor/vendors.php",{_id:currYHD.gonghuoshang._id},function(vendor){
			if(vendor.yanhuodizhi){
				$("#yhd_yanhuodizhi").val(vendor.yanhuodizhi);
			}else{
				$("#yhd_yanhuodizhi").val("");
			}
		});
	}
	$("#yhd_gonghuoshang").change(setYanhuodizhi);
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	//解释查询条件
	function getOptions(){
		var ret = {};
		return ret;
	}
		//列出原稿
	function listyanhuodan(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var cmd = getUrl().cmd?getUrl().cmd:"";
		var option = $.extend({cmd:cmd},getOptions());
		postJson("yanhuodan.php",{caozuo:"chaxun",offset:offset*limit,limit:limit,option:option},function(yanhuodans){
			$("#yanhuodantable .tr_yanhuodan").remove();
			each(yanhuodans,function(n,yanhuodan){
				var chuangjianzhe,shoulizhe,shenhezhe;
				chuangjianzhe = yanhuodan.chuangjianzhe?getUser(yanhuodan.chuangjianzhe).user_name:"";
				shoulizhe = yanhuodan.shoulizhe?getUser(yanhuodan.shoulizhe).user_name:"";
				shenhezhe = yanhuodan.shenhezhe?getUser(yanhuodan.shenhezhe).user_name:"";
				tr = tr_yanhuodan.clone(true);
				tr.data("_id",yanhuodan._id);
				tr.find("#td_bianhao").text(yanhuodan._id);
				tr.find("#td_chuangjianzhe").text(chuangjianzhe);
				tr.find("#td_shoulizhe").text(shoulizhe);
				tr.find("#td_shenhezhe").text(shenhezhe);
				tr.find("#td_zhuangtai").text(yanhuodan.zhuangtai);
				
				tr.css("background-color",toggle("#fff","#eee"));
				if(yanhuodan.zhuangtai == "作废"){
					tr.css("text-decoration","line-through");
				}
				$("#yanhuodantable").append(tr);
			});
			if(showId){
				showDetailById(showId);
			}else if(yanhuodans.length>0){
				$(".tr_yanhuodan").get(0).click();
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
		$("#yhd_gonghuoshang").css("cursor","default").unbind("click").val(currYHD.gonghuoshang?currYHD.gonghuoshang.mingchen:"");
		yuandanEditor.editorReadonly();
		$("#yhd_yanhuodizhi").attr("readonly","readonly");
		$(".plainInput").attr("readonly","readonly");
		zonge();
		if(!currYHD.qitafei){
			$("#qita_div").hide();
		}else{
			$("#qita_div").show();
		}
		$("#yanhuodanmingxi").find(".plainBtn").hide();
		$("#bianji").show();$("#fangqi").hide();$("#baocun").hide();
	}
	
	function edit(){
		editing = true;
		$("#yhd_yanhuodizhi").removeAttr("readonly");
		$(".plainInput").removeAttr("readonly");
		$("#yanhuodanmingxi").find(".plainBtn").show();
 		$("#yhd_gonghuoshang").css("cursor","pointer").xuanzeshangjia("",function(vendor){
 			currYHD.gonghuoshang = {_id:vendor._id,mingchen:vendor.mingchen};
 		}).attr("readonly","readonly");
 		$("#qita_div").show();
 		yuandanEditor.editorWritable();
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
	}
	function showDetail(yhd){
		currYHD = yhd;
		$("#liucheng").show().liucheng(getTheUser(),yhd);
		$("#yhd_bianhao").val(currYHD._id);
		$("#yhd_zhuanzhangliushui").val(currYHD.zhuanzhang?currYHD.zhuanzhang:"");
		$("#yhd_gonghuoshang").val(currYHD.gonghuoshang?currYHD.gonghuoshang.mingchen:"");
		$("#yhd_yanhuodizhi").val(currYHD.yanhuodizhi?currYHD.yanhuodizhi:"");
		yuandanEditor.editorVal(currYHD.neirong);
		$(".huowu").remove();
		each(yhd.huowu,function(i,huowu){
			var hwDiv = table_huowu.clone(true);
			hwDiv.find("#mx_guige").val(huowu.guige);
			hwDiv.find("#mx_danwei").val(huowu.danwei);
			hwDiv.find("#mx_danjia").val(huowu.danjia);
			hwDiv.find("#shuliangjianshu").remove();
			each(huowu.mingxi,function(j,mx){
				var mxDiv = tmpl_shuliangjianshu.clone(true);
				mxDiv.find(".shuliang").val(mx.shuliang);
				mxDiv.find(".jianshu").val(mx.jianshu);
				hwDiv.find("#zengjiajianshu").before(mxDiv);
			});
			hwDiv.find("#beizhu").val(huowu.beizhu);
			jisuanjine.call(hwDiv.find("#mx_danjia"));
			each(huowu.dingdan,function(k,dd){
				var tr_huowu = dingdanhuowu.clone(true);
				tr_huowu.data("huowu",dd);
				tr_huowu.find("#dingdanhao").text(dd.dingdanId);
				tr_huowu.find("#guige1").text(dd.guige);
				tr_huowu.find("#shuliang1").text(dd.shuliang);
				tr_huowu.find("#danwei1").text(dd.danwei);
				tr_huowu.find("#danjia1").text(dd.danjia);
				tr_huowu.find("#jine1").text(dd.shuliang*dd.danjia);
				hwDiv.find("#tr_tianjiadingdanhuowu").before(tr_huowu);
			});
			$("#tianjiahuowu").before(hwDiv);	
		});
		$(".qitafeiyong").remove();
		each(yhd.qitafei,function(l,qita){
			var qitaDiv = tmpl_qitafeiyong.clone(true);
			qitaDiv.find("#qita_shuoming").val(qita.shuoming);
			qitaDiv.find("#qita_jine").val(qita.jine);
			$("#zengjiaqitafeiyong").before(qitaDiv);
		});
		jisuanzonge();
		readOnly();
	}
	
	function showDetailById(_id){
		postJson("yanhuodan.php",{caozuo:"getbyid",_id:_id},function(dd){
			showDetail(dd);			
		});
	}

	jQuery.fn.liucheng = function(theUser,yanhuodan){
		var that = this.empty();
		this.data("_id",yanhuodan._id);
		each(yanhuodan.liucheng,function(n,item){
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
				if((yanhuodan.liucheng.length - 1) == n){
					$("#cz_ludan",caozuoItem).show();
				}
				$("table",tmpl).append(caozuoItem);
			}else if("录单" == item.dongzuo){
				if((yanhuodan.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#bianji").show();
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_shenqingduidan",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("申请对单" == item.dongzuo){
				if((yanhuodan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == item.userId){
						$("#cz_quxiaoshenqingduidan",caozuoItem).show();
					}else{
						$("#cz_duidan",caozuoItem).show();
					}
					$("table",tmpl).append(caozuoItem);
				}
			}else if("对单" == item.dongzuo){ 
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				$("#cz_fukuan",caozuoItem).show();
				$("#cz_fahuo",caozuoItem).show();
				var c = 2;
				for(i=n;i<yanhuodan.liucheng.length;i++){
					if(yanhuodan.liucheng[i].dongzuo == "付款"){
						$("#cz_fukuan",caozuoItem).hide();
						c --;
					}
					if(yanhuodan.liucheng[i].dongzuo == "发货"){
						$("#cz_fahuo",caozuoItem).hide();
						c --;
					}
				}
				if(c == 0){
					$("#lc_anniu",tmpl).hide();
				}
				$("table",tmpl).append(caozuoItem); 
			}else if("付款" == item.dongzuo){
				if((yanhuodan.liucheng.length - 1) == n){
					if(yanhuodan.liucheng[n-1].dongzuo == "发货"){
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						$("#cz_fuhe",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}
				}
			}else if("发货" == item.dongzuo){
				if((yanhuodan.liucheng.length - 1) == n){
					if(yanhuodan.liucheng[n-1].dongzuo == "付款"){
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						$("#cz_fuhe",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}
				}
			}
			that.append(tmpl);
		});
	}
	
	///////////////////////////////初始化/////////////////////////////////////////////
	function _chushihua_(){} 
	var limit=20;
	var currYHD = null;
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
	var tr_yanhuodan = $(".tr_yanhuodan").detach();
	var tr_seldingdan = $("#sel_dingdan tr").detach();
	var tmpl_huowu = $(".tmpl_huowu").detach();
	var dingdanhuowu = $(".dingdanhuowu").detach();
	var currHuowu = null;
	var table_huowu = $(".huowu").clone(true);
	var tmpl_shuliangjianshu = $("#shuliangjianshu").clone(true);
	var tmpl_qitafeiyong = $(".qitafeiyong").detach();
	
	var yuandanEditor = $("#yuandan").myeditor(700,300);
	yuandanEditor.editorReadonly();
	
	$("#th_bianhao").datepicker().change(function(){$(this).val("YHD"+date2id($(this).val()))});
	var liuyanElm = $("#liuyan").liuyan({hostType:"yangban",});
	listyanhuodan(0,getUrl().showId);
	
});