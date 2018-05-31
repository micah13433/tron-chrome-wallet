$(function() {
	$('.trx-assets').click(function(){
		$("#loading").show();
		var asset = $(this).find("span").html();
		$("#asset-desc").html(asset);
		
		if(asset != "TRX"){
			$("#asset-icon").attr("src","/static/imgs/assets.png");
			$("#asset-icon").attr("class","square");
		}else{
			$("#asset-icon").attr("src","/static/imgs/tron.png");
		}
		$("#asset-num").html($(this).children("span").html());
		getTransactionHistory(asset);
		
	});	

	function getTransactionHistory(asset){
	  if(asset != "TRX"){
		  $('#main-section').removeClass("visible");
		  $("#loading").hide();
		  $('#asset-detail-section').addClass("visible");
		  return;
	  }
	  var xhr = new XMLHttpRequest();
	  xhr.open("GET", baseURL + "/wallet/getTransactionHistory?page=1", true);
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
			if(res.list.length == 10){
				resultHtml += ("<li class=\"trasaction-li\"  id=\"fetch-more\"><i class=\"fa fa-angle-double-down fa-2x\"></i></li>");
			}
			if(resultHtml != ""){
				$("#empty-wrap").hide();
				$("#record-container").html(resultHtml);
			}else{
				$("#empty-wrap").show();
			}
			injectCustomJs('injectTransDetail');
			$('#main-section').removeClass("visible");
			$("#loading").hide();
			$('#asset-detail-section').addClass("visible");
		  }  
		}
	  }
	  xhr.send(); 
	}
	
});