/* ===== 天気・波(Open-Meteo)と潮(気象庁の潮位表)=====
 * Open-Meteo は登録不要・無料の天気予報 API(非商用)。ブラウザから直接取得する。
 * 潮位表は GitHub の自動実行で data/tide に取り込んだものを読む。 */
var Wx=(function(){
  var cache={}, stations=null, stLoading=null, tideCache={};
  var WMO={0:"快晴",1:"晴れ",2:"晴れ時々曇り",3:"曇り",45:"霧",48:"霧",51:"霧雨",53:"霧雨",55:"霧雨",56:"霧雨",57:"霧雨",
    61:"小雨",63:"雨",65:"強い雨",66:"雨",67:"強い雨",71:"雪",73:"雪",75:"大雪",77:"雪",80:"にわか雨",81:"にわか雨",82:"激しいにわか雨",85:"雪",86:"雪",95:"雷雨",96:"雷雨",99:"雷雨"};
  function key(lat,lng){ return (Math.round(lat*20)/20).toFixed(2)+","+(Math.round(lng*20)/20).toFixed(2); }
  function fetchJson(url){ return fetch(url).then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); }); }
  /* 指定地点の3日分の1時間ごとの予報 */
  function forecast(lat,lng){
    var k=key(lat,lng), c=cache[k];
    if(c&&(Date.now()-c.at<30*60*1000)) return c.p;
    var la=lat.toFixed(3), lo=lng.toFixed(3);
    var f=fetchJson("https://api.open-meteo.com/v1/forecast?latitude="+la+"&longitude="+lo+
      "&hourly=weather_code,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset&wind_speed_unit=ms&timezone=Asia%2FTokyo&forecast_days=6");
    var m=fetchJson("https://marine-api.open-meteo.com/v1/marine?latitude="+la+"&longitude="+lo+"&hourly=wave_height&timezone=Asia%2FTokyo&forecast_days=6").catch(function(){ return null; });
    var p=Promise.all([f,m]).then(function(r){
      var w=r[0], mar=r[1], days={};
      w.hourly.time.forEach(function(t,i){
        var d=t.slice(0,10), h=+t.slice(11,13);
        var o=days[d]=days[d]||{speed:[],dir:[],gust:[],rain:[],code:[],wave:[]};
        o.speed[h]=w.hourly.wind_speed_10m[i]; o.dir[h]=w.hourly.wind_direction_10m[i]; o.gust[h]=w.hourly.wind_gusts_10m[i];
        o.rain[h]=w.hourly.precipitation[i]; o.code[h]=w.hourly.weather_code[i];
      });
      if(mar&&mar.hourly&&mar.hourly.wave_height){ mar.hourly.time.forEach(function(t,i){ var d=t.slice(0,10); if(days[d]) days[d].wave[+t.slice(11,13)]=mar.hourly.wave_height[i]; }); }
      (w.daily.time||[]).forEach(function(d,i){ if(days[d]){ days[d].sunrise=w.daily.sunrise[i].slice(11,16); days[d].sunset=w.daily.sunset[i].slice(11,16); } });
      return {days:days,at:new Date()};
    });
    cache[k]={at:Date.now(),p:p};
    p.catch(function(){ delete cache[k]; });
    return p;
  }
  /* 時間帯(時の範囲)の代表値:平均風速、風向き(風速で重みをつけた平均)、最大の雨・波 */
  function summarize(day,h0,h1){
    var sx=0,sy=0,sum=0,n=0,rain=0,wave=null,gust=0,codes=[];
    for(var h=Math.max(0,Math.floor(h0));h<=Math.min(23,Math.ceil(h1));h++){
      var s=day.speed[h], d=day.dir[h]; if(s==null) continue;
      sx+=Math.sin(d*Math.PI/180)*s; sy+=Math.cos(d*Math.PI/180)*s; sum+=s; n++;
      rain=Math.max(rain,day.rain[h]||0); gust=Math.max(gust,day.gust[h]||0);
      if(day.wave[h]!=null) wave=Math.max(wave||0,day.wave[h]);
      codes.push(day.code[h]);
    }
    if(!n) return null;
    var deg=(Math.atan2(sx,sy)*180/Math.PI+360)%360, idx=Math.round(deg/22.5)%16;
    var worst=codes.sort(function(a,b){return b-a;})[0];
    return {wind_ms:Math.round(sum/n*10)/10, wind_dir:DIRS16[idx], gust:Math.round(gust), rain_max:Math.round(rain*10)/10, wave_m:wave==null?null:Math.round(wave*10)/10, weather:WMO[worst]||"—"};
  }
  /* 潮:最寄りの観測地点 */
  function loadStations(){ if(stations) return Promise.resolve(stations); if(stLoading) return stLoading;
    stLoading=fetchJson("data/tide/stations.json").then(function(s){ stations=s; return s; }).catch(function(){ stLoading=null; return null; }); return stLoading; }
  function nearestStation(ll){ if(!stations) return null; var b=null,bd=1e9; stations.forEach(function(s){ var d=distKm(ll,{lat:s[2],lng:s[3]}); if(d<bd){bd=d;b=s;} }); return b?{code:b[0],name:b[1],lat:b[2],lng:b[3],dist:bd}:null; }
  function nearStations(ll,n){ if(!stations) return []; return stations.map(function(s){ return {code:s[0],name:s[1],lat:s[2],lng:s[3],dist:distKm(ll,{lat:s[2],lng:s[3]})}; }).sort(function(a,b){return a.dist-b.dist;}).slice(0,n||5); }
  var tideMonths={};
  function tideInfo(code,dateKey){
    var m=tideMonths[code+"/"+dateKey.slice(0,7)]; if(!m) return null;
    var day=m[dateKey.slice(8,10)]; if(!day) return null;
    if(m._mean==null){ var rs=[]; Object.keys(m).forEach(function(k){ var d=m[k]; if(!d||!d.hi) return; var his=d.hi.map(function(e){return e[1];}), los=d.lo.map(function(e){return e[1];}); if(his.length&&los.length) rs.push(Math.max.apply(null,his)-Math.min.apply(null,los)); }); m._mean=rs.length?rs.reduce(function(a,b){return a+b;},0)/rs.length:null; }
    var his=day.hi.map(function(e){return e[1];}), los=day.lo.map(function(e){return e[1];});
    var range=(his.length&&los.length)?Math.max.apply(null,his)-Math.min.apply(null,los):null;
    return {day:day,range:range,mean:m._mean};
  }
  function tideDay(code,dateKey){
    var ym=dateKey.slice(0,7), k=code+"/"+ym;
    if(!tideCache[k]) tideCache[k]=fetchJson("data/tide/"+code+"/"+ym+".json").catch(function(){ delete tideCache[k]; return null; });
    return tideCache[k].then(function(m){ if(m) tideMonths[k]=m; return m?m[dateKey.slice(8,10)]||null:null; });
  }
  /* ポイントごとの予報:0.1度(約10km)のマス目ごとにまとめて取る */
  var cellCache={};
  function cellKey(lat,lng){ return (Math.round(lat*20)/20).toFixed(2)+","+(Math.round(lng*20)/20).toFixed(2); }
  function parseOne(w,mar){
    var days={};
    w.hourly.time.forEach(function(t,i){ var d=t.slice(0,10), h=+t.slice(11,13);
      var o=days[d]=days[d]||{speed:[],dir:[],gust:[],rain:[],code:[],wave:[]};
      o.speed[h]=w.hourly.wind_speed_10m[i]; o.dir[h]=w.hourly.wind_direction_10m[i]; o.gust[h]=w.hourly.wind_gusts_10m[i]; o.rain[h]=w.hourly.precipitation[i]; o.code[h]=w.hourly.weather_code[i];
      if(w.hourly.pressure_msl) (o.pres=o.pres||[])[h]=w.hourly.pressure_msl[i]; });
    if(mar&&mar.hourly&&mar.hourly.wave_height){ mar.hourly.time.forEach(function(t,i){ var d=t.slice(0,10), h=+t.slice(11,13); if(!days[d]) return; days[d].wave[h]=mar.hourly.wave_height[i];
      if(mar.hourly.sea_surface_temperature){ (days[d].sst=days[d].sst||[])[h]=mar.hourly.sea_surface_temperature[i]; } }); }
    return days;
  }
  function forecastCells(points){
    var need=[], keys={};
    points.forEach(function(p){ var k=cellKey(p.lat,p.lng); if(keys[k]) return; keys[k]=1; var c=cellCache[k]; if(!c||(Date.now()-c.at>30*60*1000&&!c.p)) need.push(k); });
    need=need.slice(0,200);
    if(!need.length) return Promise.resolve(false);
    var chunks=[]; for(var i=0;i<need.length;i+=50) chunks.push(need.slice(i,i+50));
    var all=Promise.all(chunks.map(function(ch){
      var la=ch.map(function(k){return k.split(",")[0];}).join(","), lo=ch.map(function(k){return k.split(",")[1];}).join(",");
      var f=fetchJson("https://api.open-meteo.com/v1/forecast?latitude="+la+"&longitude="+lo+"&hourly=weather_code,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl&wind_speed_unit=ms&timezone=Asia%2FTokyo&forecast_days=6&past_days=3");
      var m=fetchJson("https://marine-api.open-meteo.com/v1/marine?latitude="+la+"&longitude="+lo+"&hourly=wave_height,sea_surface_temperature&timezone=Asia%2FTokyo&forecast_days=6&past_days=3").catch(function(){ return null; });
      return Promise.all([f,m]).then(function(r){
        var ws=Array.isArray(r[0])?r[0]:[r[0]], ms=r[1]?(Array.isArray(r[1])?r[1]:[r[1]]):[];
        ch.forEach(function(k,i){ if(ws[i]&&ws[i].hourly) cellCache[k]={at:Date.now(),days:parseOne(ws[i],ms[i])}; });
        return true;
      }).catch(function(){ ch.forEach(function(k){ if(cellCache[k]&&cellCache[k].p) delete cellCache[k]; }); return false; });
    })).then(function(r){ return r.some(Boolean); });
    need.forEach(function(k){ cellCache[k]={at:Date.now(),p:all}; });
    return all;
  }
  /* その時刻より前の雨の合計(24時間・72時間)。真水が入るかどうかの目安 */
  function rainSum(days,key,hour){
    if(!days) return null; var d0=new Date(key+"T00:00:00Z"), r24=0, r72=0, got=0;
    for(var k=1;k<=72;k++){ var t=new Date(d0.getTime()+(hour-k)*36e5), dk=t.toISOString().slice(0,10), h=t.getUTCHours(), dd=days[dk];
      var v=dd&&dd.rain?dd.rain[h]:null; if(v==null) continue; got++; r72+=v; if(k<=24) r24+=v; }
    return got>=48?{r24:Math.round(r24),r72:Math.round(r72)}:null;
  }
  /* 前の48時間でいちばん強かった風と高かった波(時化のあとかどうか) */
  function roughBefore(days,key,hour){
    if(!days) return null; var d0=new Date(key+"T00:00:00Z"), w=null, g=null;
    for(var k=6;k<=48;k++){ var t=new Date(d0.getTime()+(hour-k)*36e5), dd=days[t.toISOString().slice(0,10)], h=t.getUTCHours(); if(!dd) continue;
      if(dd.speed&&dd.speed[h]!=null) w=Math.max(w||0,dd.speed[h]); if(dd.wave&&dd.wave[h]!=null) g=Math.max(g||0,dd.wave[h]); }
    return w==null?null:{wind:Math.round(w*10)/10,wave:g==null?null:Math.round(g*10)/10};
  }
  function sstAt(days,key,hour){ var dd=days&&days[key]; if(!dd||!dd.sst) return null; for(var k=0;k<6;k++){ var v=dd.sst[Math.max(0,Math.min(23,hour-k))]; if(v!=null) return Math.round(v*10)/10; } return null; }
  /* ある値の変化(今の値 − hours 時間前の値)。気圧・水温の上がり下がりを見る */
  function trendBefore(days,key,hour,field,hours){
    if(!days) return null; var d0=new Date(key+"T00:00:00Z");
    function at(k){ var t=new Date(d0.getTime()+(hour-k)*36e5), dd=days[t.toISOString().slice(0,10)], a=dd&&dd[field]; return a?a[t.getUTCHours()]:null; }
    var now=at(0), before=at(hours); return (now==null||before==null)?null:Math.round((now-before)*10)/10; }
  function rainBefore(lat,lng,key,hour){ return rainSum(cellDays(lat,lng),key,hour); }
  function cellDays(lat,lng){ var c=cellCache[cellKey(lat,lng)]; return c&&c.days?c.days:null; }
  return {trendBefore:trendBefore,nearStations:nearStations,roughBefore:roughBefore,sstAt:sstAt,rainSum:rainSum,rainBefore:rainBefore,tideInfo:tideInfo,forecastCells:forecastCells,cellDays:cellDays,forecast:forecast,summarize:summarize,loadStations:loadStations,nearestStation:nearestStation,tideDay:tideDay};
})();
