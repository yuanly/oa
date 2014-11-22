/*
news:
{
  "title" : "test",
  "type" : "消息",
  "content" : "aafafafa倒萨是否",
  "_id" : 10,
  "user" : 1,
  "time" : 1379070598,
  "read":2,
  "reply":2,
  "last":13322
}
newsReply:
{
  "newId" : 10,
  "content" : "asdf &nbsp;adf撒旦法发",
  "_id" : 3,
  "user" : 1,
  "time" : 1379070608
}
*/
var new_tr;
var currNew = null;
$(function(){
	$('#currLocation', window.parent.document).text("最新消息");
	
	 //编辑器定义  “图片”和“地图”按钮
	 var plugins={
     		map:{
     			c:'btnMap',
     			t:'插入地图',
     			e:function(){
     				var _this=this;
     				_this.saveBookmark();
     				_this.showIframeModal('Google 地图','../../../xheditor-1.2.1/demos/googlemap/googlemap.html',function(v){
     					_this.loadBookmark();
     					_this.pasteHTML('<img src="'+v+'" />');
     				},538,404);		
     			}
     		},
     		pic:{
     			c:'btnPic',
     			t:'插入图片',
     			e:function(){
     				//editor.pasteHTML("<img src='../img/attach.jpg'/>");
     				editor.showModal("上传本地图片","<div id='file-uploader-demo2'></div>",120,50,function(){});
     				 var uploader1 = new qq.FileUploader({
     		                element: $("#file-uploader-demo2")[0],
     		                action: '../../../uploader/server/up.php',
     		                params:{'memo':'new'},
     		                debug: true,
     		                onComplete: function(id, fileName, respJson){
 	   		                	var src = "../../../uploader/server/down.php?id="+respJson.id;
 	   		                	editor.pasteHTML("<a href='"+src+"' target=_blank ><img src='"+src+"' style='max-width:400px'/></a>");
     		                	//{"id":16,"success":true}
     		                	//editor.pasteHTML("<img src='../../../uploader/server/down.php?id="+respJson.id+"'/>");
     		                },
     		            });
     				editor.removeModal();
     				 uploader1._button.getInput().click();
     			}
     		},
     		attach:{
     			c:'btnAttach',
     			t:'插入附件',
     			e:function(){}
     		}
     };
	  
	//“清空”编辑器按钮
	$("#clearEditor").click(function(){
		$("#editor").val("");
		if("发布消息" == diag.find("#handle_name").text()){
			$("#fabuxiaoxi > #title").val("");
			$("#fabuxiaoxi > #type").val(0);
		}
	})
	//“提交”消息按钮 新增 回复
	$("#submitNew").click(function(){
		if("回复消息" == $("#handle_name").text()){ 
			//var reply ={newId:currNew._id,content:$("#editor").val().trim()};
			var reply ={newId:currNew._id,content:editor.getSource().trim()};
			if("" == reply.content){
				ask3(null,"不能发空回复！")
				return;
			}
			server.replyNew(reply,function(){
				tip(null,"回复成功！",1000);
				$("#dialogContainer").hide();
				setNewsDetail(currNew);
			});
			return;
		}
		//var theNew = {title:$("#title").val().trim(),type:$("#type").val(),content:$("#editor").val().trim()};//author time 
		var theNew = {title:$("#title").val().trim(),type:$("#type").val(),content:editor.getSource().trim()};//author time 
		console.log(theNew);
		if(!theNew.title){
			ask3(null,"消息标题不能为空！")
			return;
		} 
		server.postNew(theNew,function(resp){
			if(!resp.success){
				tip(null,resp.err);
			}else{
				$("#dialogContainer").hide();
				getnews(0,null);
			}
		}); 
	})
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
		});
		//消息记录模板
	new_tr = $("#new_tr").clone();
	$("#new_tr").remove();
	//打开消息发布界面 “发布”按钮
	$("#fabu").click(function(){
		$(".ui-layout-center").show();
		$("#newsDetailContainer").hide();
		$(".ui-layout-center > #fabuxiaoxi").remove();
		diag = $("#template > #fabuxiaoxi").clone(true);
		$(".ui-layout-center").append(diag);
		editor = diag.find("#editor").xheditor({plugins:plugins,
		tools:'Fontface,FontSize,Bold,Italic,Underline,Strikethrough,FontColor,BackColor,Removeformat,|,Align,List,Outdent,Indent,|,Link,Unlink,Img,Hr,Emot,Table,|,Preview,Print,Fullscreen,|,map,|,pic,|,attach,|',
		width:800,height:600});
		diag.find("#handle").click(function(){
			layout.toggle("west");	
		});
		diag.find("#title").removeAttr("disabled"); 
		diag.find("#type").removeAttr("disabled"); 
		diag.find("#clearEditor").click();
	});
	//消息回复 按钮
	$("#d_reply").click(function(){
		$("#fabu").click();
		diag.find("#handle_name").text("回复消息");
		diag.find("#title").val(currNew.title);
		diag.find("#title").attr("disabled","disabled");
		diag.find("#type > option[value='"+currNew.type+"']").attr("selected",true);
		diag.find("#type").attr("disabled",true);
	});
	//消息列表翻页
	$("#getMore").click(function(){
		page = $(this).data("page");
		if(!page){
			page = 1;
		}else{
			page ++;
		}
		type = $(this).data("type");
		if(!type){
			type = null;
		}
		getnews(page,type);
		$(this.page).data("page",page);
	});
	//消息列表过滤按钮
	$(".filterBtn").click(function(){
		$("#allNews").css("color","black");
		$(".filterBtn").css("color","black");
		$(this).css("color","white");
		getnews(0,$(this).text());
		$("#getMore").data("type",$(this).text());
	})
	
	$("#allNews").click(function(){
		$(".filterBtn").css("color","black");
		$(this).css("color","white");
		getnews(0,null);
		$("#getMore").data("type",null);
	});
	
	$("#genggai").click(function(){
		var that = $(this);
		if($("#type2").val() == currNews.type){
			tip(that,"请先设置为不同的类型！",1500);
		}else{
			postJson("news.php",{caozuo:"gaileixing",_id:currNews._id,leixing:$("#type2").val()},function(vendors){
				tip(that,"更改消息类型成功！",1500);
			});
		}
	});
	$("#shanchu").click(function(){
		ask(null,"一旦删除将无法恢复，真的要删除该消息吗？",function(){
				postJson("news.php",{caozuo:"shanchu",_id:currNews._id},function(vendors){
					getnews(0,null);
				});
		});
	});
	
	$("#newsDetail").dblclick(function(){layout.toggle("west");clearSelection();});
	//消息列表
	getnews(0,null);	
});

