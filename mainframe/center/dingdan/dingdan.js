$(function(){
	/*
	接单后把原来录单员录的结果写到日志，以备翻查。
	接单后允许增删规格，修改规格说明，也就是可以对订单做任意修改
	备注是要打印给供货商看的，留言是内部看的
	每个规格对应若干个发货单，还有“欠”数
	
	
	{	_id:"DD131008.1",
		liucheng:[{userId:3,dongzuo:"录单",time:1322}],
		mandan:true,
		yuangao:YG131008.1,//系统原稿编号
		taiguoyuangao:"xx",//泰国原稿编号
		taiguobianhao:3,//该订单在原始的泰国原稿中的序号（审录单时有用）
		zhuangtai:"录单",//录单 审核 接单（作废 接管 慢单/取消慢单） 下单申请（回退） 下单审核（打印 回退） 下单（回退） 发货 审结（回退） 作废（审结 回退） 
		kehu:"C",
		taiguoyangban:"xx",//从泰国原稿抄过来的，打印给泰国的柜单时有用
		yangban:{_id:"YB223",taiguoxinghao:"xxx",zhongguoxinghao:"",...},
		gonghuoshang:{_id:"SJ131110",mingchen:"大大",quyu:"xxx"},//计划装柜单的时候需要按区域查（方便装车？）
		lianxiren:{_id:12,mingchen:"xx"},
		gendanyuan:3,
		xiadanshijian:13223,//可以不要。这个时间出现在列表里，方便看出是否下单。但如果用颜色来区分状态，就没必要在列表里出现下单时间
		beizhu:"xxx",
		fudan:"fudanid",
		zidan:["zidanid"],//这个其实也可以不要，用父单做关联即可
		huowu:[{id:"xxx",taiguoguige:"xx",guige:"xxx",shuliang:23,danwei:"KG"}...]}		
	*/
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	addQuyulist();
	function piliangjiedan(){
		var ids = [];
		$(".tr_dingdan").each(function(i){
			if($(this).find(".jiedan input").attr("checked")){
				ids.push($(this).find("#td_bianhao").text());
			}
		});
		if(ids.length == 0){
			tip($("#th_jiedan"),"请先选择订单",1500);
			return;
		}
		postJson("dingdan.php",{caozuo:"piliangjiedan",_ids:ids},function(res){
			if(res.number){
				tip($("#th_jiedan"),"成功接单"+res.number+"张",1500);
				listDingdan(0);
			}else{
				tip($("#th_jiedan"),"接单失败！",1500);
				listDingdan(0);
			}			
		});
	}
	$("#th_jiedan").click(piliangjiedan);
	$("#th_quyu").attr("list","quyulist");
	$("#th_quyu").bind("input",function(){listDingdan(0);});
	$("#th_man").bind("input",function(){listDingdan(0);});
	$("#th_bianhao").datepicker().change(function(){
		$(this).val("DD"+date2id($(this).val()));
		listDingdan(0);
	});
	
	$("#dd_yuangao").click(function(){
		var yg = $(this).text().trim();
		if(yg == ""){
			return;
		}
		var showId = yg.substring(0,yg.indexOf("/"));
		window.open("../yuangao/yuangao.html?showId="+showId,"_blank")
	});
	//var kehus = getKehus();
	//kehus.unshift("客户");
	//$("#th_kehu").myselector(kehus).bind("input",function(){listDingdan(0);});
	$("#th_kehu").bind("input",function(){listDingdan(0);});
	$("#th_taiguodanhao").change(function(){listDingdan(0);});
	var users = getUsers();users.unshift({"user_name":"跟单员","_id":"-1"});
	$("#th_gendanyuan").myselector(users,"user_name").bind("input",function(){
		listDingdan(0);
	});
 
	$("#th_zhuangtai").myselector(["状态","录单","审核","接单","下单申请","下单审核","下单","发货","结单","作废"]).bind("input",function(){listDingdan(0);});
	$("#fangqi").click(function(){
		showDetailById(currDD._id);
	});
	$("#beizhuzhaiyao").click(function(){$("#zhankaibeizhu").click()});
	$("#zhankaibeizhu").click(function(){
		$("#beizhu").show();
		$(this).hide();
		$("#yincangbeizhu").show();
		$("#beizhuzhaiyao").hide();
	});
	$("#yincangbeizhu").click(function(){
		$("#beizhu").hide();
		$(this).hide();
		$("#zhankaibeizhu").show();
		$("#beizhuzhaiyao").show();
	});
	//翻页处理
	$("#prevPage").click(function(){
		listDingdan($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listDingdan($("#pager").data("offset")+1);
	});
	//设置头部点击处理（放到当前面板） 
	$("#tableheader").click(function(){
		layout.sizePane("west",$("#dingdantable").width()+20);
	}); 
	$("#detailHandle").click(function(){
		layout.sizePane("west",$("body").width()-$(this).width()-100);
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
	function sel_dingdan(){
		showDetailById($(this).data("_id"));
		$(".tr_selected").removeClass("tr_selected");
		$(this).addClass("tr_selected");
	}
	$(".tr_dingdan").click(sel_dingdan);
	function sel_lianxiren(event){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("dingdan.php",{"caozuo":"lianxiren",offset:page*limit,limit:limit,option:option.trim()},function(lianxirens){
					callback(lianxirens);
				});
			},["_id","taiguoxinghao","mingchen","shangjia.mingchen"],function(lianxiren){//选择回调
				$("#dd_lianxiren").val(lianxiren.mingchen);
				currDD.lianxiren = {_id:lianxiren._id,mingchen:lianxiren.mingchen};
			},"",function(){//清除回调
				$("#dd_lianxiren").val("");
				currDD.lianxiren = undefined;
			});
	}
	function sel_yangban(event){//订单明细中选择样板
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("yangban.php",{offset:page*limit,limit:limit,option:option},function(yangbans){
					callback(yangbans);
				});
			},["_id","taiguoxinghao","zhongguoxinghao","shangjia.mingchen","zhuangtai"],function(yangban){
				currDD.yangban = yangban;
				currDD.gonghuoshang = yangban.shangjia;
				$(this).val(yangban.zhongguoxinghao+"("+(yangban.taiguoxinghao?yangban.taiguoxinghao:"-")+"/"+(currDD.taiguoyangban?currDD.taiguoyangban:"-")+")");
				$("#dd_gonghuoshang").val(yangban.shangjia.mingchen);
				$(".unit").text(yangban.danwei);
			},(currDD.yangban)?currDD.yangban.zhongguoxinghao:"");
	}
	function sel_yangban2(event){//左侧列表过滤选择样板
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("yangban.php",{offset:page*limit,limit:limit,option:option},function(yangbans){
					callback(yangbans);
				});
			},["_id","taiguoxinghao","zhongguoxinghao","shangjia.mingchen","zhuangtai"],function(yangban){//selected callback
				$("#th_yangban").val(yangban.taiguoxinghao);
				listDingdan(0);
			},"",function(){//清空callback
				$("#th_yangban").val("样板");
				listDingdan(0);
			});
	}
	$("#th_yangban").click(sel_yangban2);
	function sel_gonghuoshang(event){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("dingdan.php",{caozuo:"shangjia",offset:page*limit,limit:limit,option:option.trim().toUpperCase()},function(gonghuoshangs){
					callback(gonghuoshangs);
				});
			},["_id","mingchen","dianhua","dizhi"],function(gonghuoshang){
				$("#th_gonghuoshang").val(gonghuoshang.mingchen);
				$("#th_gonghuoshang").data("ghsId",gonghuoshang._id);
				listDingdan(0);
			},"",function(){
				$("#th_gonghuoshang").val("供货商");
				listDingdan(0);
			});
	}
	$("#th_gonghuoshang").click(sel_gonghuoshang);
	function sel_danjia(event){
		if(!currDD.yangban._id){
			tip($(this),"请先选定样板！",1500);
			return;
		}
		
		var parent = $(this).parent().parent();
		
		if(parent.find("#mx_danwei").val().trim() != currDD.yangban.danwei){
			tip($(this),"单位必须与样板单位一致！",1500);
			return;
		} 
		list(event,currDD.yangban.jiage,function(obj){return obj.beizhu+" "+obj.zhi+"元";},function(ret){
			parent.find("#mx_danjia").val(ret.zhi); 
			parent.find("#mx_jine").text(""+round(parseFloat(ret.zhi)*parseFloat(parent.find("#mx_shuliang").val()),2));
			huizong();
		});
	}
	$(".mx_danjia").click(sel_danjia);
	function zengjiahuowu(){
			var huowu = tmpl_huowu.clone(true);
			huowu.find("#mx_xuhao").text($(".tmpl_huowu").length);
			huowu.find("#mx_danwei").val($("#unit").text());
			$("#new_huowu_item").before(huowu);
	}
	$("#zengjiahuowu").click(zengjiahuowu);
	$("#shanchuhuowu").click(function(){
		$(this).parents("tr").remove();
		$(".tmpl_huowu").each(function(i){
			$(this).find("#mx_xuhao").text(i);
		})
		huizong();
	});
	function huizong(){
		var zongliang=0;
		var jine=0;
		$(".tmpl_huowu").each(function(index){
			var f = parseFloat($(this).find("#mx_shuliang").val());
			if(!isNaN(f)){
				zongliang = zongliang+f;
			}
			f = parseFloat($(this).find("#mx_jine").text());
			if(!isNaN(f)){
				jine = jine+f;
			}
		});		
		$("#zongliang").text(round(zongliang,2));
		$("#zonge").text(round(jine,2));
	} 
	function shuliangchange(){
		var parent = $(this).parents("tr");
		var shuliang = parseFloat($(this).val());
		var danjia = parseFloat(parent.find("#mx_danjia").val());
		if(!isNaN(shuliang)&& !isNaN(danjia)){
			parent.find("#mx_jine").text(round(shuliang*danjia,2));
		}
		huizong();
	}
	$("#mx_shuliang").change(shuliangchange);
	$("#bianji").click(editable);
	
	function baocun(){ 
		//form2obj
		var hws = [];
		var ret = true;
		$(".tmpl_huowu").each(function(index){
			//规格 数量 单价 不能为空
			var huowu = {};
			huowu.guige = $(this).find("#mx_guige").text().trim();
			if("" == huowu.guige){
				tip($(this).find("#mx_guige"),"必须填写规格！",1500);
				ret = false;
				return false;
			}
			huowu.shuliang = $(this).find("#mx_shuliang").val().trim();
			if("" == huowu.shuliang){
				tip($(this).find("#mx_shuliang"),"必须填写数量！",1500);
				ret = false;
				return false;
			}
			huowu.danjia = $(this).find("#mx_danjia").val().trim();
			if("" == huowu.danjia){
				tip($(this).find("#mx_danjia"),"必须填写单价！",1500);
				ret = false;
				return false;
			}
			huowu.danwei = $(this).find("#mx_danwei").val();
			huowu.id=$(this).data("id");
			hws.push(huowu);
		});
		if(ret == false){
			return;
		}
		var maxHwId=1;
		each(hws,function(i,hw){
			var j = hwId2Int(hw.id);
			if(maxHwId<=j){
				maxHwId = j +1;
			}
		}); 
		each(hws,function(i,hw){
			if(!hw.id){
				hw.id = currDD._id+"hw"+maxHwId;
				maxHwId ++;
			}
		});
		currDD.huowu = hws;
		currDD.beizhu = beizhuEditor.editorVal();
		beizhuEditor.editorVal(currDD.beizhu);
		if(currDD.beizhu.trim()!=""){
			$("#beizhuzhaiyao").html(currDD.beizhu.truncate(40)+"<span class='plainBtn'>...[+]</span>");
		}else{
			$("#beizhuzhaiyao").empty();
		}
		postJson("dingdan.php",{caozuo:"baocun",dingdan:currDD},function(){
			readonly();
		});
	}
	$("#baocun").click(baocun);
	var beizhuEditor = $("#beizhu").myeditor(700,300);
	beizhuEditor.editorReadonly();

	function cz_jiedan(){
		//更改状态，作为留言记录订单内容；
		postJson("dingdan.php",{caozuo:"jiedan",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_jiedan").click(cz_jiedan);
	function cz_jieguan(){
		postJson("dingdan.php",{caozuo:"jieguan",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_jieguan").click(cz_jieguan);
	function cz_mandan(){
		postJson("dingdan.php",{caozuo:"mandan",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_mandan").click(cz_mandan);
	function cz_xiadanshenhe(){
		postJson("dingdan.php",{caozuo:"xiadanshenhe",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_xiadanshenhe").click(cz_xiadanshenhe);
	function cz_shenqingshenjie(){
		postJson("dingdan.php",{caozuo:"shenqingshenjie",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_shenqingshenjie").click(cz_shenqingshenjie);
	function cz_xiadanshenqing(){
		postJson("dingdan.php",{caozuo:"xiadanshenqing",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_xiadanshenqing").click(cz_xiadanshenqing);
	function cz_quxiaomandan(){
		postJson("dingdan.php",{caozuo:"quxiaomandan",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});	
	}
	$("#cz_quxiaomandan").click(cz_quxiaomandan);
	function cz_ludan(){
		postJson("dingdan.php",{caozuo:"ludan",_id:currDD._id},function(res){
			showDetailById(res.id);
		});
	}
	$("#cz_ludan").click(cz_ludan);
	function fudan(){
		showDetailById($(this).text());
	}
	$("#fudan").click(fudan);
	function cz_xiadan(){
		if(editing){
			tip($(this),"请先退出编辑状态！",1500);
			return;
		}
			var ret = true;
		$(".tmpl_huowu").each(function(index){
			//规格 数量 单价 不能为空
			var huowu = {};
			huowu.guige = $(this).find("#mx_guige").val().trim();
			if("" == huowu.guige){
				tip($(this).find("#mx_guige"),"必须填写规格！",1500);
				ret = false;
				return false;
			}
			huowu.shuliang = $(this).find("#mx_shuliang").val().trim();
			if("" == huowu.shuliang){
				tip($(this).find("#mx_shuliang"),"必须填写数量！",1500);
				ret = false;
				return false;
			}
			huowu.danjia = $(this).find("#mx_danjia").val().trim();
			if("" == huowu.danjia){
				tip($(this).find("#mx_danjia"),"必须填写单价！",1500);
				ret = false;
				return false;
			}
		});
		if(ret == false || "" == $("#zonge").text().trim() || $("#dd_gonghuoshang").val().trim() == "" || $("#dd_yangban").val().trim() == ""){
			tip($(this),"订单不完整，无法下单！",1500);
			return;
		}
		postJson("dingdan.php",{caozuo:"xiadan",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_xiadan").click(cz_xiadan);
	function cz_shenjie(){
		postJson("dingdan.php",{caozuo:"shenjie",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_shenjie").click(cz_shenjie);
	function cz_fahuo(){
		postJson("dingdan.php",{caozuo:"fahuo",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});		
	}
	$("#cz_fahuo").click(cz_fahuo);
	function cz_huitui(){
		var that = $(this);
		postJson("dingdan.php",{caozuo:"huitui",_id:currDD._id,zhuangtai:currDD.zhuangtai},function(res){
			if(res.err){
				tip(that,res.err,1500);
			}else{
				showDetailById(currDD._id);
			}
		});
	}
	$("#cz_huitui").click(cz_huitui);
	function cz_dayin(){
		window.open("dayin.html?showId="+currDD._id,"_blank");
	}
	$("#cz_dayin").click(cz_dayin);
	function cz_zuofei(){
		postJson("dingdan.php",{caozuo:"zuofei",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_zuofei").click(cz_zuofei);
	function cz_dengban(){
		postJson("dingdan.php",{caozuo:"dengban",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_dengban").click(cz_dengban);
	function cz_zidan(){
		postJson("dingdan.php",{caozuo:"zidan",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_zidan").click(cz_zidan);
	function showLianxiren(){
		if(currDD.lianxiren && currDD.lianxiren._id){
			window.open("../contact/contact.html?showId="+currDD.lianxiren._id,"_blank");
		}
	}
	function showYangban(){
		if(currDD.yangban && currDD.yangban._id){
			window.open("../sample/sample.html?showId="+currDD.yangban._id,"_blank");
		}
	}
	
	function showGonghuoshang(){
		if("" == $("#dd_gonghuoshang").val().trim()){
			$("#dd_gonghuoshang").click(function(){tip($(this),"请通过样板指定供货商！",1500);});
			return;
		}
		if(currDD.gonghuoshang && currDD.gonghuoshang._id){
			window.open("../contact/contact.html?showId="+currDD.gonghuoshang._id,"_blank");
		}
	}
	$("#dd_gonghuoshang").click(showGonghuoshang);
	$("#fhd_span").click(function(){
		window.open("../fahuodan/fahuodan.html?showId="+$(this).text(),"_blank");
	});
	$("#yhd_span").click(function(){
		window.open("../yanhuodan/yanhuodan.html?showId="+$(this).text(),"_blank");
	});
	function getHuowu(){
		postJson("dingdan.php",{caozuo:"huowu",_id:currDD._id},function(huowus){
			var fhds = [];
			var yhds = [];
			var zgds = [];
			each(huowus,function(i,hw){
				if(hw.fahuodan && fhds.indexOf(hw.fahuodan)<0){
					fhds.push(hw.fahuodan);
				}
				if(hw.yanhuodan && yhds.indexOf(hw.yanhuodan._id)<0){
					yhds.push(hw.yanhuodan._id);
				}
				if(hw.zhuangguidan && zgds.indexOf(hw.zhuangguidan)<0){
					zgds.push(hw.zhuangguidan);
				}
			});
			
			if(fhds.length>0){
				$("#fahuodan_out").show().html("发货单：");
				each(fhds,function(i,fhd){
					var fhd_1 = fhd_span.clone(true);
					fhd_1.text(fhd);
					$("#fahuodan_out").append(fhd_1).append("&nbsp;");
				});
				if(yhds.length>0){
					$("#fahuodan_out").append("，验货单：");
					each(yhds,function(i,yhd){
						var yhd_1 = yhd_span.clone(true);
						yhd_1.text(yhd);
						$("#fahuodan_out").append(yhd_1).append("&nbsp;");
					});
				}
				if(zgds.length>0){
					$("#fahuodan_out").append("，装柜单：");
					each(zgds,function(i,zgd){
						var zgd_1 = zgd_span.clone(true);
						console.log(zgd);
						zgd_1.text(zgd);
						$("#fahuodan_out").append(zgd_1).append("&nbsp;");
					});
				}
			}else{
				$("#fahuodan_out").hide();
			}
		});
	}
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	function statusColor(status,color){
		//录单 审核 接单（作废 接管 慢单/取消慢单） 下单申请（回退） 下单审核（打印 回退） 下单（回退） 发货 审结（回退） 作废（审结 回退） 
		if(status == "录单"){//浅蓝
			return "#ADD8E6";
		}
		if(status == "审核"){//绿色
			return "#7CFC00";
		}
		if(status == "接单"){//红色
			return "#FF4500";
		}
		if(status == "下单申请"){//棕色
			return "#FF6347";
		}
		if(status == "下单审核"){//粉红
			return "#FFB6C1";
		}
		if(status == "下单"){//黄色
			return "FFFF00";
		}
		if(status == "发货"){//赭
			return "#DEB887";
		}
		if(status == "作废"){//赭
			return "#DEB887";
		}
		if(status == "审结"){
			return color;
		}
	}
	
	function hwId2Int(hwId){
		if(!hwId){
			return 0;
		}
		return parseInt(hwId.substr(hwId.lastIndexOf("hw")+2));
	}
	function editable(){
		editing = true;
		$("#bianji").hide();
		$(".myinput").attr("contenteditable","true");
		$("#dd_yangban").unbind("click").click(sel_yangban);		
		$("#dd_lianxiren").unbind("click").click(sel_lianxiren);
		$(".mx_danjia").click(sel_danjia);
		$(".mx_danwei").removeAttr("readonly");
		$("#baocun").show();
		$("#fangqi").show();
		$("#new_huowu_item").show();
		$(".delete_huowu").show();
		$(".editable").removeAttr("readonly");
		beizhuEditor.editorWritable();
	}
	function readonly(){
		editing = false;
		if(kebianji){
			$("#bianji").show();
		}
		$(".myinput").removeAttr("contenteditable");
		$("#dd_yangban").unbind("click").click(showYangban);
		$("#dd_lianxiren").unbind("click").click(showLianxiren);		
		$(".mx_danwei").attr("readonly","readonly");
		$(".mx_danjia").unbind("click");
		$("#baocun").hide();
		$("#fangqi").hide();
		$("#new_huowu_item").hide();
		$(".delete_huowu").hide();
		$(".editable").attr("readonly",true);
		beizhuEditor.editorReadonly();
	}
	//解释查询条件
	function getOptions(){
		var ret = {};
		var bh = $("#th_bianhao").val().trim();
		if("" != bh && "编号" != bh){
			ret.bianhao = bh+"0";
		}
		var dh = $("#th_taiguodanhao").val().trim();
		if("" != dh && "泰国单号" != dh){
			ret.taiguodanhao = dh;
		}
		var kh = $("#th_kehu").val().trim();
		if("" != kh && "客户" != kh){
			ret.kehu = kh;
		}
		var yb = $("#th_yangban").val().trim();
		if("" != yb && "样板" != yb){
			ret.yangban = yb;
		} 
		var zt = $("#th_zhuangtai").val().trim();
		if("" != zt && "状态" != zt){
			ret.zhuangtai = zt;
		}
		var gdy = $("#th_gendanyuan").val().trim();
		if("跟单员" != gdy){
			ret.gendanyuan = getUserIdByName(gdy);
		}
		var ghs = $("#th_gonghuoshang").val().trim();
		if("" != ghs && "供货商" != ghs){
			ret.gonghuoshang = $("#th_gonghuoshang").data("ghsId");
		}
		var quyu = $("#th_quyu").val().trim();
		if("" != quyu && "区域" != quyu){
			ret.quyu = quyu;
		}
		var man = $("#th_man").val().trim();
		if("是" == man){
			ret.man = true;
		}else if("否" == man){
			ret.man = false;
		}
		return ret;
	}
		//列出原稿
	function listDingdan(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var option = $.extend({cmd:cmd},getOptions());
		postJson("dingdans.php",{offset:offset*limit,limit:limit,option:option},function(dingdans){
			$("#dingdantable .tr_dingdan").remove();
			each(dingdans,function(n,dingdan){
				tr = tr_dingdan.clone(true);
				tr.data("_id",dingdan._id);
				tr.find("#td_bianhao").text(dingdan._id);
				tr.find("#td_taiguodanhao").text((dingdan.taiguoyuangao?dingdan.taiguoyuangao:"-")+"("+(dingdan.taiguobianhao?dingdan.taiguobianhao:"-")+")");
				tr.find("#td_kehu").text(dingdan.kehu);
				if(dingdan.yangban){
					var yb = "("+(dingdan.taiguoyangban?dingdan.taiguoyangban:"-")+")";
					if(dingdan.yangban.zhongguoxinghao){
						tr.find("#td_yangban").text(dingdan.yangban.zhongguoxinghao+yb);
					}else{
						tr.find("#td_yangban").text("-"+yb);
					}
				}
				tr.find("#td_zhuangtai").text(dingdan.zhuangtai);				
				tr.find("#td_gendanyuan").text(dingdan.gendanyuan?getUser(dingdan.gendanyuan).user_name:"");
				tr.find("#td_gonghuoshang").text(dingdan.gonghuoshang?dingdan.gonghuoshang.mingchen:"");
				//tr.find("#td_xiadanriqi").text(dingdan.xiadanshijian?new Date(dingdan.xiadanshijian*1000).format("yy/MM/dd hh:mm"):"");
				tr.find("#td_quyu").text(dingdan.gonghuoshang?dingdan.gonghuoshang.quyu:"");
				tr.find("#td_man").text(dingdan.mandan?"慢":"");
				
				var color = toggle("#fff","#eee");
				tr.css("background-color",color);
				tr.find("#td_bianhao").css("background-color",statusColor(dingdan.zhuangtai,color));
				if(dingdan.zhuangtai == "作废"){
					tr.css("text-decoration","line-through");
				}
				$("#dingdantable").append(tr);
			});
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else{
				//调整左侧宽度以便显示完整的列表
				$("#tableheader").click();
				if(dingdans.length>0){
					$(".ui-layout-center").show();
					$(".tr_dingdan").get(0).click();
				}else{
					$(".ui-layout-center").hide();
				}
			}
			if(offset<=0){
				$("#prevPage").css("color","gray");
			}else{
				$("#prevPage").css("color","blue");
			}
			if(dingdans.length<limit){
				$("#nextPage").css("color","gray");
			}else{
				$("#nextPage").css("color","blue");
			}
		});
	}
	
	function showDetail(dd){
		currDD = dd;
		$("#liucheng").show().liucheng(getTheUser(),dd);
		if(currDD.fudan){
			$("#fudan_out").show();
			$("#fudan").text(currDD.fudan);
		}else{
			$("#fudan_out").hide();
		}
		if(currDD.zidan){
			$("#zidan_out").show()
			$("#zidan").empty();
			each(currDD.zidan,function(index,zidan){
				$("#zidan").append("&nbsp;<span class='plainBtn zidan' zidan='"+zidan+"'>"+zidan+"</span>&nbsp;");
			});
			$(".zidan").click(function(){
				showDetailById($(this).attr("zidan"));
			});
		}else{
			$("#zidan_out").hide();
		}
		$("#dd_bianhao").text(dd._id);
		$("#dd_yuangao").text(dd.yuangao+"/"+dd.taiguoyuangao+"("+dd.taiguobianhao+")");
		$("#dd_kehu").text(dd.kehu);
		if(dd.yangban){
			var yb = (dd.yangban.zhongguoxinghao?dd.yangban.zhongguoxinghao:"-")+"("+(dd.yangban.taiguoxinghao?dd.yangban.taiguoxinghao:"-")+"/"+(dd.taiguoyangban?dd.taiguoyangban:"-")+")"
			$("#dd_yangban").val(yb);
		}else{
			$("#dd_yangban").val("");
		}
		if(dd.gonghuoshang){
			$("#dd_gonghuoshang").val(dd.gonghuoshang.mingchen).css("cursor","pointer");
		}else{
			$("#dd_gonghuoshang").val("").css("cursor","default");
		}
		if(dd.lianxiren){
			$("#dd_lianxiren").val(dd.lianxiren.mingchen);
		}else{
			$("#dd_lianxiren").val("");
		}
		$(".tmpl_huowu").remove();
		for(var i=0;i<dd.huowu.length;i++){
			var huowu = tmpl_huowu.clone(true);
			huowu.data("id",dd.huowu[i].id);
			huowu.find("#mx_xuhao").text(i);
			huowu.find("#mx_taiguoguige").text(dd.huowu[i].taiguoguige);
			huowu.find("#mx_guige").text(dd.huowu[i].guige);
			huowu.find("#mx_shuliang").val(dd.huowu[i].shuliang);
			huowu.find("#mx_danwei").val(dd.huowu[i].danwei);
			//huowu.find("#mx_danwei").data("lastValue",dd.huowu[i].danwei);
			huowu.find("#mx_danjia").val(dd.huowu[i].danjia);
			huowu.find("#mx_jine").text(round(dd.huowu[i].shuliang*dd.huowu[i].danjia,2));
			$("#new_huowu_item").before(huowu);
		}
		if(dd.huowu){
			$(".unit").text(dd.huowu[0].danwei);
		}
		huizong(); 
		beizhuEditor.editorVal(dd.beizhu);
		if(currDD.beizhu && currDD.beizhu.trim()!=""){
			$("#beizhuzhaiyao").html(dd.beizhu.truncate(40)+"<span class='plainBtn'>...[+]</span>");0
		}else{
			$("#beizhuzhaiyao").empty();
		} 
		getHuowu();
		liuyanElm.shuaxinliebiao({hostId:currDD._id,hostType:"dingdan"});
		readonly();
		if(kebianji){
			$("#bianji").show();
		}
	}
	/*
	function shuaxindingdanliebiao(){
		var jiegaozheid = null;
		each(currYG.liucheng,function(n,liucheng){
			if(liucheng.dongzuo == "接稿"){
				jiegaozheid = liucheng.userId;
				return false;
			}		
		});
		$("#dingdanliebiao").empty().show();
		postJson("dingdan.php",{caozuo:"liebiao",_id:currYG._id},function(dingdans){
			each(dingdans,function(n,dingdan){
				var elm = lb_dingdan.clone(true);
				elm.data("dingdanId",dingdan._id);
				$("#lb_bianhao",elm).text(dingdan._id);
				$("#lb_kehu",elm).text(dingdan.kehu);
				$("#lb_yangban",elm).text(dingdan.yangban.taiguoxinghao);
				$("#lb_zhuangtai",elm).text(dingdan.zhuangtai);
				if(dingdan.zhuangtai == "录单" && getTheUser()._id == jiegaozheid){
					$("#lb_shanchu",elm).show();
					$("#lb_shenqingshenhe",elm).show();
				}
				if(dingdan.zhuangtai == "申请审核"){
					if(getTheUser()._id == jiegaozheid){
						$("#lb_quxiaoshenqing",elm).show();
					}else{
						$("#lb_shenhe",elm).show();
					}
				}
				if(dingdan.zhuangtai == "作废"){
					elm.find("div:first-child").css("background-color","#eee");
				}
				each(dingdan.huowu,function(n,hw){
					var hwelm = lb_hw.clone(true); 
					$("#lb_xuhao",hwelm).text((n+1)+".");
					$("#lb_guige",hwelm).text(hw.guige);
					$("#lb_shuliang",hwelm).text(hw.shuliang);
					$("#lb_danwei",hwelm).text(hw.danwei);
					elm.append(hwelm);
				});
				if(dingdan.ludanbeizhu){
					elm.append("<div style='margin:10px 0px 10px'><b>备注：</b>"+dingdan.ludanbeizhu+"</div>");
				}
				$("#dingdanliebiao").append(elm);
			});
			if(dingdans && dingdans.length>0){
				$("#dingdanliebiao").prepend("<p style='background-color:#eee'>已录订单</p>");
			}
		});
	}
	*/
	function showDetailById(_id){
		postJson("dingdans.php",{_id:_id},function(dd){
			showDetail(dd);			
		});
	}
	function shangchuanmoshi(){
		$("#liucheng").hide();
		$("#xianshi").hide();
		$("#dingdanliebiao").hide();
		$("#shangchuan").show();
		editor.editorVal("");		
		$("#tijiao").data("waiting",false);
	}
	$("#shangchuandingdan").click(function(){shangchuanmoshi();});
		
	jQuery.fn.liucheng = function(theUser,dingdan){
		var that = this.empty();
		this.data("_id",dingdan._id);
		each(dingdan.liucheng,function(n,item){
			var tmpl = liuchengItem.clone(true);
			$("#lc_bianhao",tmpl).text(n+1);
			var usr = getUser(item.userId);
			$("#lc_touxiang",tmpl).attr("src",usr.photo);
			$("#lc_mingchen",tmpl).text(usr.user_name);
			$("#lc_dongzuo",tmpl).text(item.dongzuo);
			$("#lc_shijian",tmpl).text(new Date(item.time*1000).format("yyyy-MM-dd hh:mm"));
			/*录单 审核 接单（作废 接管 慢单/取消慢单 子单） 下单申请（回退） 下单审核（打印 回退） 
			下单（回退） 发货 审结（回退） 作废（审结 回退）*/
			if("审核" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","录单员录入的订单已被审核，可以被采购跟单员接单处理！");
				if((dingdan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == item.userId){
						$("#cz_huitui",caozuoItem).show();
					}
					$("#cz_jiedan",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("接单" == item.dongzuo){//接单（作废-跟单员自己还没下单申请 接管-非跟单员任何时候 慢单/取消慢单-跟单员任何时候 子单-跟单未作废/审结 下单申请-跟单员）
				("#lc_tr_panel",tmpl).attr("title","跟单员已接受订单，正在对其进行处理！");
				if(!inLiucheng(dingdan.liucheng,"审结")){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == currDD.gendanyuan){
						kebianji = true;
						if(currDD.mandan){
							$("#cz_quxiaomandan",caozuoItem).show();
						}else{
							$("#cz_mandan",caozuoItem).show();
						}
						if((dingdan.liucheng.length - 1) == n){
							$("#cz_xiadanshenqing",caozuoItem).show();
							$("#cz_zuofei",caozuoItem).show();
						}
						if(!inLiucheng(dingdan.liucheng,"审结")){
							$("#cz_zidan",caozuoItem).show();
						}
					}else{
						$("#cz_jieguan",caozuoItem).show();
					}
					$("table",tmpl).append(caozuoItem);
				}
			}else if("下单申请" == item.dongzuo){//下单申请（回退-跟单员没审核 下单审核-非跟单员没审核）
				kebianji = false;
				("#lc_tr_panel",tmpl).attr("title","跟单员已经谈好价格准备下单，申请他人审核确认！");
				if((dingdan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == currDD.gendanyuan){
						$("#cz_huitui",caozuoItem).show();
					}else{
						$("#cz_xiadanshenhe",caozuoItem).show();
					}
					$("table",tmpl).append(caozuoItem);
				}
			}else if("下单审核" == item.dongzuo){//下单审核（回退-审核者没下单  打印- 下单-）
				("#lc_tr_panel",tmpl).attr("title","他人一对订单进行审核确认，可以下单！");
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				if((dingdan.liucheng.length - 1) == n){
					if(theUser._id == item.userId){
						$("#cz_huitui",caozuoItem).show();
					}else if(theUser._id == currDD.gendanyuan){
						$("#cz_xiadan",caozuoItem).show();
					}
				}
				$("#cz_dayin",caozuoItem).show();
				$("table",tmpl).append(caozuoItem);
			}else if("下单" == item.dongzuo){//下单（回退-跟单员未发货 发货-跟单员未发货）
				("#lc_tr_panel",tmpl).attr("title","订单已经发给供货商，等待供货商发货！");
				if((dingdan.liucheng.length - 1) == n){
					if(theUser._id == currDD.gendanyuan){
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						$("#cz_huitui",caozuoItem).show();
						$("#cz_fahuo",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}
				}
			}else if("发货" == item.dongzuo){//发货（回退-跟单员未审结 审结-非跟单员）
				("#lc_tr_panel",tmpl).attr("title","已发货，申请审结中！");
				if((dingdan.liucheng.length - 1) == n && theUser._id == currDD.gendanyuan){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_huitui",caozuoItem).show();
					$("#cz_shenqingshenjie",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("作废" == item.dongzuo){//作废（审结-非跟单员未审结 回退-跟单员未审结）
				("#lc_tr_panel",tmpl).attr("title","订单被作废，申请审结中！");
				if((dingdan.liucheng.length - 1) == n && theUser._id == currDD.gendanyuan){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true); 
					$("#cz_huitui",caozuoItem).show();
					$("#cz_shenqingshenjie",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("申请审结" == item.dongzuo){//作废（审结-非跟单员未审结 回退-跟单员未审结）
				("#lc_tr_panel",tmpl).attr("title","订单已收到货或被作废，跟单员自查通过后申请他人帮忙审结！");
				if((dingdan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == currDD.gendanyuan){
						$("#cz_huitui",caozuoItem).show();
					}else{
						$("#cz_shenjie",caozuoItem).show();
					}
					$("table",tmpl).append(caozuoItem);
				}
			}else if("审结" == item.dongzuo){//审结（回退-审结者）
				("#lc_tr_panel",tmpl).attr("title","订单已审核！");
				if(theUser._id == item.userId){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_huitui",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("录单" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","原稿录单员还在录单，没审核，还不可以接单！");
			}
			that.append(tmpl);
		});
	}
	
	///////////////////////////////初始化/////////////////////////////////////////////
	function _chushihua_(){} 
	var limit=20;
	var currDD = null;
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
	var tr_dingdan = $(".tr_dingdan").detach();
	var tmpl_huowu = $(".tmpl_huowu").detach();
	 
	var fhd_span = $("#fhd_span").detach(); 
	var yhd_span = $("#yhd_span").detach(); 
	var zgd_span = $("#zgd_span").detach(); 
	
	var liuyanElm = $("#liuyan").liuyan({hostType:"dingdan",});
	var cmd = getUrl().cmd?getUrl().cmd:"";
	if("jiedan" == cmd){
		$('#currLocation', window.parent.document).text("订单/待接单");
		$("#th_zhuangtai").attr("readonly","readonlly");
		$(".jiedan").show();tr_dingdan.find(".jiedan").show();
	}else if("wodexindan" == cmd){
		$('#currLocation', window.parent.document).text("订单/我的新单");
		$("#th_man").attr("readonly","readonlly");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else if("wodemandan" == cmd){
		$('#currLocation', window.parent.document).text("订单/我的慢单");
		$("#th_man").attr("readonly","readonlly");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else if("wodeweifahuo" == cmd){
		$('#currLocation', window.parent.document).text("订单/我的未发货");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else if("wodedaishenjie" == cmd){
		$('#currLocation', window.parent.document).text("订单/我的待审结");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else if("daixiadanshenhe" == cmd){
		$('#currLocation', window.parent.document).text("订单/待下单审核");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else if("daishenjie" == cmd){
		$('#currLocation', window.parent.document).text("订单/待审结");
		$("#th_zhuangtai").attr("readonly","readonlly");
	}else{
		$('#currLocation', window.parent.document).text("订单/查询");
	}
	listDingdan(0,getUrl().showId);
	
	//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){
		if(layout.state.west.innerWidth < $("#dingdantable").width()){
			layout.sizePane("west",$("#dingdantable").width()+20);
		}
	});
	$(".detailheader").click(function(){
		if(layout.state.center.innerWidth < $("#tb_huowu").width()){
			layout.sizePane("west",$("body").width()-$("#tb_huowu").width()-300);
		}
	}).dblclick(function(){layout.toggle("west");clearSelection();});
});