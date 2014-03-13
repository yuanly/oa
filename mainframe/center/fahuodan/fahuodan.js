$(function(){
	/*
	{	_id:"FHD131008.1",
		liucheng:[{userId:3,dongzuo:"录单",time:1322}],
		zhuangtai:"录单",
		gonghuoshang:{_id:"SJ131110",mingchen:"大大"},
		huowu:[huowu],//这个需要从huowu collection关联查询获取，不在fahuodan collection保存
		qitafei:[{shuoming:"xxx",jine:22}],
		neirong:"xxx",
		//zhuanzhang:["xxx",...] 改成放到流水账的表中，方便避免一个帐被多次选中。
		ludanzhe:1,
		duidanzhe:2,
		fuhezhe:3,
		shouhuoriqi:1232,
		yanhuodizhi:"xxx",
		version:34231423,//用于避免版本冲突
		lastId:x//用于简化货物id的定义
	}
	
	huowu 的数据模型：
	{
		_id:"xxx",//fhd_id+hw+n
		gonghuoshang:{_id:"xxx",mingchen:"xxx"}
		guige:"xxx",
		danwei:"码",
		danjia:23.1,
		shuliang:23,
		jianshu:2,
		fahuodan:"xx",
		yanhuodan,{_id:"xxx",beizhu:[{time:"xxx",zhu:"xxx"},{}...]},
		zhuangguidan:"xx",
		zhu:"xxx",
		dingdanhuowu:"xx"//DD140113.1HW1 具体到指定规格的货物
		}
		
	一件货物可能对应多张订单？（这种情况不多，用备注记录）
订单货物也要有id

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
	
	$('#currLocation', window.parent.document).text("发货单管理");
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	
	function _shijianchuli_(){}
		$("th").attr("nowrap","true");
		$("#zhuangguidan").click(function(){
			window.open("../zhuangguidan/zhuangguidan.html?showId="+$(this).text(),"_blank");		
		});
		function sel_zhuanzhangliushui(event){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("fahuodan.php",{caozuo:"chaliushui",offset:page*limit,limit:limit,option:option},function(liushuis){
					callback(liushuis);
				});
			},["_id","fukuanfangname","kemu","jine","shoukuanfangname","fukuanriqi","fahuodan"],function(liushui){//选中回调
				if(liushui.fahuodan && liushui.fahuodan!=currFHD._id){
					tip($(this),"该流水账已被关联到发货单，不能重复使用！！！",1500);	
					return;
				}
				$(this).text(liushui._id+"("+liushui.jine+"元)").data("liushui",liushui._id);
				if(liushui.kemu != "货款"){
					tip($(this),"注意，该流水科目不是 货款！！！",1500);	
				}
				if(currFHD.gonghuoshang){
					if(liushui.shoukuanfang != currFHD.gonghuoshang._id){
						tip($(this),"注意，该流水收款人与供货商不符！！！",1500);	
					}
				} 
				var zonge = parseFloat($("#fhd_zonge").val().trim());
				if(!isNaN(zonge)){
					if(zonge != liushui.jine){
						tip($(this),"注意，该流水金额和发货单总额不符！！！",1500);	
					}
				}
			},"",function(){//清空回调
				$(this).val("");
			},function(){//过滤框是日期选择时，在选中日期后的回调。
				$("#panel #option").val("LSZ"+date2id($("#panel #option").val()+"0"));
				});
	}
	
	$("#yanhuodan").click(function(){
		window.open("../yanhuodan/yanhuodan.html?showId="+$(this).text(),"_blank");		
	});
	$("#th_zhuangtai").bind("input",function(){listfahuodan(0);});
	$("#th_bianhao").datepicker().change(function(){
		$(this).val("FHD"+date2id($(this).val()));
		listfahuodan(0);
	});
	function sel_gonghuoshang(event){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("../dingdan/dingdan.php",{caozuo:"shangjia",offset:page*limit,limit:limit,option:option},function(gonghuoshangs){
					callback(gonghuoshangs);
				});
			},["_id","mingchen","dianhua","dizhi"],function(gonghuoshang){
				$("#th_gonghuoshang").val(gonghuoshang.mingchen);
				$("#th_gonghuoshang").data("ghsId",gonghuoshang._id);
				listfahuodan(0);
			},"",function(){
				$("#th_gonghuoshang").val("供货商");
				listfahuodan(0);
			});
	}
	$("#th_gonghuoshang").click(sel_gonghuoshang);
	$("#shanchudingdanhuowu").click(function(){
		$(this).parents(".dingdanhuowu").remove();
		$("#tr_tianjiadingdanhuowu").show();
	});
	function chaifen(){
		$(".chai").show();
		$("#fangqi").show();$("#baocun").show();
		$("#chaifen").hide();
		$(".zhu").show().removeAttr("readonly");
	}
	$("#chaifen").click(chaifen);
	function chai(){
		var hw = $(this).parents("#shuliangjianshu");
		var total = parseInt(hw.find(".jianshu").val()); 
		ask2(null,"请输入要拆出来的件数：",function(res){
			var pattern=/^[1-9][0-9]*$/;
			if(!pattern.test(res.trim())){
				tip(null,"必须为正整数！",1500);
				return false;
			}
			var jian = parseInt(res);
			if(jian >= total){
				tip(null,"必须小于"+total,1500);
				return false;
			}
			var hw1 = hw.clone(true);
			currFHD.lastId ++;
			hw1.find("#hwbianhao").text(currFHD._id+"HW"+currFHD.lastId);
			hw.find(".jianshu").val(total - jian);
			hw1.find(".jianshu").val(jian);
			hw1.find("#yanhuodan").val("").hide();
			hw1.find("#zhuangguidan").val("").hide(); 
			hw.after(hw1);
		});
	}
	$("#chai").click(chai);
	function baocun(){
		jisuanzonge();
		if($("#fhd_zonge").val().trim() == ""){
			tip($("#fhd_zonge"),"无法计算总额，请确保所有栏目有效！",1500);
			return;
		}
		if(!currFHD.gonghuoshang){
			tip($("#fhd_gonghuoshang"),"供货商不能为空！",1500);
			return;
		}
		if($("#fhd_yanhuodizhi").text().trim() != ""){
			currFHD.yanhuodizhi = $("#fhd_yanhuodizhi").text().trim();
		}
		currFHD.zhuanzhang = $("#fhd_zhuanzhangliushui").data("liushui");
		var shuliangkong = false;
		$(".shuliang").each(function(i,sl){
			if($(this).val().trim() == ""){
	 			tip($(this),"数量不能为空！",2000);
	 			shuliangkong = true;
	 			return false;
	 		}
		});
		if(shuliangkong){
			return;
		}
		var jianshukong = false;
		$(".jianshu").each(function(i,sl){
			if($(this).val().trim() == ""){
	 			tip($(this),"件数不能为空！",2000);
	 			jianshukong = true;
	 			return false;
	 		}
		});
		if(jianshukong){
			return;
		}
		var huowu = [];
		$(".huowu").each(function(i,hw){
			if("" == $(hw).find("#mx_yangban").text().trim()){
		 		tip($(hw).find("#mx_yangban"),"样板不能为空！",2000);
		 		huowu = [];
		 		return false;
		 	}
			if("" == $(hw).find("#mx_guige").text().trim()){
		 		tip($(hw).find("#mx_guige"),"规格不能为空！",2000);
		 		huowu = [];
		 		return false;
		 	}
			$(hw).find(".shuliangjianshu").each(function(j,mingxi){
			 	var item = {};
			 	item.gonghuoshang = currFHD.gonghuoshang;
			 	item._id = $(mingxi).find("#hwbianhao").text().trim();
			 	item.kehu = $(hw).find(".dingdanhuowu").find("#kehu1").text();
			 	item.yangban = $(hw).find("#mx_yangban").text().trim();
			 	item.guige  = $(hw).find("#mx_guige").text().trim();
			 	item.danwei = $(hw).find("#mx_danwei").val().trim();
		 		item.danjia = $(hw).find("#mx_danjia").val().trim();
		 		item.shuliang = $(mingxi).find(".shuliang").val().trim();
		 		item.jianshu = $(mingxi).find(".jianshu").val().trim();
		 		item.zhu = $(mingxi).find("#zhu").text().trim();
		 		item.dingdanhuowu = $(hw).find(".dingdanhuowu").data("huowu").id;
		 		item.fahuodan = currFHD._id;
			 	huowu.push(item);
			});
		});
		if(huowu.length == 0){
			return;
		}
		currFHD.huowu = huowu;
		var qita = [];
		$(".qitafeiyong").each(function(i,feiyong){
			var qtfy = {};
			qtfy.shuoming = $(feiyong).find("#qita_shuoming").text().trim();
			if("" == qtfy.shuoming){
					tip($(feiyong).find("#qita_shuoming"),"费用说明不能为空！",2000);
		 			return false;
			}
			qtfy.jine = $(feiyong).find("#qita_jine").val().trim();
			qita.push(qtfy);
		});
		if(qita.length>0){
			currFHD.qitafei = qita;
		}
		currFHD.neirong = yuandanEditor.editorVal();
		postJson("fahuodan.php",{caozuo:"baocun",fahuodan:currFHD},function(res){
			showDetailById(currFHD._id);
		});		
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
		var tb = $(this).parents(".huowu");
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
		tb.find("#mx_shuliang").text(round(sum,2));	
		sum = sum * danjia;
		tb.find("#mx_jine").text(round(sum,2));
		
		jisuanzonge();
	}
	$(".jinetrigger").change(jisuanjine);
	function zengjiajianshu(){
		var js = tmpl_shuliangjianshu.clone(true);
		currFHD.lastId ++;
		js.find("#hwbianhao").text(currFHD._id+"HW"+currFHD.lastId);	
		$(this).before(js);
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
		var tb_hw = table_huowu.clone(true);
		currFHD.lastId ++;
		tb_hw.find("#hwbianhao").text(currFHD._id+"HW"+currFHD.lastId);
		//tb_hw.find("#shuliangjianshu").data("id",currFHD.lastId);
		$(this).before(tb_hw);
	}
	$("#tianjiahuowu").click(tianjiahuowu);
	$(".list").dblclick(function(){$(this).val("");});
	function showDingdan(){
		var ddhwId = $(this).text();
		var ddId = ddhwId.substring(0,ddhwId.toUpperCase ().indexOf("HW"));
		window.open("../dingdan/dingdan.html?showId="+ddId,"_blank");
	}
	$("#dingdanhao").click(showDingdan);
	function sel_huowu(){
		var huowu = $(this).data("huowu");
		var dd = $(this).data("dingdan");
		var tr_huowu = dingdanhuowu.clone(true);
		tr_huowu.data("huowu",huowu);
//		tr_huowu.data("dingdan",dd);
		//tr_huowu.find("#dingdanhao").text($(this).data("dingdanId"));
		tr_huowu.find("#dingdanhao").text(huowu.id);
		tr_huowu.find("#kehu1").text(dd.kehu);
		tr_huowu.find("#yangban1").text(formatYangban(dd.yangban));
		tr_huowu.find("#guige1").text(huowu.guige);
		tr_huowu.find("#shuliang1").text(huowu.shuliang);
		tr_huowu.find("#danwei1").text(huowu.danwei);
		tr_huowu.find("#danjia1").text(huowu.danjia);
		tr_huowu.find("#jine1").text(round(huowu.shuliang*huowu.danjia,2));
		tr_huowu.find("#shanchudingdanhuowu").show();
		currHuowu.find("#tr_tianjiadingdanhuowu").before(tr_huowu).hide();
		currHuowu.find("#mx_yangban").text(formatYangban(dd.yangban));
		currHuowu.find("#mx_guige").text(huowu.guige);
		currHuowu.find("#mx_danwei").val(huowu.danwei);
		currHuowu.find("#mx_danjia").val(huowu.danjia).change();
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
				huowu.data("huowu",dd.huowu[i]);
				//huowu.data("dingdanId",dd._id);
				huowu.data("dingdan",dd);
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
				//tr.data("dingdan",dingdan);
				tr.find("#td_bianhao").text(dingdan._id);
				tr.find("#td_kehu").text(dingdan.kehu);
				tr.find("#td_yangban").text(formatYangban(dingdan.yangban));
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
	function cz_jieguan(){
		postJson("fahuodan.php",{caozuo:"jieguan",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_jieguan").click(cz_jieguan);
	function cz_duidan(){
				postJson("fahuodan.php",{caozuo:"duidan",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_duidan").click(cz_duidan);
	function cz_fukuan(){
		//确认已经设置转账流水
		postJson("fahuodan.php",{caozuo:"fukuan",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_fukuan").click(cz_fukuan);
	function cz_fahuo(){
		postJson("fahuodan.php",{caozuo:"fahuo",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_fahuo").click(cz_fahuo);
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
	function cz_fuhe(){
		postJson("fahuodan.php",{caozuo:"fuhe",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_fuhe").click(cz_fuhe);
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
		postJson("../contact/contacts.php",{_id:currFHD.gonghuoshang._id},function(vendor){
			if(vendor.yanhuodizhi){
				$("#fhd_yanhuodizhi").text(vendor.yanhuodizhi);
			}else{
				$("#fhd_yanhuodizhi").text("");
			}
		});
	}
	$("#fhd_gonghuoshang").change(setYanhuodizhi);
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	//解释查询条件
	function getOptions(){
		var ret = {};
		var bh = $("#th_bianhao").val().trim();
		if("" != bh && "编号" != bh){
			ret.bianhao = bh+"0";
		}
		var ghs = $("#th_gonghuoshang").val().trim();
		if("" != ghs && "供货商" != ghs){
			ret.gonghuoshang = $("#th_gonghuoshang").data("ghsId");
		}
		var zt = $("#th_zhuangtai").val().trim();
		if("" != zt && "状态" != zt){
			ret.zhuangtai = zt;
		}
		return ret;
	}
	function getOperator(fhd){
		var ret = {ludanzhe:"",duidanzhe:"",fuhezhe:""};
		each(fhd.liucheng,function(i,lc){
			if(lc.dongzuo == "录单"){
				ret.ludanzhe = getUserName(lc.userId);
			}else if(lc.dongzuo == "对单"){
				ret.duidanzhe = getUserName(lc.userId);
			}else if(lc.dongzuo == "复核"){
				ret.fuhezhe = getUserName(lc.userId);
			}
		});
		if(fhd.ludanzhe){
			ret.ludanzhe = getUserName(fhd.ludanzhe);
		}
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
				tr.find("#td_zhuangtai").text(fahuodan.zhuangtai);
				tr.find("#td_gonghuoshang").text(fahuodan.gonghuoshang?fahuodan.gonghuoshang.mingchen:"");
				var ops = getOperator(fahuodan);
				tr.find("#td_ludanzhe").text(ops.ludanzhe);
				tr.find("#td_duidanzhe").text(ops.duidanzhe);
				tr.find("#td_fuhezhe").text(ops.fuhezhe);
				
				tr.css("background-color",toggle("#fff","#eee"));
				if(fahuodan.zhuangtai == "作废"){
					tr.css("text-decoration","line-through");
				}
				$("#fahuodantable").append(tr);
			});
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else if(fahuodans.length>0){
				$(".ui-layout-center").show();
				$(".tr_fahuodan").get(0).click();
			}else{
				$(".ui-layout-center").hide();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
		});
	}

	function zonge(){
		jisuanzonge();
	}
	function link_liushui(){
		window.open("../liushuizhang/liushuizhang.html?showId="+$(this).data("liushui"),"_blank");
	}
	function readOnly(){
		editing = false;
		$(".myinput").removeAttr("contentEditable");
		$("#fhd_zhuanzhangliushui").unbind("click").click(link_liushui);
		$("#fhd_gonghuoshang").css("cursor","default").unbind("click");//.val(currFHD.gonghuoshang?currFHD.gonghuoshang.mingchen:"");
		yuandanEditor.editorReadonly();
		$("#fhd_yanhuodizhi").attr("readonly","readonly");
		$(".plainInput").attr("readonly","readonly");
		$(".zhu").attr("readonly","readonly");
		$(".zhu").each(function(i,zhu){
			if($(this).val().trim() == ""){
				$(this).hide();
			}
		});
		$(".shanchudingdanhuowu").hide();
		zonge();
		if(!currFHD.qitafei){
			$("#qita_div").hide();
		}else{
			$("#qita_div").show();
		}
		$("#qita_shuoming").removeAttr("contenteditable");
		$("#fahuodanmingxi").find(".plainBtn").hide();
		if(kebianji){
			$("#bianji").show();
		}
		if(kechaifen){
			$("#chaifen").show();
		}else{
			$("#chaifen").hide();
		}
		$("#fangqi").hide();$("#baocun").hide();
	}
	
	function edit(){
		editing = true;
		$(".myinput").attr("contentEditable","true");
		$(".zhu_ctnr").show();$(".zhu").show();
		$("#fhd_yanhuodizhi").removeAttr("readonly");
		$(".plainInput").removeAttr("readonly");
		$("#fahuodanmingxi").find(".plainBtn").show();
		$("#fhd_zhuanzhangliushui").unbind("click").click(sel_zhuanzhangliushui);
 		$("#fhd_gonghuoshang").css("cursor","pointer").attr("readonly","readonly").click(function(event){
 			var limit = 20;
	 		setSelector(event,function(page,option,callback1){
	 				postJson("../contact/lianxiren.php",{caozuo:"chashangjia",offset:page*limit,limit:limit,option:option},function(vendors){
	 					callback1(vendors);
	 				});
	 			},["_id","mingchen"],function(vendor){
	 				$(this).text(vendor.mingchen)
	 				$(this).data("shangjia",vendor);
	 				currFHD.gonghuoshang = {_id:vendor._id,mingchen:vendor.mingchen};
	 				$(this).change();
	 			},"",function(){
	 				currFHD.gonghuoshang = undefined;
	 				$(this).val("");
	 				$("#fhd_yanhuodizhi").text("");
	 		});
 		});
 		$("#qita_div").show();
 		$("#qita_shuoming").attr("contenteditable","true");
 		yuandanEditor.editorWritable();
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
		$(".tianjiadingdanhuowuclz").each(function(){
			if($(this).siblings().length>=2){
				$(this).hide();
			}	
		});
		$(".shanchudingdanhuowu").show();
	}
	function hwid2int(hwid){
		return parseInt(hwid.substr(hwid.indexOf("HW")+2));
	}
	function setZhuanzhangliushui(){
		var liushui = $("#fhd_zhuanzhangliushui").data("liushui");
		if(liushui){
			postJson("../liushuizhang/liushuizhang.php",{caozuo:"getbyid",_id:liushui},function(ls){
				$("#fhd_zhuanzhangliushui").text(liushui+"("+ls.jine+"元)");
			});
		}
	}
	function showDetail(fhd){//我承认，这个实现很烂！
		currFHD = fhd;
		currFHD.lastId = 0;
		each(fhd.huowu,function(i,hw){
			var hwid = hwid2int(hw._id);
			if(currFHD.lastId < hwid){
				currFHD.lastId = hwid + 1;
			}
		});
		$("#liucheng").show().liucheng(getTheUser(),fhd);
		$("#fhd_bianhao").val(currFHD._id);
		//$("#fhd_zhuanzhangliushui").val(currFHD.zhuanzhang?currFHD.zhuanzhang:"");
		if(currFHD.zhuanzhang){
			$("#fhd_zhuanzhangliushui").data("liushui",currFHD.zhuanzhang);
			setZhuanzhangliushui();
		}else{
			$("#fhd_zhuanzhangliushui").html("&nbsp;").removeData("liushui");
		}
		$("#fhd_gonghuoshang").text(currFHD.gonghuoshang?currFHD.gonghuoshang.mingchen:"");
		$("#fhd_yanhuodizhi").text(currFHD.yanhuodizhi?currFHD.yanhuodizhi:"");
		yuandanEditor.editorVal(currFHD.neirong);
		$(".huowu").remove();
		//huowu 2 huowu 根据订单货物id分簇，然后获取订单货物原始信息
		var ddhws = [];//找出所有不同的订单货物，即按订单货物编号去重。（订单货物是在订单中录入的货物，不同于后续的货物，一个订单货物可以对应多个货物）
		each(fhd.huowu,function(i,hw){
			var exists = false;
			each(ddhws,function(j,ddhw){
				if(ddhw == hw.dingdanhuowu){
					exists = true;
					return false;
				}
			});
			if(!exists){
				ddhws.push(hw.dingdanhuowu);
			}
		});
		var huowus = [];
		each(ddhws,function(i,ddhwId){//转换数据结构 huowus = [{_id:"xxx",...,mingxi:[{相同订单货物id的货物},...]},...]
			var hw = {};
			var tempHuowu;
			hw.mingxi = [];
			each(fhd.huowu,function(j,huowu){
				if(huowu.dingdanhuowu == ddhwId){
					tempHuowu = huowu;
					hw.mingxi.push(clone(huowu));
				}
			});
			hw.yangban = tempHuowu.yangban;
			hw.guige = tempHuowu.guige;
			hw.danwei = tempHuowu.danwei;
			hw.danjia = tempHuowu.danjia;
			hw.dingdanhuowu = ddhwId;
			huowus.push(hw);
		});
		each(huowus,function(i,huowu){
			var hwDiv = table_huowu.clone(true);
			hwDiv.find("#mx_yangban").text(huowu.yangban);
			hwDiv.find("#mx_guige").text(huowu.guige);
			hwDiv.find("#mx_danwei").val(huowu.danwei);
			hwDiv.find("#mx_danjia").val(huowu.danjia);
			hwDiv.find("#shuliangjianshu").remove();
			each(huowu.mingxi,function(j,mx){
				var mxDiv = tmpl_shuliangjianshu.clone(true);
				mxDiv.find(".shuliang").val(mx.shuliang);
				mxDiv.find(".jianshu").val(mx.jianshu);
				mxDiv.find("#hwbianhao").text(mx._id);
				mxDiv.data("id",mx.id);
				if(mx.zhu){
					mxDiv.find("#zhu").text(mx.zhu).show();
				}else{
					mxDiv.find(".zhu_ctnr").hide();
				}
				if(mx.yanhuodan){
					if(mx.yanhuodan.zhuangtai == "通过"){
						mxDiv.find("#yanhuodan").html("<font color=green>"+mx.yanhuodan._id+"</font>").show();
					}else if(mx.yanhuodan.zhuangtai == "不通过"){
						mxDiv.find("#yanhuodan").html("<font color=red>"+mx.yanhuodan._id+"</font>").show();
					}else{
						mxDiv.find("#yanhuodan").html("<font color=black>"+mx.yanhuodan._id+"</font>").show();
					}
				}
				if(mx.zhuangguidan){
					mxDiv.find("#zhuangguidan").text(mx.zhuangguidan).show();
				}
				hwDiv.find("#zengjiajianshu").before(mxDiv);
			});
			hwDiv.find("#beizhu").val(huowu.beizhu);
			jisuanjine.call(hwDiv.find("#mx_danjia"));
			postJson("../dingdan/dingdan.php",{caozuo:"gethuowubyid2",huowuId:huowu.dingdanhuowu},function(dd){
				var tr_huowu = dingdanhuowu.clone(true);
				tr_huowu.data("huowu",dd);
				tr_huowu.find("#dingdanhao").text(dd.id);
				tr_huowu.find("#kehu1").text(dd.kehu);
				tr_huowu.find("#yangban1").text(formatYangban(dd.yangban));
				tr_huowu.find("#guige1").text(dd.guige);
				tr_huowu.find("#shuliang1").text(dd.shuliang);
				tr_huowu.find("#danwei1").text(dd.danwei);
				tr_huowu.find("#danjia1").text(dd.danjia);
				tr_huowu.find("#jine1").text(round(dd.shuliang*dd.danjia,2));
				hwDiv.find("#tr_tianjiadingdanhuowu").before(tr_huowu);
			});
			$("#tianjiahuowu").before(hwDiv);	
		});
		$(".qitafeiyong").remove();
		each(fhd.qitafei,function(l,qita){
			var qitaDiv = tmpl_qitafeiyong.clone(true);
			qitaDiv.find("#qita_shuoming").text(qita.shuoming);
			qitaDiv.find("#qita_jine").val(qita.jine);
			$("#zengjiaqitafeiyong").before(qitaDiv);
		});
		jisuanzonge();
		liuyanElm.shuaxinliebiao({hostId:currFHD._id,hostType:"fahuodan"});
		readOnly();
	}
	
	function showDetailById(_id){
		kebianji = false;
		kechaifen = false;
		editing = false;
		postJson("fahuodan.php",{caozuo:"getbyid",_id:_id},function(fhd){//这里是把关联的货物放到一起了
			showDetail(fhd);
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
				("#lc_tr_panel",tmpl).attr("title","发货单原件已经被上传，等待录单！");
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				$("#cz_zuofei",caozuoItem).show();
				if((fahuodan.liucheng.length - 1) == n){
					$("#cz_ludan",caozuoItem).show();
				}
				$("table",tmpl).append(caozuoItem);
			}else if("录单" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","正在录入发货单！");
				if((fahuodan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					//if(theUser._id == item.userId){
					if(theUser._id == currFHD.ludanzhe){
						kebianji = true;
						$("#cz_shenqingduidan",caozuoItem).show();
					}else{
						$("#cz_jieguan",caozuoItem).show();
					}
					$("table",tmpl).append(caozuoItem);
				}
			}else if("申请对单" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已完成对发货单的录入，申请对单！");
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
			}else if("对单" == item.dongzuo){ 
				("#lc_tr_panel",tmpl).attr("title","已完成对单，可以进行付款！");
				kechaifen = true;
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				$("#cz_fukuan",caozuoItem).show();
				$("#cz_fahuo",caozuoItem).show();
				var c = 2;
				for(i=n;i<fahuodan.liucheng.length;i++){
					if(fahuodan.liucheng[i].dongzuo == "付款"){
						$("#cz_fukuan",caozuoItem).hide();
						c --;
					}
					if(fahuodan.liucheng[i].dongzuo == "发货"){
						$("#cz_fahuo",caozuoItem).hide();
						c --;
					}
				}
				if(c == 0){
					$("#lc_anniu",tmpl).hide();
				}
				$("table",tmpl).append(caozuoItem); 
			}else if("付款" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已完成付款，等待发货！");
				if((fahuodan.liucheng.length - 1) == n){
					if(fahuodan.liucheng[n-1].dongzuo == "发货"){
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						$("#cz_fuhe",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}
				}
			}else if("发货" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","厂家已发货！");
				if((fahuodan.liucheng.length - 1) == n){
					if(fahuodan.liucheng[n-1].dongzuo == "付款"){
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						$("#cz_fuhe",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}
				}
			}else if("复核" == item.dongzuo){
				kechaifen = false;
				("#lc_tr_panel",tmpl).attr("title","该发货单已经被再次检查无误！");
			}
			that.append(tmpl);
		});
	}
	
	///////////////////////////////初始化/////////////////////////////////////////////
	function _chushihua_(){} 
	var limit=20;
	var currFHD = null;
	var kebianji = false;
	var kechaifen = false;
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
	 
	var liuyanElm = $("#liuyan").liuyan({hostType:"fahuodan",});
	listfahuodan(0,getUrl().showId);

//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){
		layout.sizePane("west",$("#fahuodantable").width()+20);
		if(layout.state.west.innerWidth < $("#fahuodantable").width()){
			layout.sizePane("west",$("#fahuodantable").width()+20);
		}
	});
	$(".detailheader").click(function(){
		if(layout.state.center.innerWidth < $("#mingxitable").width()){
			layout.sizePane("west",$("body").width()-$("#mingxitable").width()-100);
		}
	}).dblclick(function(){layout.toggle("west");});
});