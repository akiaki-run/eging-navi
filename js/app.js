/* ===== 全国エギングナビ:画面 ===== */

/* ===== オフライン計算:月齢→潮名、日の出入り ===== */
function moonAge(d){ var ref=Date.UTC(2000,0,6,18,14); var a=((d.getTime()-ref)/864e5)%29.530588853; return a<0?a+29.530588853:a; }
function tideNameFromAge(a){ var r=Math.round(a+0.8)%30;
  if(r<=2||r>=29) return "大潮"; if(r<=6) return "中潮"; if(r<=9) return "小潮"; if(r===10) return "長潮"; if(r===11) return "若潮";
  if(r<=13) return "中潮"; if(r<=17) return "大潮"; if(r<=21) return "中潮"; if(r<=23) return "小潮"; if(r===24) return "長潮"; if(r===25) return "若潮"; return "中潮"; }
function sunTimes(y,m,d,lat,lon){
  var rad=Math.PI/180, N=Math.floor(275*m/9)-Math.floor((m+9)/12)*(1+Math.floor((y-4*Math.floor(y/4)+2)/3))+d-30;
  function calc(rise){ var lh=lon/15, t=N+((rise?6:18)-lh)/24, M=0.9856*t-3.289;
    var L=(M+1.916*Math.sin(M*rad)+0.020*Math.sin(2*M*rad)+282.634)%360; if(L<0)L+=360;
    var RA=Math.atan(0.91764*Math.tan(L*rad))/rad; RA=(RA+360)%360; RA+=(Math.floor(L/90)-Math.floor(RA/90))*90; RA/=15;
    var sd=0.39782*Math.sin(L*rad), cd=Math.cos(Math.asin(sd));
    var ch=(Math.cos(90.833*rad)-sd*Math.sin(lat*rad))/(cd*Math.cos(lat*rad)); var H=Math.acos(ch)/rad; H=(rise?360-H:H)/15;
    var T=H+RA-0.06571*t-6.622, UT=(T-lh)%24; if(UT<0)UT+=24; return (UT+9)%24; }
  return {rise:h2hm(calc(true)), set:h2hm(calc(false))};
}

/* ===== 状態 ===== */
function lsGet(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
var saved=lsGet("eging-area")||{};
var state={offset:0, slot:"auto", manual:null, mode:"center", fixId:null, addAt:null,
  center:{lat:saved.lat||32.47, lng:saved.lng||130.39}, dia:saved.dia||20, mine:[], auto:[], catches:[], groups:[], groupSpots:{},
  autoMsg:"", pos:{}, areaSaveT:null, wx:null, wxErr:null, wxKey:null, tide:null, station:null, condSeq:0};

function jstDate(off){ var n=new Date(Date.now()+9*36e5+off*864e5); return {y:n.getUTCFullYear(),m:n.getUTCMonth()+1,d:n.getUTCDate(),
  key:n.getUTCFullYear()+"-"+String(n.getUTCMonth()+1).padStart(2,"0")+"-"+String(n.getUTCDate()).padStart(2,"0"), w:"日月火水木金土"[n.getUTCDay()]}; }
function nowH(){ var n=new Date(Date.now()+9*36e5); return n.getUTCHours()+n.getUTCMinutes()/60; }
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch];});}

function allSpots(){
  var b=SPOTS.map(function(s){var p=state.pos[s.id];return p?Object.assign({},s,{lat:p.lat,lng:p.lng,moved:true}):s;});
  return b.concat(state.mine).concat(state.auto).concat(groupSpotList());
}
function radius(){return state.dia/2;}
function inside(){var c=state.center,r=radius();return allSpots().filter(function(s){return distKm(c,s)<=r;});}

var SLOTS=[["auto","次のマヅメ"],["morning","朝マヅメ"],["day","日中"],["evening","夕マヅメ"],["night","夜"]];
function slotRange(slot,sr,ss){
  if(slot==="auto"){ if(state.offset===0){ var n=nowH(); slot=n<sr+1?"morning":(n<ss+1?"evening":"night"); } else slot="evening"; }
  if(slot==="morning") return [sr-1,sr+2,slot]; if(slot==="day") return [10,15,slot]; if(slot==="evening") return [ss-2,ss+1,slot]; return [ss+1.5,23,slot];
}
function baseCond(){
  var D=jstDate(state.offset), noon=new Date(Date.UTC(D.y,D.m-1,D.d,3)), st=sunTimes(D.y,D.m,D.d,state.center.lat,state.center.lng), age=moonAge(noon);
  var c={date:D.key,w:D.w,month:D.m,moon_age:age,tide_name:tideNameFromAge(age),sunrise:st.rise,sunset:st.set,
    wind_dir:null,wind_ms:null,wave_m:null,rain_max:null,weather:null,tide_events:null,auto:false};
  var day=state.wx&&state.wx.days[D.key];
  if(day){ if(day.sunrise){c.sunrise=day.sunrise;c.sunset=day.sunset;}
    var r=slotRange(state.slot,hm2h(c.sunrise),hm2h(c.sunset)), sm=Wx.summarize(day,r[0],r[1]);
    c.slot=r[2]; c.slotFrom=r[0]; c.slotTo=r[1];
    if(sm){ Object.assign(c,sm); c.auto=true; }
    c.wind_by_hour=day.speed; c.rain_by_hour=day.rain; c.fetchedAt=state.wx.at; }
  if(state.tide&&state.tide.date===D.key&&state.tide.day){
    var t=state.tide.day; c.tide_events=t.hi.map(function(e){return {type:"満潮",time:e[0],cm:e[1]};}).concat(t.lo.map(function(e){return {type:"干潮",time:e[0],cm:e[1]};}));
    c.tide_station=state.station?state.station.name:null; c.station_dist=state.station?state.station.dist:null; }
  if(state.manual){ var m=state.manual; c.wind_dir=m.dir; c.wind_ms=m.ws; c.tide_name=m.tide; c.wave_m=m.wave; c.manualOn=true; }
  return c;
}

