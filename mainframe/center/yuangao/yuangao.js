$(function(){
	//{_id:"A232",taiguoxinghao:"",zhongguoxinghao:"",shangjia:{_id:1,mingchen:""},jiage:[beizhu:"",zhi:1.2],danwei:"",yijiazhe:2,yijiariqi:"2013/09/28",zhuantai:"",beizhu:""}
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	
	///////////////////////////////独立函数///////////////////////////////////////////////////////////////
	jQuery.fn.liucheng = function(theUser,yuangao){
		var that = this.empty();
		each(yuangao.liucheng,function(n,item){
			var tmpl = liuchengItem.clone(true);
			$("#lc_bianhao",tmpl).text(n+1);
			var usr = getUser(item.userId);
			$("#lc_touxiang",tmpl).attr("src",usr.photo);
			$("#lc_mingchen",tmpl).text(usr.user_name);
			$("#lc_dongzuo",tmpl).text(item.dongzuo);
			$("#lc_shijian",tmpl).text(new Date(item.time*1000).format("yyyy-MM-dd hh:mm"));
			if("上传" == item.dongzuo){
				if(theUser._id == item.userId){
					if(yuangao.liucheng.length == 1){
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						var caozuoItem = caozuoTmpl.clone(true);
						$("#cz_shanchu",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}
				}
			}
			that.append(tmpl);
		});
	}
	
	///////////////////////////////初始化/////////////////////////////////////////////
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	var caozuoTmpl = $("#lc_caozuo").detach();
	var liuchengItem = $("#liuchengItem").detach();
	$("#liucheng").liucheng(getTheUser(),{liucheng:[{userId:6,dongzuo:"上传",time:new Date().getTime()/1000}]});
});