function getUserName(id){
	usr = getUser(id);
	if(usr){
		return usr.user_name;
	}else{
		return null;
	}
}
function new2tr(theNew){
	var tr = new_tr.clone();
	tr.find("#newid").text(theNew._id+".");
	tr.find("#newtype").text("【"+theNew.type+"】");
	tr.find("#lin").attr("href","#"+theNew._id);
	tr.find("#lin").text(theNew.title);
	tr.find("#author").text("("+getUserName(theNew.user)+")");
	tr.find("#createtime").text(new Date(theNew.time*1000).format("yyyy-MM-dd hh:mm:ss"));
	if(!theNew.updateTime){
		theNew.updateTime = theNew.time;
	}
	tr.find("#updatetime").text(new Date(theNew.last*1000).format("yyyy-MM-dd hh:mm:ss"));
	tr.find("#readcount").text(theNew.read?theNew.read:0);
	tr.find("#replycount").text(theNew.reply?theNew.reply:0);
	
	tr/*.find("#lin")*/.click(function(){
		$(".selected").removeClass("selected");
		tr.addClass("selected");
		setNewsDetail(theNew);
	}); 
	return tr;
}

function getnews(page,type){
	server.getnews(page,type,function(news){
		if(news instanceof Array){
			$("#newslist").empty(); 
			for(i=0;i<news.length;i++){
				try{
				$("#newslist").append(new2tr(news[i]));
			}catch(e){}
			}
			if(0 == page){
				try{
					if($("#newslist").find("#lin").length>0){
						$(".ui-layout-center").show();
						$("#newslist").find("#lin").click();
					}else{
						$(".ui-layout-center").hide();
					}
				}catch(e){}
			}
		}else{
			tip(null,"获取消息失败！",1000)
		}
	})
}

function setNewsReplyTr(reply){
	var tr = $("#newsDetail #first_tr").clone();
	tr.attr("id","");
	tr.find("#louceng").text(louceng++);
	tr.find("#d_name").text(getUserName(reply.user));
	tr.find("#d_date").text(new Date(reply.time*1000).format("yyyy-MM-dd"));
	tr.find("#d_time").text(new Date(reply.time*1000).format("hh:mm:ss"));
	tr.find("#d_head").attr("src",getUser(reply.user).photo);
	tr.find("#d_content").html(reply.content); 
	return tr;
}

var louceng=2;
var currNews = null;
function setNewsDetail(theNew){
	currNews = theNew;
	if(currNews.user != getTheUser()._id){
		$("#ownerAction").hide();
	}else{
		$("#ownerAction").show();
	}
	try{
		$(".ui-layout-center > #fabuxiaoxi").remove();
		$("#newsDetailContainer").show();
		currNew = theNew;
		var first_tr = $("#newsDetail #first_tr").clone();
		$("#newsDetail table").empty();
		$("#d_title").text(theNew.title); 
		$("#type2").val(theNew.type);
		first_tr.find("#d_name").text(getUserName(theNew.user));
		first_tr.find("#d_date").text(new Date(theNew.time*1000).format("yyyy-MM-dd"));
		first_tr.find("#d_time").text(new Date(theNew.time*1000).format("hh:mm:ss"));
		first_tr.find("#d_head").attr("src",getUser(theNew.user)?getUser(theNew.user).photo:"");
		first_tr.find("#d_content").html(theNew.content);
		$("#newsDetail table").append(first_tr);
		//show replies
		louceng=2;
		server.getNewsReplies(theNew._id,function(replies){
			for(var i = 0; i<replies.length; i++){
				var tr = setNewsReplyTr(replies[i]); 
				$("#newsDetail table").append(tr);
			}
		});
	}catch(e){console.log(e)}
}