/* ===== 地図 ===== */
var map, circle, ctrMarker, spotLayer, ovLayers={}, detail={}, loading={};
function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}
function decRings(poly){return poly.map(function(r){var x=r[0],y=r[1],out=[[y/1e5,x/1e5]];for(var i=2;i<r.length;i+=2){x+=r[i];y+=r[i+1];out.push([y/1e5,x/1e5]);}return out;});}
function landStyle(){return {color:css("--coast"),weight:0.7,fillColor:css("--land"),fillOpacity:1,fillRule:"nonzero",interactive:false};}
function bbHit(b,minx,miny,maxx,maxy){return !(b[2]<minx||b[0]>maxx||b[3]<miny||b[1]>maxy);}
function prefsIn(minx,miny,maxx,maxy){return OVERVIEW.filter(function(p){return bbHit(p.bbox,minx,miny,maxx,maxy);}).map(function(p){return p.code;});}
function loadPref(code){
  if(detail[code]) return Promise.resolve(detail[code]);
  if(loading[code]) return loading[code];
  loading[code]=fetch("data/land/p"+code+".json").then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(arr){
    var rings=[], lls=[];
    arr.forEach(function(poly){ var rs=decRings(poly); lls.push(rs);
      rs.forEach(function(r,ri){ var n=r.length, xs=new Float64Array(n), ys=new Float64Array(n), b=[1e9,1e9,-1e9,-1e9];
        for(var i=0;i<n;i++){ys[i]=r[i][0];xs[i]=r[i][1];if(xs[i]<b[0])b[0]=xs[i];if(ys[i]<b[1])b[1]=ys[i];if(xs[i]>b[2])b[2]=xs[i];if(ys[i]>b[3])b[3]=ys[i];}
        rings.push({b:b,xs:xs,ys:ys,hole:ri>0}); }); });
    var d={rings:rings,layer:null};
    detail[code]=d; return d;
  }).catch(function(){ delete loading[code]; return null; });
  return loading[code];
}
function loadView(){
  if(!map||map.getZoom()<8.5) return;
  var b=map.getBounds(), codes=prefsIn(b.getWest(),b.getSouth(),b.getEast(),b.getNorth());
  if(codes.length<=8) codes.forEach(loadPref);
}
function initMap(){
  if(!window.L){ document.getElementById("map").innerHTML='<div class="empty" style="margin:12px">地図を読み込めませんでした。通信を確認して開き直してください。</div>'; return; }
  map=L.map("map",{minZoom:5,maxZoom:18,zoomSnap:0.25,maxBounds:[[20,118],[48,155]],attributionControl:true});
  map.setView([state.center.lat,state.center.lng],10);
  map.attributionControl.setPrefix(false);
  var gsi='<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a>';
  var std=L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{maxZoom:18,maxNativeZoom:18,attribution:gsi});
  var pale=L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",{maxZoom:18,maxNativeZoom:18,attribution:gsi});
  var photo=L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",{maxZoom:18,maxNativeZoom:18,attribution:gsi});
  var label=L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{maxZoom:18,maxNativeZoom:18,opacity:0.55,attribution:gsi});
  var base=lsGet("eging-base")||"std";
  ({std:std,pale:pale,photo:photo}[base]||std).addTo(map);
  if(base==="photo"&&lsGet("eging-photolabel")!==false) label.addTo(map);
  L.control.layers({"標準地図(地名あり)":std,"淡い地図":pale,"航空写真(浅瀬・藻場が見える)":photo},{"航空写真に地名を重ねる":label},{position:"topright"}).addTo(map);
  map.on("baselayerchange",function(e){ var k=e.layer===photo?"photo":(e.layer===pale?"pale":"std"); lsSet("eging-base",k); if(k==="photo"&&!map.hasLayer(label)&&lsGet("eging-photolabel")!==false) label.addTo(map); if(k!=="photo"&&map.hasLayer(label)) map.removeLayer(label); });
  map.on("overlayadd",function(e){ if(e.layer===label) lsSet("eging-photolabel",true); });
  map.on("overlayremove",function(e){ if(e.layer===label) lsSet("eging-photolabel",false); });
  map.on("zoomend",function(){ drawPins(lastRanked); });
  L.control.scale({imperial:false,position:"bottomleft"}).addTo(map);
  circle=L.circle([state.center.lat,state.center.lng],{radius:radius()*1000,color:css("--ring"),weight:2,fillColor:css("--ring"),fillOpacity:0.08,interactive:false}).addTo(map);
  ctrMarker=L.marker([state.center.lat,state.center.lng],{draggable:true,icon:L.divIcon({className:"",html:'<div class="ctr"></div>',iconSize:[18,18],iconAnchor:[9,9]}),zIndexOffset:1000,keyboard:false}).addTo(map);
  ctrMarker.bindTooltip("中心(ドラッグで移動)",{direction:"top",offset:[0,-10]});
  ctrMarker.on("drag",function(e){var ll=e.target.getLatLng();state.center={lat:ll.lat,lng:ll.lng};circle.setLatLng(ll);});
  ctrMarker.on("dragend",function(){areaChanged();});
  spotLayer=L.layerGroup().addTo(map);
  map.fitBounds(circle.getBounds(),{padding:[16,16]});
  map.on("moveend",loadView); loadView();
  map.on("click",function(e){
    var ll={lat:e.latlng.lat,lng:e.latlng.lng};
    if(state.fixId){ savePos(state.fixId,ll); state.fixId=null; setMode("center"); return; }
    if(state.mode==="add"){ state.addAt=ll; showAdd(); return; }
    state.center=ll; ctrMarker.setLatLng(e.latlng); circle.setLatLng(e.latlng); areaChanged();
  });
  var mq=window.matchMedia("(prefers-color-scheme: dark)");
  function restyle(){ circle.setStyle({color:css("--ring"),fillColor:css("--ring")}); }
  if(mq.addEventListener) mq.addEventListener("change",restyle);
  new MutationObserver(restyle).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
}

/* ===== 地形から「海が開いている向き」を測る ===== */
var openCache={}, openPending={}, rerenderT=null;
function okey(s){return s.lat.toFixed(5)+","+s.lng.toFixed(5);}
function localRings(lng,lat,dx,dy){var out=[];Object.keys(detail).forEach(function(k){var d=detail[k];if(!d)return;d.rings.forEach(function(r){if(bbHit(r.b,lng-dx,lat-dy,lng+dx,lat+dy))out.push(r);});});return out;}
function pip(rings,x,y){var ins=false;rings.forEach(function(r){if(x<r.b[0]||x>r.b[2]||y<r.b[1]||y>r.b[3])return;var xs=r.xs,ys=r.ys,n=xs.length;for(var i=0,j=n-1;i<n;j=i++){if(((ys[i]>y)!==(ys[j]>y))&&(x<(xs[j]-xs[i])*(y-ys[i])/(ys[j]-ys[i])+xs[i]))ins=!ins;}});return ins;}
function measureOpen(lat,lng){
  var L5=5, ky=110.57, kx=111.32*Math.cos(lat*Math.PI/180), dx=(L5+0.5)/kx, dy=(L5+0.5)/ky;
  var rings=localRings(lng,lat,dx,dy), res=[], off=0.03/L5;
  for(var k=0;k<16;k++){
    var th=k*Math.PI/8, ex=lng+Math.sin(th)*L5/kx, ey=lat+Math.cos(th)*L5/ky, rx=ex-lng, ry=ey-lat, ts=[];
    var land=pip(rings,lng+rx*off,lat+ry*off);
    var bx0=Math.min(lng,ex),bx1=Math.max(lng,ex),by0=Math.min(lat,ey),by1=Math.max(lat,ey);
    rings.forEach(function(r){ if(!bbHit(r.b,bx0,by0,bx1,by1))return; var xs=r.xs,ys=r.ys,n=xs.length;
      for(var i=0,j=n-1;i<n;j=i++){ var sx=xs[i]-xs[j], sy=ys[i]-ys[j], den=rx*sy-ry*sx; if(den===0)continue;
        var qx=xs[j]-lng, qy=ys[j]-lat, t=(qx*sy-qy*sx)/den, u=(qx*ry-qy*rx)/den;
        if(t>off&&t<=1&&u>=0&&u<=1) ts.push(t); } });
    ts.sort(function(a,b){return a-b;});
    var start=land?null:off, run=0, done=false;
    for(var q=0;q<ts.length;q++){
      if(land){ if(ts[q]*L5>0.4){run=0;done=true;break;} land=false; start=ts[q]; }
      else { run=(ts[q]-start)*L5; done=true; break; }
    }
    if(!done) run=(land?0:(1-start)*L5);
    res.push(Math.round(run*100)/100);
  }
  return res;
}
function ensureOpen(s){
  var k=okey(s); if(openCache[k]||openPending[k]) return;
  openPending[k]=1;
  var codes=prefsIn(s.lng-0.08,s.lat-0.06,s.lng+0.08,s.lat+0.06);
  Promise.all(codes.map(loadPref)).then(function(){
    openCache[k]=measureOpen(s.lat,s.lng); delete openPending[k];
    clearTimeout(rerenderT); rerenderT=setTimeout(render,120);
  });
}
function withOpen(s){var o=openCache[okey(s)];return o?Object.assign({},s,{_open:o}):s;}

