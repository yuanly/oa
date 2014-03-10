$(function(){
	var tmpl_tr_tuishui = $("#tr_tuishui").detach();
	var tmpl_tr_split = $("#tr_split").detach();
	
	function sel_tuishui(){
		var limit = 20;
		setSelector(event,function(page,option,callback){
				postJson("tuishui.php",{caozuo:"chaxun2",offset:page*limit,limit:limit,option:option},function(shangjias){
					callback(shangjias);
				});
			},["_id","huogui.guihao","zhuangtai","dailishang.mingchen"],function(tuishui){//selected
				$(this).text(tuishui._id);
			},"",function(){//clear
				$(this).html("&nbsp");
			},function(){//过滤框是日期选择时，在选中日期后的回调。
				$("#panel #option").val("TS"+date2id($("#panel #option").val()+"0"));
			});
	}
	$("#kaishibianhao").click(sel_tuishui);
	$("#jieshubianhao").click(sel_tuishui);
	$("#liwai").click(sel_tuishui)
	var tmpl_liwai = $("#liwai").detach();
	$("#tianjialiwai").click(function(){
		var liwai = tmpl_liwai.clone(true);
		$("#liwaiOut").append(liwai).append("&nbsp;&nbsp;");
	});
	$("#tongji").click(function(){
		var option = {};
		option.kaishibianhao = $("#kaishibianhao").text().trim().toUpperCase();
		if(option.kaishibianhao.indexOf("TS") != 0){
			tip($(this),"请输入的开始编号！",1500);
			return;
		}
		option.jieshubianhao = $("#jieshubianhao").text().trim().toUpperCase();
		if(option.jieshubianhao.indexOf("TS") != 0){
			tip($(this),"请输入的结束编号！",1500);
			return;
		}
		var liwai = [];
		$(".liwai").each(function(i,lw){
			var lw1 = $(lw).text().trim();
			if("" != lw1){
				liwai.push(lw1.toUpperCase());
			}
		});
		if(liwai.length>0){
			option.liwai = liwai;
		}
		$(".tr_tuishui").remove();$(".tr_split").remove();
		postJson("tuishui.php",{caozuo:"tongji",option:option},function(tuishuis){
			each(tuishuis,function(i,tuishui){process(tuishui)});
		});
	});
	function process(ts){
		var tr = tmpl_tr_tuishui.clone(true);
		tr.find("#bianhao").text(ts._id);
		if(ts.guandan){
			tr.find("#hetonghaoma").text(ts.guandan.hetonghao);
			tr.find("#chanpinmingchen").text(ts.guandan.chanpinmingchen);
			tr.find("#baoguanshuliang").text(ts.guandan.shuliang);
			tr.find("#baoguanjine").text("$"+ts.guandan.jine);
		}
		if(ts.tuishui){
			tr.find("#tuishuijine").text("¥"+ts.tuishui.jine);
		}
		if(ts.dailifei){
			tr.find("#dailifei").text("¥"+ts.dailifei.jine);
		}
		var fps = ts.fapiaos.slice(0);
		if(!fps){
			fps = [];
		}
		var hxs = ts.hexiaos.slice(0);
		if(!hxs){
			hxs = [];
		}
		setFP(fps,tr,ts._id);
		setHX(hxs,tr);
		if("#eee" != toggle("#fff","#eee")){
			toggle("#fff","#eee");
		}
		tr.css("background-color",toggle("#fff","#eee"));
		$("#tb_tuishui").append(tr);
		while(fps.length>0 || hxs.length>0){
			tr = tmpl_tr_tuishui.clone(true);
			setFP(fps,tr,ts._id);
			setHX(hxs,tr);
			tr.css("background-color",toggle("#fff","#eee"));
			$("#tb_tuishui").append(tr);
		}
		var lszs = [];
		each(ts.fapiaos,function(i,fp){//去重
			if("" != fp.fukuanliushui){
				if(-1 == lszs.indexOf(fp.fukuanliushui)){
					lszs.push(fp.fukuanliushui);
				}
			}
		});
		each(lszs,function(i,lsz){//合并相同流水单元格
			var clz = (ts._id + lsz).replace(/\./g,"_");
			var rowspan = $("."+clz).length;
			if(rowspan>1){
				$("."+clz).each(function(i,td){
					if(i == 0){
						$(td).attr("rowspan",""+rowspan);
					}else{
						$(td).remove();
					}
				});
			}
		});
		
		//huizong
		tr = tmpl_tr_tuishui.clone(true);
		tr.css("background-color","yellow");
		if(ts.guandan){
			tr.find("#baoguanjine").text("$"+ts.guandan.jine);
		}else{
			tr.find("#baoguanjine").text("$0");
		}
		var zengzhishuijineSum = 0;
		var kaipiaomishuSum = 0;
		var yifuhuokuanSum = 0;
		var shouhuimeijinSum = 0;
		var duirenminbiSum = 0;
		var tuishuijineSum = 0;
		var dailifeiSum = 0;
		if(ts.dailifei){
			dailifeiSum = ts.dailifei.jine;
		}
		if(ts.tuishui){
			tuishuijineSum = ts.tuishui.jine;
		}
		each(ts.fapiaos,function(i,fp){
			var zengzhishuijine = parseFloat(fp.jine);
			if(!isNaN(zengzhishuijine)){
				zengzhishuijineSum += zengzhishuijine;
			}
			var kaipiaomishu = parseFloat(fp.mishu);
			if(!isNaN(kaipiaomishu)){
				kaipiaomishuSum += kaipiaomishu;
			}
		});
		each(ts.hexiaos,function(i,hx){
			var shouhuimeijin = parseFloat(hx.meijinjine);
			if(!isNaN(shouhuimeijin)){
				shouhuimeijinSum += shouhuimeijin;
			}
			var duirenminbi = parseFloat(hx.renminbijine);
			if(!isNaN(duirenminbi)){
				duirenminbiSum += duirenminbi;
			}
		});
		
		$("."+ts._id.replace(/\./g,"_")).each(function(i,td){
			var huokuan = parseFloat($(td).text().slice(1));
			if(!isNaN(huokuan)){
				yifuhuokuanSum += huokuan;
			}
		});
		tr.find("#zengzhishuijine").text("¥"+zengzhishuijineSum);
		tr.find("#kaipiaomishu").text(kaipiaomishuSum);
		tr.find("#yifuhuokuan").text("¥"+yifuhuokuanSum);
		tr.find("#shouhuimeijin").text("$"+shouhuimeijinSum);
		tr.find("#duirenminbi").text("¥"+duirenminbiSum);
		tr.find("#tuishuijine").text("¥"+tuishuijineSum);
		tr.find("#dailifei").text("¥"+dailifeiSum);
		$("#tb_tuishui").append(tr);
		tr = tmpl_tr_split.clone(true);
		var lirun = round(duirenminbiSum + tuishuijineSum - yifuhuokuanSum - dailifeiSum,2);
		tr.find("td").html("利润：¥"+lirun);
		$("#tb_tuishui").append(tr);
	}
	
	function setFP(fps,tr,bianhao){
		if(fps.length > 0){
			var fp = fps.shift();
			if(fp.kaipiaoqiye){
				tr.find("#gongyingshang").text(fp.kaipiaoqiye.mingchen);
			}
			tr.find("#zengzhishuihaoma").text(fp.shuihao);
			tr.find("#zengzhishuijine").text("¥"+fp.jine);
			tr.find("#kaipiaomishu").text(fp.mishu);
			if("" != fp.fukuanliushui){
				var clz = (bianhao + fp.fukuanliushui).replace(/\./g,"_");
				tr.find("#yifuhuokuan").addClass(clz).addClass(bianhao.replace(/\./g,"_"));
				tr.find("#yifuhuokuan").text("¥"+(fp.fukuanjine?fp.fukuanjine:"0"));
			}
		}		
	}
	function setHX(hxs,tr){
		if(hxs.length>0){
			var hx = hxs.shift();
			tr.find("#shouhuimeijin").text("$"+hx.meijinjine);
			tr.find("#shijihuilv").text(hx.huilvpaijia);
			tr.find("#duirenminbi").text("¥"+hx.renminbijine);
		}
	}
	
	$("#dayin").click(function(){
		$("#head_div").hide();
		$("#title_div").show();
		$("html").attr("contenteditable","true");
	});
});