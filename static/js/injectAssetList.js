$(function() {	
	var assetGroup = [];
	if(window.localStorage.getItem("isMainnet") == "true"){
		chrome.storage.sync.get({displayAsset:[]},function(items){
			assetGroup = items.displayAsset;
			$('.setting-li').click(function(){
				if($(this).hasClass("on")){
					return;
				}
				var checkBox = $(this).find("input");
				if(checkBox.prop("checked")){
					checkBox.prop("checked",false);
					assetGroup.rm($(this).find("span").text());
				}else{			
					checkBox.prop("checked",true);
					assetGroup.push($(this).find("span").text());
				}
				chrome.storage.sync.set({displayAsset:assetGroup},function(){});
			});
		});
	}else{
		chrome.storage.sync.get({displayAssetTest:[]},function(items){
			assetGroup = items.displayAssetTest;
			$('.setting-li').click(function(){
				if($(this).hasClass("on")){
					return;
				}
				var checkBox = $(this).find("input");
				if(checkBox.prop("checked")){
					checkBox.prop("checked",false);
					assetGroup.rm($(this).find("span").text());
				}else{			
					checkBox.prop("checked",true);
					assetGroup.push($(this).find("span").text());
				}
				chrome.storage.sync.set({displayAssetTest:assetGroup},function(){});
			});
		});
	}	
		
});

