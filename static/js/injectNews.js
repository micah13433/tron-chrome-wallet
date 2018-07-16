$(function() {
	$('#fetch-news-more').click(function(){
		$('#fetch-news-more').html("加载中...");
		var xhr = new XMLHttpRequest();
		xhr.open("GET", baseURL + "/wallet/getNews?id=" + $(this).attr("last"), true);
		var isError = false;
		xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var res = JSON.parse(xhr.responseText);
			res = JSON.parse(res.list);
			var resultHtml = "";
			var lastId = 0;
			for (var i=0; i< res.length;i++) {
				resultHtml += "<div class=\"control clear\">" +
								"<div class=\"grade2\"></div>" + 
								"<div class=\"intro\">" +
									"<div class=\"time\">" + res[i].time + "</div>" +  
									"<div class=\"content\">" + 
										"<div class=\"news-title\">" + res[i].title + "</div>" +  
										res[i].content + 
									"</div>" + 
								"</div>" +
							"</div>";
				if( i == res.length -1){
					lastId = res[i].id;
				}
			}
			if(res.length == 20){
				resultHtml += ("<div id=\"fetch-news-more\" last=" + lastId + "><i class=\"fa fa-angle-double-down fa-2x\"></i></div>");
			}
			$('#fetch-news-more').remove();
			injectCustomJs('injectNews');
			$("#news-container").html($("#news-container").html() +resultHtml);
		}else if(xhr.status == 500 && !isError){
			isError = true;
			$("#loading").hide();
			toastr.error("获取快讯失败!");

		}
	  }
	  xhr.send();
	});	

	
});