function compassSvg(open,ca,c){
  var R=46,cx=60,cy=60,g='';
  for(var i=0;i<16;i++){ var v=open[i], rr=v>0?(14+(R-14)*Math.min(v,5)/5):0; if(!rr)continue;
    var a0=(i-0.5)*Math.PI/8, a1=(i+0.5)*Math.PI/8;
    var inSec=ca&&ca.best!=null&&(ca.lo<=ca.hi?(i>=ca.lo&&i<=ca.hi):(i>=ca.lo||i<=ca.hi));
    g+='<path d="M'+cx+' '+cy+' L'+(cx+rr*Math.sin(a0)).toFixed(1)+' '+(cy-rr*Math.cos(a0)).toFixed(1)+' A'+rr.toFixed(1)+' '+rr.toFixed(1)+' 0 0 1 '+(cx+rr*Math.sin(a1)).toFixed(1)+' '+(cy-rr*Math.cos(a1)).toFixed(1)+' Z" fill="'+(inSec?'var(--buoy)':'var(--sea)')+'" opacity="'+(inSec?0.9:0.35)+'"/>'; }
  g+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="var(--line)"/><circle cx="'+cx+'" cy="'+cy+'" r="4" fill="var(--ink)"/>';
  [["北",0],["東",4],["南",8],["西",12]].forEach(function(d){var a=d[1]*Math.PI/8;g+='<text x="'+(cx+(R+9)*Math.sin(a)).toFixed(1)+'" y="'+(cy-(R+9)*Math.cos(a)+4).toFixed(1)+'" font-size="10" text-anchor="middle" fill="var(--sub)">'+d[0]+'</text>';});
  var wi=dirIndex(c.wind_dir);
  if(wi>=0&&c.wind_ms>0){ var a=wi*Math.PI/8, x0=cx+(R+2)*Math.sin(a), y0=cy-(R+2)*Math.cos(a), x1=cx+(R-22)*Math.sin(a), y1=cy-(R-22)*Math.cos(a);
    g+='<line x1="'+x0.toFixed(1)+'" y1="'+y0.toFixed(1)+'" x2="'+x1.toFixed(1)+'" y2="'+y1.toFixed(1)+'" stroke="var(--ink)" stroke-width="2" marker-end="url(#ah)"/>'; }
  return '<svg viewBox="-6 -6 132 132" width="120" height="120" role="img" aria-label="海の開いている向きと風"><defs><marker id="ah" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="var(--ink)"/></marker></defs>'+g+'</svg>';
}
function castBlock(s,c){
  var o=openCache[okey(s)];
  if(!o) return '<div class="cast"><div class="castTxt" style="color:var(--sub)">地形を読み込んで、投げる向きを計算しています…</div></div>';
  var ca=castAdvice(o,c,s);
  return '<div class="cast">'+compassSvg(o,ca,c)+'<div class="castTxt"><span class="lbl">投げる向き</span>'+esc(ca.text)+(s.cast?'<br><span class="lbl">現地情報</span>'+esc(s.cast):'')+
    '<div class="castKey"><i class="sw" style="background:var(--buoy)"></i>おすすめの向き <i class="sw" style="background:var(--sea);opacity:.5"></i>海が開いている向き(長いほど沖まで開けている) <span>→ 風</span></div></div></div>';
}
function nearestPlace(ll){var b=null,bd=1e9;PLACES.forEach(function(p){var d=distKm(ll,{lat:p[1],lng:p[2]});if(d<bd){bd=d;b=p;}});return b?{name:b[0],lat:b[1],lng:b[2],dist:bd}:null;}

var lastRanked=[];
function drawPins(ranked){
  lastRanked=ranked||[];
  if(!spotLayer)return;
  spotLayer.clearLayers();
  var rankOf={}; lastRanked.forEach(function(r,i){rankOf[r.spot.id]=i+1;});
  allSpots().forEach(function(s){
    var n=rankOf[s.id]; if(n>10){ var dot=L.circleMarker([s.lat,s.lng],{radius:4,color:css("--card"),weight:1,fillColor:s.auto?css("--sea"):css("--buoy"),fillOpacity:0.9}); dot.bindTooltip(esc(s.name)); dot.on("click",function(){var t=document.getElementById("sp-"+s.id);if(t)t.scrollIntoView({behavior:"smooth",block:"center"});}); spotLayer.addLayer(dot); return; }
    var cls="pin"+(n?(n===1?" top":""):" out")+(s.mine?" mine":"")+(s.auto?" auto":"")+(s.shared?" shared":"");
    var sz=n?(n===1?30:24):12;
    var m=L.marker([s.lat,s.lng],{icon:L.divIcon({className:"",html:'<div class="'+cls+'">'+(n||"")+'</div>',iconSize:[sz,sz],iconAnchor:[sz/2,sz/2]}),keyboard:false,zIndexOffset:n?(500-n):0});
    var showName=n&&(n<=3||map.getZoom()>=12);
    var short=s.auto?s.name.replace(/\(.*\)$/,"").replace(/^.*?[市郡]/,"").replace(/^[^の]*?町(?=[^の])/,""):s.name; if(/^の/.test(short)) short=short.slice(1);
    m.bindTooltip(esc(showName?short:s.name),showName?{permanent:true,direction:"right",offset:[sz/2,0],className:"pinlabel"}:{direction:"top",offset:[0,-sz/2]});
    m.on("click",function(){var t=document.getElementById("sp-"+s.id);if(t){ if(t.closest("details"))t.closest("details").open=true; t.scrollIntoView({behavior:"smooth",block:"center"});}});
    spotLayer.addLayer(m);
  });
}


/* ===== 地形から釣りができそうな場所を自動で拾う ===== */
var autoT=null, autoSeq=0;
function scheduleAuto(){ clearTimeout(autoT); autoT=setTimeout(genAuto,350); }
var towns={}, townLoading={};
function loadTowns(code){ if(towns[code])return Promise.resolve(towns[code]); if(townLoading[code])return townLoading[code];
  townLoading[code]=fetch("data/land/t"+code+".json").then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(a){towns[code]=a;return a;}).catch(function(){delete townLoading[code];return null;});
  return townLoading[code]; }
function nearestTown(p){ var best=null,bd=4; Object.keys(towns).forEach(function(k){ (towns[k]||[]).forEach(function(t){ if(Math.abs(t[1]-p.lat)>0.05||Math.abs(t[2]-p.lng)>0.06)return; var d=distKm(p,{lat:t[1],lng:t[2]}); if(d<bd){bd=d;best=t[0];} }); }); return best; }
function classify(open){
  var sea=[],long=0,maxR=0,sx=0,sy=0;
  for(var i=0;i<16;i++){ var r=open[i]; if(r>=0.3){sea.push(i);sx+=Math.sin(i*Math.PI/8)*r;sy+=Math.cos(i*Math.PI/8)*r;} if(r>=1.5)long++; if(r>maxR)maxR=r; }
  if(!sea.length) return null;
  var face=Math.round(((Math.atan2(sx,sy)*8/Math.PI)+16))%16, perp=open[face];
  if(perp<1.2&&maxR>=2.5&&long>=2) return {type:"瀬戸(水道)",face:face,maxR:maxR,eging:3,current:"fast"};
  if(long>=6) return {type:"岬",face:face,maxR:maxR,eging:3,current:"normal"};
  if(long>=3) return {type:"磯・海岸",face:face,maxR:maxR,eging:2,current:"normal"};
  return {type:"入り江",face:face,maxR:maxR,eging:2,current:"normal",calm:true};
}
var AUTO_HOW={"岬":"先端から潮目を探す。潮が動く時間に回遊が入りやすい。",
  "瀬戸(水道)":"潮が速いので、潮止まり前後や小潮の日に重めのエギで底を取る。",
  "磯・海岸":"沖のかけあがりを広く探る。風が強い日は無理をしない。",
  "入り江":"風が強い日の逃げ場。秋は湾内に新子が入りやすく、藻場があれば春の産卵場にもなる。"};
