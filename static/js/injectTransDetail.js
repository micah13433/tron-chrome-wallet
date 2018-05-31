$(function() {
	var page = 1;
	$('#fetch-more').click(function(){
		page++;
		$('#fetch-more').html("loading...");
		var xhr = new XMLHttpRequest();
		xhr.open("GET", baseURL + "/wallet/getTransactionHistory?page=" + page, true);
		xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
		  var res = JSON.parse(xhr.responseText);
		  if(res.code && res.code == 1){
			var resultHtml = "";
			res.list = JSON.parse(res.list);
			for (var i=0; i< res.list.length;i++) {
				var send = false;
				if(res.address == res.list[i].sender){
					send = true;
				}
				resultHtml += ("<li class=\"trasaction-li\">" + 
					"<i class=\"fa " + (send?"fa-toggle-left":"fa-toggle-right") + " fa-2x\" style=\"margin-right: 8px;\"></i>" + 
					"<div class=\"history-desc\"><span class=\"history-address\">" + format(res.list[i].sender,8) + "</span><br/><span class=\"history-time\">" + res.list[i].time + "</span></div>" + 
					"<div class=\"history-right " + (send?"send":"receive") + "\">" + (send?"-":"+") + res.list[i].amount + "</div></li>");
			}
			$('#fetch-more').remove();
			if(res.list.length == 10){
				resultHtml += ("<li class=\"trasaction-li\"  id=\"fetch-more\"><i class=\"fa fa-angle-double-down fa-2x\"></i></li>");
			}
			$("#record-container").html($("#record-container").html() + resultHtml);
		  }else{
			$('#fetch-more').html("<i class=\"fa fa-angle-double-down fa-2x\" style=\"margin-left: 120px;\"></i>");
		  }
		}
	  }
	  xhr.send();
	});	

	
});

