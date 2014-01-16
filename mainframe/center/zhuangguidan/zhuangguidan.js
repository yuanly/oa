$(function(){
	/*
装柜单
{
 _id:"xxx",
 zhuangtai:"xx",
 huowu:[{yhdId:"xx",guige:"xxx",danwei:"x",shuliang:22,jianshu:22,beizhu:"xxx"}...],
 liucheng:[制单 接单 结单 作废]
}
创建装柜单（理想情况从验货单选择货物？但有可能货物要在装柜现场验，可以从发货单选择货物？可能有货物还没发货，装柜时现场送货到装柜地点？这时候要提前做发货单。）
打印装柜单 装柜（要对货物做分拆。已选入验货单怎么办？货物单独成表！把订单信息也带上，方便查询和统计：客户、价格、商家）
调整装柜单 审核确认 打印给业务部门 打印给老板（带成本）
	*/
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	$("#huowutable").find("#td_fahuodan").click(function(){
		window.open("../fahuodan/fahuodan.html?showId="+$(this).text(),"_blank");
	});
	$("#shangyi").click(function(){
		var curr = $(this).parents(".tr_huowu");
		var prev = curr.prev(".tr_huowu");
		if(prev.length>0){
			curr = curr.detach();
			prev.before(curr);
		}
	});
	function sel_huowu2(){
		$("#sel_ctnr").hide();
		var huowu = $(this).data("huowu");
		var duplicate = false;
		$(".tr_huowu").each(function(i,hw){ 
			if(huowu.mingxiId == $(hw).data("huowu").mingxiId){
				duplicate = true;
				return false;
			}
		});
		if(duplicate){
			tip($("#tianjiahuowu"),"重复货物！",1500);
			return ;
		}
		var tr_huowu = tmpl_tr_huowu.clone(true);
		tr_huowu.data("huowu",huowu);
		tr_huowu.find("#td_fahuodan").text(huowu.fahuodan);
		tr_huowu.find("#td_gonghuoshang").text(huowu.gonghuoshang);
		tr_huowu.find("#td_guige").text(huowu.guige);
		tr_huowu.find("#td_danwei").text(huowu.danwei);
		tr_huowu.find("#td_shuliang").text(huowu.shuliang);
		tr_huowu.find("#td_jianshu").text(huowu.jianshu);
		tr_huowu.find("#td_zhu").text(huowu.zhu?huowu.zhu:"");
		$("#huowutable").append(tr_huowu);
	}
	$(".tmpl_fahuodanhuowu").click(sel_huowu2);
	function baocun(){ 
		var huowu = [];
		$(".tr_huowu").each(function(i,hw){
		 	huowu.push($(hw).data("huowu"));
		}); 
		currYHD.huowu = huowu;
		currYHD.yanhuoshougao = yuandanEditor.editorVal(); 
		postJson("zhuangguidan.php",{caozuo:"baocun",zhuangguidan:currYHD},function(res){ 
			showDetailById(currYHD._id);
		});
	}
	$("#baocun").click(baocun);
	$("#fangqi").click(function(){showDetailById(currYHD._id);}); 
	function shanchuhuowu(){
		$(this).parents(".tr_huowu").remove();
	}
	$("#shanchuhuowu").click(shanchuhuowu); 
	$(".list").dblclick(function(){$(this).val("");});
	function showDingdan(){
		window.open("../dingdan/dingdan.html?showId="+$(this).text(),"_blank");
	}
	$("#dingdanhao").click(showDingdan);  
	 
	function sel_fahuodan_pager(){
		list_sel_fahuodan($("#sel_fahuodan_pager").data("offset")+1);
	}
	$("#sel_fahuodan_pager").click(sel_fahuodan_pager);
	function guanbi_sel_fahuodan(){
		$("#sel_ctnr").hide();
	}
	$("#guanbi_sel_fahuodan").click(guanbi_sel_fahuodan);
	function list_sel_fahuodan(offset){
		if(offset<0){
			return;
		}
		$("#sel_fahuodan_pager").data("offset",offset); 
		postJson("../fahuodan/fahuodan.php",{caozuo:"chaxunforzhuangguidan",offset:offset*20,limit:20,option:{cmd:"",yhdId:$("#opt_zhuangguidanid").val().trim()}},function(fahuodans){
			$(".tmpl_fahuodanhuowu").remove();
			var i=1;
			each(fahuodans,function(n,fahuodan){
				each(fahuodan.huowu,function(n1,huowu){
					each(huowu.mingxi,function(n2,mingxi){
						tr = tmpl_fahuodanhuowu.clone(true);
						tr.data("id",mingxi.id);						//发货单 货物 要有id，否则验货单没法做保存。
						tr.find("#td_bianhao").text(i++);
						tr.find("#td_zhuangtai").text(fahuodan.zhuangtai);
						tr.find("#td_fahuodan").text(fahuodan._id);
						tr.find("#td_gonghuoshang").text(fahuodan.gonghuoshang?fahuodan.gonghuoshang.mingchen:"");
						tr.find("#td_guige").text(huowu.guige);
						tr.find("#td_danwei").text(huowu.danwei);
						tr.find("#td_shuliang").text(mingxi.shuliang);
						tr.find("#td_jianshu").text(mingxi.jianshu);
						tr.find("#td_zhu").text(mingxi.zhu);
						tr.data("huowu",{mingxiId:mingxi.id,fahuodan:fahuodan._id,gonghuoshang:fahuodan.gonghuoshang?fahuodan.gonghuoshang.mingchen:"",guige:huowu.guige,danwei:huowu.danwei,shuliang:mingxi.shuliang,jianshu:mingxi.jianshu,zhu:mingxi.zhu});
						
						tr.css("background-color",toggle("#fff","#eee"));
						if(fahuodan.zhuangtai == "作废"){
							tr.css("text-decoration","line-through");
						} 
						$("#sel_fahuodan").append(tr);
					});
				});
			});
		});
	}
	function tianjiahuowu(){
		$("#sel_ctnr").show().center().css("top","50px");
		if($("#sel_fahuodan").find("tr").length == 1){
			list_sel_fahuodan(0);
		}
	}
	$("#tianjiahuowu").click(tianjiahuowu);
	$("#bianji").click(edit);
	function cz_zuofei(){
		if(!confirm("确定要作废该验货单吗？")){
			return;
		}
		postJson("zhuangguidan.php",{caozuo:"zuofei",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_zuofei").click(cz_zuofei);
	function cz_shouli(){
		postJson("zhuangguidan.php",{caozuo:"shouli",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_shouli").click(cz_shouli);
	function cz_shenqingshenhe(){
		postJson("zhuangguidan.php",{caozuo:"shenqingshenhe",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_shenqingshenhe").click(cz_shenqingshenhe);
	function cz_quxiaoshenqingshenhe(){
		postJson("zhuangguidan.php",{caozuo:"quxiaoshenqingshenhe",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		})
	}
	$("#cz_quxiaoshenqingshenhe").click(cz_quxiaoshenqingshenhe);
	function cz_quxiaoshenhe(){
		postJson("zhuangguidan.php",{caozuo:"quxiaoshenhe",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_quxiaoshenhe").click(cz_quxiaoshenhe);
	function cz_quxiaoshenqingshouli(){
		postJson("zhuangguidan.php",{caozuo:"quxiaoshenqingshouli",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_quxiaoshenqingshouli").click(cz_quxiaoshenqingshouli);
	function cz_shenhe(){
		postJson("zhuangguidan.php",{caozuo:"shenhe",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_shenhe").click(cz_shenhe);
	function cz_shenqingshouli(){
		postJson("zhuangguidan.php",{caozuo:"shenqingshouli",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
 $("#cz_shenqingshouli").click(cz_shenqingshouli);
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
		postJson("../vendor/vendors.php",{_id:currYHD.gonghuoshang._id},function(vendor){
			if(vendor.yanhuodizhi){
				$("#yhd_yanhuodizhi").val(vendor.yanhuodizhi);
			}else{
				$("#yhd_yanhuodizhi").val("");
			}
		});
	}
	$("#yhd_gonghuoshang").change(setYanhuodizhi);
	$("#opt_zhuangguidanid").change(function(){
		var yhdId = "FHD"+date2id($(this).val());
		$(this).val(yhdId);
		list_sel_fahuodan(0);
	});
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	//解释查询条件
	function getOptions(){
		var ret = {};
		return ret;
	}
		//列出原稿
	function listzhuangguidan(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var cmd = getUrl().cmd?getUrl().cmd:"";
		var option = $.extend({cmd:cmd},getOptions());
		postJson("zhuangguidan.php",{caozuo:"chaxun",offset:offset*limit,limit:limit,option:option},function(zhuangguidans){
			$("#zhuangguidantable .tr_zhuangguidan").remove();
			each(zhuangguidans,function(n,zhuangguidan){
				var chuangjianzhe,shoulizhe,shenhezhe;
				chuangjianzhe = zhuangguidan.chuangjianzhe?getUser(zhuangguidan.chuangjianzhe).user_name:"";
				shoulizhe = zhuangguidan.shoulizhe?getUser(zhuangguidan.shoulizhe).user_name:"";
				shenhezhe = zhuangguidan.shenhezhe?getUser(zhuangguidan.shenhezhe).user_name:"";
				tr = tr_zhuangguidan.clone(true);
				tr.data("_id",zhuangguidan._id);
				tr.find("#td_bianhao").text(zhuangguidan._id);
				tr.find("#td_chuangjianzhe").text(chuangjianzhe);
				tr.find("#td_shoulizhe").text(shoulizhe);
				tr.find("#td_shenhezhe").text(shenhezhe);
				tr.find("#td_zhuangtai").text(zhuangguidan.zhuangtai);
				
				tr.css("background-color",toggle("#fff","#eee"));
				if(zhuangguidan.zhuangtai == "作废"){
					tr.css("text-decoration","line-through");
				}
				$("#zhuangguidantable").append(tr);
			});
			if(showId){
				showDetailById(showId);
			}else if(zhuangguidans.length>0){
				$(".tr_zhuangguidan").get(0).click();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
		});
	}
 
	function readOnly(){
		editing = false;
		$("#yhd_gonghuoshang").css("cursor","default").unbind("click").val(currYHD.gonghuoshang?currYHD.gonghuoshang.mingchen:"");
		yuandanEditor.editorReadonly();
		$("#yhd_yanhuodizhi").attr("readonly","readonly");
		$(".plainInput").attr("readonly","readonly"); 
		if(!currYHD.qitafei){
			$("#qita_div").hide();
		}else{
			$("#qita_div").show();
		}
		$("#zhuangguidanmingxi").find(".plainBtn").hide();
		if(kebianji){
			$("#bianji").show();
		}
		$("#fangqi").hide();$("#baocun").hide();
	}
	
	function edit(){
		editing = true;
		$("#yhd_yanhuodizhi").removeAttr("readonly");
		$(".plainInput").removeAttr("readonly");
		$("#zhuangguidanmingxi").find(".plainBtn").show();
 		$("#yhd_gonghuoshang").css("cursor","pointer").xuanzeshangjia("",function(vendor){
 			currYHD.gonghuoshang = {_id:vendor._id,mingchen:vendor.mingchen};
 		}).attr("readonly","readonly");
 		$("#yuandan_ctr").show();
 		yuandanEditor.editorWritable();
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
	}
	function showDetail(yhd){
		currYHD = yhd;
		$("#liucheng").show().liucheng(getTheUser(),yhd);
		$("#yhd_bianhao").val(currYHD._id);
		yuandanEditor.editorVal(currYHD.yanhuoshougao);
		if(!currYHD.yanhuoshougao){
			$("#yuandan_ctr").hide();
		}else{
			$("#yuandan_ctr").show();
		}
		$(".tr_huowu").remove();
		each(yhd.huowu,function(i,huowu){
			var tr_huowu = tmpl_tr_huowu.clone(true);
			tr_huowu.data("huowu",huowu);
			tr_huowu.find("#td_fahuodan").text(huowu.fahuodan);
			tr_huowu.find("#td_gonghuoshang").text(huowu.gonghuoshang);
			tr_huowu.find("#td_guige").text(huowu.guige);
			tr_huowu.find("#td_danwei").text(huowu.danwei);
			tr_huowu.find("#td_shuliang").text(huowu.shuliang);
			tr_huowu.find("#td_jianshu").text(huowu.jianshu);
			tr_huowu.find("#td_zhu").text(huowu.zhu?huowu.zhu:"");
			$("#huowutable").append(tr_huowu); 
		});

		liuyanElm.shuaxinliebiao({hostId:currYHD._id,hostType:"zhuangguidan"});
		readOnly();
	}
	
	function showDetailById(_id){
		postJson("zhuangguidan.php",{caozuo:"getbyid",_id:_id},function(dd){
			showDetail(dd);			
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
			if("新建" == item.dongzuo){
				if((zhuangguidan.liucheng.length - 1) == n && theUser._id == item.userId){
					kebianji = true;
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_shenqingshouli",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("申请受理" == item.dongzuo){
				kebianji = false;
				if((zhuangguidan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == item.userId){
						$("#cz_quxiaoshenqingshouli",caozuoItem).show();
					}else{
						$("#cz_shouli",caozuoItem).show();
					} 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("受理" == item.dongzuo){
				if((zhuangguidan.liucheng.length - 1) == n && theUser._id == item.userId){
					kebianji = true;
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true); 
					$("#cz_shenqingshenhe",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("申请审核" == item.dongzuo){ 
				if((zhuangguidan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == item.userId){
						$("#cz_quxiaoshenqingshenhe",caozuoItem).show();
					}else{
						$("#cz_shenhe",caozuoItem).show();
					} 
					$("table",tmpl).append(caozuoItem); 
				} 
			}else if("审核" == item.dongzuo){
				if((zhuangguidan.liucheng.length - 1) == n && theUser._id == item.userId){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true); 
					$("#cz_quxiaoshenhe",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
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
	var tr_zhuangguidan = $(".tr_zhuangguidan").detach();
	var tmpl_tr_huowu = $(".tr_huowu").detach();
	var tmpl_huowu = $(".tmpl_huowu").detach();
	var dingdanhuowu = $(".dingdanhuowu").detach();
	var currHuowu = null;
	var table_huowu = $(".huowu").clone(true);
	var tmpl_shuliangjianshu = $("#shuliangjianshu").clone(true);
	var tmpl_qitafeiyong = $(".qitafeiyong").detach();
	var tmpl_fahuodanhuowu = $(".tmpl_fahuodanhuowu").detach();
	
	var yuandanEditor = $("#yuandan").myeditor(700,300);
	yuandanEditor.editorReadonly();
	
	$("#sel_ctnr").draggable();
	$("#th_bianhao").datepicker().change(function(){$(this).val("YHD"+date2id($(this).val()))});
	$("#opt_zhuangguidanid").datepicker();//.change(function(){$(this).val("YHD"+date2id($(this).val()))});
	var liuyanElm = $("#liuyan").liuyan({hostType:"zhuangguidan",});
	listzhuangguidan(0,getUrl().showId);
	
});