function genAuto(){
  var my=++autoSeq;
  if(state.dia>40){ state.auto=[]; state.autoMsg="地形からの自動候補は、直径40km以下のときに出します。"; render(); return; }
  var c=state.center, r=radius(), kx=111.32*Math.cos(c.lat*Math.PI/180), ky=110.57, dx=(r+6)/kx, dy=(r+6)/ky;
  state.autoMsg="地形から候補を探しています…"; render();
  var codes=prefsIn(c.lng-dx,c.lat-dy,c.lng+dx,c.lat+dy);
  if(codes.length>8){ state.auto=[]; state.autoMsg=""; render(); return; }
  Promise.all(codes.map(loadPref).concat(codes.map(loadTowns))).then(function(){
    if(my!==autoSeq) return;
    var rings=localRings(c.lng,c.lat,(r+1)/kx,(r+1)/ky), cands=[];
    var STEP=0.25;
    rings.forEach(function(rg){
      if(rg.hole) return;
      var xs=rg.xs, ys=rg.ys, n=xs.length, per=0, area=0;
      for(var i=1;i<n;i++){ per+=Math.hypot((xs[i]-xs[i-1])*kx,(ys[i]-ys[i-1])*ky); area+=xs[i-1]*ys[i]-xs[i]*ys[i-1]; }
      if(per<3) return;
      var ccw=area>0, px=[], py=[], acc=0;
      for(var j=1;j<n;j++){ var segL=Math.hypot((xs[j]-xs[j-1])*kx,(ys[j]-ys[j-1])*ky); if(!segL)continue;
        var t=acc; while(t<segL){ px.push(xs[j-1]+(xs[j]-xs[j-1])*t/segL); py.push(ys[j-1]+(ys[j]-ys[j-1])*t/segL); t+=STEP; } acc=t-segL; }
      var m=px.length; if(m<12) return;
      function turn(i,k){ var a=(i-k+m)%m, b=(i+k)%m; var ax=(px[i]-px[a])*kx, ay=(py[i]-py[a])*ky, bx=(px[b]-px[i])*kx, by=(py[b]-py[i])*ky;
        var cr=ax*by-ay*bx, dt=ax*bx+ay*by; var ang=Math.atan2(cr,dt); return ccw?ang:-ang; }
      for(var q=0;q<m;q++){
        if(Math.hypot((px[q]-c.lng)*kx,(py[q]-c.lat)*ky)>r) continue;
        var s=turn(q,2)*0.5+turn(q,5);
        if(Math.abs(s)>0.9) cands.push({lng:px[q],lat:py[q],s:s,sideX:ccw?(py[(q+1)%m]-py[q])*ky:-(py[(q+1)%m]-py[q])*ky,sideY:ccw?-(px[(q+1)%m]-px[q])*kx:(px[(q+1)%m]-px[q])*kx});
      }
    });
    cands.sort(function(a,b){return Math.abs(b.s)-Math.abs(a.s);});
    var picked=[], heads=0, bays=0, existing=allSpots();
    for(var i=0;i<cands.length&&picked.length<36;i++){
      var p=cands[i], isHead=p.s>0;
      if(isHead&&heads>=26) continue; if(!isHead&&bays>=10) continue;
      if(picked.some(function(o){return distKm(o,p)<1.2;})) continue;
      if(existing.some(function(o){return distKm(o,p)<0.6;})) continue;
      var L=Math.hypot(p.sideX,p.sideY)||1, ox=p.lng+(p.sideX/L)*0.15/kx, oy=p.lat+(p.sideY/L)*0.15/ky;
      if(pip(rings,ox,oy)) continue;
      picked.push(p); if(isHead)heads++; else bays++;
    }
    var pl=nearestPlace(c), town=pl?pl.name.replace(/^(北海道|東京都|大阪府|京都府|.{2,3}県)/,""):"";
    var out=[];
    picked.forEach(function(p){
      var open=measureOpen(p.lat,p.lng), cl=classify(open); if(!cl) return;
      var near=nearestTown(p)||(nearestPlace(p)||{}).name||town, tn=near.replace(/^(北海道|東京都|大阪府|京都府|.{2,3}県)/,"");
      var id="a"+Math.round(p.lat*1e4)+"_"+Math.round(p.lng*1e4);
      openCache[okey({lat:+p.lat.toFixed(5),lng:+p.lng.toFixed(5)})]=open;
      out.push({id:id,auto:true,name:tn+"の"+cl.type+"("+DIRS16[cl.face]+"向き)",area:tn+"(地形から自動で出した候補)",lat:+p.lat.toFixed(5),lng:+p.lng.toFixed(5),
        eging:cl.eging,current:cl.current,kind:cl.type,ika:"",open:open,
        feat:DIRS16[cl.face]+"向きに海が開けた"+cl.type+"。最大で約"+cl.maxR.toFixed(1)+"km先まで海が続く"+(cl.current==="fast"?"。両側から陸が迫る水道で、潮が速くなりやすい":"")+"。",
        how:AUTO_HOW[cl.type], note:"道があるか、足場、立入禁止かどうかは確認できていない。航空写真と現地で確かめてから。"});
    });
    state.auto=out; state.autoMsg=out.length?"":"この範囲では地形からの候補が見つかりませんでした。";
    render();
  });
}


/* ===== 釣果の記録 ===== */
var logSpotId=null;
function logStats(id){ var t=0,h=0,n=0; state.catches.forEach(function(x){ if(x.spot_id===id){ t++; if(x.count>0){h++;n+=x.count;} } }); return t?{trips:t,hits:h,total:n}:null; }
function fmtAt(iso){ var d=new Date(iso); if(isNaN(d))return ""; var j=new Date(d.getTime()+9*36e5); return (j.getUTCMonth()+1)+"/"+j.getUTCDate()+" "+String(j.getUTCHours()).padStart(2,"0")+":"+String(j.getUTCMinutes()).padStart(2,"0"); }
function localInputNow(){ var j=new Date(Date.now()+9*36e5); return j.toISOString().slice(0,16); }
function openLog(id){
  var s=allSpots().filter(function(x){return x.id===id;})[0]; if(!s) return;
  logSpotId=id;
  document.getElementById("logSpot").textContent=s.name;
  document.getElementById("lgAt").value=localInputNow();
  var o=openCache[okey(s)], ca=o?castAdvice(o,baseCond(),s):null;
  document.getElementById("lgDir").value=ca&&ca.best!=null?DIRS16[ca.best]:"";
  document.getElementById("lgN").value=1; document.getElementById("lgG").value=""; document.getElementById("lgMemo").value=""; document.getElementById("lgMsg").textContent="";
  document.getElementById("logSheet").hidden=false; document.getElementById("lgN").focus();
}
function closeLog(){ document.getElementById("logSheet").hidden=true; logSpotId=null; }
function condAt(iso,s){
  var d=new Date(iso), j=new Date(d.getTime()+9*36e5), key=j.toISOString().slice(0,10), h=j.getUTCHours()+j.getUTCMinutes()/60, out={};
  var day=state.wx&&state.wx.days[key];
  if(day){ var sm=Wx.summarize(day,Math.floor(h),Math.floor(h)); if(sm){ out.weather=sm.weather; out.wind_dir=sm.wind_dir; out.wind_ms=sm.wind_ms; if(sm.wave_m!=null) out.wave_m=sm.wave_m; }
    if(day.sunrise){ if(Math.abs(h-hm2h(day.sunrise))<=1) out.mazume="朝マヅメ"; else if(Math.abs(h-hm2h(day.sunset))<=1) out.mazume="夕マヅメ"; } }
  if(state.tide&&state.tide.date===key&&state.tide.day){ var t=state.tide.day;
    var cv=tideCurve(t.hi.map(function(e){return {type:"満潮",time:e[0],cm:e[1]};}).concat(t.lo.map(function(e){return {type:"干潮",time:e[0],cm:e[1]};})));
    if(cv){ var near=cv.events.some(function(e){return Math.abs(e.t-h)<0.67;}); out.tide_phase=near?"潮止まり前後":(cv.at(h+0.25)>cv.at(h-0.25)?"上げ潮":"下げ潮"); }
    if(state.station) out.tide_station=state.station.name; }
  var noon=new Date(Date.UTC(j.getUTCFullYear(),j.getUTCMonth(),j.getUTCDate(),3)); out.tide_name=tideNameFromAge(moonAge(noon));
  if(state.manual&&key===jstDate(0).key){ out.wind_dir=state.manual.dir; out.wind_ms=state.manual.ws; }
  return out;
}
function saveLog(){
  var s=allSpots().filter(function(x){return x.id===logSpotId;})[0], msg=document.getElementById("lgMsg");
  if(!s) return;
  var atLocal=document.getElementById("lgAt").value; if(!atLocal){ msg.textContent="日時を入れてください。"; return; }
  var iso=new Date(atLocal+":00+09:00").toISOString();
  var rec={spot_id:s.id,spot_name:s.name,lat:s.lat,lng:s.lng,at:iso,count:Math.max(0,+document.getElementById("lgN").value||0),
    kind:document.getElementById("lgKind").value,max_g:document.getElementById("lgG").value?+document.getElementById("lgG").value:null,
    egi_size:document.getElementById("lgSize").value,egi_color:document.getElementById("lgColor").value.trim(),
    cast_dir:document.getElementById("lgDir").value||null,memo:document.getElementById("lgMemo").value.trim(),cond:condAt(iso,s),createdAt:new Date().toISOString()};
  var chain=Promise.resolve();
  if(s.auto){ var keep={name:s.name,note:s.note||"",lat:s.lat,lng:s.lng,eging:s.eging,current:s.current,kind:s.kind,feat:s.feat,how:s.how,open:s.open||null,createdAt:new Date().toISOString(),from_auto:true};
    chain=Store.saveSpot(s.id,keep); }
  document.getElementById("lgSave").disabled=true;
  chain.then(function(){ return Store.addCatch(rec); }).then(function(){ closeLog(); }).catch(function(e){ console.warn(e); msg.textContent="保存できませんでした。通信を確認して、もう一度押してください。"; })
    .then(function(){ document.getElementById("lgSave").disabled=false; });
}
function renderLog(){
  var el=document.getElementById("logList"); if(!el) return;
  if(!state.catches.length){ el.innerHTML='<div class="empty">まだ記録はありません。ポイントのカードにある「釣果を記録」から入れられます。釣れなかった日も0杯で残すと、順位づけに使えます。</div>'; return; }
  var tot=0,hits=0; state.catches.forEach(function(x){tot+=x.count||0;if(x.count>0)hits++;});
  el.innerHTML='<div class="logsum">'+state.catches.length+'回の釣行で、'+hits+'回釣れて計'+tot+'杯</div>'+state.catches.slice(0,30).map(function(x){
    var cd=x.cond||{}, cond=[cd.weather,cd.wind_dir?(cd.wind_dir+" "+(cd.wind_ms!=null?cd.wind_ms+"m":"")):"",cd.tide_name,cd.tide_phase,cd.mazume].filter(Boolean).join("・");
    return '<div class="logrow"><div class="lt num">'+fmtAt(x.at)+'</div><div class="lb"><b>'+esc(x.spot_name)+'</b> <span class="cnt'+(x.count>0?'':' zero')+'">'+(x.count>0?x.count+"杯":"ボウズ")+'</span>'+
      (x.count>0?' '+esc(x.kind||"")+(x.max_g?" 最大"+x.max_g+"g":""):"")+
      '<small>'+esc([x.egi_size?x.egi_size+"号":"",x.egi_color,x.cast_dir?x.cast_dir+"へ投げた":""].filter(Boolean).join(" ・ "))+(cond?' / '+esc(cond):'')+(x.memo?' / '+esc(x.memo):'')+'</small></div>'+
      '<button class="btn sm" data-lgdel="'+esc(x.id)+'">削除</button></div>';
  }).join("");
  Array.prototype.forEach.call(el.querySelectorAll("[data-lgdel]"),function(b){ b.onclick=function(){
    if(b.dataset.armed){ Store.deleteCatch(b.dataset.lgdel).catch(function(){}); } else { b.dataset.armed="1"; b.textContent="もう一度押すと削除"; } }; });
}

