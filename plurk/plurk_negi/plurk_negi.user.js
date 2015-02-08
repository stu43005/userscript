// ==UserScript==
// @name           Plurk Nagi
// @namespace      Plurk
// @include        http://www.plurk.com/*
// @include        https://www.plurk.com/*
// ==/UserScript==

(function(file){
  var script=document.createElement('script');
  script.type='text/javascript';
  script.src=file;
  document.body.appendChild(script);
})("https://rawgit.com/stu43005/userscript/master/plurk/plurk_negi/plurk_negi.js");

/*
網址列(或書籤)用：
javascript:(function(file){var script=document.createElement('script');script.type='text/javascript';script.src=file;document.body.appendChild(script)})("https://rawgit.com/stu43005/userscript/master/plurk/plurk_negi/plurk_negi.js")
*/