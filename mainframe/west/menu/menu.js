$(function(){
	$("#accordion").accordion({
		active:0,
		animate:100,
		heightStyle:"content"
	});
	
	$("#newstable").click(function(){
		window.open("../../center/news/news.html","contentpane");
	});
	var version = 0;
	function stat(){
		postJson("stat.php",{version:version},function(res){//·þÎñÆ÷
			if(res.version > version){
				$("#yuangaotip").text(res.yuangao>0?res.yuangao:"-");
				$("#dingdantip").text(res.dingdan>0?res.dingdan:"-");
				$("#dingdantip2").text(res.dingdan2>0?res.dingdan2:"-");
				$("#fahuodantip").text(res.fahuodan>0?res.fahuodan:"-");
				$("#fahuodantip2").text(res.fahuodan2>0?res.fahuodan2:"-");
				$("#yanhuodantip").text(res.yanhuodan>0?res.yanhuodan:"-");
				$("#yanhuodantip2").text(res.yanhuodan2>0?res.yanhuodan2:"-");
				$("#zhuangguidantip").text(res.zhuangguidan>0?res.zhuangguidan:"-");
				$("#zhuangguidantip2").text(res.zhuangguidan2>0?res.zhuangguidan2:"-");
				$("#fukuanshenqingtip").text(res.fukuanshenqing>0?res.fukuanshenqing:"-");
				$("#jizhangtip").text(res.jizhang>0?res.jizhang:"-");
				$("#tuishuitip").text(res.tuishui>0?res.tuishui:"-");
				if(res.news[0]){
					$("#n0").text(res.news[0].title);
					if(res.news[1]){
						$("#n1").text(res.news[1].title);
						if(res.news[2]){
							$("#n2").text(res.news[2].title);
						}
					}
				}
				version = res.version;
			}
		});
	}
	stat();
	setInterval(stat,15000);
});