function areaChanged(fit){
  lsSet("eging-area",{lat:state.center.lat,lng:state.center.lng,dia:state.dia});
  if(fit&&map&&circle) map.fitBounds(circle.getBounds(),{padding:[16,16]});
  render(); scheduleAuto();
  clearTimeout(state.areaSaveT);
  state.areaSaveT=setTimeout(saveArea,2000);
}
function saveArea(){
  var pl=nearestPlace(state.center);
  Store.saveArea({lat:+state.center.lat.toFixed(4),lng:+state.center.lng.toFixed(4),diameter_km:state.dia,place:pl?pl.name:null,updatedAt:new Date().toISOString()}).catch(function(){});
}
function savePos(id,ll){
  state.pos[id]={lat:ll.lat,lng:ll.lng}; render();
  Store.savePos(id,{lat:+ll.lat.toFixed(5),lng:+ll.lng.toFixed(5)}).catch(function(){});
}

/* ===== 画面 ===== */
function setMode(m){
  state.mode=m;
  document.getElementById("mCenter").setAttribute("aria-pressed",m==="center");
  document.getElementById("mAdd").setAttribute("aria-pressed",m==="add");
  if(m!=="add"){ document.getElementById("addForm").hidden=true; state.addAt=null; }
  hint();
}
var SLOT_NAME={morning:"朝マヅメ",day:"日中",evening:"夕マヅメ",night:"夜"};
function fmtTime(d){ if(!d) return ""; var j=new Date(d.getTime()+9*36e5); return String(j.getUTCHours()).padStart(2,"0")+":"+String(j.getUTCMinutes()).padStart(2,"0"); }
function hint(){
  var h=document.getElementById("hint"), n=inside().length;
  if(state.fixId){ var s=allSpots().filter(function(x){return x.id===state.fixId;})[0]; h.textContent="地図で「"+(s?s.name:"")+"」の正しい位置をタップしてください。"; return; }
  var pl=nearestPlace(state.center);
  h.textContent=(state.autoMsg?state.autoMsg+" ":"")+(pl?"中心:"+pl.name+"付近。":"")+(state.mode==="add"?"地図で追加したい場所をタップ。":"地図をタップするか中心の点をドラッグして範囲を決めます。")+" 円の中:"+n+"か所";
}
function showAdd(){ var f=document.getElementById("addForm"); f.hidden=false; document.getElementById("addName").focus(); }

function render(){
  var c=baseCond(), D=jstDate(state.offset);
  document.getElementById("d0").setAttribute("aria-pressed",state.offset===0);
  document.getElementById("d1").setAttribute("aria-pressed",state.offset===1);
  document.getElementById("diaV").textContent=state.dia;
  hint();
  var wind=c.wind_ms!=null?(esc(c.wind_dir||"")+" "+c.wind_ms+"m"):"—";
  document.getElementById("strip").innerHTML=
    '<div><small>天気</small><b>'+esc(c.weather||"—")+'</b></div>'+
    '<div><small>風</small><b class="num">'+wind+'</b></div>'+
    '<div><small>潮</small><b>'+esc(c.tide_name)+' <span class="num" style="font-size:.8rem;color:var(--sub)">月齢'+(+c.moon_age).toFixed(1)+'</span></b></div>'+
    '<div><small>日の出/入</small><b class="num">'+c.sunrise+'/'+c.sunset+'</b></div>';
  var ev=(c.tide_events||[]).map(function(e){return (/満/.test(e.type)?"満":"干")+e.time;}).join(" ");
  var src=document.getElementById("src");
  if(c.manualOn){ src.className="src manual"; src.textContent="手で入れた条件で並べています。"; }
  else if(c.auto){ src.className="src"; src.textContent=c.date+"("+c.w+") "+SLOT_NAME[c.slot]+"("+h2hm(Math.max(0,c.slotFrom))+"〜"+h2hm(Math.min(24,c.slotTo))+")の予報"+(c.gust?"・最大瞬間"+c.gust+"m":"")+(c.wave_m!=null?"・波"+c.wave_m+"m":"")+(c.tide_station?" ・潮は"+c.tide_station+(c.station_dist>25?"(約"+Math.round(c.station_dist)+"km先)":"")+" "+ev:"")+" ・"+fmtTime(c.fetchedAt)+"取得"; }
  else { src.className="src manual"; src.textContent=state.wxErr?"天気予報を取得できませんでした("+state.wxErr+")。潮名と日の出入りは計算値です。風は「条件を自分で変える」から入れられます。":"天気予報を読み込んでいます…"; }
  document.getElementById("tideH").textContent="潮と時間帯"+(c.tide_station?"("+c.tide_station+"の潮位・目安)":"");

  var cand=inside().sort(function(a,b){return distKm(state.center,a)-distKm(state.center,b);}).slice(0,60); cand.forEach(ensureOpen); cand=cand.map(withOpen).map(function(s){var st=logStats(s.id);return st?Object.assign({},s,{log:st}):s;});
  var ranked=rankSpots(c,cand,state.center,radius());
  drawPins(ranked);
  var pick=document.getElementById("pick");
  if(!ranked.length){
    pick.innerHTML='<div class="eyebrow">'+(state.offset===0?"今日":"明日")+'の一押し</div><div class="empty">円の中にポイントがありません。地形からの自動候補は直径40km以下で出ます。行きたい港や磯は「タップでポイントを追加」で登録できます。</div>';
    document.getElementById("rank").innerHTML='<div class="empty">円の中のポイントはまだありません。</div>';
    drawTide(c,null,[]); renderSpots(ranked,c); renderLog(); return;
  }
  var top=ranked[0], wins=bestWindows(c,top.spot,state.offset===0?nowH():0);
  var winHtml=wins.length?wins.map(function(w){return '<span class="chip'+(/マヅメ/.test(w.label)?' dusk':'')+'"><b class="num">'+h2hm(w.s)+'〜'+h2hm(w.e)+'</b>'+esc(w.label)+'</span>';}).join(""):'<span class="chip">今日はもう遅い時間です。明日を見てください</span>';
  pick.innerHTML='<div class="eyebrow">'+(state.offset===0?"今日":"明日")+'の一押し</div>'+
    '<div class="name">'+esc(top.spot.name)+'</div>'+
    '<div class="meta">'+esc(top.spot.area||"自分で追加")+' ・ 中心から約'+top.dist.toFixed(1)+'km'+(top.spot.ika?' ・ '+esc(top.spot.ika):'')+'</div>'+
    '<div class="when">'+winHtml+'</div>'+
    (top.why.length?'<ul class="why">'+top.why.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+'</ul>':'')+
    top.warn.map(function(x){return '<div class="warn">注意:'+esc(x)+'</div>';}).join("")+castBlock(top.spot,c)+
    (top.spot.how?'<div style="font-size:.88rem"><span style="color:var(--sub)">狙い方:</span>'+esc(top.spot.how)+'</div>':'')+'<div><button class="btn pri sm" data-log="'+esc(top.spot.id)+'">ここで釣果を記録</button></div>';
  var mx=ranked[0].score, mn=Math.min.apply(null,ranked.map(function(r){return r.score;}));
  var rowsHtml=ranked.map(function(r,i){
    var pct=mx===mn?100:Math.round(25+75*(r.score-mn)/(mx-mn)), sub=(r.why.filter(function(x){return x!=="自分で追加したポイント";})[0]||"")+(r.warn[0]?" / "+r.warn[0]:"");
    return '<div class="row" data-id="'+esc(r.spot.id)+'"><span class="pos">'+(i+1)+'</span><span class="nm">'+esc(r.spot.name)+'<small>'+esc(sub||r.spot.area||"")+' ・ '+r.dist.toFixed(1)+'km</small></span><span class="bar" aria-label="おすすめ度 '+pct+'%"><i style="width:'+pct+'%"></i></span></div>';
  });
  document.getElementById("rank").innerHTML=rowsHtml.length>12?rowsHtml.slice(0,12).join("")+'<details class="outer"><summary>13位以下を見る('+(rowsHtml.length-12)+'か所)</summary>'+rowsHtml.slice(12).join("")+'</details>':rowsHtml.join("");
  Array.prototype.forEach.call(document.querySelectorAll(".row"),function(el){el.onclick=function(){var s=allSpots().filter(function(x){return x.id===el.dataset.id;})[0];if(s&&map){map.panTo([s.lat,s.lng]);} var t=document.getElementById("sp-"+el.dataset.id);if(t)t.scrollIntoView({behavior:"smooth",block:"center"});};});
  drawTide(c,top.spot,wins);
  renderSpots(ranked,c); renderLog(); bindShare();
  Array.prototype.forEach.call(document.querySelectorAll("[data-log]"),function(b){b.onclick=function(){openLog(b.dataset.log);};});
  Array.prototype.forEach.call(document.querySelectorAll("[data-xy]"),function(b){b.onclick=function(){var v=b.dataset.xy;var done=function(){b.textContent="コピーしました";};try{navigator.clipboard.writeText(v).then(done,function(){b.textContent=v;});}catch(e){b.textContent=v;}};});
}

