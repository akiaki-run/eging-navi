/* 電波が弱い釣り場でもサイトを開けるように、ページ本体と部品を端末に保存しておく。
 * 天気や潮のデータは毎回取りに行き、取れないときだけ前に保存したものを使う。 */
var CACHE="eging-navi-v2";
var CDN=/^https:\/\/(cdnjs\.cloudflare\.com|www\.gstatic\.com\/firebasejs)\//;
self.addEventListener("install",function(e){ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(["./","index.html","manifest.webmanifest","icon.svg"]).catch(function(){}); })); });
self.addEventListener("activate",function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);})); }).then(function(){ return self.clients.claim(); })); });
function put(req,res){ if(res&&(res.ok||res.type==="opaque")){ var cp=res.clone(); caches.open(CACHE).then(function(c){ c.put(req,cp); }); } return res; }
self.addEventListener("fetch",function(e){
  var r=e.request; if(r.method!=="GET") return;
  var u=new URL(r.url), same=u.origin===self.location.origin;
  /* 地図などの部品:まずネットから取り、取れないときだけ保存したものを使う */
  if(CDN.test(r.url)){ e.respondWith(fetch(r).then(function(res){ return put(r,res); }).catch(function(){ return caches.match(r).then(function(hit){ return hit||Response.error(); }); })); return; }
  if(!same) return;
  /* ページと自分のファイル:まずネット、だめなら保存したもの */
  e.respondWith(fetch(r).then(function(res){ return put(r,res); }).catch(function(){ return caches.match(r,{ignoreSearch:/\.(json)$/.test(u.pathname)?false:false}).then(function(hit){ return hit||caches.match(r,{ignoreSearch:true}); }).then(function(hit){ return hit||(r.mode==="navigate"?caches.match("index.html"):Response.error()); }); }));
});
