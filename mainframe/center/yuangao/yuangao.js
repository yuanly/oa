$(function(){
	//{_id:"A232",taiguoxinghao:"",zhongguoxinghao:"",shangjia:{_id:1,mingchen:""},jiage:[beizhu:"",zhi:1.2],danwei:"",yijiazhe:2,yijiariqi:"2013/09/28",zhuantai:"",beizhu:""}
	///////////////////////////////////////事件定义//////////////////////////////////////////////////////
	function tijiaoyuangao(){
		var yuangao = {shangchuanzhe:getTheUser()._id,neirong:editor.editorVal()};
		postJson("./yuangao.php",yuangao,function(yg){
			showDetail(yg);
		});
	}
	$("#tijiao").click(tijiaoyuangao);
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
				if(yuangao.liucheng.length == 1)
					$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
					var caozuoItem = caozuoTmpl.clone(true);
					if(theUser._id == item.userId){{
						$("#cz_shanchu",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}else{
						$("#cz_jiegao",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}
				}
			}else if("接稿" == item.dongzuo){
				if("审结" != yuangao.liucheng[yuangao.liucheng.length-1].dongzuo){
					if(theUser._id != item.userId){
						var caozuoItem = caozuoTmpl.clone(true);
						$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
						$("#cz_jieguan",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
					}else{
						if("申请审结" != yuangao.liucheng[yuangao.liucheng.length-1].dongzuo){
							var caozuoItem = caozuoTmpl.clone(true);
							$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
							$("#cz_shenqingshenhe",caozuoItem).show();
							$("#cz_shenqingshenjie",caozuoItem).show();
							$("table",tmpl).append(caozuoItem);
						}
					}
				}
			}else if("申请审核" == item.dongzuo){
				var caozuoItem = caozuoTmpl.clone(true);
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				if(theUser._id == item.userId){
						$("#cz_quxiaoshenqingshenhe",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
				}else{
						$("#cz_shenhe",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
				}
			}else if("申请审结" == item.dongzuo){
				var caozuoItem = caozuoTmpl.clone(true);
				$("#lc_anniu",tmpl).show().attr("src","../../../img/down.png");
				if(theUser._id == item.userId){
						$("#cz_quxiaoshenqingshenjie",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
				}else{
						$("#cz_shenjie",caozuoItem).show();
						$("table",tmpl).append(caozuoItem);
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
	
	//$("#liucheng").liucheng(getTheUser(),{liucheng:[{userId:6,dongzuo:"上传",time:new Date().getTime()/1000}]});
	var editor = $("#bianjikuang").myeditor(800,600).editorWritable();
});