function spotCard(s,isTop,inCircle,c){
  var d=distKm(state.center,s);
  var tags=[s.area?'<span class="tag">'+esc(s.area)+'</span>':'', s.ika?'<span class="tag">'+esc(s.ika)+'</span>':'',
    (s.mine||s.auto)?'':'<span class="tag">風に'+["弱い","ふつう","強い"][s.shelter==null?1:s.shelter]+(s.northShelter?"(北風に強い)":"")+'</span>',
    (s.current&&s.current!=="normal")?'<span class="tag">潮が速い</span>':'', s.light?'<span class="tag">常夜灯あり</span>':'', s.moved?'<span class="tag">位置を直した</span>':'',s.auto?'<span class="tag">自動候補</span>':'',s.shared?'<span class="tag shr">'+esc(s.byName)+'さんが共有('+esc(s.groupName)+')</span>':''].join("");
  return '<article class="spot'+(isTop?' hl':'')+(inCircle?'':' outside')+'" id="sp-'+esc(s.id)+'"><h3>'+esc(s.name)+'<span class="d num">中心から'+d.toFixed(1)+'km</span></h3>'+
    '<div class="tags">'+tags+'</div>'+
    (s.feat?'<p><span class="lbl">特徴</span>'+esc(s.feat)+'</p>':'')+(s.how?'<p><span class="lbl">狙い方</span>'+esc(s.how)+'</p>':'')+(s.note?'<p><span class="lbl">'+(s.mine?"メモ":"注意")+'</span>'+esc(s.note)+'</p>':'')+(inCircle?castBlock(s,c):'')+
    '<div class="acts"><a href="https://www.google.com/maps/search/?api=1&query='+(s.q?encodeURIComponent(s.q):s.lat.toFixed(5)+","+s.lng.toFixed(5))+'" target="_blank" rel="noopener">地図アプリで開く</a>'+
    '<a href="https://maps.gsi.go.jp/#17/'+s.lat.toFixed(6)+'/'+s.lng.toFixed(6)+'/&base=std&ls=seamlessphoto&disp=1" target="_blank" rel="noopener">航空写真で海の中を見る</a>'+
    '<a href="https://www.msil.go.jp/msil/htm/main.html?Lang=0" target="_blank" rel="noopener">海しるで水深を見る</a>'+
    '<button class="btn sm" data-xy="'+s.lat.toFixed(5)+','+s.lng.toFixed(5)+'">座標をコピー</button>'+
    '<button class="btn pri sm" data-log="'+esc(s.id)+'">釣果を記録</button>'+shareButtons(s)+
    ((s.auto||s.shared)?'':'<button class="btn sm" data-fix="'+esc(s.id)+'">位置を直す</button>')+(s.mine?'<button class="btn sm" data-del="'+esc(s.id)+'">削除</button>':'')+'</div></article>';
}
function renderSpots(ranked,c){
  var inIds={}; ranked.forEach(function(r){inIds[r.spot.id]=1;});
  var topId=ranked[0]&&ranked[0].spot.id;
  var ins=ranked.map(function(r){return spotCard(r.spot,r.spot.id===topId,true,c);});
  var outs=allSpots().filter(function(s){return !inIds[s.id];}).sort(function(a,b){return distKm(state.center,a)-distKm(state.center,b);});
  document.getElementById("spotsIn").innerHTML=(ins.length>12?ins.slice(0,12).join("")+'<details class="outer"><summary>円の中のほかのポイント('+(ins.length-12)+'か所)</summary><div class="spots">'+ins.slice(12).join("")+'</div></details>':ins.join(""))||'<div class="empty">円の中にポイントはありません。</div>';
  document.getElementById("spotsOut").innerHTML=outs.map(function(s){return spotCard(s,false,false,c);}).join("");
  document.getElementById("outerSum").textContent="円の外のポイント("+outs.length+"か所)";
  document.getElementById("outerBox").hidden=!outs.length;
  Array.prototype.forEach.call(document.querySelectorAll("[data-fix]"),function(b){b.onclick=function(){state.fixId=b.dataset.fix;setMode("center");hint();document.getElementById("map").scrollIntoView({behavior:"smooth",block:"center"});};});
  Array.prototype.forEach.call(document.querySelectorAll("[data-del]"),function(b){b.onclick=function(){
    if(b.dataset.armed){ var id=b.dataset.del; state.mine=state.mine.filter(function(s){return s.id!==id;}); render(); Store.deleteSpot(id).catch(function(){}); }
    else { b.dataset.armed="1"; b.textContent="もう一度押すと削除"; }
  };});
}

