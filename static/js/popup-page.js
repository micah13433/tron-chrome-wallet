var baseURL = "http://tron123.top";
$(function() {
	//chrome.storage.sync.clear(function(){});
	var assetNumJson = null;
	initToastr();
	initNetwork();	
	initAsset();
	initDatePick();

	var ele = $("#copy-container")[0];
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
		ele.html("登录中...");
		
		var xhr = new XMLHttpRequest();
		var extraParam = "?isMainnet=" + window.localStorage.getItem("isMainnet");
		xhr.open("POST", baseURL + "/wallet/doLogin" + extraParam + "&from=chrome&password=" + password, true);
		var isError = false;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var res = JSON.parse(xhr.responseText);
				if(res.status && res.status == 1){
					assetNumJson = res;
					initImage(res.address);
					refreshAsset();
					$("#totalAssetValue").html((res.price*res.TRX).toFixed(3));
					$('#login-section').removeClass("visible");
					$('#register-section').removeClass("visible");
					ele.html("确定");
					$("#loading").hide();
					$('#main-section').addClass("visible");
				}else{
					$("#loading").hide();
					ele.html("确定");
					toastr.error("登录失败!");
				}
			}else if(xhr.status == 500 && !isError){
				isError = true;
				$("#loading").hide();
				ele.html("确定");
				toastr.error("登录失败!");
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
	  if(window.localStorage.getItem("isMainnet") == "true"){
		  var xhr = new XMLHttpRequest();
		  xhr.open("GET", "https://api.tronscan.org/api/token?sort=-name", true);
		  xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
			  var resp = JSON.parse(xhr.responseText);
			  var resultHtml = "";
			  var defaultConfig = {displayAsset:[]}; // 默认配置
				chrome.storage.sync.get(defaultConfig, function(items) {
					//剔除过期的token
					var assetGroup = items.displayAsset;
					for(var j in items.displayAsset){
						var found = false;
						for(var i in resp.data){
							if(resp.data[i].name == items.displayAsset[j]){
								found = true;
								break;
							}
						}
						if(!found){
							assetGroup.rm(items.displayAsset[j]);
						}
					}
					chrome.storage.sync.set({displayAsset:assetGroup},function(){});
				})
				chrome.storage.sync.get(defaultConfig, function(items) {
					for(var i in resp.data){
						if(resp.data[i].name == "TRX"){
							continue;
						}
						var showFlag = false;
						for(var j in items.displayAsset){
							if(items.displayAsset[j] == resp.data[i].name){
								showFlag = true;
								break;
							}
						}
						if(resp.data[i].name == ""){
							continue;
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
		}else{
		  var xhr = new XMLHttpRequest();
		  xhr.open("GET", "https://testapi.tronscan.org/api/token?sort=-name", true);
		  xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
			  var resp = JSON.parse(xhr.responseText);
			  var resultHtml = "";
			  var defaultConfig = {displayAssetTest:[]}; // 默认配置
			    chrome.storage.sync.get(defaultConfig, function(items) {
					//剔除过期的token
					var assetGroup = items.displayAssetTest;
					for(var j in items.displayAssetTest){
						var found = false;
						for(var i in resp.data){
							if(resp.data[i].name == items.displayAssetTest[j]){
								found = true;
								break;
							}
						}
						if(!found){
							assetGroup.rm(items.displayAssetTest[j]);
						}
					}
					chrome.storage.sync.set({displayAssetTest:assetGroup},function(){});
				})
				chrome.storage.sync.get(defaultConfig, function(items) {
					for(var i in resp.data){
						if(resp.data[i].name == "TRX"){
							continue;
						}
						var showFlag = false;
						for(var j in items.displayAssetTest){
							if(items.displayAssetTest[j] == resp.data[i].name){
								showFlag = true;
								break;
							}
						}
						if(resp.data[i].name == ""){
							continue;
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
		}
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
		$("#empty-wrap").show();
		$('#record-container').html('');	
	});
	$('#freezeContainer').click(function(){
		$('#main-section').removeClass("visible");
		$('#asset-freeze-section').addClass("visible");
		$('#freeze-amount').focus();
	});
	$('#pushSettingContainer').click(function(){
		$('#main-section').removeClass("visible");
		initSetting();
		$('#asset-pushsetting-section').addClass("visible");	
	});	
	$('#voteContainer').click(function(){
		$("#loading").show();
		$('#main-section').removeClass("visible");
		$('#vote-section').addClass("visible");	
		initAsset();
		var xhr = new XMLHttpRequest();
		var extraParam = "?isMainnet=" + window.localStorage.getItem("isMainnet");
		xhr.open("get", baseURL + "/wallet/getWitness" + extraParam, true);
		var isError = false;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var res = JSON.parse(xhr.responseText);
				res = JSON.parse(res.list);
				var frozenAmount = window.localStorage.getItem("frozenAmount") || 0;
				var resultHtml = "<div class=\"vote-remain-row\"><span class=\"dec-large\" id=\"vote-remain\">" + frozenAmount + "</span><span class=\"dec-small\" style=\"margin-right:10px;\">余票</span><button class=\"vote-btn btn-reset \"><span>清零</span></button><button class=\"vote-btn btn-ok \"><span>投票</span></button></div><ul class=\"setting-items-list\" id=\"vote-list\" style=\"height:370px;\">";
				for (var i=0; i< res.length;i++) {
					resultHtml += ("<li class=\"setting-li on\"><span class=\"text\" title=\"" + res[i].url + "\">【" + (i+1) + "】" + splitstr(res[i].url,22) + "</span><input type=\"number\" class=\"vote-input\" address=\"" + res[i].address + "\">");
				}
				resultHtml += "</ul>";
				$("#loading").hide();
				injectCustomJs('injectVoteList');
				var inner = $("#vote-section").html();
				$("#vote-section").html(inner + resultHtml);
			}else if(xhr.status == 500 && !isError){
				isError = true;
				$("#loading").hide();
				toastr.error("获取代表出错!");

			}
		}
		xhr.send();
	});	
	$('#assetContainer').click(function(){
		$("#loading").show();
		$('#main-section').removeClass("visible");
		$('#assetList-section').addClass("visible");
		var xhr = new XMLHttpRequest();
		var extraParam = "?isMainnet=" + window.localStorage.getItem("isMainnet");
		xhr.open("get", baseURL + "/wallet/getAssets" + extraParam, true);
		var isError = false;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var res = JSON.parse(xhr.responseText);
				res = JSON.parse(res.list);
				var resultHtml = "";
				for (var i=0; i< res.length;i++) {
					resultHtml += ("<li class=\"setting-li on\"><span class=\"text\" title=\"" + res[i].description + "\">【" + (i+1) + "】" + splitstr(res[i].name,22) + "</span><button class=\"vote-btn asset-btn\" finish=\"" + res[i].finised + "\" name=\"" + res[i].name + "\" start=\"" + res[i].startTime + "\" end=\"" + res[i].endTime + "\"><span>购买</span></button>");
				}
				$("#loading").hide();
				injectCustomJs('injectAssetBuyList');
				$("#assetInner-list").html(resultHtml);
			}else if(xhr.status == 500 && !isError){
				isError = true;
				$("#loading").hide();
				toastr.error("获取token出错!");

			}
		}
		xhr.send();
	});
	$('#issueContainer').click(function(){
		$('#asset-issue-section').addClass("visible");
		$('#main-section').removeClass("visible");
		$('#assetIssue-name').focus();
	});
	$('#asset-issue-back').click(function(){
		$('#asset-issue-section').removeClass("visible");
		$('#main-section').addClass("visible");	
	});
	$('#assetList-section-back').click(function(){
		$('#assetList-section').removeClass("visible");
		$('#main-section').addClass("visible");	
	});
	$('#asset-buy-back').click(function(){
		$('#assetList-section').addClass("visible");
		$('#asset-buy-section').removeClass("visible");	
	});
	$('#vote-section-back').click(function(){
		$('#vote-section').removeClass("visible");
		$('#main-section').addClass("visible");	
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
		$("#send-title").html($("#asset-desc").html() + "转账");
		$("#send-to-address").val("");
		$("#send-amount").val("");
		$("#send-to-address").focus();
		$('#asset-send-section').addClass("visible");
		$('#main-section').removeClass("visible");
		$('#send-to-address').focus();
		
	});
	$('#receive-tab').click(function(){
		var ele2 = document.getElementById("copy-qr");
		var clipboard2 = new ClipboardJS(ele2);
		$("#receive-title").html($("#asset-desc").html() + "收款");
		$("#receive-amount").val("");
		$("#receive-to-address").focus();
		$('#asset-receive-section').addClass("visible");
		$('#main-section').removeClass("visible");
		$('#receive-amount').focus();
		
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
		var extraParam = "&isMainnet=" + window.localStorage.getItem("isMainnet");
		var url = baseURL + "/wallet/send?toAddress=" + address + "&amount=" + amount + "&asset=" + asset + extraParam;
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
				$("#messages-tab").click();	
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
		var isError = false;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				$("#loading").hide();
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
				injectCustomJs('injectNews');
				$("#news-container").html(resultHtml);
			}else if(xhr.status == 500 && !isError){
				isError = true;
				$("#loading").hide();
				toastr.error("获取快讯失败!");

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
		var isError = false;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				$("#loading").hide();
				var res = JSON.parse(xhr.responseText);
				res = JSON.parse(res.list);
				var resultHtml = "<ul><li class=\"name oltext\">交易所</li> <li class=\"price oltext\">价格</li> <li class=\"oltext\">涨跌幅</li></ul>";
				for (var i=0; i< res.length;i++) {
					resultHtml += ("<ul><a href=\"" + res[i].domain + "\" target=\"_blank\"><li class=\"name\"><img src=\""+ res[i].logo +"\">" + 
						 res[i].name
					  + "</li> <li class=\"price chartUp\">￥" + res[i].price
					  + "</li> <li><div class=\"digital-" + (res[i].rate.indexOf("+")>=0 ? "up":"down") + "\">" 
					  +  res[i].rate + "</div></li></a></ul>");
				}
				$("#market-container").html(resultHtml);
			}else if(xhr.status == 500 && !isError){
				isError = true;
				$("#loading").hide();
				toastr.error("获取行情失败!");

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
		var extraParam = "&isMainnet=" + window.localStorage.getItem("isMainnet");
		xhr.open("get", baseURL + "/wallet/send?toAddress=" + address + "&amount=" + amount + "&asset=" + asset + extraParam, true);
		var isError = false;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){
					$("#loading").hide();
					initAsset();
					$('#asset-send-section').removeClass("visible");
					$('#asset-detail-section').removeClass("visible");
					$('#main-section').addClass("visible");
					toastr.success("转账成功!");
				}else{
					$("#loading").hide();
					toastr.error("转账失败!");
				}
			}else if(xhr.status == 500 && !isError){
				isError = true;
				$("#loading").hide();
				toastr.error("转账失败!");

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
				}else{
					$("#loading").hide();
					toastr.error("Fail!");
				}
			}else{
				$("#loading").hide();
				toastr.error("Fail!");
			}
		}
		xhr.send();
	});

	$('#freeze-btn').click(function(){
		var frozenNum = $("#freeze-amount").val();
		frozenNum = parseInt(frozenNum);
		if(frozenNum <=0 || frozenNum > $("#asset-remain-freeze").html()){
			$("#freeze-amount").focus();
			return;
		}
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		var extraParam = "&isMainnet=" + window.localStorage.getItem("isMainnet");
		xhr.open("get", baseURL + "/wallet/freeze?frozenBalance=" + frozenNum  + extraParam, true);
		var isError = false;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){					
					$("#loading").hide();
					$('#asset-freeze-back').click();
					$("#messages-tab").click();
					toastr.success("冻结成功!");
				}else{
					$("#loading").hide();
					toastr.error("冻结失败!");

				}
			}else if(xhr.status == 500 && !isError){
				isError = true;
				$("#loading").hide();
				toastr.error("冻结失败!");
			}
		}
		xhr.send();
	});
		
	$('#unFreezeContainer').click(function(){
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		var extraParam = "?isMainnet=" + window.localStorage.getItem("isMainnet");
		xhr.open("get", baseURL + "/wallet/unfreeze" + extraParam, true);
		var isError = false;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				$("#loading").hide();
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){					
					$("#loading").hide();
					initAsset();
					toastr.success("解冻成功!");
				}else{
					toastr.error("解冻失败!");
					$("#loading").hide();
				}
			}else if(xhr.status == 500 && !isError){
				isError = true;
				toastr.error("解冻失败!");
				$("#loading").hide();
			}
		}
		xhr.send();
	});	
	$('#asset-amount').blur(function(){
		var temp = parseInt($(this).val());
		if(temp < 0){
			temp = 0;
		}
		$(this).val(temp);
	});
	$('#send-amount').blur(function(){
		var temp = parseInt($(this).val());
		if(temp < 0){
			temp = 0;
		}
		$(this).val(temp);
	});	
	$('#asset-buy-btn').click(function(){
		var frozenNum = $("#asset-amount").val();
		frozenNum = parseInt(frozenNum);
		if(frozenNum <=0){
			$("#asset-amount").focus();
			return;
		}
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		var extraParam = "&isMainnet=" + window.localStorage.getItem("isMainnet");
		xhr.open("get", baseURL + "/wallet/assetBuy?assetname=" + $("#asset-name").html() + "&toaddress=" + $(this).attr("address") + "&amount=" + $("#asset-amount").val() + extraParam, true);
		var isError = false;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){					
					$("#loading").hide();
					$('#asset-buy-back').click();
					toastr.success("购买成功!");
				}else{
					$("#loading").hide();
					toastr.error("token购买失败!");

				}
			}else if(xhr.status == 500 && !isError){
				isError = true;
				$("#loading").hide();
				toastr.error("token购买失败!");
			}
		}
		xhr.send();
	});
	$('#updateContainer').click(function(){
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		var isError = false;
		xhr.open("get", baseURL + "/wallet/checkUpdate?version=" + $("#version").html(), true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				$("#loading").hide();
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){					
					$("#loading").hide();
					toastr.success("已是最新版本!");					
				}else{
					toastr.warning("最新版本为" + res.version + "，请前往下载!");
					$("#loading").hide();
					$('#version-new').removeClass("hide");
				}
			}else if(xhr.status == 500 && !isError){
				isError = true;
				toastr.success("已是最新版本!");
				$("#loading").hide();	
			}
		}
		xhr.send();
	});
	$('#asset-issue-btn').click(function(){	
		 var issue_name = $.trim($("#assetIssue-name").val());
		 if(issue_name.length <= 0){
			 $("#assetIssue-name").focus();
			 return;
		 }
		 var issue_total = parseInt($.trim($("#assetIssue-supply").val()));
		 if(isNaN(issue_total) || issue_total <= 0){
			 $("#assetIssue-supply").focus();
			 return;
		 }
		 var issue_price = parseFloat($.trim($("#assetIssue-price").val()));
		 if(isNaN(issue_price) || issue_price <= 0){
			 $("#assetIssue-price").focus();
			 return;
		 }
		 var issue_url = $.trim($("#assetIssue-url").val());
		 if(issue_url.length <= 0){
			 $("#assetIssue-url").focus();
			 return;
		 }
		 var issue_desc = $.trim($("#assetIssue-desc").val());
		 if(issue_desc.length <= 0){
			 $("#assetIssue-desc").focus();
			 return;
		 }
		 var startTime = $("#assetIssue-start");
		 var endTime = $("#assetIssue-end");
		 if(startTime.val() > endTime.val()){
			 startTime.focus();
			 return;
		 }
		$("#loading").show();
		var xhr = new XMLHttpRequest();
		var isError = false;
		xhr.open("post", baseURL + "/wallet/assetIssue", true);
		var extraParam = "&isMainnet=" + window.localStorage.getItem("isMainnet");
		var param = "name=" + issue_name + "&supply=" + issue_total + "&price=" + issue_price + "&url=" + issue_url + "&desc=" + issue_desc + "&startTime=" + startTime.val() + "&endTime=" + endTime.val() + extraParam;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				$("#loading").hide();
				var res = JSON.parse(xhr.responseText);
				if(res.code && res.code == 1){					
					$("#loading").hide();
					toastr.success("token发行成功!");					
				}else{
					toastr.error("token发行失败!");
					$("#loading").hide();
				}
			}else if(xhr.status == 500 && !isError){
				isError = true;
				toastr.error("token发行失败!");
				$("#loading").hide();	
			}
		}
		xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xhr.send(param);
		
	});
	$('#dropdown').click(function(){
		$("#dropdown-menu").toggle();
		
	});
	$('#dropdownReg').click(function(){
		$("#dropdown-menuReg").toggle();
		
	});

	$('.dropdown-item').click(function(){
		$('#network').html($(this).html());
		$('#networkReg').html($(this).html());
		$("#dropdown-menu").hide();
		$("#dropdown-menuReg").hide();
		$("#dropdown-menu").attr("net",$(this).attr("data-i"));
		$("#dropdown-menuReg").attr("net",$(this).attr("data-i"));
		var isMainnet = $("#dropdown-menu").attr("net") == 0 ? true : false;
		window.localStorage.setItem("isMainnet",isMainnet);
	});	
	
	function randomImageIndex(max){
		return Math.floor(Math.random()*max + 1);
	}

	function generateAccount(){
		var xhr = new XMLHttpRequest();
		xhr.open("POST", baseURL + "/wallet/generate", false);
		var isError = false;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var res = JSON.parse(xhr.responseText);
				$("#register-address").val(res.address);
				$("#register-password").val(res.password);
				$('#login-section').removeClass("visible");
				$('#register-section').addClass("visible");
			}else if(xhr.status == 500 && !isError){
				isError = true;
				toastr.error("账号生成失败!");
			}
		}
		xhr.send();
	}

	function initImage(address){
		$("#send-from-address").val(address);
		$("#receive-to-address").val(address);
		$("#ower-address").html(format(address,10));
		$("#copy-container").attr("data-clipboard-text",address);
		var extraParam = "&isMainnet=" + window.localStorage.getItem("isMainnet");
		var url = baseURL + "/wallet/send?toAddress=" + address + "&amount=0&asset=TRX" + extraParam;
		$("#qrcode").html("");
		$("#qrcode").qrcode({width: 200,height: 200,correctLevel:0,render: "table",text: url});
		$("#copy-qr").attr("data-clipboard-text",url);
		
		var iconImageIndex = window.localStorage.getItem(address);
		if(iconImageIndex == null || iconImageIndex == 0){
			iconImageIndex = randomImageIndex(22);
			window.localStorage.setItem(address,iconImageIndex); 
		}
		$(".head-icon").attr("src","/static/imgs/head/" + iconImageIndex + ".png");

	}

	function initAsset(){		
		var xhr = new XMLHttpRequest();
		var extraParam = "?isMainnet=" + window.localStorage.getItem("isMainnet");
		xhr.open("POST", baseURL + "/wallet/getLatestAsset" + extraParam, true);
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
					$("#vote-remain").html(res.frozenAmount);
					window.localStorage.setItem("frozenAmount",res.frozenAmount);
				}else{
					$('#login-section').addClass("visible");
					$('#main-section').removeClass("visible");
				}
			}
		}
		xhr.send();
	}
	
	function initNetwork(){
		if(window.localStorage.getItem("isMainnet") == null){
			var network = $("#dropdown-menu");
			var isMainnet = network.attr("net") == 0 ? true : false;
			window.localStorage.setItem("isMainnet",isMainnet);
		}else{
			if(window.localStorage.getItem("isMainnet") == "false"){
				$('#network').html("测试网");
				$('#networkReg').html("测试网");
			}else{
				$('#network').html("主干网");
				$('#networkReg').html("主干网");
			}
		}
	}
		
	function refreshAsset(){
		if(window.localStorage.getItem("isMainnet") == "true"){
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
		}else{
			chrome.storage.sync.get({displayAssetTest:[]},function(items){
				var assetGroup = items.displayAssetTest;
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
		}
	};	

	$('.setting-li').click(function(){
		if(!$(this).hasClass("on")){
			return;
		}
		var checkBox = $(this).find("input");
		if(checkBox.prop("checked")){
			checkBox.prop("checked",false);
			if($(this).attr("id") == "marketSwitch"){
				window.localStorage.setItem("marketSwitch",0);
			}else{
				window.localStorage.setItem("newsSwitch",0);
			}
		}else{			
			checkBox.prop("checked",true);
			if(checkBox.attr("id") == "marketSwitch"){
				window.localStorage.setItem("marketSwitch",1);
			}else{
				window.localStorage.setItem("newsSwitch",1);
			}
			
			var opt = {  
				type: 'basic',  
				title: '示例弹窗!',  
				message: '波场才是真的比特币~',  
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

function initToastr(){
	toastr.options = {  
        closeButton: true,  
        progressBar: true,  
        positionClass: "toast-bottom-center",  
        showDuration: "300",  
        hideDuration: "1000",  
        timeOut: "2000",  
        extendedTimeOut: "1000",  
        showEasing: "swing",  
        hideEasing: "linear",  
        showMethod: "fadeIn",  
        hideMethod: "fadeOut"  
    };
}
function initSetting(){
	var newsSwitch = window.localStorage.getItem("newsSwitch");
	var marketSwitch = window.localStorage.getItem("marketSwitch");
	if(newsSwitch == 1){
		$("#newsSwitch").attr("checked", true);
	}
	if(marketSwitch == 1){
		$("#marketSwitch").attr("checked", true);
	}
}

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
function initDatePick(){
	var now = new Date();
	laydate.render({
	  elem: '#assetIssue-start',
	  type: 'datetime',
	  value: now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate() + " 00:00:00",
	  min:0
	});
	laydate.render({
	  elem: '#assetIssue-end',
	  type: 'datetime',
	  value: now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate() + " 23:59:59",
	  min:0
	});
}
function format(str,index){
	var pre = str.substring(0,index);
	var post = str.substring(str.length-index);
	return pre + "..." + post;
}
function splitstr(str,index){
	if(str.length <= index) return str;
	var pre = str.substring(0,index);
	return pre + "...";
}
Array.prototype.indexOf = function(val) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == val) return i;
	}
	return -1;
};
Array.prototype.rm = function(val) {
	var index = this.indexOf(val);
	if (index > -1) {
	this.splice(index, 1);
	}
};