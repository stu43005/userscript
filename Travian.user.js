// ==UserScript==
// @name       Travian
// @version    0.1.1.2
// @include    http://tx3.travian.tw/*
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

function appendscript(scriptText, args) {
	var args = JSON.stringify(args);
	if (typeof scriptText == 'function')
		scriptText = '(' + scriptText + ')(' + args + ');';

	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.appendChild(document.createTextNode(scriptText));
	document.body.appendChild(script);

	setTimeout(function() {
		script.parentNode.removeChild(script);
	}, 1000);
}

function checkAll(type, form, value, checkall, changestyle) {
	var checkall = checkall ? checkall : 'chkall';
	for(var i = 0; i < form.elements.length; i++) {
		var e = form.elements[i];
		if(type == 'option' && e.type == 'radio' && e.value == value && e.disabled != true) e.checked = true;
		else if(type == 'value' && e.type == 'checkbox' && e.value == value) e.checked = form.elements[checkall].checked;
		else if(type == 'prefix' && e.name && e.name != checkall && (!value || (value && e.name.match(value)))) {
			e.checked = form.elements[checkall].checked;
			if(changestyle && e.parentNode && e.parentNode.tagName.toLowerCase() == 'li') e.parentNode.className = e.checked ? 'checked' : '';
		}
	}
}

$("head").append("<style type=\"text/css\">.showCosts .resources.little_res{color:red}</style>");

if ( location.href.indexOf("dorf1.php") != -1 ) {
	for(var i=1;i<=4;i++) {
		var tmp = $("#l"+i).html().match(/(\d+)\/(\d+)/),
			tmp2 = $("#production tbody tr:nth-child("+i+") .num").html().match(/([\d\-]+)/),
			text = "";
		if ( tmp2[1] == 0 ) {
			continue;
		} else if ( tmp2[1] > 0 ) {
			var n = (tmp[2] - tmp[1]) / tmp2[1] * 60;
			text = (n>=60?Math.floor(n/60)+"小時":"")+(n%60>0?Math.floor(n%60)+"分鐘":"")+"後資源滿 ("+(new Date((new Date()).getTime()+n*60*1000)).toLocaleTimeString()+")";
		} else {
			var n = tmp[1] / tmp2[1] * 60 * (-1);
			text = (n>=60?Math.floor(n/60)+"小時":"")+(n%60>0?Math.floor(n%60)+"分鐘":"")+"後資源空 ("+(new Date((new Date()).getTime()+n*60*1000)).toLocaleTimeString()+")";
		}
		appendscript(function(args) {
			$$("#production tbody tr:nth-child(" + args.i + ")").setTip(args.text);
		}, {
			i: i,
			text: text
		});
	}
} else if ( location.href.indexOf("berichte.php") != -1 && location.href.indexOf("?id=") == -1 ) {
	$("form").append('<input class="check" type="checkbox" id="chkall" name="chkall"> <label for="chkall">全選</label>');
	$("#chkall").click(function(){
		checkAll('prefix',$("form").get(0));
	});
}

