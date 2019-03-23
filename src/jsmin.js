var win=window, doc=document, arr=Array.prototype,
forEach=arr.forEach,filter=arr.filter,map=arr.map,push=arr.push,
reverse=arr.reverse,slice=arr.slice,some=arr.some,splice=arr.splice,

isSet = function(a){return typeof a !== 'undefined'},
isStr = function(a){return typeof a === 'string' || a instanceof String},
isArr = function(a){return a && typeof a === 'object' && a.constructor === Array},
isNum = function(a){return typeof a === 'number' && isFinite(a)},
isObj = function(a){return a && typeof a === 'object' && a.constructor === Object},
isBool= function(a){return typeof a === 'boolean'},
isFunc= function(a){return typeof a === 'function' || a instanceof Function},
isElm = function(a){return a instanceof Element || a instanceof HTMLDocument},
inArr = function(a,v){return a.indexOf(v) > -1},
isJson = function(str) {try {var obj = JSON.parse(str)} catch(e){return false}return obj},
isIndexed = function(a){return a[0] !== void 0},

$parse = function(a,t){return new DOMParser().parseFromString(a, t===void 0 ? 'text/html': t);},
$id = function(a,d){return (d||doc)["getElementById"](a)},
$qs = function(a,d){return (d||doc)["querySelector"](a)},
$find = function(a,d){return slice.call((d||doc)["querySelectorAll"](a))},
$name = function(a,d){return slice.call((d||doc)["getElementsByName"](a))},
$tag = function(a,d){return slice.call((d||doc)["getElementsByTagName"](a))},
$class = function(a,d){return slice.call((d||doc)["getElementsByClassName"](a))},
$mkElm = function(a,d){return (d||doc)["createElement"](a)},
$mkTxt = function(a,d){return (d||doc)["createTextNode"](a)},
$target = function(e){return !e.target ? e.srcElement : e.target},
$prevent = function(e){e.preventDefault ? e.preventDefault() : e.returnValue=false},
$ready = function(cb){AddEv("DOMContentLoaded",cb)};

if(!forEach){
    forEach = function(callback){
        if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
        if (this == null) throw new TypeError('this is null or not defined');
        var T = arguments.length > 1 ? arguments[1] : null;
        for (var i = this.length; i--;) callback.call(T, this[i], i, this);
    };
}

