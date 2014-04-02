$(function(){
	/*
流程：上传 接单 申请对单  对单 收货 装柜 申请审结 审结

状态：上传(删除 接单） 接单（作废 接管-未审结 申请对单） 申请对单（回退 对单）  对单（回退-未付款 收货） 
			 收货（回退 装柜-发现有未关联货柜的货物要提醒-考虑有退货情况不强制要求关联） 装柜（回退 申请审结-已付款） 申请审结（回退 审结） 审结（回退）（付完款才能审结）
需要另外增加一个“付款申请”模块，数据模型兼容“发货单”，流程：制单 申请付款（申请对单） 审核申请（对单） 付款 审结
跟“流水账”合并到一个叫“财账”的模块。

	{	_id:"FHD131008.1",
		subid:"xx",//不带FHD和SQ的id，方便两种类型混一起排序和查询
		type:"fahuodan"/"shenqing",
		zongjine:213.2,//付款申请要手工输入，发货单则自动计算
		kemu:"",//付款申请才需要
		subid:"xx",
		liucheng:[{userId:3,dongzuo:"录单",time:1322}],
		liushuizhang:{_id:"xx",yifu:true},//保存的是流水账id，但返回时直接关联上整个流水账//一般不会有一个付款申请被分成多次支付，除非不够钱，对方要求有多少付多少，但这种情况发生可能性极低，备注注明即可。
		zhuangtai:"录单",
		gonghuoshang:{_id:"SJ131110",mingchen:"大大",quyu:"xxx"},//收款人,其中quyu要带到huowu去，而huowu需要quyu方便选货装柜和建验货单。
		shoukuanzhanghu:"xxx",//收款账户 整理好的一个字符串
		huowu:[huowu],//这个需要从huowu collection关联查询获取，不在fahuodan collection保存
		qitafei:[{shuoming:"xxx",jine:22}],
		neirong:"xxx",
		ludanzhe:1,
		duidanzhe:2,
		//fuhezhe:3,//改成从流程里拿
		shouhuoriqi:1232,
		yanhuodizhi:"xxx",
		version:34231423,//用于避免版本冲突
		lastId:x//用于简化货物id的定义
	}
	
	huowu 的数据模型：
	{
		_id:"xxx",//fhd_id+hw+n
		gonghuoshang:{_id:"xxx",mingchen:"xxx",quyu:"xx"}
		yangban:{_id:"xx",zhongguoxinghao:"xxx",taiguoxinghao:"xxx"},
		kehu:"xx",
		guige:"xxx",
		danwei:"码",
		danjia:23.1,
		shuliang:23,
		jianshu:2,
		fahuodan:"xx",
		yanhuodan：{_id:"xxx",zhuangtai:"已通过",beizhu:[{time:"xxx",zhu:"xxx"},{}...]},
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
	$("#fhd_zhuanzhangliushui").click(function(){
		if(currFHD.liushuizhang){
			window.open("../liushuizhang/liushuizhang.html?showId="+currFHD.liushuizhang._id,"_blank");
		}	
	});
	function sel_zhanghu(event){
		if(!currFHD.gonghuoshang){
			tip($(this),"必须先指定供货商",1500);
			return;
		}
		var thatInput = $(this);
		var contactId = currFHD.gonghuoshang._id;
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("../liushuizhang/zhanghu.php",{offset:page*limit,limit:limit,option:contactId},function(zhanghus){
					callback(zhanghus);
				});
			},["yinhang","huming","zhanghao"],function(zhanghu){
				currFHD.shoukuanzhanghu = zhanghu.yinhang+" "+zhanghu.zhanghao+"("+zhanghu.huming+")";
				thatInput.html(currFHD.shoukuanzhanghu);
				thatInput.data("zhanghao",zhanghu.zhanghao);
			},currFHD.gonghuoshang._id,function(){//清空
				currFHD.shoukuanzhanghu = "";
				thatInput.html("&nbsp;");
			});
	}
	$("th").attr("nowrap","true");
	$("#shangchuanfahuodan").click(function(){
		window.open("shangchuan.html","_self");
	});
	function statusColor(status,color){
		//上传 接单 申请对单 对单 收货 装柜 申请审结 审结 作废
		if(status == "上传"){//绿色
			return "#7CFC00";
		}
		if(status == "接单"){//红色
			return "#FF4500";
		}
		if(status == "申请对单"){//棕色
			return "#FF6347";
		}
		if(status == "对单"){//粉红
			return "#FFB6C1";
		}
		if(status == "收货"){//黄色
			return "FFFF00";
		}
		if(status == "装柜"){//赭
			return "#DEB887";
		}
		if(status == "申请审结"){//赭
			return "#DEB887";
		}
		if(status == "作废"){//赭
			return "#DEB887";
		}
		if(status == "审结"){
			return color;
		}
	}
		$("#zhuangguidan").click(function(){
			window.open("../zhuangguidan/zhuangguidan.html?showId="+$(this).text(),"_blank");		
		});
		$("#fhd_bianhao").click(function(){
			window.open("fahuodan.html?showId="+$(this).val(),"_blank");		
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
	$("#th_fukuan").bind("input",function(){listfahuodan(0);});
	$("#th_bianhao").datepicker().change(function(){
		$(this).val("FHD"+date2id($(this).val()));
		listfahuodan(0);
	});
	function sel_gonghuoshang(event){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("../contact/lianxiren.php",{caozuo:"chashangjia",offset:page*limit,limit:limit,option:option},function(gonghuoshangs){
					callback(gonghuoshangs);
				});
			},["_id","mingchen","quyu","dizhi"],function(gonghuoshang){
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
		$(this).parents("#tb_dingdan").find("#tr_tianjiadingdanhuowu").show();
		$(this).parents(".dingdanhuowu").remove();
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
		currFHD.zongjine = parseFloat($("#fhd_zonge").val());
		if(isNaN(currFHD.zongjine)){
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
			 	var yb = $(hw).find(".dingdanhuowu").data("huowu").yangban;;
			 	item.yangban = {_id:yb._id,taiguoxinghao:yb.taiguoxinghao,zhongguoxinghao:yb.zhongguoxinghao};//$(hw).find("#mx_yangban").text().trim();
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
			tip($(this),"货物不能为空！",2000);
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
			if(res.err){
				tip($("#baocun"),res.err,1500);
			}else{
				showDetailById(currFHD._id);
			}
		});		
	}
	$("#baocun").click(baocun);
	$("#fangqi").click(function(){
		showDetailById(currFHD._id);
	});
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
		huowu.yangban = dd.yangban;
		tr_huowu.data("huowu",huowu);//TODO 这个huowu藏了yangban
//		tr_huowu.data("dingdan",dd);
		tr_huowu.find("#dingdanhao").text(huowu.id);
		tr_huowu.find("#kehu1").text(dd.kehu);
		tr_huowu.find("#yangban1").html(formatYangban(dd.yangban));
		tr_huowu.find("#guige1").text(huowu.guige);
		tr_huowu.find("#shuliang1").text(huowu.shuliang);
		tr_huowu.find("#danwei1").text(huowu.danwei);
		tr_huowu.find("#danjia1").text(huowu.danjia);
		tr_huowu.find("#jine1").text(round(huowu.shuliang*huowu.danjia,2));
		tr_huowu.find("#shanchudingdanhuowu").show();
		currHuowu.find("#tr_tianjiadingdanhuowu").before(tr_huowu).hide();
		currHuowu.find("#mx_yangban").html(formatYangban(dd.yangban));
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
				tr.find("#td_yangban").html(formatYangban(dingdan.yangban));
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
	function cz_shanchu(){
		postJson("fahuodan.php",{caozuo:"shanchu",_id:currFHD._id},function(res){
			if(res.err){
				tip($("#cz_shanchu"),res.err,1500);
			}else{
				listfahuodan(0);
			}
		});
	}
	$("#cz_shanchu").click(cz_shanchu);
	function cz_jiedan(){
		postJson("fahuodan.php",{caozuo:"jiedan",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_jiedan").click(cz_jiedan);
	function cz_shenqingduidan(){
		if("none" == $("#bianji").css("display")){
			tip($(this),"请先退出编辑状态！",1500);
			return;
		}
		if(!currFHD.huowu || currFHD.huowu.length<=0){
			tip($(this),"货物不能留空！",1500);
			return;
		}
		postJson("fahuodan.php",{caozuo:"shenqingduidan",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_shenqingduidan").click(cz_shenqingduidan);
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
	function cz_huitui(){
		postJson("fahuodan.php",{caozuo:"huitui",_id:currFHD._id,zhuangtai:currFHD.zhuangtai},function(res){
			if(res.err){
				tip(that,res.err,1500);
			}else{
				showDetailById(currFHD._id);
			}
		});
	}
	$("#cz_huitui").click(cz_huitui);
	function cz_duidan(){
		postJson("fahuodan.php",{caozuo:"duidan",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_duidan").click(cz_duidan); 
	function cz_shouhuo(){
		postJson("fahuodan.php",{caozuo:"shouhuo",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_shouhuo").click(cz_shouhuo);
	function cz_zhuanggui(){
		postJson("fahuodan.php",{caozuo:"zhuanggui",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_zhuanggui").click(cz_zhuanggui);
	function cz_shenqingshenjie(){
		if((currFHD.liushuizhang && currFHD.liushuizhang.yifu) || currFHD.zhuangtai=="作废"||currFHD.zongjine==0){
			postJson("fahuodan.php",{caozuo:"shenqingshenjie",_id:currFHD._id},function(res){
				showDetailById(currFHD._id);
			});
		}else{
			tip($(this),"必须先付款才能申请审结！",1500);
		}
	}
	$("#cz_shenqingshenjie").click(cz_shenqingshenjie);
	function cz_shenjie(){
		postJson("fahuodan.php",{caozuo:"shenjie",_id:currFHD._id},function(res){
			showDetailById(currFHD._id);
		});
	}
	$("#cz_shenjie").click(cz_shenjie);

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
	$("#fhd_gonghuoshang").change(function(){
		setYanhuodizhi();
		currFHD.shoukuanzhanghu="";
		$("#fhd_shoukuanzhanghu").html("&nbsp;");
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
		var ghs = $("#th_gonghuoshang").val().trim();
		if("" != ghs && "供货商" != ghs){
			ret.gonghuoshang = $("#th_gonghuoshang").data("ghsId");
		}
		var zt = $("#th_zhuangtai").val().trim();
		if("" != zt && "状态" != zt){
			ret.zhuangtai = zt;
		}
		var fk = $("#th_fukuan").val().trim();
		if("" != fk && "付款" != fk){
			ret.fukuan = fk;
		}
		return ret;
	}
	function getOperator(fhd){
		var ret = {ludanzhe:"",duidanzhe:"",fuhezhe:""};
		var lc = fhd.liucheng[fhd.liucheng.length-1];
		if(lc.dongzuo == "审结"){
			ret.fuhezhe = getUserName(lc.userId);
		}
		if(fhd.ludanzhe){
			ret.ludanzhe = getUserName(fhd.ludanzhe);
		}
		if(fhd.duidanzhe){
			ret.duidanzhe = getUserName(fhd.duidanzhe);
		}
		return ret;
	}
	//列出原稿
	function listfahuodan(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);

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
				if(fahuodan.liushuizhang){
					if(fahuodan.liushuizhang.yifu){
						tr.find("#td_fukuan").text("已付款");
					}else{
						tr.find("#td_fukuan").text("已记账");
					}
				}
				
				var color = toggle("#fff","#eee");
				tr.css("background-color",color);
				tr.find("#td_bianhao").css("background-color",statusColor(fahuodan.zhuangtai,color));
				//if(fahuodan.zhuangtai == "作废"){
				if(inLiucheng(fahuodan.liucheng,"作废")){
					tr.css("text-decoration","line-through");
				}
				$("#fahuodantable").append(tr);
			});
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else{				
				//调整左侧宽度以便显示完整的列表
				$("#tableheader").click();
				if(fahuodans.length>0){
					$(".ui-layout-center").show();
					$(".tr_fahuodan").get(0).click();
				}else{
					$(".ui-layout-center").hide();
				}
			}
			if(offset<=0){
				$("#prevPage").css("color","gray");
			}else{
				$("#prevPage").css("color","blue");
			}
			if(fahuodans.length<limit){
				$("#nextPage").css("color","gray");
			}else{
				$("#nextPage").css("color","blue");
			}
		});
	}

	function zonge(){
		jisuanzonge();
	}
	function link_liushui(){
		if(currFHD.liushuizhang){
			window.open("../liushuizhang/liushuizhang.html?showId="+currFHD.liushuizhang._id,"_blank");
		}
	}
	function readOnly(){
		editing = false;
		$(".myinput").removeAttr("contenteditable");
		$("#fhd_shoukuanzhanghu").unbind("click");
		$("#fhd_gonghuoshang").unbind("click").click(function(){
			if(currFHD.gonghuoshang){
				window.open("../contact/contact.html?showId="+currFHD.gonghuoshang._id,"_blank");
			}
		});
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
		}else{
			$("#bianji").hide();
		}
		if(kechaifen){
			$("#chaifen").show();
		}else{
			$("#chaifen").hide();
		}
		$("#fangqi").hide();$("#baocun").hide();
	}
	
	function edit(event){
		editing = true;
		$(".myinput").attr("contenteditable","true");
		$("#fhd_zhuanzhangliushui").removeAttr("contenteditable");		
		$("#fhd_gonghuoshang").removeAttr("contenteditable");		
		$("#fhd_shoukuanzhanghu").removeAttr("contenteditable");
		$(".zhu_ctnr").show();$(".zhu").show();
		$("#fhd_yanhuodizhi").removeAttr("readonly");
		$(".plainInput").removeAttr("readonly");
		$("#fahuodanmingxi").find(".plainBtn").show();
		$("#fhd_shoukuanzhanghu").click(sel_zhanghu);
 		$("#fhd_gonghuoshang").unbind("click").click(function(event){
 			var limit = 20;
	 		setSelector(event,function(page,option,callback1){
	 				postJson("../contact/lianxiren.php",{caozuo:"chashangjia",offset:page*limit,limit:limit,option:option},function(vendors){
	 					callback1(vendors);
	 				});
	 			},["_id","mingchen"],function(vendor){
	 				$(this).text(vendor.mingchen)
	 				$(this).data("shangjia",vendor);
	 				currFHD.gonghuoshang = {_id:vendor._id,mingchen:vendor.mingchen,quyu:vendor.quyu};
	 				$(this).change();
	 			},"",function(){//清空
	 				currFHD.gonghuoshang = undefined;
	 				$("#fhd_gonghuoshang").html("&nbsp;");
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
		if(fhd.liushuizhang){
			$("#tb_liushuizhangliucheng").show();
			$("#liushuizhangliucheng").show().liushuizhangliucheng(fhd.liushuizhang.liucheng);
		}else{
			$("#tb_liushuizhangliucheng").hide();
		}
		$("#fhd_bianhao").val(fhd._id);
		if(fhd.liushuizhang){
			if(fhd.liushuizhang.yifu){
				$("#fhd_zhuanzhangliushui").text(fhd.liushuizhang.shoukuanfangname+"("+fhd.liushuizhang.jine+"元)");
			}else{
				if(fhd.liushuizhang.shoukuanfangname){
					$("#fhd_zhuanzhangliushui").text(fhd.liushuizhang.shoukuanfangname+"(未付款！)");
				}else{
					$("#fhd_zhuanzhangliushui").text("(未付款！)");
				}
			}
		}else{
			$("#fhd_zhuanzhangliushui").html("");
		}
		$("#fhd_gonghuoshang").html(currFHD.gonghuoshang?currFHD.gonghuoshang.mingchen:"&nbsp;");
		$("#fhd_shoukuanzhanghu").html(currFHD.shoukuanzhanghu?currFHD.shoukuanzhanghu:"&nbsp;");
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
			hwDiv.find("#mx_yangban").html(formatYangban(huowu.yangban));
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
					if(mx.yanhuodan.zhuangtai == "已通过"){
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
				tr_huowu.find("#yangban1").html(formatYangban(dd.yangban));
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
		if(getUrl().showId){
			$("#yuandan_ctr_ctr").show();
			$("#yuandan_ctr_ctr").html(currFHD.neirong?currFHD.neirong:"<center>暂无原单</center>");
			$("#yuandan_ctr_ctr img").css("max-width",$(window).width()/2+"px");
		}
	}
	
	function showDetailById(_id){
		kebianji = false;
		kechaifen = false;
		editing = false;
		postJson("fahuodan.php",{caozuo:"getbyid",_id:_id},function(fhd){//这里是把关联的货物放到一起了
			showDetail(fhd);
		});
	}
	jQuery.fn.liushuizhangliucheng = function(liucheng){//显示流水账流程。仅显示，不能操作，要在流水账管理界面操作。
		var that = this.empty();
		each(liucheng,function(n,item){
			var tmpl = liuchengItem.clone(true);
			$("#lc_bianhao",tmpl).text(n+1);
			var usr = getUser(item.userId);
			$("#lc_touxiang",tmpl).attr("src",usr.photo);
			$("#lc_mingchen",tmpl).text(usr.user_name);
			$("#lc_dongzuo",tmpl).text(item.dongzuo);
			$("#lc_shijian",tmpl).text(new Date(item.time*1000).format("yyyy-MM-dd hh:mm"));
			that.append(tmpl);
		});
	}
	jQuery.fn.liucheng = function(theUser,fahuodan){
		kechaifen = false;
		kebianji = false;
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
				("#lc_tr_panel",tmpl).attr("title","发货单原件已经被上传，等待接单！");
				if((fahuodan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == item.userId){
						$("#cz_shanchu",caozuoItem).show();
					}
					$("#cz_jiedan",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("接单" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","正在录入发货单！");
				if(!inLiucheng(fahuodan.liucheng,"审结")){
					if(fahuodan.ludanzhe == theUser._id){
						if((fahuodan.liucheng.length - 1) == n){
							kebianji = true;							
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
							$("#cz_shenqingduidan",caozuoItem).show();
							$("#cz_zuofei",caozuoItem).show();
							$("table",tmpl).append(caozuoItem);
						}
					}else{						
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						$("#cz_jieguan",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}
				}
			}else if("申请对单" == item.dongzuo){
				kebianji = false;
				kechaifen = true;
				("#lc_tr_panel",tmpl).attr("title","已完成对发货单的录入，申请对单！");
				if((fahuodan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == fahuodan.ludanzhe){
						$("#cz_huitui",caozuoItem).show();
					}
					if(theUser._id != item.userId){
						$("#cz_duidan",caozuoItem).show();
					}
					$("table",tmpl).append(caozuoItem);
				}
			}else if("对单" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已完成对单，等待发货！");
				if((fahuodan.liucheng.length - 1) == n){
					if(theUser._id == fahuodan.ludanzhe){
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						$("#cz_shouhuo",caozuoItem).show();
						$("table",tmpl).append(caozuoItem); 
					}else if(theUser._id == item.userId && !currFHD.liushuizhang){
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						$("#cz_huitui",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}
				}
			}else if("收货" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已收货，可以装柜！");
				if((fahuodan.liucheng.length - 1) == n && theUser._id == fahuodan.ludanzhe){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_huitui",caozuoItem).show();
					$("#cz_zhuanggui",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("装柜" == item.dongzuo){
				kechaifen = false;
				("#lc_tr_panel",tmpl).attr("title","货物已装柜，如果已经付款则可以申请审结！");
				if((fahuodan.liucheng.length - 1) == n && theUser._id == fahuodan.ludanzhe){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_huitui",caozuoItem).show();
					$("#cz_shenqingshenjie",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("作废" == item.dongzuo){
				kechaifen = false;
				("#lc_tr_panel",tmpl).attr("title","该单已作废，但还需要申请审结！");
				if((fahuodan.liucheng.length - 1) == n && theUser._id == fahuodan.ludanzhe){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_huitui",caozuoItem).show();
					$("#cz_shenqingshenjie",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("申请审结" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","货等待他人审结！");
				if((fahuodan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == fahuodan.ludanzhe){
						$("#cz_huitui",caozuoItem).show();
					}
					if(theUser._id != item.userId){
						$("#cz_shenjie",caozuoItem).show();
					}
					$("table",tmpl).append(caozuoItem);
				}
			}else if("审结" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","该发货单已被处理完成，经检查无误！");
				if(theUser._id == item.userId){
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
	
		 	
	var cmd = getUrl().cmd?getUrl().cmd:"";
	if("daijiedan" == cmd){
		$('#currLocation', window.parent.document).text("发货单/待接单");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else if("daiduidan" == cmd){
		$('#currLocation', window.parent.document).text("发货单/待对单");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else if("daishenjie" == cmd){
		$('#currLocation', window.parent.document).text("发货单/待审结");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else if("wodedailudan" == cmd){
		$('#currLocation', window.parent.document).text("发货单/我的待录单");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else if("wodedaiduidan" == cmd){
		$('#currLocation', window.parent.document).text("发货单/我的待对单");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else if("wodeyiduidan" == cmd){
		$('#currLocation', window.parent.document).text("发货单/我的已对单");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else if("wodedaifukuan" == cmd){
		$('#currLocation', window.parent.document).text("发货单/我的待付款");
		$("#th_fukuan").attr("readonly","readonlly");
	}else if("wodedaishenjie" == cmd){
		$('#currLocation', window.parent.document).text("发货单/我的待审结");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else{
		$("#shangchuanfahuodan").show();
		$('#currLocation', window.parent.document).text("发货单/查询");
	}
	
	if(getUrl().showId){
		$("#fahuodanliebiao_ctr").hide();
		$("#yuandan_ctr_ctr").show();
		showDetailById(getUrl().showId);
	}else{
		listfahuodan(0,getUrl().showId);
	}

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
	}).dblclick(function(){layout.toggle("west");clearSelection();});
});