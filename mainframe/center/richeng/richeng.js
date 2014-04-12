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
						$(th).css("background-color","#ffffcc");
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
							$(td).css("background-color","#ffffcc");
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
	function reorder(){
		var order = $(this).data("forReorder");
		if(!order){
			return;
		}
		postJson("richeng.php",{caozuo:"reorder",order:order},function(res){
			var users = getUsers();
			each(users,function(i,user){
				if(user._id == order.id){
					user.rcOrder = order.lastOrder;
				}else if(user._id == order.lastId){
					user.rcOrder = order.order;
				}
			});
			localStorage.setItem("users",JSON.stringify(users));
		setUsers(false);
		refreshRicheng(currDay);
		$(".mingchen").css("cursor","pointer").unbind("click").click(reorder);	
		$(".up").show();
		});
	}
	$("#editBtn").toggle(function(){
		setUsers(false);
		refreshRicheng(currDay);
		$(".mingchen").css("cursor","pointer").click(reorder);	
		$(".up").show();
	},function(){
		setUsers(true);
		refreshRicheng(currDay);
		$(".mingchen").css("cursor","default").unbind("click");
		$(".up").hide();
	});
	
	function setUsers(theUserFirst){
		var users = getUsers();
		var rcOrder = 100;
		each(users,function(i,usr){
			if(usr.rcOrder){
				if(usr.rcOrder>rcOrder){
					rcOrder = usr.rcOrder;
				}
			}
		});
		var changed=false;
		each(users,function(i,usr){
			if(!usr.rcOrder){
				changed=true;
				rcOrder += 100;
				usr.rcOrder = rcOrder;
				postJson("richeng.php",{caozuo:"rcorder",lxrId:usr._id,rcOrder:rcOrder},function(res){});
			}
		});
		if(changed){
			localStorage.setItem("users",JSON.stringify(users));
		}
		users = users.sort(function(a,b){
			return a.rcOrder - b.rcOrder;
		});
		if(theUserFirst){
			var theUser = getTheUser();
			var tmpUsers = [];
			each(users,function(i,u){
				if(u._id != theUser._id){
					tmpUsers.push(u);
				}
			});
			tmpUsers.unshift(theUser);//当前用户放第一行
			users = tmpUsers;
		}
		users.unshift({_id:"LXR0",mingchen:"公司"});
		each(users,function(i,user){console.log(user.rcOrder+":"+user.mingchen)});
		$(".tr_richeng").remove();	
		var lastUser;
		each(users,function(i,user){
			var tr = tmpl_tr.clone(true);
			tr.attr("title",user.mingchen);
			if(i > 1){
				$(tr.find("td").get(0)).html(user.mingchen+"<span class='plainBtn up' style='display:none'>↑</span>");
				$(tr.find("td").get(0)).data("forReorder",{id:user._id,order:user.rcOrder,lastId:lastUser._id,lastOrder:lastUser.rcOrder});
			}else{
				$(tr.find("td").get(0)).html(user.mingchen);
			}
			tr.data("lxrId",user._id);
			$("#tb_richeng").append(tr);
			lastUser = user;
		});
	}
	///////////////////////////////初始化/////////////////////////////////////////////
	function _chushihua_(){} 
	var tmpRC=null;
	var week = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
	var tmpl_tr = $("#tr_richeng").detach();
	
	setUsers(true);
	var today = Math.floor((new Date().getTime()+(8*3600000))/1000/3600/24);
	var currDay = today - 7;
	refreshRicheng(currDay);
});