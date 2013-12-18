$(function(){
	/*
	{	_id:"FHD131008.1",
		liucheng:[{userId:3,dongzuo:"录单",time:1322}],
		zhuangtai:"录单",
		gonghuoshang:{_id:"SJ131110",mingche:"大大"},
		huowu:[{guige:"xxx",shuliang:23,jianshu:2,danwei:"码",danjia:23.1,jine:232.1}...]},
		yunfei:23.2,
		qitafei:[{beizhu:"xxx",jine:22}],
		neirong:"xxx",
		zhuanzhang:"xxx"
	}
	*/
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}

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
		postJson("fahuodans.php",{offset:offset*limit,limit:limit,option:option},function(fahuodans){
			$("#fahuodantable .tr_fahuodan").remove();
			each(fahuodans,function(n,fahuodan){
				tr = tr_fahuodan.clone(true);
				tr.data("_id",fahuodan._id);
				tr.find("#td_bianhao").text(fahuodan._id);
				tr.find("#td_kehu").text(fahuodan.kehu);
				if(fahuodan.yangban){
					var yb = "("+fahuodan.yangban.taiguoxinghao+")";
					if(fahuodan.yangban.zhongguoxinghao){
						tr.find("#td_yangban").text(fahuodan.yangban.zhongguoxinghao+yb);
					}else{
						tr.find("#td_yangban").text(yb);
					}
				}
				tr.find("#td_zhuangtai").text(fahuodan.zhuangtai);				
				tr.find("#td_gendanyuan").text(fahuodan.gendanyuan?getUser(fahuodan.gendanyuan).user_name:"");
				tr.find("#td_gonghuoshang").text(fahuodan.gonghuoshang?fahuodan.gonghuoshang.mingchen:"");
				tr.find("#td_xiadanriqi").text(fahuodan.xiadanshijian?new Date(fahuodan.xiadanriqi*1000).format("yy/MM/dd hh:mm"):"");
				
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
		$(".tmpl_huowu").remove();
		for(var i=0;i<dd.huowu.length;i++){
			var huowu = tmpl_huowu.clone(true);
			huowu.find("#mx_xuhao").text(i);
			huowu.find("#mx_guige").val(dd.huowu[i].guige);
			huowu.find("#mx_shuliang").val(dd.huowu[i].shuliang);
			huowu.find("#mx_danwei").val(dd.huowu[i].danwei);
			huowu.find("#mx_danwei").data("lastValue",dd.huowu[i].danwei);
			huowu.find("#mx_danjia").val(dd.huowu[i].danjia);
			huowu.find("#mx_jine").text(round(dd.huowu[i].shuliang*dd.huowu[i].danjia,2));
			$("#new_huowu_item").before(huowu);
		}
		
		huizong();
		//$("#beizhu").html(dd.beizhu);
		beizhuEditor.editorVal(dd.beizhu);
		if(currDD.beizhu.trim()!=""){
			$("#beizhuzhaiyao").html(dd.beizhu.truncate(40)+"<span class='plainBtn'>...[+]</span>");0
		}else{
			$("#beizhuzhaiyao").empty();
		}
		liuyanElm.shuaxinliebiao({hostId:currDD._id,hostType:"fahuodan"});
		readonly();
		if(kebianji){
			$("#bianji").show();
		}
	}
	function shuaxinfahuodanliebiao(){
		var jiegaozheid = null;
		each(currYG.liucheng,function(n,liucheng){
			if(liucheng.dongzuo == "接稿"){
				jiegaozheid = liucheng.userId;
				return false;
			}		
		});
		$("#fahuodanliebiao").empty().show();
		postJson("fahuodan.php",{caozuo:"liebiao",_id:currYG._id},function(fahuodans){
			each(fahuodans,function(n,fahuodan){
				var elm = lb_fahuodan.clone(true);
				elm.data("fahuodanId",fahuodan._id);
				$("#lb_bianhao",elm).text(fahuodan._id);
				$("#lb_kehu",elm).text(fahuodan.kehu);
				$("#lb_yangban",elm).text(fahuodan.yangban.taiguoxinghao);
				$("#lb_zhuangtai",elm).text(fahuodan.zhuangtai);
				if(fahuodan.zhuangtai == "录单" && getTheUser()._id == jiegaozheid){
					$("#lb_shanchu",elm).show();
					$("#lb_shenqingshenhe",elm).show();
				}
				if(fahuodan.zhuangtai == "申请审核"){
					if(getTheUser()._id == jiegaozheid){
						$("#lb_quxiaoshenqing",elm).show();
					}else{
						$("#lb_shenhe",elm).show();
					}
				}
				if(fahuodan.zhuangtai == "作废"){
					elm.find("div:first-child").css("background-color","#eee");
				}
				each(fahuodan.huowu,function(n,hw){
					var hwelm = lb_hw.clone(true); 
					$("#lb_xuhao",hwelm).text((n+1)+".");
					$("#lb_guige",hwelm).text(hw.guige);
					$("#lb_shuliang",hwelm).text(hw.shuliang);
					$("#lb_danwei",hwelm).text(hw.danwei);
					elm.append(hwelm);
				});
				if(fahuodan.ludanbeizhu){
					elm.append("<div style='margin:10px 0px 10px'><b>备注：</b>"+fahuodan.ludanbeizhu+"</div>");
				}
				$("#fahuodanliebiao").append(elm);
			});
			if(fahuodans && fahuodans.length>0){
				$("#fahuodanliebiao").prepend("<p style='background-color:#eee'>已录订单</p>");
			}
		});
	}
	function showDetailById(_id){
		postJson("fahuodans.php",{_id:_id},function(dd){
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
			if("审核" == item.dongzuo){
				if((fahuodan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_jiedan",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("接单" == item.dongzuo){
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				$("#cz_dayin",caozuoItem).show();
				if(theUser._id == item.userId){
					kebianji = true;
					if((fahuodan.liucheng.length - 1) == n){
						$("#cz_xiadan",caozuoItem).show();
						$("#cz_zidan",caozuoItem).show();
						$("#cz_dengban",caozuoItem).show();
					}else if("子单" == fahuodan.liucheng[fahuodan.liucheng.length-1].dongzuo || "等版" == fahuodan.liucheng[fahuodan.liucheng.length-1].dongzuo){
						$("#cz_xiadan",caozuoItem).show();
					}
					if("结单" != fahuodan.liucheng[fahuodan.liucheng.length-1].dongzuo && "作废" != fahuodan.liucheng[fahuodan.liucheng.length-1].dongzuo){
						$("#cz_zuofei",caozuoItem).show();
					}
				}else if((fahuodan.liucheng.length - 1) == n){
					$("#cz_jieguan",caozuoItem).show();
				}
				$("table",tmpl).append(caozuoItem);
			}else if("子单" == item.dongzuo){
				if(theUser._id == item.userId){
					if((fahuodan.liucheng.length - 1) == n){
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						$("#cz_ludan",caozuoItem).show();
					}
				}
				$("table",tmpl).append(caozuoItem);
			}else if("下单" == item.dongzuo){
				kebianji = false;
				var caozuoItem = caozuoTmpl.clone(true);
				if(theUser._id != item.userId && (fahuodan.liucheng.length - 1) == n){
					$("#cz_shendan",caozuoItem).show();
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				}
				$("table",tmpl).append(caozuoItem);
			}else if("审单" == item.dongzuo){
				var caozuoItem = caozuoTmpl.clone(true);
				if(theUser._id != item.userId && (fahuodan.liucheng.length - 1) == n){
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
	var tr_fahuodan = $(".tr_fahuodan").detach();
	var tmpl_huowu = $(".tmpl_huowu").detach();
	
	var liuyanElm = $("#liuyan").liuyan({hostType:"yangban",});
	listfahuodan(0,getUrl().showId);
	
});