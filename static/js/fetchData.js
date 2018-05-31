function getAssets(url){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
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
		});  
     
    }
  }
  xhr.send(); 
}