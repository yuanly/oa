﻿/*
//
{_id:"xx",
	index:"A232",//人工编址，索引
	accesss:122, 
	taiguoxinghao:"",
	zhongguoxinghao:"",
	py:[xx],//中国型号的拼音首字母
	shangjia:{_id:1,mingchen:"",py:[],quyu:""},
	jiage:[beizhu:"",zhi:1.2],
	danwei:"件",
	jianmashu:23.1,//
	jiandanwei:"码",//jianmashu和jiandanwei在danwei=="件"时有效
	yijiazhe:2,
	yijiariqi:"2013/09/28",
	zhuantai:"",
	beizhu:""
}
*/
$(function(){
	$('#currLocation', window.parent.document).text("样板管理");
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	//新增样板
	function xinzengyangban_handle(){
		currSample = null;
		$(".ui-layout-center").show();
		obj2form({danwei:"码",zhuangtai:"正常",yijiazhe:getTheUser()._id,yijiariqi:(new Date()).format("yyyy/MM/dd")});
		bianji();
		$("#liuyan").hide();
	}
	$("#xinzengyangban").click(xinzengyangban_handle);
	$(".list").dblclick(function(){
		$(this).val("");
		});
	//检查是否有重复，若有重复则提示并清空
	function bianhao_change(){
		var bh = $("#bianhao").val().trim(); 
		if(bh != "" && (currSample == null || bh != currSample._id)){
			postJson("samples.php",{"caozuo":"sfchongfu","index":bh},function(res){
				if(res.err){
					$("#bianhao").val("");
					tip($("#bianhao"),res.err,1500);
				}
			});
		}
	}
	$("#bianhao").change(bianhao_change);
	//提交
	function tijiao_handle(){
		var bh = $("#bianhao").val().trim(); 
		if("" == bh){
			tip($("#bianhao"),"样板编号不能为空！",1500);
			return;
		}
		var yangban = form2obj();
		if(!yangban.zhongguoxinghao){
			tip(null,"中国型号不能为空！",1500);
			return;
		}
		if("件" == yangban.danwei){
			if(!yangban.jianmashu || !yangban.jiandanwei){
				tip(null,"每件数量/单位不能为空！",1500);
				return;
			}
		}
		var xinbianhao = false;		
		if(currSample == null || bh != currSample.index){
			xinbianhao = true;
		} 
		postJson("samples.php",{"caozuo":"sfchongfu","index":bh},function(res){
			if(res.err && xinbianhao){
				$("#bianhao").val("");
				tip($("#bianhao"),"编号重复，请重置！",1500);
			}else{
				yangban.py = makePy(yangban.zhongguoxinghao);
				
				postJson("sample.php",yangban,function(res){
					if(res.success == true){
						/*
						//location.reload();
						currSample = yangban;
						obj2form(yangban);
						zhidu();
						liuyanElm.shuaxinliebiao({hostId:yangban._id});
						tip($("#bianji"),"成功提交样板信息！",1500);						
						*/
						tip(null,"成功提交样板信息！",1500);						
						listYangban(0);
					}else{
						ask3(null,res.err);
					}
				});
			}
		});
	}
	
	$("#tijiao").click(tijiao_handle);
	//设置记录点击处理，在模板被剥离前。
	$(".tr_sample").click(function(){
		$(".selected").removeClass("selected");
		$(this).addClass("selected");
		showDetail($(this).data("_id"));
	});
	//筛选处理
	$(".option").changex(function(){
		listYangban(0);
	}).focus(function(){
		$(".option:not(:focus)").val("");
		$(".option:not(:focus)").data("lastValue","");
	});
		//翻页处理
	$("#prevPage").click(function(){
		listYangban($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listYangban($("#pager").data("offset")+1);
	});
	$("#bianji").click(function(){
		bianji();
	});
	$("#beixuan_bianhao").click(function(){
		showDetail($(this).text());
	});
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
	//列出样板
	function listYangban(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		postJson("samples.php",{offset:offset*limit,limit:limit,option:{"bianhao":$("#option_bianhao").data("lastValue"),
																																		"shangjia":$("#option_shangjia").data("lastValue"),
																																		"taixing":$("#option_taixing").data("lastValue"),
																																		"zhongxing":$("#option_zhongxing").data("lastValue")}},function(samples){
			$("#sampletable .tr_sample").remove();
			each(samples,function(n,sample){
				tr = tr_sample.clone(true);
				tr.data("_id",sample._id);
				tr.find("#td_bianhao").text(sample.index);
				tr.find("#td_taiguoxinghao").text(sample.taiguoxinghao);
				var jiage = jiages2str(sample.jiage);
				if(jiage.length>15){
					tr.find("#td_jiage").html("<font style='font-size:0.8em'>"+jiage+"</font>").attr("title",jiage);
				}else{
					tr.find("#td_jiage").text(jiage).attr("title",jiage);
				}
				tr.find("#td_danwei").text(sample.danwei);
				if(sample.zhongguoxinghao && sample.zhongguoxinghao.length>15){
					tr.find("#td_zhongguoxinghao").html("<font style='font-size:0.8em'>"+sample.zhongguoxinghao+"</font>");
				}else{
					tr.find("#td_zhongguoxinghao").text(sample.zhongguoxinghao);
				}
				tr.find("#td_yijiariqi").text(sample.yijiariqi);
				if(sample.shangjia){
					if(sample.shangjia.mingchen.length>10){
						tr.find("#td_shangjia").html("<font style='font-size:0.8em'>"+sample.shangjia.mingchen+"</font>");
					}else{
						tr.find("#td_shangjia").text(sample.shangjia.mingchen);
					}
				}
				tr.css("background-color",toggle("#fff","#eee"));
				if(sample.zhuangtai == "停产"){
					tr.css("color","gray").css("text-decoration","line-through");
				}else if(sample.zhuangtai == "缺货"){
					tr.css("color","gray").css("font-style","italic");
				}
				$("#sampletable").append(tr);
			});
			if(showId){
				showDetail(showId);
				layout.close("west");
			}else if(samples.length>0){//将列表第一个商家显示在右边的商家详情表单
				$(".ui-layout-center").show();
				$(".tr_sample").get(0).click();
			}else{
				$(".ui-layout-center").hide();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
			if(offset<=0){
				$("#prevPage").css("color","gray");
			}else{
				$("#prevPage").css("color","blue");
			}
			if(samples.length<limit){
				$("#nextPage").css("color","gray");
			}else{
				$("#nextPage").css("color","blue");
			}
		});
	}
	//将指定id的样板详情显示在右侧
	function showDetail(id){
		postJson("samples.php",{_id:id},function(sample){
			currSample = sample;
			obj2form(sample);
			zhidu();
			liuyanElm.shuaxinliebiao({hostId:id});
		});
	}
	
	//价格数组转换成字符串
	function jiages2str(jiages){
		var str = "";
		each(jiages,function(n,jiage){
			if(jiage.beizhu){
				str += "【"+jiage.beizhu+" "+jiage.zhi+"元】 ";
			}else{
				str += "【"+jiage.zhi+"元】 ";
			}
		});
		return str;
	}
	//用参数对象更新表单的内容
	function obj2form(yangban){
		$("#liuyan").show();
		$("#xiangdan").data("yangban",yangban);
		$("#bianhao").vals(yangban.index);
		$("#taiguoxinghao").vals(yangban.taiguoxinghao);
		$("#zhongguoxinghao").vals(yangban.zhongguoxinghao);
		if(yangban.zhongguoxinghao){
			$("#zhongguoxinghao").text(yangban.zhongguoxinghao);
		}else{
			$("#zhongguoxinghao").html("&nbsp;");
		}
		$("#jiage").val(jiages2str(yangban.jiage));
		if(!$("#jiage").val()){
			$("#jiage").val("【 元】");
		}
		$("#danwei").vals(yangban.danwei);
		if(yangban.danwei == "件"){
			$("#tr_jianmashu").show();
			$("#jianmashu").vals(yangban.jianmashu);
			$("#jiandanwei").val(yangban.jiandanwei?yangban.jiandanwei:"码");
		}else{
			$("#jianmashu").vals("");
			$("#jiandanwei").val("码");
			$("#tr_jianmashu").hide();
		}
		if(yangban.shangjia){
			$("#shangjia").vals(yangban.shangjia.mingchen);
			$("#shangjia").data("shangjia",yangban.shangjia);
		}else{
			$("#shangjia").val("");
			$("#shangjia").removeData("shangjia");
		}
		var user = getUser(yangban.yijiazhe);
		if(user){
			$("#yijiazhe").vals(user.user_name);
		}else{
		$("#yijiazhe").val("");
		}
		$("#yijiariqi").val(yangban.yijiariqi)
		$("#zhuangtai").vals(yangban.zhuangtai);
		$("#beixuan").empty();
		if(!yangban.beixuan || yangban.beixuan.length<=1){
			$("#beixuan").append("该样板还没有后备，请尽快寻找！");
		}else{
			each(yangban.beixuan,function(n,beixuan){
				if(beixuan.index != yangban.index){
					var beixuan_elm = beixuan_tmpl.clone(true);
					beixuan_elm.find("#beixuan_bianhao").text(beixuan.index);
					if(beixuan.shangjia){
						//beixuan_elm.find("#beixuan_shangjia").vals(beixuan.shangjia.mingchen);
						beixuan_elm.find("#beixuan_shangjia").text(beixuan.shangjia.mingchen);
					}else{
						beixuan_elm.find("#beixuan_shangjia").val("");
					}
					beixuan_elm.find("#beixuan_jiage").text(jiages2str(beixuan.jiage));
					$("#beixuan").append(beixuan_elm);
				}
			});
		}
		//$("#beizhu").editorVal(yangban.beizhu);
		beizhuEditor.editorVal(yangban.beizhu);
	}
	$("#danwei").bind("input",function(){
		if("件" == $(this).val()){
			$("#tr_jianmashu").show();
		}else{
			$("#tr_jianmashu").hide();
		}
	});
	//读取表单内容，构造对象并返回
	function form2obj(){
		var yangban = {};
		if(currSample){
			yangban._id = currSample._id;
		}
		yangban.index = $("#xiangdan #bianhao").val().trim().toUpperCase();
		yangban.taiguoxinghao = $("#xiangdan #taiguoxinghao").val().trim().toUpperCase();
		yangban.zhongguoxinghao = $("#xiangdan #zhongguoxinghao").text().trim().toUpperCase();
		yangban.jiage = getPrices($("#xiangdan #jiage").val());
		yangban.danwei = $("#xiangdan #danwei").val().trim();
		if("件" == yangban.danwei){
			yangban.jianmashu = parseFloat($("#jianmashu").val());
			yangban.jiandanwei = $("#jiandanwei").val();
		}
		var shangjia = $("#xiangdan #shangjia").data("shangjia");
		if(shangjia){
			yangban.shangjia = {_id:shangjia._id,mingchen:shangjia.mingchen,py:shangjia.py,quyu:shangjia.quyu};
		}
		yangban.yijiazhe = getUserIdByName($("#xiangdan #yijiazhe").val().trim());
		yangban.yijiariqi = $("#xiangdan #yijiariqi").val().trim();
		yangban.beizhu = beizhuEditor.editorVal();//$("#xiangdan #beizhu").editorVal();
		yangban.zhuangtai = $("#zhuangtai").val().trim();
		return yangban
	}
	//进入编辑状态
	function bianji(){
		$("#xiangdan").find(".plainInput").removeAttr("disabled");
		beizhuEditor.editorWritable();//$("#beizhu").editorWritable();
		$("#bianji").hide();
		$("#tijiao").show();
		$("#jiage").val($("#jiage").val()+" 【元】 【元】 【元】");
		$("#zhongguoxinghao").attr("contenteditable","true");
	}
	//进入只读状态
	function zhidu(){
		$("#xiangdan").find(".plainInput").attr("disabled",true);
		beizhuEditor.editorReadonly();//$("#beizhu").editorReadonly();
		$("#bianji").show();
		$("#tijiao").hide();
		$("#zhongguoxinghao").removeAttr("contenteditable");
	}
	//解释价格内容
	function getPrices(s){
	 var r = [];
	 var p = {};
		var i = 0;
		var si,ei;
		while(i>=0){
			si = s.substring(i).search(/(\d+\.)?\d+\s*元\s*】/);
			if(si>=0){
				si += i;
				ei = s.substring(i,si).lastIndexOf("【");
				if(ei>=0){
					p={};
					p.beizhu = s.substring(i+ei+1,si).trim();
					i = s.substring(si).search(/元\s*】/);
					p.zhi = parseFloat(s.substring(si,i+si).trim());
					i = i+si+2;
					r.push(p);
				}else{
					break;
				}
			}else{
				break;
			}
		}
		return r;
	} 
	///////////////////////////////初始化/////////////////////////////////////////////
	var limit = 35;
	var currSample=null;
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	$(".plainInput").css("background-color","white");
	//定义议价日期 的 日期控件
	$("#yijiariqi").datepicker().attr("disabled",true);
	//定义备注 的 编辑器
	var beizhuEditor = $("#beizhu").myeditor(700,200);beizhuEditor.editorReadonly();

	$("#jiage").change(function(){
 		$(this).val(jiages2str(getPrices($(this).val())));
 	});
 	var beixuan_tmpl = $("#beixuan_tmpl").detach();
 	$("#shangjia").xuanzeshangjia();
 	$("#yijiazhe").userSelector();
 	var tr_sample = $(".tr_sample").detach();
 
 	//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){
		layout.sizePane("west",$("#sampletable").width()+20);
	});
	$("#detailheader").click(function(){
		layout.sizePane("west",$("body").width()-$(this).width()-100);
	}).dblclick(function(){layout.toggle("west");clearSelection();});
	//列出样板
	listYangban(0,getUrl().showId);
	
	var liuyanElm = $("#liuyan").liuyan({hostType:"yangban",});
	//liuyanElm.setOption({hostId:"123"});
});