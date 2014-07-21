$(function(){
		$("#lianxiren").click(function(event){
 		var limit = 20;
 		setSelector(event,function(page,option,callback1){
 				postJson("../contact/lianxiren.php",{caozuo:"chalianxiren",offset:page*limit,limit:limit,option:option},function(vendors){
 					callback1(vendors);
 				});
 			},["_id","mingchen"],function(lianxiren){//选择
 				$(this).data("lxrId",lianxiren._id);
				$(this).text(lianxiren.mingchen);
 			},"",function(){//清空
				$(this).removeData("lxrId");
				$(this).html("&nbsp;");
			});
 	});
 	
 	var tmpl_tr_shenqing = $("#tr_shenqing").detach();
	$("#tongji").click(function(){
		var option = {};
		option.lxrId = $("#lianxiren").data("lxrId");
		if(!option.lxrId){
			tip($(this),"必须指定商家！",1500);
			return;
		}
		
		
		postJson("shenqing.php",{caozuo:"yuejietongji",option:option},function(shenqings){			
			$(".tr_shenqing").remove();
			var number = 1;
			var zongzhichu = 0;
			each(shenqings,function(i,shenqing){
				var tr_shenqing = tmpl_tr_shenqing.clone(true);
				tr_shenqing.find("#td_no").text(number++);
				tr_shenqing.find("#td_bianhao").text(shenqing._id);
				tr_shenqing.find("#td_ludanzhe").text(getUserName(shenqing.ludanzhe));
				if(shenqing.zongjine<0){
					tr_shenqing.find("#td_shoukuanjine").text(shenqing.zongjine).css("color","red");
				}else{
					tr_shenqing.find("#td_shoukuanjine").text(shenqing.zongjine);
				}
				tr_shenqing.css("background-color",toggle("#fff","#eee"));
				$("#tb_shenqing").append(tr_shenqing);
				zongzhichu += shenqing.zongjine;
			});
			$("#weijizhangzonge").text(zongzhichu);
		});
	});
});