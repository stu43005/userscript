var save_interval = 300000, // 10 min = 10 * 60 * 1000
	savetime = new Date();

$("<span/>").attr("id","autosave").insertAfter("span#save");
$("<span/>").attr("id","time").css({
	"font-size": "9px",
	"font-family": "monospace",
	"position": "absolute",
	"top": "5px",
	"left": "5px"
}).insertAfter("button.toggle");

function save_success() {
	savetime = new Date();
}

$("#saveButton").bind("click",function(){
	save_success();
});

window.setInterval(function(){
	var now = new Date(),
		diff = now - savetime,
		vmindiff, vsecdiff;

	vmindiff = Math.floor(diff / 1000 / 60);
	diff -= vmindiff * 1000 * 60;
	vsecdiff = Math.floor(diff / 1000);

	var mintext = '00';
	if (vmindiff > 0) mintext = String(vmindiff);
	if (mintext.length == 1) mintext = '0' + mintext;

	var sectext = '00';
	if (vsecdiff > 0) sectext = String(vsecdiff);
	if (sectext.length == 1) sectext = '0' + sectext;

	$("#time").html("Time:&nbsp;"+now.toLocaleTimeString()+"<br/>Last Save:&nbsp;"+savetime.toLocaleTimeString()+"&nbsp;("+mintext+":"+sectext+" ago)");
}, 1000);

window.setInterval(("("+save+")()").replace(/\balert\(/gi,"$(\"span#autosave\").html(").replace("save()","()").replace("code = msg.substring(0,5);","code = msg.substring(0,5);save_success();"), save_interval);
