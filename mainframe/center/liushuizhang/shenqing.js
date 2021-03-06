$(function(){
	/* 是fahuodan的父类
	{	_id:"sq131008.1",
		type:"shenqing"/"shenqing",
		zongjine:213.2,//付款申请要手工输入，发货单则自动计算
		kemu:"",//付款申请才需要
		liucheng:[{userId:3,dongzuo:"录单",time:1322}],
		liushuizhang:{"xx"},//保存的是流水账id，但返回时直接关联上整个流水账//一般不会有一个付款申请被分成多次支付，除非不够钱，对方要求有多少付多少，但这种情况发生可能性极低，备注注明即可。
		zhuangtai:"制单",//制单（删除） 申请对单（回退） 对单（回退）
		gonghuoshang:{_id:"SJ131110",mingchen:"大大"},//收款人
		shoukuanzhanghu:{zhanghao:,huming:,yinhang:,wangdian:},//收款账户
		neirong:"xxx",
		ludanzhe:1,
		duidanzhe:2,
		version:34231423,//用于避免版本冲突
	}
流程：制单

付款金额
收款人
账户
科目
说明

流程：对单（发货单不在这里对）

明细：
编号：  金额：   收款人：   收款账户：科目：

说明：

非货款
编号 状态 科目 收款人 金额 申请者 审核者 付款



付款申请 待审核申请 已审核申请 付款待审核 我的付款申请 查询流水 流水统计
	*/
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	$("#sq_bianhao").click(function(){
		if("" != $(this).text()){
			window.open("shenqing.html?showId="+$(this).text(),"_blank");
		}
	});
	function link_liushui(){
		if(currSQ.liushuizhang){
			window.open("../liushuizhang/liushuizhang.html?showId="+currSQ.liushuizhang._id,"_blank");
		}
	}
	$("#tongji").click(function(){
		window.open("../liushuizhang/yuejietongji.html","_blank");
	});
	$("#sq_fukuanxinxi").click(link_liushui);
	function selShengchengliushui(event){
		var liushui = {};
		var shenqings = [];
		$("#seltable").find(".tr_shenqing").each(function(i){
			shenqings.push($(this).data("_id"));
		});
		if(shenqings.length==0){
			tip($(this),"必须选择申请",1500);
			return;
		}
		liushui.shenqings = shenqings;
		liushui.jine = parseFloat($("#selSum").text());		
		var kemu;
		$("#seltable").find(".tr_shenqing").each(function(i){
			if($(this).data("kemu")){
				kemu = $(this).data("kemu");
				return false;
			}
		});
		if(kemu){
			liushui.kemu = kemu;
		}
		postJson("liushuizhang.php",{caozuo:"daishenqingchuanjian",liushui:liushui},function(res){
			if(res.err){
				tip($("#shengchengliushui"),res.err,1500);
			}else{
				//window.open("./liushuizhang.html?showId="+res._id,"_blank");
				location = "./liushuizhang.html?showId="+res._id+"&checkdingjin=true";
			}
		});
	}
	$("#shengchengliushui").click(selShengchengliushui);
	function selXuanze(){
		if(lxrConflict($(".tr_selected").data("lxrId"))){
			tip($(this),"收款人冲突",1500);
			return;
		}
		$("#seltable").append($(".tr_selected").detach());
		$(this).hide();$("#quxiao").show();
		sumSel();
	}
	$("#xuanze").click(selXuanze);
	function selQuxiao(){
		$("#tableheader").after($(".tr_selected").detach());
		$("#xuanze").show();$(this).hide();
		sumSel();
	}
	$("#quxiao").click(selQuxiao);
	$("#notfahuodan").change(function(){
		listShenqing(0);
	});
	$("#th_shoukuanren").click(function(event){
 		var limit = 20;
 		setSelector(event,function(page,option,callback1){
 				postJson("../contact/lianxiren.php",{caozuo:"chalianxiren",offset:page*limit,limit:limit,option:option},function(vendors){
 					callback1(vendors);
 				});
 			},["_id","mingchen"],function(lianxiren){
 				$(this).data("lxrId",lianxiren._id);
				$(this).val(lianxiren.mingchen);
				listShenqing(0);
				postJson("../contact/lianxiren.php",{caozuo:"access",_id:lianxiren._id},function(res){});
 			},"",function(){
 				$(this).val("收款人");
 				listShenqing(0);
			});
 	});
	var users = getUsers();users.unshift({"user_name":"申请者","_id":"-1"});
	$("#th_shenqingzhe").myselector(users,"user_name").bind("input",function(){
		listShenqing(0);
	});
	$("#th_shenhezhe").myselector(users,"user_name").bind("input",function(){
		listShenqing(0);
	});
	$("#th_fukuan").bind("input",function(){listShenqing(0);});
	$("#th_zhuangtai").bind("input",function(){listShenqing(0);});
	$("#th_bianhao").datepicker().change(function(){
		$(this).val(date2id($(this).val()));
		listShenqing(0);
	});
	function sel_zhanghu(event){
		if(!currSQ.gonghuoshang){
			tip($(this),"必须先指定收款人",1500);
			return;
		}
		var thatInput = $(this);
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("zhanghu.php",{offset:page*limit,limit:limit,option:currSQ.gonghuoshang._id},function(zhanghus){
					callback(zhanghus);
				});
			},["yinhang","huming","zhanghao"],function(zhanghu){
					thatInput.text(zhanghu.yinhang+" "+zhanghu.zhanghao+"("+zhanghu.huming+")");
			});
	}	
	function baocun(){
		currSQ.zongjine = parseFloat2($("#sq_jine").val().trim());
		currSQ.kemu = $("#sq_kemu").val().trim();
		currSQ.zhaiyao = $("#sq_zhaiyao").text().trim();
		//收款人在选择的时候就已经设置
		currSQ.shoukuanzhanghu = $("#sq_shoukuanzhanghu").text().trim();
		currSQ.neirong = shuomingEditor.editorVal();
		postJson("shenqing.php",{caozuo:"baocun",shenqing:currSQ},function(res){
			showDetailById(currSQ._id);
		});		
	}
	$("#baocun").click(baocun);
	$("#fangqi").click(function(){showDetailById(currSQ._id);});
	$("#sq_kemu").kemu();
	$("#bianji").click(edit);
	function cz_shanchu(){
		postJson("shenqing.php",{caozuo:"shanchu",_id:currSQ._id},function(res){
			if(res.err){
				tip($("#cz_shanchu"),res.err,1500);
			}else{
				listShenqing(0);
			}
		});
	}
	$("#cz_shanchu").click(cz_shanchu);
	function cz_shenqingduidan(){
		if("none" == $("#bianji").css("display")){
			tip($(this),"请先退出编辑状态！",1500);
			return;
		}
		$("#sq_jine").val(currSQ.zongjine?currSQ.zongjine:""); 		
		if(!currSQ.zongjine){
			tip($(this),"付款金额必须为大于0的数值！",1500);
			return;
		}
		if(!currSQ.gonghuoshang){
			tip($(this),"必须指定收款人！",1500);
			return;
		}		
		if(!currSQ.kemu){
			tip($(this),"必须指定科目！",1500);
			return;
		}
		if("" == $("#editor_div1").text().trim()){
			tip($(this),"付款申请说明不能留空！",1500);
			return;
		}
		postJson("shenqing.php",{caozuo:"shenqingduidan",_id:currSQ._id},function(res){
			showDetailById(currSQ._id);
		});
	}
	$("#cz_shenqingduidan").click(cz_shenqingduidan);
	function cz_huitui(){
		postJson("shenqing.php",{caozuo:"huitui",_id:currSQ._id,zhuangtai:currSQ.zhuangtai},function(res){
			showDetailById(currSQ._id);
		});
	}
	$("#cz_huitui").click(cz_huitui);
	function cz_duidan(){
		postJson("shenqing.php",{caozuo:"duidan",_id:currSQ._id},function(res){
			showDetailById(currSQ._id);
		});
	}
	$("#cz_duidan").click(cz_duidan); 
	//翻页处理
	$("#prevPage").click(function(){
		listShenqing($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listShenqing($("#pager").data("offset")+1);
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
	function sel_shenqing(){
		showDetailById($(this).data("_id"));
		$(".tr_selected").removeClass("tr_selected");
		$(this).addClass("tr_selected");
	}
	$(".tr_shenqing").click(sel_shenqing);
	$("#xinzengshenqing").click(function(){
		postJson("shenqing.php",{caozuo:"xinzengshenqing"},function(res){
			listShenqing(0);
		});
	});
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	function sumSel(){
		$("#selNum").text($("#seltable").find(".tr_shenqing").length);
		var sum = 0;
		$("#seltable").find(".tr_shenqing").each(function(i){
			sum += parseFloat($(this).find("#td_jine").text());
		});
		$("#selSum").text(sum);
	}
	function lxrConflict(lxrId){
		if(!lxrId){
			return false;
		}
		var ret = false;
		$("#seltable").find(".tr_shenqing").each(function(i){
			if($(this).data("lxrId") && $(this).data("lxrId") != lxrId){
				ret = true;
				return false;
			}
		});
		return ret;
	}
	function isSel(_id){
		var ret = false;
		$("#seltable").find(".tr_shenqing").each(function(i){
			if($(this).data("_id") == _id){
				ret = true;
				return false;
			}
		});
		return ret;
	}
	function edit(){
		$("#bianji").hide();$("#fangqi").show();$("#baocun").show();
 		shuomingEditor.editorWritable();
 		$("#sq_jine").removeAttr("readonly");
 		$("#sq_kemu").removeAttr("readonly");
		$("#sq_shoukuanren").unbind("click").click(sel_lianxiren);
		$("#sq_shoukuanzhanghu").click(sel_zhanghu).css("cursor","pointer");
		$("#sq_zhaiyao").attr("contenteditable","true");
	}	
	function link_lianxiren(){
		if(currSQ.gonghuoshang){
			window.open("../contact/contact.html?showId="+currSQ.gonghuoshang._id,"_blank");
		}
	}
	function readOnly(){
		$("#bianji").hide();$("#fangqi").hide();$("#baocun").hide();
		if(kebianji){
			$("#bianji").show();
		}else{
			$("#bianji").hide();
		}
		shuomingEditor.editorReadonly();
		$("#sq_jine").attr("readonly","readonly");
		$("#sq_kemu").attr("readonly","readonly");
		$("#sq_shoukuanren").unbind("click").click(link_lianxiren);
		$("#sq_shoukuanzhanghu").unbind("click").css("cursor","default");
		$("#sq_zhaiyao").removeAttr("contenteditable");
	}

	function sel_lianxiren(event){
		var thatInput = $(this);
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("lianxiren.php",{offset:page*limit,limit:limit,option:option.toUpperCase()},function(lianxirens){
					callback(lianxirens);
				});
			},["_id","mingchen","shangjia.mingchen"],function(lianxiren){
				if(!currSQ.gonghuoshang || lianxiren._id != currSQ.gonghuoshang._id){
					$("#sq_shoukuanzhanghu").html("&nbsp;");
				}				
				currSQ.gonghuoshang = {_id:lianxiren._id,mingchen:lianxiren.mingchen};
				if(lianxiren.leixing == "geren" && lianxiren.shangjia){
					thatInput.text(lianxiren.mingchen+"("+lianxiren.shangjia.mingchen+")");
				}else{
					thatInput.text(lianxiren.mingchen);
				}
				postJson("../contact/lianxiren.php",{caozuo:"access",_id:lianxiren._id},function(res){});
			});
	}
	jQuery.fn.liucheng = function(theUser,shenqing){
		kebianji = false;
		var that = this.empty();
		this.data("_id",shenqing._id);
		each(shenqing.liucheng,function(n,item){
			var tmpl = liuchengItem.clone(true);
			$("#lc_bianhao",tmpl).text(n+1);
			var usr = getUser(item.userId);
			$("#lc_touxiang",tmpl).attr("src",usr.photo);
			$("#lc_mingchen",tmpl).text(usr.user_name);
			$("#lc_dongzuo",tmpl).text(item.dongzuo);
			$("#lc_shijian",tmpl).text(new Date(item.time*1000).format("yyyy-MM-dd hh:mm"));
			if(shenqing.type=="shenqing"){
				if("制单" == item.dongzuo){
					("#lc_tr_panel",tmpl).attr("title","正在编制付款申请单！");
					if((shenqing.liucheng.length - 1) == n && theUser._id == shenqing.ludanzhe){
						kebianji = true; 
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						$("#cz_shanchu",caozuoItem).show();
						$("#cz_shenqingduidan",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}
				}else if("申请对单" == item.dongzuo){
					kebianji = false; 
					("#lc_tr_panel",tmpl).attr("title","已完成付款申请单编制，申请对单！");
					if((shenqing.liucheng.length - 1) == n){
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						if(theUser._id == shenqing.ludanzhe){
							$("#cz_huitui",caozuoItem).show();
						}else{
							$("#cz_duidan",caozuoItem).show();
						}
						$("table",tmpl).append(caozuoItem);
					}
				}else if("对单" == item.dongzuo){
					("#lc_tr_panel",tmpl).attr("title","已完成对单，可以付款！");
					if((shenqing.liucheng.length - 1) == n){
						if(theUser._id == item.userId && !shenqing.liushuizhang){
							$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
							var caozuoItem = caozuoTmpl.clone(true);
							$("#cz_huitui",caozuoItem).show();
							$("table",tmpl).append(caozuoItem); 
						}
					}
				}
			}
			that.append(tmpl);
		});
	}
	function statusColor(status){
		//上传 接单/制单 申请对单 对单
		if(status == "上传"||status == "接单"||status == "制单"){//红色
			return "#FF4500";
		}
		if(status == "申请对单"){//棕色
			return "#FF6347";
		}
		//if(status == "对单"){//其他 粉红
			return "#FFB6C1";
		//}
	}
	function showDetailById(_id){
		tip(null,"正在加载...");
		postJson("shenqing.php",{caozuo:"getbyid",_id:_id},function(sq){//这里是把关联的货物放到一起了
			untip();
			showDetail(sq);
		});
	}
	function showDetail(sq){
		$("#ctr_shenqing").show();
		if(isSel(sq._id)){
			$("#xuanze").hide();$("#quxiao").show();
		}else{
			$("#xuanze").show();$("#quxiao").hide();
		}
		currSQ = sq; 
		
		$("#liucheng").show().liucheng(getTheUser(),sq);
		if(sq.liushuizhang){
			var lsz = sq.liushuizhang;
			$("#tb_liushuizhangliucheng").show();
			$("#liushuizhangliucheng").show().liucheng(lsz.liucheng,lsz);
			$("#sq_fukuanxinxi").text(lsz.shoukuanfangname+"("+lsz.jine+"元)");
		}else{
			$("#sq_fukuanxinxi").html("未付款！");
		}
		$("#sq_bianhao").text(currSQ._id);
		$("#sq_jine").val(currSQ.zongjine?currSQ.zongjine:""); 
		if(sq.type == "fahuodan"){
			$("#sq_kemu").val("货款"); 
			var zy = "&nbsp;";
			if(sq.zhaiyao && sq.zhaiyao.length>0){
				each(sq.zhaiyao,function(i,id){
					zy = "<a href='../dingdan/dingdan.html?showId="+id+"' target='_blank'>"+id+"</a>&nbsp;"
				});
			}
			$("#sq_zhaiyao").html(zy);
		}else{
			$("#sq_kemu").val(currSQ.kemu?currSQ.kemu:""); 
			$("#sq_zhaiyao").html(currSQ.zhaiyao?currSQ.zhaiyao:"&nbsp;");
		}
		
		$("#sq_shoukuanren").html(currSQ.gonghuoshang?currSQ.gonghuoshang.mingchen:"&nbsp;"); 
		$("#sq_shoukuanzhanghu").text(currSQ.shoukuanzhanghu?currSQ.shoukuanzhanghu:""); 
		
		$("#fahuodanmingxi_ctr").empty();
		if(sq.type == "fahuodan"){
			$("#fahuodanmingxi_ctr").append(fahuodanmingxi.clone(true));
			//huowu 2 huowu 根据订单货物id分簇，然后获取订单货物原始信息
			var ddhws = [];//找出所有不同的订单货物，即按订单货物编号去重。（订单货物是在订单中录入的货物，不同于后续的货物，一个订单货物可以对应多个货物）
			each(sq.huowu,function(i,hw){
				var exists = false;
				each(ddhws,function(j,ddhw){
					if(ddhw == hw.dingdanhuowu){
						exists = true;
						return false;
					}
				});
				if(!exists){
					ddhws.push(hw.dingdanhuowu);
				}
			});
			var huowus = [];
			each(ddhws,function(i,ddhwId){//转换数据结构 huowus = [{_id:"xxx",...,mingxi:[{相同订单货物id的货物},...]},...]
				var hw = {};
				var tempHuowu;
				hw.mingxi = [];
				each(sq.huowu,function(j,huowu){
					if(huowu.dingdanhuowu == ddhwId){
						tempHuowu = huowu;
						hw.mingxi.push(clone(huowu));
					}
				});
				hw.yangban = tempHuowu.yangban;
				hw.guige = tempHuowu.guige;
				hw.danwei = tempHuowu.danwei;
				hw.danjia = tempHuowu.danjia;
				hw.dingdanhuowu = ddhwId;
				huowus.push(hw);
			});
			each(huowus,function(i,huowu){
				var hwDiv = table_huowu.clone(true);
				hwDiv.find("#mx_yangban").html(formatYangban(huowu.yangban));
				hwDiv.find("#mx_guige").text(huowu.guige);
				hwDiv.find("#mx_danwei").val(huowu.danwei);
				hwDiv.find("#mx_danjia").val(huowu.danjia);
				hwDiv.find("#shuliangjianshu").remove();
				each(huowu.mingxi,function(j,mx){
					var mxDiv = tmpl_shuliangjianshu.clone(true);
					mxDiv.find(".shuliang").val(mx.shuliang);
					mxDiv.find(".jianshu").val(mx.jianshu);
					mxDiv.find("#hwbianhao").text(mx._id);
					mxDiv.data("id",mx.id);
					if(mx.zhu){
						mxDiv.find("#zhu").text(mx.zhu).show();
					}else{
						mxDiv.find(".zhu_ctnr").hide();
					}
					if(mx.yanhuodan){
						if(mx.yanhuodan.zhuangtai == "已通过"){
							mxDiv.find("#yanhuodan").html("<font color=green>"+mx.yanhuodan._id+"</font>").show();
						}else if(mx.yanhuodan.zhuangtai == "不通过"){
							mxDiv.find("#yanhuodan").html("<font color=red>"+mx.yanhuodan._id+"</font>").show();
						}else{
							mxDiv.find("#yanhuodan").html("<font color=black>"+mx.yanhuodan._id+"</font>").show();
						}
					}
					if(mx.zhuangguidan){
						mxDiv.find("#zhuangguidan").text(mx.zhuangguidan).show();
					}
					hwDiv.find("#shuliangjianshu_ctr").append(mxDiv);
				});
				hwDiv.find("#beizhu").val(huowu.beizhu);
				jisuanjine.call(hwDiv.find("#mx_danjia"));
				postJson("../dingdan/dingdan.php",{caozuo:"gethuowubyid2",huowuId:huowu.dingdanhuowu},function(dd){
					var tr_huowu = dingdanhuowu.clone(true);
					tr_huowu.data("huowu",dd);
					tr_huowu.find("#dingdanhao").text(dd.id);
					tr_huowu.find("#kehu1").text(dd.kehu);
					tr_huowu.find("#yangban1").html(formatYangban(dd.yangban));
					tr_huowu.find("#guige1").text(dd.guige);
					tr_huowu.find("#shuliang1").text(dd.shuliang);
					tr_huowu.find("#danwei1").text(dd.danwei);
					tr_huowu.find("#danjia1").text(dd.danjia);
					tr_huowu.find("#jine1").text(round(dd.shuliang*dd.danjia,2));
					hwDiv.find("#tb_dingdan").append(tr_huowu);
				});
				$("#fahuodanmingxi").append(hwDiv);	
			});
			if(sq.qitafei && sq.qitafei.length>0){
				var qita_div = tmpl_qita_div.clone(true);
				each(sq.qitafei,function(l,qita){
					var qitaDiv = tmpl_qitafeiyong.clone(true);
					qitaDiv.find("#qita_shuoming").text(qita.shuoming);
					qitaDiv.find("#qita_jine").val(qita.jine);
					qita_div.append(qitaDiv);
				});
				$("#fahuodanmingxi").append(qita_div);	
			}
			
		}
		
		
		shuomingEditor.editorVal(currSQ.neirong);
	
 
		liuyanElm.shuaxinliebiao({hostId:currSQ._id,hostType:"shenqing"});
		readOnly();
		if(getUrl().showId && getUrl().showId.indexOf("FHD") == 0){
			$("#shenqing_liebiao_ctr").html(sq.neirong);
			$("#shenqing_liebiao_ctr").css("max-width",$(window).width()/2+"px");
		}
	}
	function jisuanjine(){
		var tb = $(this).parents(".huowu");
		var danjia = parseFloat(tb.find("#mx_danjia").val());
		if(isNaN(danjia)){
			return;
		}
		var sum=0;
		tb.find(".shuliangjianshu").each(function(i,sljs){
			sum += parseFloat($(this).find(".shuliang").val()) * parseInt($(this).find(".jianshu").val());
			if(isNaN(sum)){
				return false;
			}
		});
		
		if(isNaN(sum)){
			tb.find("#mx_jine").text("");
			return;
		}
		tb.find("#mx_shuliang").text(round(sum,2));	
		sum = sum * danjia;
		tb.find("#mx_jine").text(round(sum,2));
	}
	function getOptions(){
		var ret = {};
		if($("#notfahuodan").attr("checked")){
			ret.type=true;
		}
		var v = $("#th_bianhao").val().trim();
		if("" != v && "编号" != v){
			ret.bianhao = v+"0";
		}
		v = $("#th_zhuangtai").val().trim();
		if("" != v && "状态" != v){
			ret.zhuangtai = v;
		}
		v = $("#th_shoukuanren").val().trim();
		if("" != v && "供货商" != v){
			ret.gonghuoshang = $("#th_shoukuanren").data("lxrId");
		}
		v = $("#th_shenqingzhe").val().trim();
		if("" != v && "申请者" != v){
			ret.shenqingzhe = getUserIdByName(v);
		}
		v = $("#th_shenhezhe").val().trim();
		if("" != v && "审核者" != v){
			ret.shenhezhe = getUserIdByName(v);
		}
		v = $("#th_fukuan").val().trim();
		if("" != v && "付款" != v){
			ret.fukuan = v;
		}
		return ret;
	};
	function getOperator(sq){
		var ret = {ludanzhe:"",duidanzhe:""};
		if(sq.ludanzhe){
			ret.ludanzhe = getUserName(sq.ludanzhe);
		}
		if(sq.duidanzhe){
			ret.duidanzhe = getUserName(sq.duidanzhe);
		}
		return ret;
	}
	function listShenqing(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		var option = $.extend({cmd:cmd},getOptions());
		postJson("shenqing.php",{caozuo:"chaxun",offset:offset*limit,limit:limit,option:option},function(shenqings){
			$("#shenqingtable .tr_shenqing").remove();
			each(shenqings,function(n,shenqing){
				if(cmd == "daifukuan" && isSel(shenqing._id)){
					return true;
				}
				tr = tmpl_tr_shenqing.clone(true);
				tr.data("_id",shenqing._id);
				tr.find("#td_bianhao").text(shenqing._id);
				tr.find("#td_zhuangtai").text(shenqing.zhuangtai);
				tr.find("#td_shoukuanren").text(shenqing.gonghuoshang?shenqing.gonghuoshang.mingchen:"");
				if(shenqing.gonghuoshang){
					tr.data("lxrId",shenqing.gonghuoshang._id);
				}
				if(shenqing.kemu){//创建流水时用得上
					tr.data("kemu",shenqing.kemu);
				}else if(shenqing.type=="fahuodan"){
					tr.data("kemu","货款");
				}
				tr.find("#td_jine").text(shenqing.zongjine?shenqing.zongjine:"");
				var ops = getOperator(shenqing);
				tr.find("#td_shenqingzhe").text(ops.ludanzhe);
				tr.find("#td_shenhezhe").text(ops.duidanzhe);	
				tr.find("#td_fukuan").text(shenqing.liushuizhang?"已付":"");
				if(shenqing.liushuizhang){
					if(shenqing.liushuizhang.yifu){
						tr.find("#td_fukuan").text("已付款");	
					}else{
						tr.find("#td_fukuan").text("已记账");	
					}
				}else{
					tr.find("#td_fukuan").text("");
				}
				tr.find("#td_zhaiyao").text(shenqing.zhaiyao);
				var color = toggle("#fff","#eee");
				tr.css("background-color",color);
				if(!shenqing.liushuizhang){
					tr.find("#td_bianhao").css("background-color",statusColor(shenqing.zhuangtai));
				}
				$("#shenqingtable").append(tr);
			});
			if(showId){
				showDetailById(showId);
				layout.close("west");
			}else{
				//调整左侧宽度以便显示完整的列表
				$("#tableheader").click();
				if(shenqings.length>0){
					//$(".ui-layout-center").show();
					$("#ctr_shenqing").show();
					$(".tr_shenqing").get(0).click();
				}else{
					//$(".ui-layout-center").hide();
					$("#ctr_shenqing").hide();
				}
			}
			if(offset<=0){
				$("#prevPage").css("color","gray");
			}else{
				$("#prevPage").css("color","blue");
			}
			if(shenqings.length<limit){
				$("#nextPage").css("color","gray");
			}else{
				$("#nextPage").css("color","blue");
			}
		});
	}
	
	///////////////////////////////初始化/////////////////////////////////////////////
	function _chushihua_(){} 
	var limit=20;
	var currSQ = null;
	var caozuoTmpl = $("#lc_caozuo").detach();
	var liuchengItem = $("#liuchengItem").detach();
	var tmpl_tr_shenqing = $(".tr_shenqing").detach();

	var dingdanhuowu = $(".dingdanhuowu").detach();
	var tmpl_shuliangjianshu = $("#shuliangjianshu").clone(true);
	var tmpl_qitafeiyong = $(".qitafeiyong").detach();
	var tmpl_qita_div = $("#qita_div").detach();
	var table_huowu = $(".huowu").detach();
	var fahuodanmingxi = $("#fahuodanmingxi").detach();

	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	
	var liuyanElm = $("#liuyan").liuyan({hostType:"shenqing",});
	
	var shuomingEditor = $("#sq_shuoming").myeditor(700,300);
	shuomingEditor.editorReadonly();
	 
	
	var cmd = getUrl().cmd?getUrl().cmd:"";
	if("chaxun" == cmd){		
		$("#xinzengshenqing").show();
		$('#currLocation', window.parent.document).text("财账/申请");
	}else	if("daishenheshenqing"== cmd){
		$('#currLocation', window.parent.document).text("财账/待审核申请");
		$("#th_zhuangtai").val("申请对单").attr("readonly","readonly");
	}else if("daifukuan"== cmd){
		$('#currLocation', window.parent.document).text("财账/待记账申请");
		$("#th_zhuangtai").val("对单").attr("readonly","readonly");
		$("#th_fukuan").val("未记账").attr("readonly","readonly");
		$("#ctr_sel").show();
	}
	
	if(getUrl().showId && getUrl().showId.indexOf("FHD") == 0){
		showDetailById(getUrl().showId);
	}else{
		listShenqing(0,getUrl().showId);
	}
	
	 	//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){
		if(layout.state.west.innerWidth < $("#shenqingtable").width()){
			layout.sizePane("west",$("#shenqingtable").width()+20);
		}
	});
	$("#detailheader").click(function(){
		if(layout.state.center.innerWidth < $("#detailtable").width()){
			layout.sizePane("west",$("body").width()-$("#detailtable").width()-100);
		}
	}).dblclick(function(){layout.toggle("west");clearSelection();});
});