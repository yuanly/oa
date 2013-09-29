$(function(){
	//{_id:"A232",taiguoxinghao:"",zhongguoxinghao:"",shangjia:{_id:1,mingchen:""},jiage:[beizhu:"",zhi:1.2],danwei:"",yijiazhe:2,yijiariqi:"2013/09/28",zhuantai:"",beizhu:""}
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	//新增样板
	function xinzengyangban_handle(){
		obj2form({});
		bianji();
	}
	$("#xinzengyangban").click(xinzengyangban_handle);
	//提交
	function tijiao_handle(){
		var yangban = form2obj();
		if(!yangban._id){
			tip(null,"样板编号不能为空！",1500);
			return;
		}
		if(!yangban.zhongguoxinghao){
			tip(null,"中国型号不能为空！",1500);
			return;
		}
		postJson("sample.php",yangban,function(res){
			if(res.success == true){
				obj2form(yangban);
				zhidu();
				tip(null,"成功提交样板信息！",3000);
			}else{
				ask3(null,res.err);
			}
		});
	}
	$("#tijiao").click(tijiao_handle);
	
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
	//列出样板
	function listYangban(offset){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		postJson("samples.php",{offset:offset*limit,limit:limit,option:{"shangjia":$("#shangjiaoption").data("lastValue"),"mingchen":$("#mingchenoption").data("lastValue")}},function(contacts){
			$("#contacttable .tr_contact").remove();
			each(contacts,function(n,contact){
				tr = tr_contact.clone(true);
				tr.data("_id",contact._id);
				tr.find("#td_bianhao").text(contact._id);
				tr.find("#td_mingchen").text(contact.mingchen);
				tr.find("#td_dianhua").text(showdianhuas(contact.dianhualiebiao));
				if(contact.shangjia){
					tr.find("#td_shangjia").text(contact.shangjia.mingchen);
				}
				tr.css("background-color",toggle("#deedde","#dedeed"));
				$("#contacttable").append(tr);
			});
			if(contacts.length>0){//将列表第一个商家显示在右边的商家详情表单
				showDetail(contacts[0]["_id"]);
			}
			//调整左侧宽度以便显示完整的列表
			$("#tableheader").click();
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
		}else{
			$("#shangjia").val("");
		}
		var user = getUser(yangban.yijiazhe);
		if(user){
		$("#yijiazhe").vals(user.user_name);
		}else{
		$("#yijiazhe").val("");
		}
		$("#yijiariqi").val(int2Date(yangban.yijiariqi));
		$("#zhuangtai").vals(yangban.zhuangtai);
		$("#beixuan").empty();
		if(!yangban.beixuan){
			$("#beixuan").append("该样板还没有后备，请尽快寻找！");
		}else{
			each(yangban.beixuan,function(n,beixuan){
				var beixuan_elm = beixuan_tmpl.clone(true);
				beixuan_elm.find("#beixuan_bianhao").val(beixuan.bianhao);
				if(beixuan.shangjia){
					beixuan_elm.find("#beixuan_shangjia").vals(beixuan.shangjia.mingchen);
				}else{
					beixuan_elm.find("#beixuan_shangjia").val("");
				}
				beixuan_elm.find("#jiage").val(jiages2str(beixuan.jiage));
				$("#beixuan").append(beixuan_elm);
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
		yangban.yijiazhe = $("#xiangdan #yijiazhe").val().trim();
		yangban.yijiariqi = $("#xiangdan #yijiariqi").val().trim();
		yangban.beizhu = $("#xiangdan #beizhu").editorVal();
		yangban.zhuangtai = $("#zhuangtai").val().trim();
		return yangban
	}
	//进入编辑状态
	function bianji(){
		$(".plainInput").removeAttr("disabled");
		$("#beizhu").editorWritable();
		$("#bianji").hide();
		$("#tijiao").show();
	}
	//进入只读状态
	function zhidu(){
		$(".plainInput").attr("disabled",true);
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
});