$(function() {
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
	var assetGroup = [];
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
		
});

