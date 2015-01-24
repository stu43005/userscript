var appendToFuncTop = function (base_func_str, insert_func) {
	var insert_func_str;
	try{
		if(typeof eval(base_func_str) !== "function")
			throw "傳入的base function不為function型態！";
	} catch(e){
		alert("appendToFuncTop() 錯誤: " + e);
		return;
	}
	insert_func_str = insert_func.toString().replace(/^[\d\D]*?\{/, "").replace(/}$/, "");
	eval([base_func_str, " = ", eval(base_func_str).toString().replace("{", "{"+insert_func_str)].join(""));
	return eval(base_func_str).toString();
};
if(window.Poll && window.Poll._renderPlurks){
	appendToFuncTop("window.Poll.markAllRead", function(){
		if(Poll.preventDblClick){
			if(!confirm("【防手誤貼心提醒】\n\t確定將所有的Plurk設定已讀嗎？")){
				return false;
			}
		}
	});
	appendToFuncTop("window.Poll._renderPlurks", function(){
		Poll.preventDblClick = true;
		setTimeout(function(){
			delete Poll.preventDblClick;
		},1000);
	});
	var retry = 5;
	var timer = setInterval( function(){
		if(AJS.$("noti_re_actions") && AJS.$("noti_re_view")){
			clearInterval(timer);
			onEvent($("noti_re_actions").firstChild, "click", window.Poll.markAllRead);
			onEvent($("noti_re_view").firstChild, "click", window.Poll._renderPlurks);
		}
		if((--retry)<=0) clearInterval(timer);
	},1000);
}

