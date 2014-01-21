$(function(){
	/*
验货单
{
 _id:"xxx",
 zhuangtai:"xx",
 //yanhuodans:["xxx","xxx",...],//根据验货单id反查
 huowu:[{yhdId:"xx",guige:"xxx",danwei:"x",shuliang:22,jianshu:22,beizhu:"xxx"}...],
 liucheng:[制单 接单 结单 作废],
 yanhuoshougao:"xxx"
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
		postJson("yanhuodan.php",{caozuo:"baocun",yanhuodan:currYHD},function(res){ 
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
		list_sel_huowu($("#sel_fahuodan_pager").data("offset")+1);
	}
	$("#sel_fahuodan_pager").click(sel_fahuodan_pager);
	function guanbi_sel_fahuodan(){
		$("#sel_ctnr").hide();
	}
	$("#guanbi_sel_fahuodan").click(guanbi_sel_fahuodan);
	function list_sel_huowu(offset){
		if(offset<0){
			return;
		}
		$("#sel_fahuodan_pager").data("offset",offset); 
		postJson("yanhuodan.php",{caozuo:"chaxunhuowu",offset:offset*20,limit:20,option:{cmd:"",fhdId:$("#opt_yanhuodanid").val().trim()}},function(huowus){
			$(".tmpl_fahuodanhuowu").remove();
			each(huowus,function(i,huowu){
				tr = tmpl_fahuodanhuowu.clone(true);
				tr.find("#td_huowubianhao").text(huowu._id);
				tr.find("#td_gonghuoshang").text(huowu.gonghuoshang?huowu.gonghuoshang.mingchen:"");
				tr.find("#td_guige").text(huowu.guige);
				tr.find("#td_danwei").text(huowu.danwei);
				tr.find("#td_shuliang").text(huowu.shuliang);
				tr.find("#td_jianshu").text(huowu.jianshu);
				tr.find("#td_zhu").text(huowu.zhu);
				each(huowu.yanhuodan,function(i,yanhuodan){
					tr.find("#td_yanhuodan").append("<span>"+yanhuodan+"</span>&nbsp;");
				});
				tr.data("huowu",huowu);
				tr.css("background-color",toggle("#fff","#eee"));
				$("#sel_fahuodan").append(tr);
			});
		});
	}
	function tianjiahuowu(){
		$("#sel_ctnr").show().center().css("top","50px");
		if($("#sel_fahuodan").find("tr").length == 1){
			list_sel_huowu(0);
		}
	}
	$("#tianjiahuowu").click(tianjiahuowu);
	$("#bianji").click(edit);
	function cz_zuofei(){
		if(!confirm("确定要作废该验货单吗？")){
			return;
		}
		postJson("yanhuodan.php",{caozuo:"zuofei",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_zuofei").click(cz_zuofei);
	function cz_shouli(){
		postJson("yanhuodan.php",{caozuo:"shouli",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_shouli").click(cz_shouli);
	function cz_shenqingshenhe(){
		postJson("yanhuodan.php",{caozuo:"shenqingshenhe",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_shenqingshenhe").click(cz_shenqingshenhe);
	function cz_quxiaoshenqingshenhe(){
		postJson("yanhuodan.php",{caozuo:"quxiaoshenqingshenhe",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		})
	}
	$("#cz_quxiaoshenqingshenhe").click(cz_quxiaoshenqingshenhe);
	function cz_quxiaoshenhe(){
		postJson("yanhuodan.php",{caozuo:"quxiaoshenhe",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_quxiaoshenhe").click(cz_quxiaoshenhe);
	function cz_quxiaoshenqingshouli(){
		postJson("yanhuodan.php",{caozuo:"quxiaoshenqingshouli",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_quxiaoshenqingshouli").click(cz_quxiaoshenqingshouli);
	function cz_shenhe(){
		postJson("yanhuodan.php",{caozuo:"shenhe",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_shenhe").click(cz_shenhe);
	function cz_shenqingshouli(){
		postJson("yanhuodan.php",{caozuo:"shenqingshouli",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
 $("#cz_shenqingshouli").click(cz_shenqingshouli);
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
	$("#opt_yanhuodanid").change(function(){
		var yhdId = "FHD"+date2id($(this).val());
		$(this).val(yhdId);
		list_sel_huowu(0);
	});
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
		$("#yanhuodanmingxi").find(".plainBtn").hide();
		if(kebianji){
			$("#bianji").show();
		}
		$("#fangqi").hide();$("#baocun").hide();
	}
	
	function edit(){
		editing = true;
		$("#yhd_yanhuodizhi").removeAttr("readonly");
		$(".plainInput").removeAttr("readonly");
		$("#yanhuodanmingxi").find(".plainBtn").show();
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

		liuyanElm.shuaxinliebiao({hostId:currYHD._id,hostType:"yanhuodan"});
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
			if("新建" == item.dongzuo){
				if((yanhuodan.liucheng.length - 1) == n && theUser._id == item.userId){
					kebianji = true;
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					$("#cz_shenqingshouli",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("申请受理" == item.dongzuo){
				kebianji = false;
				if((yanhuodan.liucheng.length - 1) == n){
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
				if((yanhuodan.liucheng.length - 1) == n && theUser._id == item.userId){
					kebianji = true;
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true); 
					$("#cz_shenqingshenhe",caozuoItem).show();
					$("#cz_zuofei",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("申请审核" == item.dongzuo){ 
				if((yanhuodan.liucheng.length - 1) == n){
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
				if((yanhuodan.liucheng.length - 1) == n && theUser._id == item.userId){
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
	var tr_yanhuodan = $(".tr_yanhuodan").detach();
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
	$("#opt_yanhuodanid").datepicker();//.change(function(){$(this).val("YHD"+date2id($(this).val()))});
	var liuyanElm = $("#liuyan").liuyan({hostType:"yanhuodan",});
	listyanhuodan(0,getUrl().showId);
	
});