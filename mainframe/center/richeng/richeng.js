$(function(){
	/*
	{_id:"2014-03-23",  
		LXRn:"xxx",
		...
	}
	
	*/
	
	$('#currLocation', window.parent.document).text("日程管理");
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function _shijianchuli_(){}
	$("td","#tb_richeng").attr("contenteditable","true");
	$($("td","#tr_richeng").get(0)).removeAttr("contenteditable").attr("nowrap","nowrap");
	$("th").attr("nowrap","nowrap");
	
	$("#qianyitian").click(function(){
		currDay = currDay - 1;
		refreshRicheng(currDay);
	});
	$("#qianyizhou").click(function(){
		currDay = currDay - 7;
		refreshRicheng(currDay);
	});
	$("#houyitian").click(function(){
		currDay = currDay + 1;
		refreshRicheng(currDay);
	});
	$("#houyizhou").click(function(){
		currDay = currDay + 7;
		refreshRicheng(currDay);
	});
	
	$("td","#tb_richeng").focus(function(){
		tmpRC = $(this).html().trim();
	}).blur(function(){
		var rc = {_id:$(this).data("day")};
		var i = $(this).data("i");
		if(!i){
			return;
		}
		if($(this).html().trim() == tmpRC){
			return;
		}
		$(".tr_richeng").each(function(n,tr){
			var td = $($("td",tr).get(i));
			if("" != td.html().trim()){
				rc[td.data("lxrId")] = td.html().trim();
			}
		});
		var theTd = $(this);
		postJson("richeng.php",{caozuo:"baocun",richeng:rc},function(res){
			if(res.success == true){
				tip(theTd,"已保存",500);
			}
		});		
	});
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
function _hanshuku_(){}
	function formatDate(day){
		return new Date(day*1000*24*3600).format("yyyy-MM-dd")
	}
	function formatDay(day){
		var i = new Date(day*1000*24*3600).getDay();
		return week[i];
	}
	function getRicheng(rcs,day,lxrId){
		var richeng = null;
		each(rcs,function(i,rc){
			if(rc._id == day){
				richeng = rc;
				return false;
			}
		});
		if(richeng){
			if(richeng[lxrId]){
				return richeng[lxrId];
			}
		}
		return "";
	}
	function refreshRicheng(day){
		$("tb_richeng td").text("");
		postJson("richeng.php",{caozuo:"chaxun",day:day},function(richengs){
			$("th","#tr_header").each(function(i,th){
				if(i>0){
					$(th).html(formatDate(day+i)+"<br/>"+formatDay(day+i));
					if((day+i) == today){
						$(th).css("background-color","yellow");
					}else{
						$(th).css("background-color","#99ccff");
					}
				}
			});
			$(".tr_richeng").each(function(i,tr){
				var lxrId = $(tr).data("lxrId");
				$("td",tr).each(function(i,td){
					if(i>0){
						$(td).html(getRicheng(richengs,day+i,lxrId));
						if((day+i) == today){
							$(td).css("background-color","yellow");
						}else{
							$(td).css("background-color","#fff");
						}
						$(td).data("day",(day+i));
						$(td).data("lxrId",lxrId);
						$(td).data("i",i);
					}
				});
			});
		});
	}
	
	///////////////////////////////初始化/////////////////////////////////////////////
	function _chushihua_(){} 
	var tmpRC=null;
	var week = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
	var tmpl_tr = $("#tr_richeng").detach();
	var users = getUsers();
	var theUser = getTheUser();
	users = users.sort(function(a,b){
		if(a._id<b._id){
			return -1;
		}else if(a._id>b._id){
			return 1;
		}else {
			return 0;
		}
	});
	users.push(users.shift());//第一个用户是LXR1 袁立宇，放到最后一行。
	var tmpUsers = [];
	each(users,function(i,u){
		if(u._id != theUser._id){
			tmpUsers.push(u);
		}
	});
	tmpUsers.unshift(theUser);//当前用户放第一行
	tmpUsers.unshift({_id:"LXR0",mingchen:"公司"});
	each(tmpUsers,function(i,user){
		var tr = tmpl_tr.clone(true);
		$(tr.find("td").get(0)).text(user.mingchen);
		tr.data("lxrId",user._id);
		$("#tb_richeng").append(tr);
	});
	var today = Math.floor((new Date().getTime())/1000/3600/24);
	var currDay = today - 7;
	refreshRicheng(currDay);
});