$(function(){
	$("body").layout({
		resizable:false,
		west__resizable:true,
		west__maxSize:300,
		west__maskContents:true,
		center__maskContents:true,
		spacing_open:1,
		west__spacing_open:3
	});
	$("#logout_id").click(function(){
		delTheUser();
		location.href="../login/login.html";
	})
	$("#liucheng_help").click(function(){
		window.open("../doc/tutorial.pdf","_blank");
	});
	server.getTheUser(function(resp){
		$("#username").text(resp.username);
	}); 
});