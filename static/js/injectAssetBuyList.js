$(function() {	
	$('.asset-btn').each(function(){
		var now = new Date().getTime();
		var start = $(this).attr("start");
		var end = $(this).attr("end");
		var finish = $(this).attr("finish");			
		if(now > end || now < start || finish == "true"){
			return true;
		}
		$(this).addClass("vote-btn-ok");
		$(this).click(function(){
			$("#loading").show();
			var xhr = new XMLHttpRequest();
			xhr.open("get", baseURL + "/wallet/getAssetDetail?name=" + $(this).attr("name"), true);
			var isError = false;
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && xhr.status == 200) {
					var res = JSON.parse(xhr.responseText);
					res = (res.asset);
					$("#asset-name").html(res.name);
					$("#asset-url").html(res.url);
					$("#asset-supply").html(res.totalSupply);
					$("#asset-start").html(res.startTime);
					$("#asset-end").html(res.endTime);
					$("#asset-price").html(res.price + " TRX");
					$("#asset-buy-btn").attr("address",res.ownerAddress);
					$("#loading").hide();
				}else if(xhr.status == 500 && !isError){
					isError = true;
					$("#loading").hide();
					toastr.error("获取token详细信息出错!");

				}
				$('#assetList-section').removeClass("visible");
				$('#asset-buy-section').addClass("visible");
				$('#asset-amount').focus();
			}
			xhr.send();
				
		});
	});			
});

