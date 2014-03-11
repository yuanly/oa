$(function(){
	/*
	接单后把原来录单员录的结果写到日志，以备翻查。
	接单后允许增删规格，修改规格说明，也就是可以对订单做任意修改
	备注是要打印给供货商看的，留言是内部看的
	每个规格对应若干个发货单，还有“欠”数
	
	
	{	_id:"DD131008.1",
		liucheng:[{userId:3,dongzuo:"录单",time:1322}],
		yuangao:YG131008.1,
		zhuangtai:"录单",
		kehu:"C",
		yangban:{_id:"YB223",taiguoxinghao:"xxx",zhongguoxinghao:""},
		gonghuoshang:{_id:"SJ131110",mingche:"大大"},
		lianxiren:{_id:12,mingchen:"xx"},
		gendanyuan:3,
		xiadanshijian:13223,
		beizhu:"xxx",
		fudan:"fudanid",
		zidan:["zidanid"],
		huowu:[{guige:"xxx",shuliang:23,danwei:"KG"}...]}		
	*/
	$('#currLocation', window.parent.document).text("订单管理");
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	
	$("#th_bianhao").datepicker().change(function(){
		$(this).val("DD"+date2id($(this).val()));
		listDingdan(0);
	});
	$("#dd_yuangao").click(function(){
		if($(this).val().trim() == ""){
			return;
		}
		window.open("../yuangao/yuangao.html?showId="+$(this).val().trim(),"_blank")
	});
	//var kehus = getKehus();
	//kehus.unshift("客户");
	//$("#th_kehu").myselector(kehus).bind("input",function(){listDingdan(0);});
	$("#th_kehu").bind("input",function(){listDingdan(0);});
	var users = getUsers();users.unshift({"user_name":"跟单员","_id":"-1"});
	$("#th_gendanyuan").myselector(users,"user_name").bind("input",function(){
		listDingdan(0);
	});
 
	$("#th_zhuangtai").myselector(["状态","录单","审核","接单","等版","子单","下单","审单","结单","作废"]).bind("input",function(){listDingdan(0);});
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
			},["_id","taiguoxinghao","mingchen","shangjia.mingchen"],function(lianxiren){
				$("#dd_lianxiren").val(lianxiren.mingchen);
				currDD.lianxiren = {_id:lianxiren._id,mingchen:lianxiren.mingchen};
			},"");
	}
	function sel_yangban(event){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("yangban.php",{offset:page*limit,limit:limit,option:option},function(yangbans){
					callback(yangbans);
				});
			},["_id","taiguoxinghao","zhongguoxinghao","shangjia.mingchen","zhuangtai"],function(yangban){
				currDD.yangban = yangban;
				currDD.gonghuoshang = yangban.shangjia;
				$(this).val(yangban.zhongguoxinghao+"("+yangban.taiguoxinghao+")");
				$("#dd_gonghuoshang").val(yangban.shangjia.mingchen);
				$(".unit").text(yangban.danwei);
			},(currDD.yangban)?currDD.yangban.taiguoxinghao:"");
	}
	function sel_yangban2(event){
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
				postJson("dingdan.php",{caozuo:"shangjia",offset:page*limit,limit:limit,option:option},function(gonghuoshangs){
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
		
		var parent = $(this).parents("tr");
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
			huowu.find("#mx_danwei").text($("#unit").text());
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
			huowu.danwei = $(this).find("#mx_danwei").text();
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
	
	$(".mx_danwei").dblclick(function(){
		$(this).val("");
		});
		/*
	$(".mx_danwei").change(function(){
		if($(this).val().trim() == "码" && $(this).data("lastValue") == "米"){
			var parent = $(this).parents("tr");
			var sl = parseFloat(parent.find("#mx_shuliang").val());
			if(!isNaN(sl)){
				parent.find("#mx_shuliang").val(round(sl*1.094,2));
			}
		}else if($(this).val().trim() == "米" && $(this).data("lastValue") == "码"){
			var parent = $(this).parents("tr");
			var sl = parseFloat(parent.find("#mx_shuliang").val());
			if(!isNaN(sl)){
				parent.find("#mx_shuliang").val(round(sl*0.9144,2));
			}
		}
		$(this).data("lastValue",$(this).val().trim());
	});
	*/
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
	function cz_shendan(){
		postJson("dingdan.php",{caozuo:"shendan",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_shendan").click(cz_shendan);
	function cz_jie2dan(){
		postJson("dingdan.php",{caozuo:"jie2dan",_id:currDD._id},function(res){
			showDetailById(currDD._id);
		});
	}
	$("#cz_jie2dan").click(cz_jie2dan);
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
		return ret;
	}
		//列出原稿
	function listDingdan(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var cmd = getUrl().cmd?getUrl().cmd:"";
		var option = $.extend({cmd:cmd},getOptions());
		postJson("dingdans.php",{offset:offset*limit,limit:limit,option:option},function(dingdans){
			$("#dingdantable .tr_dingdan").remove();
			each(dingdans,function(n,dingdan){
				tr = tr_dingdan.clone(true);
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
				tr.find("#td_xiadanriqi").text(dingdan.xiadanshijian?new Date(dingdan.xiadanshijian*1000).format("yy/MM/dd hh:mm"):"");
				
				tr.css("background-color",toggle("#fff","#eee"));
				if(dingdan.zhuangtai == "删除"){
					tr.css("text-decoration","line-through");
				}
				$("#dingdantable").append(tr);
			});
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else if(dingdans.length>0){
				$(".tr_dingdan").get(0).click();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
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
		$("#dd_bianhao").val(dd._id);
		$("#dd_yuangao").val(dd.yuangao);
		$("#dd_kehu").val(dd.kehu);
		if(dd.yangban){
			var yangban = "("+dd.yangban.taiguoxinghao+")";
			if(dd.yangban.zhongguoxinghao){
				yangban = dd.yangban.zhongguoxinghao + yangban;
			}
			$("#dd_yangban").val(yangban);
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
			huowu.find("#mx_guige").text(dd.huowu[i].guige);
			huowu.find("#mx_shuliang").val(dd.huowu[i].shuliang);
			huowu.find("#mx_danwei").text(dd.huowu[i].danwei);
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
			if("审核" == item.dongzuo){
				if((dingdan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_jiedan",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("接单" == item.dongzuo){
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				$("#cz_dayin",caozuoItem).show();
				if(theUser._id == currDD.gendanyuan){
					kebianji = true;
					if((dingdan.liucheng.length - 1) == n){
						$("#cz_xiadan",caozuoItem).show();
						$("#cz_zidan",caozuoItem).show();
						$("#cz_dengban",caozuoItem).show();
					}else if("子单" == dingdan.liucheng[dingdan.liucheng.length-1].dongzuo || "等版" == dingdan.liucheng[dingdan.liucheng.length-1].dongzuo){
						$("#cz_xiadan",caozuoItem).show();
					}
					if("结单" != dingdan.liucheng[dingdan.liucheng.length-1].dongzuo && "作废" != dingdan.liucheng[dingdan.liucheng.length-1].dongzuo){
						$("#cz_zuofei",caozuoItem).show();
					}
				}else if((dingdan.liucheng.length - 1) == n){
					$("#cz_jieguan",caozuoItem).show();
				}
				$("table",tmpl).append(caozuoItem);
			}else if("子单" == item.dongzuo){
				if(theUser._id == currDD.gendanyuan){
					if((dingdan.liucheng.length - 1) == n){
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						$("#cz_ludan",caozuoItem).show();
					}
				}
				$("table",tmpl).append(caozuoItem);
			}else if("下单" == item.dongzuo){
				kebianji = false;
				var caozuoItem = caozuoTmpl.clone(true);
				if(theUser._id != item.userId && (dingdan.liucheng.length - 1) == n){
					$("#cz_shendan",caozuoItem).show();
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				}
				$("table",tmpl).append(caozuoItem);
			}else if("审单" == item.dongzuo){
				var caozuoItem = caozuoTmpl.clone(true);
				if(theUser._id == currDD.gendanyuan && (dingdan.liucheng.length - 1) == n){
					$("#cz_jie2dan",caozuoItem).show();
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				}
				$("table",tmpl).append(caozuoItem);
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
	});
});