function drawTide(c,spot,wins){
  var W=600,H=170,pl=34,pr=8,pt=12,pb=26, curve=tideCurve(c.tide_events);
  function X(h){return pl+(W-pl-pr)*h/24;}
  var sr=hm2h(c.sunrise), ss=hm2h(c.sunset), g='';
  [[sr-1,sr+1],[ss-1,ss+1]].forEach(function(b){g+='<rect x="'+X(Math.max(0,b[0]))+'" y="'+pt+'" width="'+(X(Math.min(24,b[1]))-X(Math.max(0,b[0])))+'" height="'+(H-pt-pb)+'" fill="var(--dusk)"/>';});
  wins.forEach(function(w){g+='<rect x="'+X(w.s)+'" y="'+(H-pb-5)+'" width="'+(X(w.e)-X(w.s))+'" height="5" rx="2" fill="var(--buoy)"/>';});
  for(var h=0;h<=24;h+=3){g+='<line x1="'+X(h)+'" x2="'+X(h)+'" y1="'+pt+'" y2="'+(H-pb)+'" stroke="var(--line)" stroke-width="1"/><text x="'+X(h)+'" y="'+(H-8)+'" font-size="11" text-anchor="middle" fill="var(--sub)" font-family="IBM Plex Mono,monospace">'+h+'</text>';}
  if(curve){
    var vals=[],lo=1e9,hi=-1e9; for(var i=0;i<=96;i++){var v=curve.at(i/4);vals.push(v);lo=Math.min(lo,v);hi=Math.max(hi,v);}
    var pad=(hi-lo)*0.12||10; lo-=pad; hi+=pad;
    var Y=function(v){return pt+(H-pt-pb)*(1-(v-lo)/(hi-lo));};
    var d=vals.map(function(v,i){return (i?"L":"M")+X(i/4).toFixed(1)+" "+Y(v).toFixed(1);}).join(" ");
    g+='<path d="'+d+' L'+X(24)+' '+(H-pb)+' L'+X(0)+' '+(H-pb)+' Z" fill="var(--seaSoft)" opacity=".7"/><path d="'+d+'" fill="none" stroke="var(--sea)" stroke-width="2.5"/>';
    curve.events.forEach(function(e){ if(e.t<0||e.t>24)return; var y=Y(e.cm);
      g+='<circle cx="'+X(e.t)+'" cy="'+y+'" r="3.5" fill="var(--sea)"/><text x="'+Math.min(W-30,Math.max(pl+14,X(e.t)))+'" y="'+(e.high?y-7:y+16)+'" font-size="11" text-anchor="middle" fill="var(--ink)" font-family="IBM Plex Mono,monospace">'+(e.high?"満":"干")+h2hm(e.t)+'</text>'; });
  } else {
    g+='<text x="'+(W/2)+'" y="'+(H/2)+'" font-size="13" text-anchor="middle" fill="var(--sub)">潮見表データ待ち(マヅメと潮名だけで判断中)</text>';
  }
  if(state.offset===0){var nh=nowH();g+='<line x1="'+X(nh)+'" x2="'+X(nh)+'" y1="'+pt+'" y2="'+(H-pb)+'" stroke="var(--ink)" stroke-dasharray="3 3"/><text x="'+(X(nh)+4)+'" y="'+(pt+10)+'" font-size="10" fill="var(--ink)">いま</text>';}
  document.getElementById("tideSvg").innerHTML='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="潮位と狙い目の時間帯">'+g+'</svg>';
}

/* ===== 操作 ===== */
document.getElementById("dia").value=state.dia;
document.getElementById("dia").oninput=function(e){ state.dia=+e.target.value; document.getElementById("diaV").textContent=state.dia; if(circle) circle.setRadius(radius()*1000); hint(); };
document.getElementById("dia").onchange=function(){ areaChanged(true); };
document.getElementById("mCenter").onclick=function(){ state.fixId=null; setMode("center"); };
document.getElementById("mAdd").onclick=function(){ state.fixId=null; setMode("add"); };
document.getElementById("addCancel").onclick=function(){ setMode("center"); };
document.getElementById("addSave").onclick=function(){
  var name=document.getElementById("addName").value.trim(); if(!name||!state.addAt){ document.getElementById("addName").focus(); return; }
  var id="u"+Date.now().toString(36);
  var s={id:id,name:name,note:document.getElementById("addNote").value.trim(),lat:+state.addAt.lat.toFixed(5),lng:+state.addAt.lng.toFixed(5),mine:true,eging:2,shelter:1,current:"normal"};
  state.mine.push(s); document.getElementById("addName").value=""; document.getElementById("addNote").value=""; setMode("center"); render();
  Store.saveSpot(id,{name:s.name,note:s.note,lat:s.lat,lng:s.lng,createdAt:new Date().toISOString()}).catch(function(){});
};
document.getElementById("lgDir").innerHTML='<option value="">—</option>'+DIRS16.map(function(d){return "<option>"+d+"</option>";}).join("");
document.getElementById("lgSave").onclick=saveLog;
document.getElementById("lgCancel").onclick=closeLog;
document.getElementById("d0").onclick=function(){state.offset=0;state.manual=null;render();loadConditions();};
document.getElementById("d1").onclick=function(){state.offset=1;state.manual=null;render();loadConditions();};
(function(){
  var sel=document.getElementById("mDir"); sel.innerHTML=DIRS16.map(function(d){return "<option>"+d+"</option>";}).join("");
  var r=document.getElementById("mWs"), v=document.getElementById("mWsV");
  function syncForm(){ var c=baseCond(); sel.value=c.wind_dir||"北"; r.value=c.wind_ms!=null?Math.round(c.wind_ms):3; v.textContent=r.value+"m/s"; document.getElementById("mTide").value=c.tide_name; document.getElementById("mWave").value=c.wave_m==null?"":(c.wave_m<0.5?"0.3":c.wave_m<1.5?"1":"2"); }
  r.oninput=function(){v.textContent=r.value+"m/s";};
  document.getElementById("manualPanel").addEventListener("toggle",function(){ if(this.open) syncForm(); });
  document.getElementById("mApply").onclick=function(){ var wv=document.getElementById("mWave").value; state.manual={dir:sel.value,ws:+r.value,tide:document.getElementById("mTide").value,wave:wv===""?null:+wv}; render(); document.getElementById("pick").scrollIntoView({behavior:"smooth",block:"start"}); };
  document.getElementById("mReset").onclick=function(){ state.manual=null; render(); syncForm(); };
})();


/* ===== 天気・潮を読み込む ===== */
var condT=null, lastWxCenter=null;
function loadConditions(){
  var my=++state.condSeq, c=state.center, D=jstDate(state.offset);
  var moved=!lastWxCenter||distKm(lastWxCenter,c)>3;
  if(moved){ state.wx=null; state.wxErr=null; render(); }
  lastWxCenter={lat:c.lat,lng:c.lng};
  Wx.forecast(c.lat,c.lng).then(function(w){ if(my!==state.condSeq) return; state.wx=w; state.wxErr=null; render(); })
    .catch(function(e){ if(my!==state.condSeq) return; state.wxErr=String(e&&e.message||e); render(); });
  Wx.loadStations().then(function(){
    var st=Wx.nearestStation(c); state.station=st;
    if(!st){ state.tide=null; render(); return; }
    return Wx.tideDay(st.code,D.key).then(function(day){ if(my!==state.condSeq) return; state.tide={date:D.key,day:day}; render(); });
  });
}
function scheduleConditions(){ clearTimeout(condT); condT=setTimeout(loadConditions,500); }

