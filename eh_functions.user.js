// ==UserScript==
// @name    E-H Function
// @version    1.0
// @include    https://g.e-hentai.org/*
// @include    https://exhentai.org/*
// @grant    GM_registerMenuCommand
// ==/UserScript==

(function () {
    var list = [{
        name: "查MyTags各tag最後發表日期距今幾天",
        func: async function () {
            const gts = Array.from(document.querySelectorAll('.gt').values());
            const tags = gts.map(el => el.title).filter(tag => tag.startsWith('artist:') || tag.startsWith('group:'));
            for (const tag of tags) {
                const res = await fetch(`/tag/${tag}`);
                const text = await res.text();

                const parser = new DOMParser();
                const doc = parser.parseFromString(text, "text/html");
                const div = doc.querySelector('.gl1t:nth-child(1) .gl5t div:nth-child(1) div:nth-child(2)');
                if (!div) break;
                const time = div.innerText;
                const days = Math.floor((Date.now() - new Date(time).getTime()) / 8640000) / 10;

                const gt = gts.find(el => el.title.includes(tag));
                if (!gt) break;
                gt.parentNode.appendChild(document.createTextNode(days));
            }
        }
    }];

    var localScript = function (scriptText, args) {
        var args = JSON.stringify(args);
        if (typeof scriptText == 'function')
            scriptText = '(' + scriptText + ')(' + args + ');';

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.appendChild(document.createTextNode(scriptText));
        document.body.appendChild(script);

        setTimeout(function () {
            script.parentNode.removeChild(script);
        }, 1000);
    };

    var runMenu = function (id) {
        localScript(function (args) {
            (eval(args.func))();
        }, {
            namespace: this.namespace,
            func: '(' + this.func + ')'
        });
    };

    if (GM_registerMenuCommand && typeof GM_registerMenuCommand === 'function') {
        for (var i = 0; i < list.length; i++) {
            GM_registerMenuCommand('E-H Function - ' + list[i].name, runMenu.bind(list[i], i));
        }
    }
})()