;(function(){
	"use strict";
	var Jsmin = function(){
		function Jsmin(sle, dcc) {
			if (dcc === void 0) dcc = doc;
			if (!sle) return;
			if (isJsmin(sle)) return sle;
			var elms = sle;
			if (isStr(sle)){
				dcc = isJsmin(dcc) ? dcc[0] : dcc;
				if(/<.+>/.test(sle)) elms = $parse(sle);
                else{
                	var fst = sle.charAt(0), sby = sle.substr(1);
                	elms = ( /^[\w-]+$/.test(sby) ) ? (fst=='#') ? $id(sby,dcc) : (fst=='.') ? $class(sby,dcc) : $tag(sle,dcc) : $find(sle,dcc);
                } 
                if(!elms) return;
			}
			else if (isFunc(sle)) return this.ready(sle);
			if (elms.nodeType || elms === win) elms = [elms];
			this.length = elms.length;
			for (var i = 0, l = this.length; i < l; i++) this[i] = elms[i];
		}
		Jsmin.prototype.init = function (sle, dom) {
			return new Jsmin(sle, dom);
		};
		return Jsmin;
	}();

	var jsmin = Jsmin.prototype.init;
	jsmin.fn = jsmin.prototype = Jsmin.prototype;

	function each(arr,callback){
		var item,i=0; while(item=arr[i++]) callback.call(this,item,i,arr)
	}

	jsmin.each = each;

	//***
	Jsmin.prototype.each = function (callback) {
		each(this, callback);
		return this;
	};

    //***
	Jsmin.prototype.attr = function(a,v){
		if(v===void 0) return this[0].getAttribute(a);
		this.each(function(el){
            v ? el.setAttribute(a,v) : el.removeAttribute(a);
        });
        return this;
    };

    //***
	Jsmin.prototype.style = function(val){
		if(val===void 0) return this.attr('style');
		this.attr('style',val);
        return this;
    };

    //***
    function getCss(ele, prop){
		if (ele.nodeType !== 1 || !prop) return;
		var style = win.getComputedStyle(ele, null), value = style.getPropertyValue(prop);
		if(!value || value==='undefined') value = ele.style[prop];
		return value;
	}

    //***
	Jsmin.prototype.hide = function(css){
		this.each(function(elm){
			getCss(elm, 'display') !== 'none' && jsmin(elm).css('display:none');
        });
        return this;
    };

    //***
	Jsmin.prototype.show = function(css){
		this.each(function(elm){
			getCss(ele, 'display') === 'none' && jsmin(elm).css('display:block');
        });
        return this;
    };

    function css(el){
        var sheets = document.styleSheets, ret = [];
        el.matches = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector;
        for (var i in sheets) {
            var rules = sheets[i].rules || sheets[i].cssRules;
            for (var r in rules) {
                if (el.matches(rules[r].selectorText)) {
                    ret.push(rules[r].cssText);
                }
            }
        }
        return ret;
    }
    
    //***
    //if param Value not set function will return PropertyValue
	Jsmin.prototype.css = function(prop,val){
        if(prop===void 0) return css(this[0]);
		if(val===void 0) return getCss(this[0], prop);
		this.each(function(elm){
             elm.style.setProperty(prop, val);
        });
        return this;
    };

    //***
    Jsmin.prototype.html = function(str){
    	if(str===void 0) return this[0].innerHTML;
        this.each(function(elm){
             elm.innerHTML=str;
        });
        return this;
    };

	function getText(el){
	    var node, ret = "", i = 0, nt = el.nodeType;
	    if (!nt) while ( (node = el[i++]) ) ret += getText(node);
	    else if ( inArr([1,9,11],nt) ) {
	        if ( isStr(el.textContent) ) return el.textContent;
	        else for(el = el.firstChild; el; el = el.nextSibling ) ret += getText( el );
	    }else if( inArr([3,4],nt) ) return el.nodeValue;
	    return ret;
	}
 
 	Jsmin.prototype.text = function(str){
 		if(str===void 0) return getText(this);
 		this.each(function(elm){
             if ( inArr([1,9,11],elm.nodeType) ) elm.textContent ? elm.textContent=str : elm.innerText=str;
        });
        return this;
	};

    //***
    function on(el, ev, cb){ el["on"+ev] = isFunc(cb) ? cb : null;}
    Jsmin.prototype.on = function(ev,callback){
        this.each(function(elm){
        	on(elm,ev,callback);
        });
        return this;
    };

    //***   
    function addEv(el, ev, cb){
    	el.addEventListener ? el.addEventListener(ev,cb,false) : el.attachEvent("on"+ev, cb);
    }
    Jsmin.prototype.addEv = function(ev,callback){
        this.each(function(elm){
        	addEv(elm,ev,callback);
        });
        return this;
    };

    //***
    function remEv(el, ev, cb){
    	el.removeEventListener ? el.removeEventListener(ev,cb,false) : el.detachEvent("on"+ev, cb);
    }

    Jsmin.prototype.remEv = function(ev,callback){
        this.each(function(elm){
        	remEv(elm,ev,callback);
        });
        return this;
    };

    //***
    Jsmin.prototype.hasClass = function(cls){
        return cls && some.call(this, function (elm) {
            return elm.classList ? elm.classList.contains(cls) : inArr(elm.className,cls);
        });
    }

    //***
    Jsmin.prototype.removeClass = function(cls){
        this.each(function(elm){
        	if(elm.classList) elm.classList.remove(cls);
        	else{
        		var cnm = elm.className; inArr(cnm,cls) ? cnm = cnm.replace(cls,'').replace(/  +/g, ' ') : void 0;
        	}
        });
        return this;
    };

    //***
    Jsmin.prototype.toggleClass = function(cls){
        this.each(function(elm){
        	if(elm.classList) elm.classList.toggle(cls);
        	else{
        		var cnm = elm.className; inArr(cnm,cls) ? cnm = cnm.replace(cls,'').replace(/  +/g, ' ') : cnm += " " + cls;
        	}
        });
        return this;
    };

    //***
    Jsmin.prototype.addClass = function(cls){
        this.each(function(elm){
        	if(elm.classList) elm.classList.add(cls);
        	else{
        		var cnm = elm.className; inArr(cnm,cls) ? void 0 : cnm += " " + cls;
        	}
        });
        return this;
    };

    Jsmin.prototype.append = function(elms){
        this.each(function (parent){
            parent.innerHTML += elms;
        });
        return this;
    };
    //***
    /*
    Jsmin.prototype.append = function(elms){
        elms = isStr(elms) ? jsmin($mkTxt(elms)) : jsmin(elms);
        this.each(function (parent){
            elms.each(function (child){
                parent.appendChild(child);
            });
        });
        return this;
    };
    */

	//***
	Jsmin.prototype.prepend = function(elms,nth){
    	elms = isStr(elms) ? jsmin($mkTxt(elms)) : jsmin(elms);
    	this.each(function (parent) {
			elms.each(function (child) {
				parent.insertBefore(child, (nth===void 0 ? parent.childNodes[0] : parent.childNodes[nth]));
			});
		});
		return this;
	};

	//***
	win.ajax = function(){
        var a = arguments, accept = {
            text: "text/plain",
            html: "text/html",
            xml: "application/xml, text/xml",
            json: "application/json, text/javascript"
        },
        config = {
            type:'GET',
            url:location.href,
            async:true,
            data:null,
            dataType:accept['text'],
            contentType:"application/x-www-form-urlencoded; charset=UTF-8",
            success:function(res){console.log(res)}
            //,error:function(xhr){console.log(xhr.responseText)}
        };
        if( a.length==1 && isObj(a[0]) )
            for (var x in a[0]) config[x] = x=="dataType" ? accept[a[0][x]] : a[0][x];
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) config.success(this.responseText);
        };
        xhr.onerror = function(){
            config.error(xhr);
        };
        xhr.open(config.type, config.url, config.async);
        xhr.setRequestHeader("content-type",config.contentType);
        xhr.setRequestHeader('Accept', config.dataType);
        xhr.send(config.data);
    }

    //***
    win.log = function(msg){
    	var pre = $qs('pre'), log = pre ? pre : $mkElm("pre");
	    jsmin(log).css('background-color: rgba(0, 0, 0, 0.5);bottom:0;color:#fff;font-family:Courier;left:0;margin:auto;position:absolute;width:100%;z-index:1;');
	    jsmin(log).html('log: '+msg);
	    doc.body.appendChild(log);
    }
    function isJsmin(a){return a instanceof Jsmin};
	win['jsmin'] = win['$'] = jsmin;
})();
