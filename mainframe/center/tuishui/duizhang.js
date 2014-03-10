$(function(){
	var tmpl_liwai = $("#liwai").detach();
	var tmpl_tr_tuishui = $("#tr_tuishui").detach();
	var tmpl_tr_split = $("#tr_split").detach();
	
	$("#tianjialiwai").click(function(){
		var liwai = tmpl_liwai.clone(true);
		$("#liwaiOut").append(liwai).append("&nbsp;&nbsp;");
	});
	$("#tongji").click(function(){
			var option = {};
			option.kaishibianhao = $("#kaishibianhao").text().trim().toUpperCase();
			option.jieshubianhao = $("#jieshubianhao").text().trim().toUpperCase();
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
			tr.find("#baoguanjine").text(ts.guandan.jine);
		}
		if(ts.tuishui){
			tr.find("#tuishuijine").text(ts.tuishui.jine);
		}
		if(ts.dailifei){
			tr.find("#dailifei").text(ts.dailifei.jine);
		}
		var fps = ts.fapiaos;
		if(!fps){
			fps = [];
		}
		var hxs = ts.hexiaos;
		if(!hxs){
			hxs = [];
		}
		setFP(fps,tr);
		setHX(hxs,tr);
		$("#tb_tuishui").append(tr);
		while(fps.length>0 || hxs.length>0){
			tr = tmpl_tr_tuishui.clone(true);
			setFP(fps,tr);
			setHX(hxs,tr);
			$("#tb_tuishui").append(tr);
		}
		$("#tb_tuishui").append(tmpl_tr_split.clone(true));
	}
	
	function setFP(fps,tr){
		if(fps.length > 0){
			var fp = fps.shift();
			if(fp.kaipiaoqiye){
				tr.find("#gongyingshang").text(fp.kaipiaoqiye.mingchen);
			}
			tr.find("#zengzhishuijine").text(fp.jine);
			tr.find("#kaipiaomishu").text(fp.mishu);
			tr.find("#yifuhuokuan").addClass(fp.fukuanliushui);
			postJson("../liushuizhang/liushuizhang.php",{caozuo:"getbyid",_id:fp.fukuanliushui},function(liushui){
				tr.find("#yifuhuokuan").text(liushui.jine);
			});
		}		
	}
	function setHX(hxs,tr){
		if(hxs.length>0){
			var hx = hxs.shift();
			tr.find("#shouhuimeijin").text(hx.meijinjine);
			tr.find("#shijihuilv").text(hx.huilvpaijia);
			tr.find("#duihourenminbi").text(hx.renminbijine);
		}
	}
});