$(function(){
	/*
	{	_id:"TS131008.1",
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
	function readOnly(){
	}
	function showDetail(ts){
		currTS = ts;
		$("#liucheng").show().liucheng(getTheUser(),ts);
		readOnly();	
	}
	function showDetailById(_id){		
		postJson("tuishui.php",{caozuo:"getbyid",_id:_id},function(ts){
			showDetail(ts);
		});
	}
	jQuery.fn.liucheng = function(theUser,tuishui){
		var that = this.empty();
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
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_dayin",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show();
					$("#cz_jieguan",caozuoItem).show();
				if((tuishui.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#cz_zhuanggui",caozuoItem).show();
				}
				$("table",tmpl).append(caozuoItem);
			}else if("装柜" == item.dongzuo){
				if((tuishui.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_baoguan",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("报关" == item.dongzuo){
				if((tuishui.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_fukuan",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("付款" == item.dongzuo){
				if((tuishui.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_kaipiao",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("开票" == item.dongzuo){
				if((tuishui.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_danzheng",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("单证" == item.dongzuo){
				if((tuishui.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_quxiao",caozuoItem).show();
					$("#cz_tuishui",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("退税" == item.dongzuo){
				if((tuishui.liucheng.length - 1) == n && theUser._id == item.userId){
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
 
	listtuishui(0);
});