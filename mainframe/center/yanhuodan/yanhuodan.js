$(function(){
	/*
验货单
{
 _id:"xxx",
 zhidanzhe:"xx",
 shoulizhe:"xx",
 shehezhe:"xx",
 zhuangtai:"xx",//状态：制单（删除） 申请受理 受理 申请审核（回退） 审核（回退，非受理者本人审核）
 //huowu:[{yhdId:"xx",guige:"xxx",danwei:"x",shuliang:22,jianshu:22,beizhu:"xxx"}...], 要从huowu表中关联
 liucheng:[...],
 yanhuoshougao:"xxx"
}
状态：制单（删除 谁都可以打印） 申请受理（回退） 受理 申请审核（回退） 审核（回退，非受理者本人审核）
只要没申请审核，制单者都可以修改甚至删除验货单（若要删除，必须已清空货物）。受理者已经拿了打印单，不用担心工作被否定。
制单者可以是受理者。只有受理者才能修改状态，而且仅能修改状态，而且是在申请审核前。

一个货物只能被一个验货单收录，如果要重复验货，被收入新验货单时，就会冲掉旧验货单信息（？）备注在选择货物的时候要带进来。
不考虑接管，因为验货单的处理不影响其他环节。货物总可以被抢到其他验货单，受理者不登记验货结果也不影响出货。
	*/
	$('#currLocation', window.parent.document).text("验货单管理");
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	$("#xinzengyanhuodan").click(function(){
		postJson("yanhuodan.php",{caozuo:"xinjian"},function(res){
			listyanhuodan(0);
		});	
	});
	$("#th_bianhao").datepicker().change(function(){
		$(this).val("YHD"+date2id($(this).val()));
		listyanhuodan(0);
	});
	$("#yhd_bianhao").click(function(){
			window.open("yanhuodan.html?showId="+$(this).val(),"_blank");		
		});
	var users = getUsers();users.unshift({"user_name":"制单者"});
	$("#th_chuangjianzhe").myselector(users,"user_name").bind("input",function(){
		listyanhuodan(0);
	});
	users = getUsers();users.unshift({"user_name":"受理者"});
	$("#th_shoulizhe").myselector(users,"user_name").bind("input",function(){
		listyanhuodan(0);
	});
	users = getUsers();users.unshift({"user_name":"审核者"});
	$("#th_shenhezhe").myselector(users,"user_name").bind("input",function(){
		listyanhuodan(0);
	});
	$("#th_zhuangtai").bind("input",function(){
		listyanhuodan(0);
	});
	/*
	$("#th_bianhao").bind("input",function(){
		listyanhuodan(0);
	});
	*/
	$("#shanchubeizhu").click(function(){
		$(this).parents("#div_zhu").remove();
	});
	$("#jiazhu").click(function(){
		var tr_zhu = $(this).parents("tr").next(".tr_zhu");
		if(tr_zhu.length == 0){
			tr_zhu = tmpl_tr_zhu.clone(true);
			$(this).parents("tr").after(tr_zhu);
		}
		var div_zhu = tmpl_div_zhu.clone(true);
		div_zhu.find("#riqi").text(new Date().format("yyyy-MM-dd"));
		tr_zhu.find("#td_zhu").append(div_zhu);
	});
	$("#huowutable").find("#td_huowubianhao").click(function(){ 
		var showId = $(this).text().substr(0,$(this).text().indexOf("HW"));
		window.open("../fahuodan/fahuodan.html?showId="+showId,"_blank");
	});
	$("#shangyi").click(function(){
		var curr = $(this).parents(".tr_huowu");
		var prev = curr.prev();
		if(prev.hasClass("tr_zhu")){
			prev = prev.prev();
		}
		if(prev.hasClass("tr_huowu")){
			var tr_zhu = curr.next();
			curr = curr.detach();
			prev.before(curr);
			if(tr_zhu.hasClass("tr_zhu")){
				prev.before(tr_zhu);
			}
		}
	});
	function sel_huowu2(){
		var huowu = $(this).data("huowu");
		if(huowu.yanhuodan){
			tip($("#tianjiahuowu"),"该货物已选入其它验货单！",1500);
			return ;
		}
		var duplicate = false;
		$(".tr_huowu").each(function(i,hw){ 
			if(huowu._id == $(hw).data("huowu")._id){
				duplicate = true;
				return false;
			}
		});
		if(duplicate){
			tip($("#tianjiahuowu"),"该货物已被选择！",1500);
			return ;
		}
		
		$("#sel_ctnr").hide();
		var tr_huowu = tmpl_tr_huowu.clone(true);
		tr_huowu.data("huowu",huowu);
		tr_huowu.find("#td_huowubianhao").text(huowu._id);
		tr_huowu.find("#td_kehu").text(huowu.kehu);
		tr_huowu.find("#td_gonghuoshang").text(huowu.gonghuoshang.mingchen);
		tr_huowu.find("#td_yangban").text(huowu.yangban);
		tr_huowu.find("#td_guige").text(huowu.guige);
		tr_huowu.find("#td_danwei").text(huowu.danwei);
		tr_huowu.find("#td_shuliang").text(huowu.shuliang);
		tr_huowu.find("#td_jianshu").text(huowu.jianshu);
		tr_huowu.find("#td_zhuangtai").val(huowu.zhuangtai?huowu.zhuangtai:"待查");
		tr_huowu.find("#td_beizhu").text(huowu.zhu?huowu.zhu:"");
		$("#huowutable").append(tr_huowu);
	}
	$(".tmpl_fahuodanhuowu").click(sel_huowu2);
	function baocun(){
		//huowu:{_id:"huowuId",yanhuodan:{_id:"yanhuodanId",index:1,zhuangtai:"xx",beizhu:[{riqi:"xx",zhu:"xx"}]}}
		var huowu = [];
		$(".tr_huowu").each(function(i,hw){
			var obj = $(hw).data("huowu");
			var yhd = {_id:currYHD._id,index:i};
			yhd.zhuangtai = $(this).find("#td_zhuangtai").val();
			var tr_zhu = $(this).next(".tr_zhu");
			if(tr_zhu.length>0){
				var beizhu = [];
				tr_zhu.find(".div_zhu").each(function(i,z){
					if("" != $(this).find("#zhu").text().trim()){
						beizhu.push({riqi:$(this).find("#zhuriqi").text(),zhu:$(this).find("#zhu").text()});
					}
				});
				if(beizhu.length>0){
					yhd.beizhu = beizhu;
				}
			}
		 	huowu.push({_id:obj._id,yanhuodan:yhd});
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
		var fhdId = $("#opt_yanhuodanid").val().trim();
		if(fhdId != ""){
			fhdId += "0";
		}
		postJson("yanhuodan.php",{caozuo:"chaxunhuowu",offset:offset*20,limit:20,option:{cmd:"",fhdId:fhdId}},function(huowus){
			$(".tmpl_fahuodanhuowu").remove();
			each(huowus,function(i,huowu){
				tr = tmpl_fahuodanhuowu.clone(true);
				tr.find("#td_huowubianhao").text(huowu._id);
				tr.find("#td_kehu").text(huowu.kehu);
				tr.find("#td_quyu").text(huowu.gonghuoshang?huowu.gonghuoshang.quyu:"");
				tr.find("#td_gonghuoshang").text(huowu.gonghuoshang?huowu.gonghuoshang.mingchen:"");
				tr.find("#td_yangban").text(huowu.yangban);
				tr.find("#td_guige").text(huowu.guige);
				tr.find("#td_danwei").text(huowu.danwei);
				tr.find("#td_shuliang").text(huowu.shuliang);
				tr.find("#td_jianshu").text(huowu.jianshu);
				tr.find("#td_zhu").text(huowu.zhu);
				if(huowu.yanhuodan){
					if(huowu.yanhuodan.zhuangtai=="通过"){
						tr.find("#td_yanhuodan").html("<font color=green>"+huowu.yanhuodan._id+"</font>");
					}else if(huowu.yanhuodan.zhuangtai=="不通过"){
						tr.find("#td_yanhuodan").html("<font color=red>"+huowu.yanhuodan._id+"</font>");
					}else{
						tr.find("#td_yanhuodan").text(huowu.yanhuodan._id);
					}					
				}
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
	function cz_shanchu(){
		if(!currYHD.huowu){
			tip($(this),"必须清空验货单中的货物并保存，才能删除验货单！",1500);
			return;
		}
		postJson("yanhuodan.php",{caozuo:"shanchu",_id:currYHD._id},function(res){
			if(res.err){
				tip($("#cz_shanchu"),res.err,1500);
			}else{
				showDetailById(currYHD._id);
			}
		});
	}
	$("#cz_shanchu").click(cz_shanchu);
	function cz_jieguan(){
		postJson("yanhuodan.php",{caozuo:"jieguan",_id:currYHD._id},function(res){
			showDetailById(currYHD._id);
		});
	}
	$("#cz_jieguan").click(cz_jieguan);
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
	function cz_dayin(){
		window.open("dayin.html?showId="+currYHD._id,"_blank");
	}
	function cz_miyin(){
		window.open("dayin.html?showId="+currYHD._id+"&jiami=ture","_blank");
	}
	function cz_miyin2(){
		window.open("dayin.html?showId="+currYHD._id+"&shangjia=ture","_blank");
	}
	$("#cz_dayin").click(cz_dayin);
	$("#cz_miyin").click(cz_miyin);
	$("#cz_miyin2").click(cz_miyin2);
	function cz_huitui(){
		var that = $(this);
		postJson("yanhuodan.php",{caozuo:"huitui",_id:currYHD._id,zhuangtai:currYHD.zhuangtai},function(res){
			if(res.err){
				tip(that,res.err,1500);
			}else{
				showDetailById(currYHD._id);
			}
		});
	}
	$("#cz_huitui").click(cz_huitui);
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
		$(this).parents("#lc_tb_in").find("#lc_caozuo").toggle();
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
	//制单 申请受理 受理 申请审核 审核
	function statusColor(status,color){
		if(status == "制单"){//红色
			return "#FF4500";
		}
		if(status == "申请受理"){//棕色
			return "#FF6347";
		}
		if(status == "受理"){//粉红
			return "#FFB6C1";
		}
		if(status == "申请审核"){//黄色
			return "FFFF00";
		}
		if(status == "审核"){
			return color;
		}
	}
	function getUserIdByName(name){
		var ret="";
		each(getUsers(),function(i,user){
			if(name == user.user_name){
				ret = user._id;
				return false;
			}
		});
		return ret;
	}
	//解释查询条件
	function getOptions(){
		var ret = {};
		var bh = $("#th_bianhao").val().trim();
		if("" != bh && "编号" != bh){
			ret.bianhao = bh+"0";
		}
		var zt = $("#th_zhuangtai").val().trim();
		if("" != zt && "状态" != zt){
			ret.zhuangtai = zt;
		}
		var cjz = $("#th_chuangjianzhe").val().trim();
		if("" != cjz && "制单者" != cjz){
			var id = getUserIdByName(cjz);
			if(id){
				ret.chuangjianzhe = id;
			}
		}
		var slz = $("#th_shoulizhe").val().trim();
		if("" != slz && "受理者" != slz){
			var id = getUserIdByName(slz);
			if(id){
				ret.shoulizhe = id;
			}
		}
		var shz = $("#th_shenhezhe").val().trim();
		if("" != shz && "审核者" != shz){
			var id = getUserIdByName(shz);
			if(id){
				ret.shenhezhe = id;
			}
		}
		return ret;
	}
		//列出原稿
	function listyanhuodan(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
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
				
				var color = toggle("#fff","#eee");
				tr.css("background-color",color);
				tr.find("#td_bianhao").css("background-color",statusColor(yanhuodan.zhuangtai,color));
				
				$("#yanhuodantable").append(tr);
			});
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else{
				//调整左侧宽度以便显示完整的列表
				$("#tableheader").click();
				if(yanhuodans.length>0){
					$(".ui-layout-center").show();
					$(".tr_yanhuodan").get(0).click();
				}else{
					$(".ui-layout-center").hide();
				}
			}
			if(offset<=0){
				$("#prevPage").css("color","gray");
			}else{
				$("#prevPage").css("color","blue");
			}
			if(yanhuodans.length<limit){
				$("#nextPage").css("color","gray");
			}else{
				$("#nextPage").css("color","blue");
			}
		});
	}
 
	function readOnly(){
		editing = false;
		$(".myinput").removeAttr("contenteditable");
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
		$(".myinput").attr("contenteditable","true");
		$("#yhd_yanhuodizhi").removeAttr("readonly");
		$(".plainInput").removeAttr("readonly");
		if(getTheUser()._id != currYHD.shoulizhe){
			$(".zhuangtai").attr("readonly","readonly");
		}
		$("#yanhuodanmingxi").find(".plainBtn").show();
		if(getTheUser()._id != currYHD.zhidanzhe){
			$(".shanchu").hide();
			$("#tianjiahuowu").hide();
		}
 		$("#yhd_gonghuoshang").css("cursor","pointer").xuanzeshangjia("",function(vendor){
 			currYHD.gonghuoshang = {_id:vendor._id,mingchen:vendor.mingchen};
 		}).attr("readonly","readonly");
 		$("#yuandan_ctr").show();
 		yuandanEditor.editorWritable();
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
	}
	
	function cmp(hw1,hw2){
		if(!hw1.yanhuodan.index){
			return -1;
		}
		if(!hw2.yanhuodan.index){
			return 1;
		}
		return hw1.yanhuodan.index - hw2.yanhuodan.index;
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
		$(".tr_zhu").remove();
		postJson("yanhuodan.php",{caozuo:"huowu",_id:yhd._id},function(huowus){
			var hws = huowus.sort(cmp);
			each(hws,function(i,huowu){
				var tr_huowu = tmpl_tr_huowu.clone(true);
				tr_huowu.data("huowu",huowu);
				tr_huowu.find("#td_huowubianhao").text(huowu._id);
				tr_huowu.find("#td_kehu").text(huowu.kehu);
				tr_huowu.find("#td_gonghuoshang").text(huowu.gonghuoshang.mingchen);
				tr_huowu.find("#td_yangban").text(huowu.yangban);
				tr_huowu.find("#td_guige").text(huowu.guige);
				tr_huowu.find("#td_danwei").text(huowu.danwei);
				tr_huowu.find("#td_shuliang").text(huowu.shuliang);
				tr_huowu.find("#td_jianshu").text(huowu.jianshu);
				tr_huowu.find("#td_beizhu").text(huowu.zhu?huowu.zhu:"");
				tr_huowu.find("#td_zhuangtai").val(huowu.yanhuodan.zhuangtai);
				$("#huowutable").append(tr_huowu);
				if(huowu.yanhuodan.beizhu && huowu.yanhuodan.beizhu.length>0){
					var tr_zhu = tmpl_tr_zhu.clone(true);
					each(huowu.yanhuodan.beizhu,function(i,zhu){
						var div_zhu = tmpl_div_zhu.clone(true);
						div_zhu.find("#zhuriqi").text(zhu.riqi);
						div_zhu.find("#zhu").text(zhu.zhu);
						tr_zhu.find("#td_zhu").append(div_zhu);
					});
					$("#huowutable").append(tr_zhu);
				}
			});
			readOnly();
		});
		
		liuyanElm.shuaxinliebiao({hostId:currYHD._id,hostType:"yanhuodan"});
		readOnly();
	}
	
	function showDetailById(_id){
		postJson("yanhuodan.php",{caozuo:"getbyid",_id:_id},function(yhd){
			showDetail(yhd);
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
			if("制单" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","验货单已创建，正在进行编制！");
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				var caozuoItem = caozuoTmpl.clone(true);
				$("#cz_dayin",caozuoItem).show();
				$("#cz_miyin",caozuoItem).show();
				$("#cz_miyin2",caozuoItem).show();
				if(theUser._id == yanhuodan.zhidanzhe){
					kebianji = true;
					if(!inLiucheng(yanhuodan.liucheng,"申请审核")){
						$("#cz_shanchu",caozuoItem).show();
					}
					if((yanhuodan.liucheng.length - 1) == n){
						$("#cz_shenqingshouli",caozuoItem).show();
					}
				}else{
					if(!inLiucheng(yanhuodan.liucheng,"申请审核")){
						$("#cz_jieguan",caozuoItem).show();
					}
				}
				$("table",tmpl).append(caozuoItem);
/*状态：制单（删除 接管） 申请受理（回退） 受理 申请审核（回退） 审核（回退，非受理者本人审核）
只要没申请审核，制单者都可以修改甚至删除验货单（若要删除，必须已清空货物）。受理者已经拿了打印单，不用担心工作被否定。
制单者可以是受理者。只有受理者才能修改状态，而且仅能修改状态，而且是在申请审核前。
一个货物只能被一个验货单收录，如果要重复验货，被收入新验货单时，就会冲掉旧验货单信息（？）备注在选择货物的时候要带进来。*/
			}else if("申请受理" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","验货单已编制好，申请验货员受理！");
				if((yanhuodan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if((yanhuodan.liucheng.length - 1) == n && theUser._id == yanhuodan.zhidanzhe){
						$("#cz_huitui",caozuoItem).show();
					}
					$("#cz_shouli",caozuoItem).show(); 
					$("table",tmpl).append(caozuoItem);
				}
			}else if("受理" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","验货员受理了验货单，正在按依照验货单开展验货！");
				if((yanhuodan.liucheng.length - 1) == n && theUser._id == fahuodan.shoulizhe){
					kebianji = true;
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true); 
					$("#cz_shenqingshenhe",caozuoItem).show();
					$("table",tmpl).append(caozuoItem);
				}
			}else if("申请审核" == item.dongzuo){ 
				kebianji = false;
				("#lc_tr_panel",tmpl).attr("title","验货员已经完成验货并录入验货结果，申请审核！");
				if((yanhuodan.liucheng.length - 1) == n){
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == fahuodan.shoulizhe){
						$("#cz_huitui",caozuoItem).show();
					}else{
						$("#cz_shenhe",caozuoItem).show();
					} 
					$("table",tmpl).append(caozuoItem); 
				} 
			}else if("审核" == item.dongzuo){
				("#lc_tr_panel",tmpl).attr("title","验货单已被审核！");
				if((yanhuodan.liucheng.length - 1) == n && theUser._id == item.userId){
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
	var tmpl_div_zhu = $("#div_zhu").detach();
	var tmpl_tr_zhu = $(".tr_zhu").detach();
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
	$("#opt_yanhuodanid").datepicker();//.change(function(){$(this).val("YHD"+date2id($(this).val()))});
	var liuyanElm = $("#liuyan").liuyan({hostType:"yanhuodan",});
	
	var cmd = getUrl().cmd?getUrl().cmd:"";
	if("daishouli"== cmd){
		$("#th_zhuangtai").val("申请受理");
	}else if("daishenhe" == cmd){
		$("#th_zhuangtai").val("申请审核");
	}
	
	var cmd = getUrl().cmd?getUrl().cmd:"";
	if("chaxun" == cmd){		
		$("#xinzengyanhuodan").show();
		$('#currLocation', window.parent.document).text("验货单/查询");
	}else	if("daishouli"== cmd){
		$('#currLocation', window.parent.document).text("验货单/待受理");
		$("#th_zhuangtai").val("申请受理").attr("readonly","readonly");
	}else if("daishenhe"== cmd){
		$('#currLocation', window.parent.document).text("验货单/待审核");
		$("#th_zhuangtai").val("申请审核").attr("readonly","readonly");
	}
	listyanhuodan(0,getUrl().showId);
	
			 	//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){
		if(layout.state.west.innerWidth < $("#yanhuodantable").width()){
			layout.sizePane("west",$("#yanhuodantable").width()+20);
		}
	});
	$("#detailheader").click(function(){
		if(layout.state.center.innerWidth < $("#huowutable").width()){
			layout.sizePane("west",$("body").width()-$("#huowutable").width()-100);
		}
	}).dblclick(function(){layout.toggle("west");clearSelection();});
});