/* ===== 仲間グループ ===== */
function groupSpotList(){
  var out=[];
  state.groups.forEach(function(g){ (state.groupSpots[g.code]||[]).forEach(function(x){
    if(x.by===Store.uid) return;
    var o=Object.assign({eging:2,shelter:1,current:"normal"},x,{id:"g_"+g.code+"_"+x.docId,shared:true,groupName:g.name,groupCode:g.code,byName:x.byName||"仲間"});
    if(x.open) openCache[okey(o)]=x.open;
    out.push(o);
  }); });
  return out;
}
function isShared(code,s){ return (state.groupSpots[code]||[]).some(function(x){ return x.docId===Store.uid+"_"+s.id; }); }
function grpMsg(t){ var el=document.getElementById("grpMsg"); if(el) el.textContent=t||""; }
function shareButtons(s){
  if(Store.mode!=="cloud"||s.shared||!state.groups.length||!(s.mine||s.auto)) return "";
  return state.groups.map(function(g){ var on=isShared(g.code,s);
    return '<button class="btn sm'+(on?' on':'')+'" data-share="'+esc(g.code)+'" data-sid="'+esc(s.id)+'" data-on="'+(on?1:0)+'">'+(on?esc(g.name)+"の共有をやめる":esc(g.name)+"に共有")+'</button>'; }).join("");
}
function bindShare(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-share]"),function(b){ b.onclick=function(){
    var s=allSpots().filter(function(x){return x.id===b.dataset.sid;})[0]; if(!s) return;
    var on=b.dataset.on!=="1";
    if(!s.open){ var o=openCache[okey(s)]; if(o) s=Object.assign({},s,{open:o}); }
    var pre=(on&&s.auto)?Store.saveSpot(s.id,{name:s.name,note:s.note||"",lat:s.lat,lng:s.lng,eging:s.eging,current:s.current,kind:s.kind,feat:s.feat,how:s.how,open:s.open||null,createdAt:new Date().toISOString(),from_auto:true}):Promise.resolve();
    pre.then(function(){ return Store.shareSpot(b.dataset.share,s,on); }).catch(function(e){ alertMsg("共有できませんでした:"+(e&&e.message||e)); }); }; });
}
function alertMsg(t){ var el=document.getElementById("toast"); el.textContent=t; el.hidden=false; clearTimeout(alertMsg.t); alertMsg.t=setTimeout(function(){el.hidden=true;},4000); }
function renderGroups(){
  var el=document.getElementById("grpList"), form=document.getElementById("grpForm"); if(!el) return;
  if(Store.mode!=="cloud"){ el.innerHTML='<div class="empty">仲間との共有は、ログインすると使えます。</div>'; form.hidden=true; return; }
  form.hidden=false;
  el.innerHTML=state.groups.length?state.groups.map(function(g){
    var n=(state.groupSpots[g.code]||[]).length;
    return '<div class="grow"><div class="lb"><b>'+esc(g.name)+'</b><small>コード <span class="num">'+esc(g.code)+'</span> ・ 共有中のポイント '+n+'か所</small></div>'+
      '<button class="btn sm" data-gcopy="'+esc(g.code)+'">コードをコピー</button><button class="btn sm" data-gleave="'+esc(g.code)+'">抜ける</button></div>';
  }).join(""):'<div class="empty">まだグループはありません。作ったグループのコードを仲間に送ると、仲間はそのコードで参加できます。</div>';
  Array.prototype.forEach.call(el.querySelectorAll("[data-gcopy]"),function(b){ b.onclick=function(){ copyText(b.dataset.gcopy,b); }; });
  Array.prototype.forEach.call(el.querySelectorAll("[data-gleave]"),function(b){ b.onclick=function(){
    if(!b.dataset.armed){ b.dataset.armed="1"; b.textContent="もう一度押すと抜ける"; return; }
    Store.leaveGroup(b.dataset.gleave).catch(function(e){ grpMsg("抜けられませんでした:"+(e&&e.message||e)); }); }; });
}
function copyText(v,b){ var done=function(){ b.textContent="コピーしました"; }; try{ navigator.clipboard.writeText(v).then(done,function(){ b.textContent=v; }); }catch(e){ b.textContent=v; } }
document.getElementById("grpCreate").onclick=function(){
  var name=document.getElementById("grpName").value.trim()||"釣り仲間";
  grpMsg("作っています…");
  Store.createGroup(name).then(function(){ document.getElementById("grpName").value=""; grpMsg("作りました。コードをコピーして仲間に送ってください。"); })
    .catch(function(e){ grpMsg("作れませんでした:"+(e&&e.message||e)); });
};
document.getElementById("grpJoin").onclick=function(){
  var code=document.getElementById("grpCode").value.trim().toLowerCase();
  if(!/^[a-z0-9]{10}$/.test(code)){ grpMsg("コードは英数字10文字です。"); return; }
  if(state.groups.some(function(g){return g.code===code;})){ grpMsg("もう参加しています。"); return; }
  grpMsg("参加しています…");
  Store.joinGroup(code,document.getElementById("grpJoinName").value.trim()).then(function(){ document.getElementById("grpCode").value=""; grpMsg("参加しました。仲間が共有したポイントが地図に緑のピンで出ます。"); })
    .catch(function(e){ grpMsg(e&&e.message?e.message:"参加できませんでした。"); });
};

/* ===== ログイン ===== */
function renderAuth(){
  var el=document.getElementById("auth");
  if(!Store.configured){ el.innerHTML='<span class="src">この端末に保存中</span>'; return; }
  if(Store.mode==="cloud"){
    var lc=Store.localCounts(), mig=(lc.spots+lc.catches)>0;
    el.innerHTML='<span class="src">'+esc(Store.userName||"ログイン中")+'</span>'+(mig?'<button class="btn sm pri" id="migBtn">この端末の記録('+(lc.spots+lc.catches)+'件)をアカウントへ移す</button>':'')+'<button class="btn sm" id="outBtn">ログアウト</button>';
    document.getElementById("outBtn").onclick=function(){ Store.signOut(); };
    if(mig) document.getElementById("migBtn").onclick=function(){ Store.migrateLocal().then(function(n){ alertMsg(n+"件をアカウントに移しました。"); renderAuth(); }).catch(function(e){ alertMsg("移せませんでした:"+(e&&e.message||e)); }); };
  } else {
    el.innerHTML='<button class="btn sm pri" id="inBtn">Googleでログイン</button>';
    document.getElementById("inBtn").onclick=function(){ Store.signIn().catch(function(e){ alertMsg("ログインできませんでした:"+(e&&e.message||e)); }); };
  }
}

/* ===== 時間帯の切り替え ===== */
(function(){
  var el=document.getElementById("slots");
  el.innerHTML=SLOTS.map(function(s){ return '<button data-slot="'+s[0]+'" aria-pressed="'+(s[0]===state.slot)+'">'+s[1]+'</button>'; }).join("");
  Array.prototype.forEach.call(el.querySelectorAll("button"),function(b){ b.onclick=function(){ state.slot=b.dataset.slot;
    Array.prototype.forEach.call(el.querySelectorAll("button"),function(x){ x.setAttribute("aria-pressed",x===b); }); render(); }; });
})();

/* ===== 起動 ===== */
var OVERVIEW=[], PLACES=[];
var _areaChanged=areaChanged;
areaChanged=function(fit){ _areaChanged(fit); scheduleConditions(); };
Promise.all([fetch("data/overview.json").then(function(r){return r.json();}),fetch("data/places.json").then(function(r){return r.json();})]).then(function(r){
  OVERVIEW=r[0]; PLACES=r[1];
  initMap(); render(); scheduleAuto(); loadConditions();
  Store.on("auth",function(){ renderAuth(); renderGroups(); render(); });
  Store.on("spots",function(list){ state.mine=list.map(function(x){ var o=Object.assign({eging:2,shelter:1,current:"normal"},x,{mine:true}); if(x.open) openCache[okey(o)]=x.open; return o; });
    var ids={}; state.mine.forEach(function(s){ids[s.id]=1;}); state.auto=state.auto.filter(function(s){return !ids[s.id];}); render(); });
  Store.on("catches",function(list){ state.catches=list.slice().sort(function(a,b){return (b.at||"")>(a.at||"")?1:-1;}); render(); });
  Store.on("pos",function(p){ state.pos=p||{}; render(); });
  Store.on("groups",function(g){ state.groups=g||[]; renderGroups(); render(); });
  Store.on("groupSpots",function(g){ state.groupSpots=g||{}; renderGroups(); render(); });
  var firstArea=true;
  Store.on("area",function(a){ if(!a||!firstArea||lsGet("eging-area")) return; firstArea=false;
    state.center={lat:a.lat,lng:a.lng}; state.dia=a.diameter_km||state.dia; document.getElementById("dia").value=state.dia;
    if(ctrMarker){ ctrMarker.setLatLng([a.lat,a.lng]); circle.setLatLng([a.lat,a.lng]).setRadius(radius()*1000); map.fitBounds(circle.getBounds(),{padding:[16,16]}); }
    render(); scheduleAuto(); loadConditions(); });
  Store.init();
  setInterval(function(){ if(document.visibilityState==="visible") loadConditions(); },30*60*1000);
}).catch(function(e){ document.getElementById("pick").innerHTML='<div class="empty">データを読み込めませんでした。ページを開き直してください。('+esc(String(e))+')</div>'; });
