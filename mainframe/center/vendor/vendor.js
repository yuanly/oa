/*
{
	_id:"xxx",
	mingchen:"xxx",
	dianhua:"xxx",
	dizhi:"xxxx",
	beizhu:"xxx",
	yanhuodizhi:"xxx"
}
*/

$(function(){
	var currVendor = null;
	var limit = 20;
	//定义左右布局
	var layout = $("body").layout({
		west__size:"auto",
		west__maskContents:true,
		center__maskContents:true,
	});
	
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
	     		                	//{"id":16,"success":true}
	     		                	editor.pasteHTML("<img src='../../../uploader/server/down.php?id="+respJson.id+"'/>");
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
	    editor = $("#beizhu").xheditor({plugins:plugins,
				tools:'Fontface,FontSize,Bold,Italic,Underline,Strikethrough,FontColor,BackColor,Removeformat,|,Align,List,Outdent,Indent,|,Link,Unlink,Img,Hr,Emot,Table,|,Preview,Print,Fullscreen,|,map,|,pic,|,attach,|',
				width:700,height:400});

	//设置记录点击处理，在模板被剥离前。
	$(".tr_vendor").click(function(){
		showDetail($(this).data("_id"));
	});
	//获取并显示商家列表
	var tr_vendor = $(".tr_vendor").detach();
	listVendors(0,getUrl().showId);


	//处理“编辑”按钮
	$("#bianji").click(function(){
		$("#beizhu").val(currVendor.beizhu);
		makeEditable(null);
	});
	
	
	//过滤条件变更处理
	$("#option").keyup(function(event){
		if($(this).data("lastValue") != $(this).val().trim()){
			$(this).data("lastValue",$(this).val().trim()) ;
			listVendors(0);
		}
	});
	//翻页处理
	$("#prevPage").click(function(){
		listVendors($("#pager").data("offset")-1);
	});
	$("#nextPage").click(function(){
		listVendors($("#pager").data("offset")+1);
	});
	//新增商家
	$("#newVendor").click(function(){
		$("#bianhao").text("【新增】");
		$("#mingchen").val("");
		$("#dianhua").val("");
		$("#dizhi").val("");
		$("#beizhu").val("");
		makeEditable();
	});
	//提交
	$("#tijiao").click(function(){
			if("" == $("#mingchen").val().trim()){
				tip(null,"商家名称不能留空！",1500);
				return;
			}
		if("【新增】" == $("#bianhao").text()){		
			postJson("vendor.php",form2Obj(),function(res){
				if(res.success == true){
					window.location.reload();
				}else{
					ask3(null,res.err);//可能是重名
				}
			});
		}else{
			var vendor = form2Obj();
			vendor._id = currVendor._id;			
			postJson("vendor.php",vendor,function(res){
				if(res.success == true){
					currVendor = vendor;
					$("#beizhu2").html(vendor.beizhu);
					$("#beizhu2").show();
					$("#taContainer").hide();
					$("#bianji").show();
					$("#tijiao").hide();
					tip(null,"成功修改商家信息！",3000);
				}else{
					ask3(null,res.err);//可能是重名
				}
			});
		}
	});
	//设置头部点击处理（放到当前面板）
	$("#tableheader").click(function(){
		layout.sizePane("west",$("#vendortable").width()+20);
	});
	$("#detailheader").click(function(){
		layout.sizePane("west",$("body").width()-$(this).width()-100);
	});
	//列出商家
	function listVendors(offset,showId){
		if(offset<0){
			return;
		}
		$("#pager").data("offset",offset);
		postJson("vendors.php",{offset:offset*limit,limit:limit,option:$("#option").data("lastValue")},function(vendors){
			$("#vendortable .tr_vendor").remove();
			each(vendors,function(n,vendor){
				tr = tr_vendor.clone(true);
				tr.data("_id",vendor._id);
				tr.find("#td_bianhao").text(vendor._id);
				tr.find("#td_mingchen").text(vendor.mingchen);
				tr.find("#td_dianhua").text(vendor.dianhua);
				tr.find("#td_dizhi").text(vendor.dizhi);
				tr.css("background-color",toggle("#deedde","#dedeed"));
				$("#vendortable").append(tr);
			});
			if(showId){
				showDetail(showId);
			}else if(vendors.length>0){//将列表第一个商家显示在右边的商家详情表单
				showDetail(vendors[0]["_id"]);
			}
		});
	}
	
	/*显示指定商家详情*/
	function showDetail(_id){
				postJson("vendors.php",{_id:_id},function(vendor){
					obj2form(vendor);
					$("#beizhu2").show();
					$("#taContainer").hide();
					$(".ui-layout-center .plainInput").attr("readonly",true);
					$("#bianji").show();
					$("#tijiao").hide();
				});
	}
	//将vendor对象设置到表单
	function obj2form(vendor){
		currVendor = vendor;
		$("#bianhao").text(vendor._id);
		$("#mingchen").val(vendor.mingchen);
		$("#dianhua").val(vendor.dianhua);
		$("#dizhi").val(vendor.dizhi);
		$("#yanhuodizhi").val(vendor.yanhuodizhi?vendor.yanhuodizhi:"");
		$("#beizhu2").html(vendor.beizhu);
	//	$("#beizhu").val(vendor.beizhu);
	}
	
	
	//将表单的内容转换为vendor对象
	function form2Obj(){
			var vendor = {};
			vendor.mingchen = $("#mingchen").val().trim();
			vendor.dianhua = $("#dianhua").val().trim();
			vendor.dizhi = $("#dizhi").val().trim();
			vendor.yanhuodizhi = $("#yanhuodizhi").val().trim();
			vendor.beizhu = $("#beizhu").val().trim();
			return vendor;
	}
	//进入编辑状态
	function makeEditable(elm){	
			$("#beizhu2").hide();
			$("#taContainer").show();
			$(".ui-layout-center .plainInput").removeAttr("readonly");
			$("#bianji").hide();
			$("#tijiao").show();
	}
	
//	makeEditable();
});