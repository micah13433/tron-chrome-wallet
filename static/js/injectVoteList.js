$(function() {	
	$('.vote-input').blur(function(){
		var temp = parseInt($(this).val());
		if(temp < 0){
			temp = 0;
		}
		$(this).val(temp);
		
		var used = 0;
		$(".vote-input").each(function(){
			if($.trim($(this).val()) != ""){
				used += parseInt($.trim($(this).val()));
			}			
	    });
		var remain = window.localStorage.getItem("frozenAmount") - used;
		$('#vote-remain').html(remain);
		if(remain < 0){
			$('.btn-ok').hide();
		}else{
			$('.btn-ok').show();
		}
	});
	$('#vote-section-back').click(function(){
		$('#vote-section').removeClass("visible");
		$('#main-section').addClass("visible");	
	});
	$('.btn-reset').click(function(){
		$('.vote-input').val("");
	});
	$('.btn-ok').click(function(){
		var addressList = new Array();
        var amountList = new Array();
		var index = 0;
		$(".vote-input").each(function(){
			if((parseInt($(this).val())) > 0){
				addressList[index] = $(this).attr("address");
        		amountList[index] = parseInt($(this).val());
        		index++;
			}
	    });
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		var extraParam = "&isMainnet=" + window.localStorage.getItem("isMainnet");
		xhr.open("get", baseURL + "/wallet/vote?addressList=" + addressList.join(",") + "&amountList=" + amountList.join(",") + extraParam, true);
		var isError = false;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){					
					$("#loading").hide();
					$('.vote-input').val("");
					toastr.success("投票成功!");
				}else{
					$("#loading").hide();
					toastr.error("投票失败!");

				}
			}else if(xhr.status == 500 && !isError){
				isError = true;
				$("#loading").hide();
				toastr.error("投票失败!");
			}
		}
		xhr.send();
	});
});

