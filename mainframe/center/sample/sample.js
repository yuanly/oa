/*
//
{_id:"A232",
	taiguoxinghao:"",
	zhongguoxinghao:"",
	shangjia:{_id:1,mingchen:""},
	jiage:[beizhu:"",zhi:1.2],
	danwei:"",
	yijiazhe:2,
	yijiariqi:"2013/09/28",
	zhuantai:"",
	beizhu:""
}
*/
$(function(){
	
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	//新增样板
	function xinzengyangban_handle(){
		currSample = null;
		obj2form({});
		bianji();
	}
	$("#xinzengyangban").click(xinzengyangban_handle);
	$(".list").dblclick(function(){
		$(this).val("");
		});
	//检查是否有重复，若有重复则提示并清空
	function bianhao_change(){
		var bh = $("#bianhao").val().trim(); 
		if(bh != "" && (currSample == null || bh != currSample._id)){
			postJson("samples.php",{"caozuo":"sfchongfu","bianhao":bh},function(res){
				if(res.chongfu){
					$("#bianhao").val("");
					tip($("#bianhao"),"编号重复，请重置！",1500);
				}
			});
		}
	}
	$("#bianhao").change(bianhao_change);
	//提交
	function tijiao_handle(){
		var bh = $("#bianhao").val().trim(); 
		if("" == bh){
			tip(null,"样板编号不能为空！",1500);
			return;
		}
		var yangban = form2obj();
		if(!yangban.zhongguoxinghao){
			tip(null,"中国型号不能为空！",1500);
			return;
		}
		var xinbianhao = false;		
		if(currSample == null || bh != currSample._id){
			xinbianhao = true;
		}
		postJson("samples.php",{"caozuo":"sfchongfu","bianhao":bh},function(res){
			if(res.chongfu && xinbianhao){
				$("#bianhao").val("");
				tip($("#bianhao"),"编号重复，请重置！",1500);
			}else{
				postJson("sample.php",yangban,function(res){
					if(res.success == true){
						location.reload();
						/*
						currSample = yangban;
						obj2form(yangban);
						zhidu();
						tip(null,"成功提交样板信息！",3000);
						*/
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
				tr.find("#td_bianhao").text(sample._id);
				tr.find("#td_taiguoxinghao").text(sample.taiguoxinghao);
				tr.find("#td_jiage").text(jiages2str(sample.jiage));
				tr.find("#td_danwei").text(sample.danwei);
				tr.find("#td_zhongguoxinghao").text(sample.zhongguoxinghao);
				tr.find("#td_yijiariqi").text(sample.yijiariqi);
				if(sample.shangjia){
					tr.find("#td_shangjia").text(sample.shangjia.mingchen);
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
				$(".tr_sample").get(0).click();
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
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
		$("#xiangdan").data("yangban",yangban);
		$("#bianhao").vals(yangban._id);
		$("#taiguoxinghao").vals(yangban.taiguoxinghao);
		$("#zhongguoxinghao").vals(yangban.zhongguoxinghao);
		$("#jiage").val(jiages2str(yangban.jiage));
		if(!$("#jiage").val()){
			$("#jiage").val("【 元】");
		}
		$("#danwei").vals(yangban.danwei);
		if(yangban.shangjia){
			$("#shangjia").vals(yangban.shangjia.mingchen);
			$("#shangjia").data("shangjia",yangban.shangjia);
		}else{
			$("#shangjia").val("");
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
				if(beixuan._id != yangban._id){
					var beixuan_elm = beixuan_tmpl.clone(true);
					beixuan_elm.find("#beixuan_bianhao").text(beixuan._id);
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
		$("#beizhu").editorVal(yangban.beizhu);
	}
	//读取表单内容，构造对象并返回
	function form2obj(){
		var yangban={};
		yangban._id = $("#xiangdan #bianhao").val().trim();
		yangban.taiguoxinghao = $("#xiangdan #taiguoxinghao").val().trim();
		yangban.zhongguoxinghao = $("#xiangdan #zhongguoxinghao").val().trim();
		yangban.jiage = getPrices($("#xiangdan #jiage").val());
		yangban.danwei = $("#xiangdan #danwei").val().trim();
		var shangjia = $("#xiangdan #shangjia").data("shangjia");
		if(shangjia){
			yangban.shangjia = {_id:shangjia._id,mingchen:shangjia.mingchen};
		}
		yangban.yijiazhe = getUserIdByName($("#xiangdan #yijiazhe").val().trim());
		yangban.yijiariqi = $("#xiangdan #yijiariqi").val().trim();
		yangban.beizhu = $("#xiangdan #beizhu").editorVal();
		yangban.zhuangtai = $("#zhuangtai").val().trim();
		return yangban
	}
	//进入编辑状态
	function bianji(){
		$("#xiangdan").find(".plainInput").removeAttr("disabled");
		$("#beizhu").editorWritable();
		$("#bianji").hide();
		$("#tijiao").show();
	}
	//进入只读状态
	function zhidu(){
		$("#xiangdan").find(".plainInput").attr("disabled",true);
		$("#beizhu").editorReadonly();
		$("#bianji").show();
		$("#tijiao").hide();
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
	var limit = 20;
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
	$("#beizhu").myeditor(700,200).editorReadonly();

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
	});
	//列出样板
	listYangban(0,getUrl().showId);
	
	var liuyanElm = $("#liuyan").liuyan({hostType:"yangban",});
	//liuyanElm.setOption({hostId:"123"});
});