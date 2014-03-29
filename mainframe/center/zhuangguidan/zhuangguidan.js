$(function(){
	/*
装柜单
{
 _id:"xxx",
 guihao:"xx",//如第N柜的N
 zhuangtai:"xx",//制单(删除) 交单 审核
 zhuangguiriq:"2012-1-1",
 //huowu:[{zgdId:"xx",guige:"xxx",danwei:"x",shuliang:22,jianshu:22,beizhu:"xxx"}...],//从huowu表关联
 liucheng:[制单 交单 审核],
 zhidanzhe:23,
 jiaodanzhe:33,
 shenhezhe:22,
 zhuangguirenyuan:"xxx"//手写的一串名字，系统不做校验。
}
制单（删除-货物清空时 接管） 交单（回退） 审核（回退） 
制单者直接交单，无需受理者，因为别人很容易接管。

创建装柜单（如果是装柜时发货，也得先做好发货单才能建装柜单）
	编辑（包括新建和调整装柜单 对货物做分拆） 打印装柜单（随时都可以打印） 未申请审核可作废
已装柜（已装柜 申请审核，可以取消） 
审核确认 （可以取消）
打印给业务部门 
打印给老板（带成本）
	*/
	$('#currLocation', window.parent.document).text("装柜单管理");
	function _huowuliebiao_(){}
	//翻页处理
	$("#hw_prevPage").click(function(){
		listHuowu($("#hw_pager").data("offset")-1);
	});
	$("#hw_nextPage").click(function(){
		listHuowu($("#hw_pager").data("offset")+1);
	});
	function statusHwColor(status){
		if(status == "未检验"){//浅紫
			return "#CCCCFF";
		}
		if(status == "已通过"){//浅绿
			return "#CCFFCC";
		}
		if(status == "不通过"){//红色
			return "#CC334D";
		}
		if(status == "已装柜"){//浅蓝
			return "#CCFFE6";
		}
	}
	function link_dingdan(){
		var id = $(this).text();
		window.open("../dingdan/dingdan.html?showId="+id,"_blank");
	}
	$("#td_hw_dingdan").click(link_dingdan);
	function link_fahuodan(){
		var id = $(this).text();
		id = id.substr(0,id.indexOf("HW"));
		window.open("../fahuodan/fahuodan.html?showId="+id,"_blank");
	}
	$("#td_hw_huowubianhao").click(link_fahuodan);
	function link_yanhuodan(){
		var id = $(this).text();
		if("" == id){
			return;
		}
		window.open("../yanghuodan/yanhuodan.html?showId="+id,"_blank");
	}
	$("#td_hw_yanhuodandan").click(link_yanhuodan);
	function link_zhuangguidan(){
		var id = $(this).text();
		if("" == id){
			return;
		}
		window.open("../zhuangguidan/zhuangguidan.html?showId="+id,"_blank");
	}
	$("#td_hw_zhuangguidan").click(link_zhuangguidan);
	function shanchuhuowu(){
		var that = $(this).parent().parent();
		var tr = that.detach();
		tr.find(".td_left_most").hide();
		tr.find("#xuan").show();
		tr.css("background-color",toggle("#fff","#eee"));
		$("#huowutable").append(tr);
	}
	$("#shanchuhuowu").click(shanchuhuowu);
	
	function xuanCallback(that){
		var tr = that.detach();
		tr.find(".td_left_most").show();
		tr.find("#xuan").hide();
		$("#selhuowutable").append(tr);
		$("#selhuowutable .tr_huowu").each(function(i){
			$(this).css("background-color",toggle("#fff","#eee"));	
		});
	} 
	function xuan(){
		var that = $(this).parent().parent();
		var huowu = that.data("huowu");
		if(huowu.zhuangguidan){
			tip($(this),"醒醒！货物已装柜。",1500);
			return;
		}
		if(!huowu.yanghuodan || huowu.yanhuodang.zhuangtai != "已通过"){
			ask($(this),"货物未通过检验，确定要装柜吗？",function(){
				xuanCallback(that);
			});
		}else{
			xuanCallback(that);
		}		
	}
	$("#xuan").click(xuan);
	$("#th_hw_huowubianhao").datepicker().change(function(){
		$(this).val("FHD"+date2id($(this).val()));
		listHuowu(0);
	});
	$("#th_hw_zhuangtai").bind("input",function(){listHuowu(0);});
	$("#th_hw_kehu").bind("input",function(){listHuowu(0);});
	$("#th_hw_gonghuoshang").click(sel_gonghuoshang);
	addQuyulist();
	$("#quyulist").prepend('<option value="区域"/>');
	$("#th_hw_quyu").attr("list","quyulist").bind("input",function(){listHuowu(0);});
	function sel_gonghuoshang(event){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("../contact/lianxiren.php",{caozuo:"chashangjia",offset:page*limit,limit:limit,option:option},function(gonghuoshangs){
					callback(gonghuoshangs);
				});
			},["_id","mingchen","quyu","dizhi"],function(gonghuoshang){
				$("#th_hw_gonghuoshang").text(gonghuoshang.mingchen);
				$("#th_hw_gonghuoshang").data("ghsId",gonghuoshang._id);
				listHuowu(0);
			},"",function(){
				$("#th_hw_gonghuoshang").removeData("ghsId");
				$("#th_hw_gonghuoshang").text("供货商");
				listHuowu(0);
			});
	}
	function cutDDHWID(id){
		return id.substr(0,id.indexOf("HW"));
	}
	function sel_yangban2(event){//左侧列表过滤选择样板
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("../dingdan/yangban.php",{offset:page*limit,limit:limit,option:option},function(yangbans){
					callback(yangbans);
				});
			},["index","taiguoxinghao","zhongguoxinghao","shangjia.mingchen","zhuangtai"],function(yangban){//selected callback
				$("#th_hw_yangban").text(yangban.zhongguoxinghao).data("ybId",yangban._id);
				listHuowu(0);
			},"",function(){//清空callback
				$("#th_hw_yangban").text("样板");
				listHuowu(0);
			});
	}
	$("#th_hw_yangban").click(sel_yangban2);
	function feedHwTr(tr_huowu,huowu){
		tr_huowu.data("huowu",huowu);
		tr_huowu.find("#td_hw_huowubianhao").text(huowu._id);
		tr_huowu.find("#td_hw_kehu").text(huowu.kehu);
		tr_huowu.find("#td_hw_gonghuoshang").text(huowu.gonghuoshang.mingchen);
		tr_huowu.find("#td_hw_quyu").text(huowu.gonghuoshang.quyu);
		tr_huowu.find("#td_hw_yangban").text(formatYangban(huowu.yangban));
		tr_huowu.find("#td_hw_guige").text(huowu.guige);
		tr_huowu.find("#td_hw_danwei").text(huowu.danwei);
		tr_huowu.find("#td_hw_shuliang").text(huowu.shuliang);
		tr_huowu.find("#td_hw_jianshu").text(huowu.jianshu);
		tr_huowu.find("#td_hw_dingdan").text(cutDDHWID(huowu.dingdanhuowu));		
		tr_huowu.find("#td_hw_yanhuodan").text(huowu.yanghuodan?huowu.yanghuodan._id:"");
		tr_huowu.find("#td_hw_zhuangguidan").text(huowu.zhuangguidan?huowu.zhuangguidan:"");
		tr_huowu.find("#td_hw_beizhu").text(huowu.zhu?huowu.zhu:"");
		var status = "未检验";
		if(huowu.zhuangguidan){
			status = "已装柜";
		}else if(huowu.yanhuodan && huowu.yanhuodan.zhuangtai){
			status = huowu.yanhuodan.zhuangtai;
		}
		tr_huowu.find("#td_hw_zhuangtai").text(status);
		tr_huowu.css("background-color",toggle("#fff","#eee"));
		tr_huowu.find("#td_hw_huowubianhao").css("background-color",statusHwColor(status));
		return tr_huowu;
	}
	function getHwOptions(){
		var ret = {};
		var v = $("#th_hw_huowubianhao").val().trim();
		if("" != v && "货物编号" != v){
			ret.bianhao = v+"0";
		}
		v = $("#th_hw_zhuangtai").val().trim();
		if("" != v && "状态" != v){
			ret.zhuangtai = v;
		}
		v = $("#th_hw_kehu").text().trim();
		if("" != v && "客户" != v){
			ret.kehu = v;
		}
		v = $("#th_hw_gonghuoshang").text().trim();
		if("" != v && "供货商" != v){
			ret.gonghuoshang = $("#th_hw_gonghuoshang").data("ghsId");
		}
		v = $("#th_hw_quyu").val().trim();
		if("" != v && "区域" != v){
			ret.quyu = v;
		}
		v = $("#th_hw_yangban").text().trim();
		if("" != v && "样板" != v){
			ret.yangban = $("#th_hw_yangban").data("ybId");
		}
		return ret;
	}
	function isSelectedHuowu(id){
		var dup = false;
		$("#selhuowutable .tr_huowu").each(function(i){
			if($(this).find("#td_hw_huowubianhao").text() == id){
				dup = true;
				return false;
			}
		});
		return dup;
	}
	function listHuowu(offset){
		if(offset<0){
			return;
		}
		$("#hw_pager").data("offset",offset);
		var option = getHwOptions();
		postJson("../fahuodan/huowu.php",{caozuo:"chaxun",offset:offset*limit,limit:limit,option:option},function(huowus){
			$("#huowutable .tr_huowu").remove();
			each(huowus,function(n,huowu){
				if(isSelectedHuowu(huowu._id)){
					return true;
				}
				var tr = tmpl_tr_huowu.clone(true);
				tr.data("huowu",huowu);
				$("#huowutable").append(feedHwTr(tr,huowu));
			});
			//调整左侧宽度以便显示完整的列表
			if(layout.state.west.innerWidth < $("#huowutable").width()){
				layout.sizePane("west",$("#huowutable").width()+20);
			}
			if(offset<=0){
				$("#hw_prevPage").css("color","gray");
			}else{
				$("#hw_prevPage").css("color","blue");
			}
			if(huowus.length<limit){
				$("#hw_nextPage").css("color","gray");
			}else{
				$("#hw_nextPage").css("color","blue");
			}
		});
	}	
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	$("#xinzengzhuangguidan").click(function(){
		postJson("zhuangguidan.php",{caozuo:"xinjian"},function(res){
			listzhuangguidan(0);
		});	
	});
	$("th").attr("nowrap","true");
	$("#th_bianhao").datepicker().change(function(){
		$(this).val("ZGD"+date2id($(this).val()));
		listzhuangguidan(0);
	});
	$("#th_guihao").change(function(){listzhuangguidan(0);});
	$("#th_zhuangtai").bind("input",function(){
		listzhuangguidan(0);
	});
	var users = getUsers();users.unshift({"user_name":"交单者"});
	$("#th_jiaodanzhe").myselector(users,"user_name").bind("input",function(){
		listzhuangguidan(0);
	});
	users = getUsers();users.unshift({"user_name":"制单者"});
	$("#th_zhidanzhe").myselector(users,"user_name").bind("input",function(){
		listzhuangguidan(0);
	});
	$("#th_zhuangguiriqi").datepicker().change(function(){
		listzhuangguidan(0);
	});
	users = getUsers();users.unshift({"user_name":"审核者"});
	$("#th_shenhezhe").myselector(users,"user_name").bind("input",function(){
		listzhuangguidan(0);
	});
	$("#shangyi").click(function(){
		var curr = $(this).parents(".tr_huowu");
		var prev = curr.prev(".tr_huowu");
		if(prev.length>0){
			curr = curr.detach();
			prev.before(curr);
		}
	});

	function baocun(){
		var huowu = [];
		$(".tr_huowu").each(function(i,hw){
			var obj = $(hw).data("huowu");
			obj.zgdIdx = i;
		 	huowu.push(obj);
		}); 
		currZGD.huowu = huowu;
		currZGD.guihao = $("#zgd_guihao").val().trim();
		currZGD.zhuangguiriqi = $("#zgd_zhuangguiriqi").val().trim();
		currZGD.zhuangguirenyuan = $("#zhuangguirenyuan").text().trim();
		postJson("zhuangguidan.php",{caozuo:"baocun",zhuangguidan:currZGD},function(res){ 
			showDetailById(currZGD._id);
		});
	}
	$("#baocun").click(baocun);
	$("#fangqi").click(function(){
		$("#zhuangguidan_liebiao_ctr").show();
		$("#huowu_liebiao_ctr").hide();
		showDetailById(currZGD._id);}
	);
	function shanchuhuowu(){
		var that = $(this).parent().parent();
		var tr = that.detach();
		tr.find(".td_left_most").hide();
		tr.find("#xuan").show();
		tr.css("background-color",toggle("#fff","#eee"));
		$("#huowutable").append(tr);
	}
	$("#shanchuhuowu").click(shanchuhuowu);
	 
	$("#bianji").click(edit);
	function cz_shanchu(){
		if(!currZGD.huowu){
			tip($(this),"必须清空装柜单中的货物并保存，才能删除装柜单！",1500);
			return;
		}
		ask($(this),"确定要删除吗？",function(){
			postJson("zhuangguidan.php",{caozuo:"shanchu",_id:currZGD._id},function(res){
				if(res.err){
					tip($("#cz_shanchu"),res.err,1500);
				}else{
					listzhuangguidan(0);
				}
			});
		});		
	}
	$("#cz_shanchu").click(cz_shanchu);
	function cz_jieguan(){
		postJson("zhuangguidan.php",{caozuo:"jieguan",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_jieguan").click(cz_jieguan);
	function cz_jiaodan(){
		postJson("zhuangguidan.php",{caozuo:"jiaodan",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_jiaodan").click(cz_jiaodan);
	function cz_huitui(){
		postJson("zhuangguidan.php",{caozuo:"huitui",_id:currZGD._id,zhuangtai:currZGD.zhuangtai},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_huitui").click(cz_huitui);
	$("#cz_dayin").click(function(){
		window.open("dayin.html?showId="+currZGD._id,"_blank");
	});
	function cz_shenhe(){
		postJson("zhuangguidan.php",{caozuo:"shenhe",_id:currZGD._id},function(res){
			showDetailById(currZGD._id);
		});
	}
	$("#cz_shenhe").click(cz_shenhe);
	//翻页处理
	$("#prevPage").click(function(){
		listzhuangguidan($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listzhuangguidan($("#pager").data("offset")+1);
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
	function sel_zhuangguidan(){
		showDetailById($(this).data("_id"));
		$(".tr_selected").removeClass("tr_selected");
		$(this).addClass("tr_selected");
	}
	$(".tr_zhuangguidan").click(sel_zhuangguidan);
	function setYanhuodizhi(){
		postJson("../vendor/vendors.php",{_id:currZGD.gonghuoshang._id},function(vendor){
			if(vendor.yanhuodizhi){
				$("#zgd_yanhuodizhi").val(vendor.yanhuodizhi);
			}else{
				$("#zgd_yanhuodizhi").val("");
			}
		});
	}
	$("#zgd_gonghuoshang").change(setYanhuodizhi);
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	//制单（删除-货物清空时） 交单（回退） 审核（回退） 
	function statusColor(status,color){
		if(status == "制单"){//红色
			return "#FF4500";
		}
		if(status == "申请审核"){//黄色
			return "FFFF00";
		}
		if(status == "审核"){
			return color;
		}
	}
	//解释查询条件
	function getOptions(){
		var ret = {};
		var v = $("#th_bianhao").val().trim();
		if("" != v && "编号" != v){
			ret.bianhao = v+"0";
		}
		v = $("#th_guihao").val().trim();
		if("" != v && "柜号" != v){
			ret.guihao = v;
		}
		v = $("#th_zhuangtai").val().trim();
		if("" != v && "状态" != v){
			ret.zhuangtai = v;
		}
		/*
		var jdz = $("#th_jiaodanzhe").val().trim();
		if("" != jdz && "交单者" != jdz){
			ret.jiaodanzhe = getUserIdByName(jdz);
		}*/
		v = $("#th_zhidanzhe").val().trim();
		if("" != v && "制单者" != v){
			ret.zhidanzhe = getUserIdByName(jdz);
		}
		v = $("#th_zhuangguiriqi").val().trim();
		if("" != v && "装柜日期" != v){
			ret.zhuangguiriqi = v+"0";
		}
		v = $("#th_shenhezhe").val().trim();
		if("" != v && "审核者" != v){
			ret.shenhezhe = getUserIdByName(v);
		} 
		return ret;
	}
		//列出装柜单
	function listzhuangguidan(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var option = $.extend({cmd:cmd},getOptions());
		postJson("zhuangguidan.php",{caozuo:"chaxun",offset:offset*limit,limit:limit,option:option},function(zhuangguidans){
			$("#zhuangguidantable .tr_zhuangguidan").remove();
			each(zhuangguidans,function(n,zhuangguidan){
				var zhidanzhe,jiaodanzhe,shenhezhe;
				zhidanzhe = zhuangguidan.zhidanzhe?getUser(zhuangguidan.zhidanzhe).user_name:"";
				jiaodanzhe = zhuangguidan.jiaodanzhe?getUser(zhuangguidan.jiaodanzhe).user_name:"";
				shenhezhe = zhuangguidan.shenhezhe?getUser(zhuangguidan.shenhezhe).user_name:"";
				tr = tr_zhuangguidan.clone(true);
				tr.data("_id",zhuangguidan._id);
				tr.find("#td_bianhao").text(zhuangguidan._id);				
				tr.find("#td_guihao").text(zhuangguidan.guihao);
				tr.find("#td_zhuangtai").text(zhuangguidan.zhuangtai);
				tr.find("#td_zhidanzhe").text(zhidanzhe);
				//tr.find("#td_jiaodanzhe").text(jiaodanzhe);
				tr.find("#td_zhuangguiriqi").text(zhuangguidan.zhuangguiriqi);
				tr.find("#td_shenhezhe").text(shenhezhe);
				
				var color = toggle("#fff","#eee");
				tr.css("background-color",color);
				tr.find("#td_bianhao").css("background-color",statusColor(zhuangguidan.zhuangtai,color));
				
				$("#zhuangguidantable").append(tr);
			});
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else {
				//调整左侧宽度以便显示完整的列表
				$("#tableheader").click();
				if(zhuangguidans.length>0){
					$(".ui-layout-center").show();
					$(".tr_zhuangguidan").get(0).click();
				}else{
					$(".ui-layout-center").hide();
				}
			}
			if(offset<=0){
				$("#prevPage").css("color","gray");
			}else{
				$("#prevPage").css("color","blue");
			}
			if(zhuangguidans.length<limit){
				$("#nextPage").css("color","gray");
			}else{
				$("#nextPage").css("color","blue");
			}
		});
	}
 
	function readOnly(){
		editing = false;
		$(".myinput").removeAttr("contenteditable");
		$("#zgd_gonghuoshang").css("cursor","default").unbind("click").val(currZGD.gonghuoshang?currZGD.gonghuoshang.mingchen:"");
		$("#zgd_yanhuodizhi").attr("readonly","readonly");
		$(".plainInput").attr("readonly","readonly"); 
		if(!currZGD.qitafei){
			$("#qita_div").hide();
		}else{
			$("#qita_div").show();
		}
		$("#zhuangguidanmingxi").find(".plainBtn").hide();
		if(kebianji){
			$("#bianji").show();
		}
		$("#fangqi").hide();$("#baocun").hide();
		$("#zgd_zhuangguiriqi").datepicker( "destroy" );
	}
	
	function edit(){
		editing = true;
		$(".myinput").attr("contenteditable","true");
		$("#zgd_yanhuodizhi").removeAttr("readonly");
		$(".plainInput").removeAttr("readonly");
		$("#zhuangguidanmingxi").find(".plainBtn").show();
 		$("#zgd_gonghuoshang").css("cursor","pointer").xuanzeshangjia("",function(vendor){
 			currZGD.gonghuoshang = {_id:vendor._id,mingchen:vendor.mingchen};
 		}).attr("readonly","readonly");
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
		$("#zgd_zhuangguiriqi").datepicker();
		
		$("#zhuangguidan_liebiao_ctr").hide();
		$("#huowu_liebiao_ctr").show();
		listHuowu(0);
	}
	function showDetail(zgd){
		currZGD = zgd;
		$("#liucheng").show().liucheng(getTheUser(),zgd);
		$("#zgd_bianhao").val(currZGD._id);
		$("#zgd_guihao").val(currZGD.guihao);
		$("#zgd_zhuangguiriqi").val(currZGD.zhuangguiriqi);
		$("#zhuangguirenyuan").text(currZGD.zhuangguirenyuan);
		$(".tr_huowu").remove();
		each(zgd.huowu,function(i,huowu){
			var tr_huowu = tmpl_tr_huowu.clone(true);
			tr_huowu = feedHwTr(tr_huowu,huowu);
			tr_huowu.find(".td_left_most").show();
			tr_huowu.find("#xuan").hide();
			$("#selhuowutable").append(tr_huowu); 
		});

		liuyanElm.shuaxinliebiao({hostId:currZGD._id,hostType:"zhuangguidan"});
		readOnly();
	}
	
	function showDetailById(_id){
		postJson("zhuangguidan.php",{caozuo:"getbyid",_id:_id},function(zgd){
			showDetail(zgd);			
		});
	}

	jQuery.fn.liucheng = function(theUser,zhuangguidan){
		var that = this.empty();
		this.data("_id",zhuangguidan._id);
		each(zhuangguidan.liucheng,function(n,item){
			var tmpl = liuchengItem.clone(true);
			$("#lc_bianhao",tmpl).text(n+1);
			var usr = getUser(item.userId);
			$("#lc_touxiang",tmpl).attr("src",usr.photo);
			$("#lc_mingchen",tmpl).text(usr.user_name);
			$("#lc_dongzuo",tmpl).text(item.dongzuo);
			$("#lc_shijian",tmpl).text(new Date(item.time*1000).format("yyyy-MM-dd hh:mm"));
			if("制单" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","正在编制装柜单！");
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				$("#cz_dayin",caozuoItem).show();
				if((zhuangguidan.liucheng.length - 1) == n){
					if(theUser._id == zhuangguidan.zhidanzhe){
						kebianji = true;
						$("#cz_jiaodan",caozuoItem).show();
						$("#cz_shanchu",caozuoItem).show();
					}else{
						$("#cz_jieguan",caozuoItem).show();
					}
				}
				$("table",tmpl).append(caozuoItem);
			}else if("交单" == item.dongzuo){
				kebianji = false;
				("#lc_tr_panel",tmpl).attr("title","装柜单完成编制，可以打印出来指导装柜！");
				if((zhuangguidan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == item.userId){
						$("#cz_huitui",caozuoItem).show();
					}else{
						$("#cz_shenhe",caozuoItem).show();
					}
					$("table",tmpl).append(caozuoItem);
				}
			}else if("审核" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","装柜单已被审核与实际装柜情况一致！");
				if((zhuangguidan.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true); 
					if(theUser._id == item.userId){
						$("#cz_huitui",caozuoItem).show(); 
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
	var currZGD = null;
	var kebianji=true;
	var editing = false;
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	var caozuoTmpl = $("#lc_caozuo").detach();
	var liuchengItem = $("#liuchengItem").detach();
	var tr_zhuangguidan = $(".tr_zhuangguidan").detach();
	var tmpl_tr_huowu = $(".tr_huowu").detach();
	var tmpl_huowu = $(".tmpl_huowu").detach();
	var dingdanhuowu = $(".dingdanhuowu").detach();
	var currHuowu = null;
	var table_huowu = $(".huowu").clone(true);
	var tmpl_shuliangjianshu = $("#shuliangjianshu").clone(true);
	var tmpl_qitafeiyong = $(".qitafeiyong").detach();
	var tmpl_fahuodanhuowu = $(".tmpl_fahuodanhuowu").detach();
	
	 
	var liuyanElm = $("#liuyan").liuyan({hostType:"zhuangguidan",});
		
	var cmd = getUrl().cmd?getUrl().cmd:"";
	if("chaxun" == cmd){
		$('#currLocation', window.parent.document).text("装柜单/查询");
		$("#xinzengzhuangguidan").show();
	}else if("zhidan" == cmd){
		$('#currLocation', window.parent.document).text("装柜单/制单");
		$("#th_zhuangtai").val("制单").attr("readonly","readonly");
	}else if("daishenhe" == cmd){
		$('#currLocation', window.parent.document).text("装柜单/待审核");
		$("#th_zhuangtai").val("交单").attr("readonly","readonly");
	}
	listzhuangguidan(0,getUrl().showId);
	
		 	//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){		
		if(layout.state.west.innerWidth < $("#zhuangguidantable").width()){
			layout.sizePane("west",$("#zhuangguidantable").width()+20);
		}
	});
	$("#detailheader").click(function(){
		if(layout.state.center.innerWidth < $("#huowutable").width()){
			layout.sizePane("west",$("body").width()-$("#huowutable").width()-100);
		}
	}).dblclick(function(){layout.toggle("west");clearSelection();});
});