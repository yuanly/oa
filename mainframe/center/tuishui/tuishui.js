$(function(){
	/*
	{	_id:"TS131008.1",
		liucheng:[...],
		gendanyuan:"xx",
		zhuangtai:"xx",
		huogui:{_id:"xx",guihao:"xx",zhuangguiriqi:"xx"},
		guandan:{hetonghao:"xx",pinming:"xx",jine:3423,shuliang:3432,baoguanriqi:"xx",jidanriqi:"xxx",shoudanriqi:"xx"},
		dailishang:{_id:"xx",mingchen:"xx",renminbizhanghao:"xxx",minjinzhanghao:"xx"},
		fapiaos:[{kaipiaoqiye:{_id:"xx",mingchen:"xx"},shuihao:"xx",pinming:"xx",mishu:332,danjia:23.2,shuie:232.2,kaipiaoriqi:"xx",shoupiaoriqi:"xx",fukuanliushui:"xx",beizhu:"xx"},...],
		huilv:6.2,
		hexiaos:[{shouhuiliushui:"xx",shouhuiriqi:"xx",meijinjine:23,hexiaoliushui:"xx",heixiaoriqi:"xx",renminbijine:32,huilvpaijia:2.3,shijihuilv:2.3},...],
		tuishui:{liushui:"xx",riqi:"xx",jine:32,shuilv:32},
		dailifei:{liushui:"xx",riqi:"xx",jine:32,beizhu:"xx"}
		}
	*/
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	$("#gd_baoguanriqi").datepicker();
	function sel_zhuangguidan(){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("tuishui.php",{caozuo:"chazhuangguidan",offset:page*limit,limit:limit,option:option},function(zhuangguidans){
					callback(zhuangguidans);
				});
			},["_id","zhuangtai","guihao","zhuangguiriqi"],function(zhuangguidan){//selected
				$("#hg_zhuangguidan").text(zhuangguidan._id);
				$("#hg_guihao").text(zhuangguidan.guihao);
				$("#hg_zhuangguiriqi").text(zhuangguidan.zhuangguiriqi);
			},$("#hg_zhuangguidan").text(),function(){//clear
				$("#hg_zhuangguidan").html("&nbsp;");
				$("#hg_guihao").text("");
				$("#hg_zhuangguiriqi").text("");
			},function(){//datepick
			$("#panel #option").val("ZGD"+date2id($("#panel #option").val()+"0"));
			});
	}
	function link_zhuangguidan(){
		window.open("../zhuangguidan/zhuangguidan.html?showId="+$(this).text(),"_blank");
	}
	function baocun(){
		if("" != $("#hg_zhuangguidan").text().trim()){
			currTS.huogui = {_id:$("#hg_zhuangguidan").text().trim(),guihao:$("#hg_guihao").text().trim(),zhuangguiriqi:$("#hg_zhuangguiriqi").text().trim()};
		}else{
			currTS.huogui = undefined;
		}
		var guandan = {};
		guandan.hetonghao = $("#gd_hetonghao").text().trim();
		guandan.chanpinmingchen = $("#gd_chanpinmingchen").text().trim();
		guandan.jine = parseFloat($("#gd_jine").text().trim());
		if(isNaN(guandan.jine)){
			guandan.jine = 0;
		}
		guandan.shuliang = parseFloat($("#gd_shuliang").text().trim());
		if(isNaN(guandan.shuliang)){
			guandan.shuliang = 0;
		}
		guandan.baoguanriqi = $("#gd_baoguanriqi").text().trim();
		guandan.jidanriqi = $("#gd_jidanriqi").text().trim();
		guandan.shoudanriqi = $("#gd_shoudanriqi").text().trim();
		currTS.guandan = guandan;
		
		postJson("tuishui.php",{caozuo:"baocun",tuishui:currTS},function(res){
			showDetailById(currTS._id);
		});		
	}
	function already(dongzuo){
		var ret = false;
		each(currTS.liucheng,function(i,lc){
			if(dongzuo == lc.dongzuo){
				ret = true;
				return false;
			}
		});
		return ret;
	}
	function edit(){
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
		if(!already("装柜")){
			$("#hg_zhuangguidan").unbind("click").css("color","blue").click(sel_zhuangguidan);
		}
		if(!already("报关")){
			$("#div_guandan").find(".myinput").attr("contenteditable","true");
			$("#div_guandan").find(".plainInput").removeAttr("readonly").datepicker({dateFormat:"yy-mm-dd"});
		}
	}
	$("#bianji").click(edit);
	$("#baocun").click(baocun);
	$("#fangqi").click(function(){showDetailById(currTS._id);});
	function readOnly(){
		$("#fangqi").hide();$("#baocun").hide();
		$("#hg_zhuangguidan").css("color","#660033").unbind("click").click(link_zhuangguidan);
		$("#div_guandan").find(".myinput").removeAttr("contenteditable");
		$("#div_guandan").find(".plainInput").attr("readonly","readonly").datepicker("destroy");
	}
	//翻页处理
	$("#prevPage").click(function(){
		listtuishui($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listtuishui($("#pager").data("offset")+1);
	});
	//流程下拉按钮
	function cz_anniu(){
		$(this).parents("#lc_tb_in").find("#lc_caozuo").toggle();
		if($(this).attr("src").indexOf("up")>-1){
			$(this).attr("src","../../../img/down.png");
		}else{
			$(this).attr("src","../../../img/up.png");
		}
	}
	$("#lc_anniu").click(cz_anniu);
	//列表记录选择
	function sel_tuishui(){
		showDetailById($(this).data("_id"));
		$(".tr_selected").removeClass("tr_selected");
		$(this).addClass("tr_selected");
	}
	$(".tr_tuishui").click(sel_tuishui);
	function cz_zhuanggui(){
		if(!currTS.huogui){
			tip($(this),"必须先设置货柜信息！",1500);
			return;
		}
		postJson("tuishui.php",{caozuo:"zhuanggui",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_zhuanggui").click(cz_zhuanggui);
	function cz_baoguan(){
		if(!currTS.guandan){
			tip($(this),"必须先设置关单信息！",1500);
			return;
		}
		if(currTS.guandan.baoguanriqi == ""){
			tip($(this),"必须先设置报关日期！",1500);
			return;
		}
		if(currTS.guandan.jine == 0){
			tip($(this),"必须先设置金额！",1500);
			return;
		}
		if(currTS.guandan.jine == 0){
			tip($(this),"必须先设置数量！",1500);
			return;
		}
		postJson("tuishui.php",{caozuo:"baoguan",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_baoguan").click(cz_baoguan);
	function cz_fukuan(){
		var ok=true;
		each(currTS.fapiaos,function(i,fp){
			if(fp.fukuanliushui == ""){
				ok = false;
				return false;
			}
		});
		if(!ok){
			tip($(this),"必须先设置全部发票付款流水！",1500);
			return;
		}
		var zongmishu = 0;
		each(currTS.fapiaos,function(i,fp){
			zongmishu += fp.mishu;
		});
		if(zongmishu + 30 < currTS.guandan.shuliang){
			tip($(this),"待开票数量太大！",1500);
			return;			
		} 
		postJson("tuishui.php",{caozuo:"fukuan",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_fukuan").click(cz_fukuan);
	function cz_kaipiao(){
		var ok=true;
		each(currTS.fapiaos,function(i,fp){
			if(fp.shoupiaoriqi == ""){
				ok = false;
				return false;
			}
		});
		if(!ok){
			tip($(this),"必须先设置全部发票收票日期！",1500);
			return;
		}
		postJson("tuishui.php",{caozuo:"kaipiao",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_kaipiao").click(cz_kaipiao);
	function cz_danzheng(){
		postJson("tuishui.php",{caozuo:"danzheng",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_danzheng").click(cz_danzheng);
	function cz_tuishui(){
		postJson("tuishui.php",{caozuo:"tuishui",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_tuishui").click(cz_tuishui);
	function cz_quxiao(){
		postJson("tuishui.php",{caozuo:"quxiao",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_quxiao").click(cz_quxiao);
	function cz_jieguan(){
		postJson("tuishui.php",{caozuo:"jieguan",_id:currTS._id},function(res){
			showDetailById(currTS._id);
		});
	}
	$("#cz_jieguan").click(cz_jieguan);
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	function getOptions(){
		var ret = {};
		/*
		var bh = $("#th_bianhao").val().trim();
		if("" != bh && "编号" != bh){
			ret.bianhao = bh+"0";
		}
		*/
		return ret;
	}
 	function listtuishui(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var cmd = getUrl().cmd?getUrl().cmd:"";
		var option = $.extend({cmd:cmd},getOptions());
		postJson("tuishui.php",{caozuo:"chaxun",offset:offset*limit,limit:limit,option:option},function(tuishuis){
			$("#tuishuitable .tr_tuishui").remove();
			each(tuishuis,function(n,tuishui){
				tr = tr_tuishui.clone(true);
				tr.data("_id",tuishui._id);
				tr.find("#td_bianhao").text(tuishui._id);
				tr.find("#td_gendanyuan").text(getUserName(tuishui.gendanyuan));
				tr.find("#td_guihao").text(tuishui.huogui?tuishui.huogui.guihao:"");
				tr.find("#td_zhuangguiriqi").text(tuishui.huogui?tuishui.huogui.zhuangguiriqi:"");
				tr.find("#td_baoguanriqi").text((tuishui.guandan && tuishui.guandan.baoguanriqi)?tuishui.guandan.baoguanriqi:"");
				tr.find("#td_zhuangtai").text(tuishui.zhuangtai);
				tr.find("#td_shuliang").text((tuishui.guandan && tuishui.guandan.shuliang)?tuishui.guandan.shuliang:"");
				tr.find("#td_jine").text((tuishui.guandan && tuishui.guandan.jine)?tuishui.guandan.jine:"");
				tr.find("#td_dailishang").text(tuishui.dailishang?tuishui.dailishang.mingchen:"");
				
				tr.css("background-color",toggle("#fff","#eee"));
				if(tuishui.zhuangtai == "作废"){
					tr.css("text-decoration","line-through");
				}
				$("#tuishuitable").append(tr);
			});
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else if(tuishuis.length>0){
				$(".tr_tuishui").get(0).click();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
		});
	} 
	function showDetail(ts){
		currTS = ts;
		$("#liucheng").show().liucheng(getTheUser(),ts);
		if(ts.huogui){
			$("#hg_zhuangguidan").text(ts.huogui._id);
			$("#hg_guihao").text(ts.huogui.guihao);
			$("#hg_zhuangguiriqi").text(ts.huogui.zhuangguiriqi);
		}else{
			$("#hg_zhuangguidan").html("&nbsp;");
			$("#hg_guihao").text("");
			$("#hg_zhuangguiriqi").text("");
		}
		if(currTS.guandan){
				var guandan = currTS.guandan;
			$("#gd_hetonghao").text(guandan.hetonghao);
			$("#gd_chanpinmingchen").text(guandan.chanpinmingchen);
			$("#gd_jine").text(guandan.jine);
			$("#gd_shuliang").text(guandan.shuliang);
			$("#gd_baoguanriqi").html(guandan.baoguanriqi?guandan.baoguanriqi:"&nbsp;");
			$("#gd_jidanriqi").html(guandan.jidanriqi?guandan.jidanriqi:"&nbsp;");
			$("#gd_shoudanriqi").html(guandan.shoudanriqi?guandan.shoudanriqi:"&nbsp;");
		}
		
		liuyanElm.shuaxinliebiao({hostId:currTS._id,hostType:"tuishui"});
		readOnly();	
	}
	function showDetailById(_id){
		postJson("tuishui.php",{caozuo:"getbyid",_id:_id},function(ts){
			showDetail(ts);
		});
	}
	jQuery.fn.liucheng = function(theUser,tuishui){
		var that = this.empty();
		$("#bianji").show();
		this.data("_id",tuishui._id);
		each(tuishui.liucheng,function(n,item){
			var tmpl = liuchengItem.clone(true);
			$("#lc_bianhao",tmpl).text(n+1);
			var usr = getUser(item.userId);
			$("#lc_touxiang",tmpl).attr("src",usr.photo);
			$("#lc_mingchen",tmpl).text(usr.user_name);
			$("#lc_dongzuo",tmpl).text(item.dongzuo);
			$("#lc_shijian",tmpl).text(new Date(item.time*1000).format("yyyy-MM-dd hh:mm"));
			if("新建" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已建立退税单证记录，等待装柜并录入货柜信息！");
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				if(currTS.gendanyuan == theUser._id){
					$("#cz_dayin",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show();
					if((tuishui.liucheng.length - 1) == n){
						$("#cz_zhuanggui",caozuoItem).show();
					}
				}else{
					$("#cz_jieguan",caozuoItem).show();
				}
				$("table",tmpl).append(caozuoItem);
			}else if("装柜" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已装柜并录入装柜信息，等待报关并录入报关信息！");
				if((tuishui.liucheng.length - 1) == n && currTS.gendanyuan == theUser._id){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_baoguan",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("报关" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已报关并录入报关信息，等待代理商向开票厂家付清全部开票货款！（需要我们在代理商的人民币或美金账户有足够多的余额）");
				if((tuishui.liucheng.length - 1) == n && currTS.gendanyuan == theUser._id){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_fukuan",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("付款" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","已付清全部开票货款，等待开票企业开票并将全部发票寄给代理商！");
				if((tuishui.liucheng.length - 1) == n && currTS.gendanyuan == theUser._id){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_kaipiao",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("开票" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","全部发票已经收齐，等待收齐全部单证（如核销单。实际情况可能不需要等核销单代理商就给我们算退税，此时就当已经收齐，直接进入下一流程。）！");
				if((tuishui.liucheng.length - 1) == n && currTS.gendanyuan == theUser._id){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_danzheng",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("单证" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","全部单证已经收齐，等待代理商给我们算退税（即把退税额算进代理商的人民币账户余额）！");
				if((tuishui.liucheng.length - 1) == n && currTS.gendanyuan == theUser._id){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_tuishui",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("退税" == item.dongzuo){
				$("#bianji").hide();
				("#lc_tr_panel",tmpl).attr("title","代理商已经给我们算了退税！");
				if((tuishui.liucheng.length - 1) == n && currTS.gendanyuan == theUser._id){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}
			that.append(tmpl);
		});
	}
	///////////////////////////////初始化/////////////////////////////////////////////
	function _chushihua_(){} 
	var limit = 20;
	var currTS = null;
	 
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	
	var caozuoTmpl = $("#lc_caozuo").detach();
	var liuchengItem = $("#liuchengItem").detach();
	var tr_tuishui = $(".tr_tuishui").detach();
 
 	var liuyanElm = $("#liuyan").liuyan({hostType:"tuishui",});
 	
	listtuishui(0);
});