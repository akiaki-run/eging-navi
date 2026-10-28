
/* ===== 全国エギングナビ:ポイントと判断のルール ===== */
var SPOTS = [
 {id:"hiai", name:"樋合新港", area:"上天草・樋合島の南端", lat:32.5369, lng:130.3968, eging:3, shelter:2, current:"normal", ika:"アオリイカ・コウイカ",
  feat:"南の波止がメイン。途中で港内向きに折れ、港内側は足場が広く、沖側は一段高い。内海側の波止は風や波を受けにくく、荒れた日の逃げ場になる。",
  how:"風が弱い日は沖側で潮が動く時間に。風が強い日は港内側に入る。秋の新子は港内にも入る。", note:"トイレなし(樋合海水浴場まで車で約4分)。休日は混みやすい。", q:"樋合新港 上天草市"},
 {id:"aitsu", name:"合津港", area:"上天草・松島北部", lat:32.5215, lng:130.4322, eging:2, shelter:1, current:"fast", ika:"コウイカ(アオリイカも)",
  feat:"前島との水道に面し、潮の流れと水深がある。岸壁中心で足場が良く、周りにホテルや商店があり便利。",
  how:"潮が速いので小潮〜若潮の日が狙いやすい。重めのエギやシンカーで底を取る。", note:"係留船や観光客に注意。", q:"合津港 上天草市松島町"},
 {id:"hatonokama", name:"鳩之釜漁港", area:"上天草・大矢野", lat:32.5505, lng:130.4074, eging:1, shelter:1, northShelter:true, current:"normal", ika:"情報少なめ",
  feat:"北からの季節風に強い、南向きの広い漁港。南東に延びる長い波止がメイン。港内側は足場が広く、沖側と先端は一段高い。",
  how:"北風が強い日の候補。イカの情報は少ないので、波止の先端から広く探る。", note:"港内は養殖イケスのロープに注意。", q:"鳩之釜漁港 上天草市"},
 {id:"iwaya", name:"岩谷港", area:"上天草・大矢野", lat:32.5877, lng:130.4549, eging:3, shelter:2, current:"complex", ika:"アオリイカ",
  feat:"山に囲まれて強風に強い小さな港。三角ノ瀬戸から複雑な潮が入り込み、魚のエサ場になっている。エギングでアオリイカの実績あり。",
  how:"風が強い日の第一候補。潮が速すぎる大潮より、中潮〜小潮が釣りやすい。", note:"小規模なので先客がいると入りにくい。", q:"岩谷港 上天草市大矢野町"},
 {id:"himedo", name:"姫戸港", area:"上天草・姫戸町", lat:32.4579, lng:130.4286, eging:2, shelter:1, current:"normal", light:true, kou:true, ika:"コウイカ多め・アオリイカ",
  feat:"外側の堤防が小島とつながり、変化のある地形。小島公園手前の波止は先端に常夜灯。コウイカが多い傾向。",
  how:"エギにオモリを足して底付近を重点的に。冬〜春のコウイカ狙いにも。", note:"常夜灯のある波止は頭上に電線。", q:"姫戸港 上天草市姫戸町"},
 {id:"oodou", name:"大道港", area:"上天草・龍ヶ岳町", lat:32.39, lng:130.37, eging:3, shelter:1, current:"normal", light:true, ika:"アオリイカ・コウイカ",
  feat:"大きく伸びる白灯波止は足場が良く、歩いてポイントを変えられる。堤防先端、フェリー乗り場脇のテトラ、白灯波止のかけあがりが狙いどころ。駐車場と公衆トイレあり。",
  how:"日没前後から夜が狙い目。潮通しの良い場所にベイトが集まる。", note:"テトラ周りは足元に注意。", q:"大道港 上天草市龍ヶ岳町"},
 {id:"hinoshima", name:"樋島港", area:"上天草・龍ヶ岳町樋島", lat:32.3811, lng:130.4182, eging:2, shelter:1, current:"normal", ika:"アオリイカ・コウイカ",
  feat:"大きく伸びる白灯波止と港内の埠頭から釣れる。アオリイカ(ミズイカ)とコウイカの両方が狙える。",
  how:"白灯波止の先端から沖向きに。港内は底付近でコウイカ。", note:"周辺に大きな駐車スペースがない。地元の迷惑にならないように。", q:"樋島港 上天草市龍ヶ岳町"},
 {id:"tanasoko", name:"棚底港", area:"天草市・倉岳町", lat:32.4051, lng:130.34, eging:3, shelter:1, current:"normal", light:true, ika:"アオリイカ・コウイカ",
  feat:"御所浦行きフェリーの港。長い2本の堤防がメインで、外向きに投げるとアオリイカがよく釣れる。先端付近は釣果が出やすい。北波止の先端に常夜灯。",
  how:"外向きに投げる。先端に人がいなければ先端から。", note:"北波止は頭上に電線。手前の駐車場は有料。", q:"棚底港 天草市倉岳町"},
 {id:"miyada", name:"宮田港", area:"天草市・倉岳町", lat:32.3984, lng:130.3125, eging:3, shelter:1, current:"normal", ika:"アオリイカ",
  feat:"東西の波止から釣れる。春から秋のミズイカ(アオリイカ)が人気で、エギングの人が多い。",
  how:"沖向きは一段高い波返しの上から。", note:"足元の高さに注意。", q:"宮田港 天草市倉岳町"},
 {id:"akasaki", name:"赤崎港", area:"天草市・有明町", lat:32.5157, lng:130.3368, eging:2, shelter:1, current:"normal", kou:true, ika:"アオリイカ・コウイカ",
  feat:"東側の白灯波止がメイン。海底は砂地でコウイカの実績が高い。テトラから沖側でアオリイカ、港内でコウイカが釣れやすい。",
  how:"沖向きはアオリイカ、港内は底を引いてコウイカ。春は良型のコウイカ。", note:"テトラの上は滑りやすい。", q:"赤崎港 天草市有明町"},
 {id:"goshoura", name:"御所浦島", area:"天草市・御所浦町(フェリー)", lat:32.3224, lng:130.3563, eging:3, shelter:1, current:"normal", ferry:true, ika:"アオリイカ",
  feat:"フェリーで渡る離島。島全体がポイントで、漁港だけでなく道路脇の護岸でも釣れる。秋は数釣り、春は良型。",
  how:"港を回ってランガン。秋のハイシーズンは2桁も狙える。", note:"フェリーの時刻を先に確認。", q:"御所浦港 天草市御所浦町"},
 {id:"tomioka", name:"富岡西港", area:"苓北町", lat:32.5203, lng:130.0354, eging:3, shelter:1, current:"normal", ika:"アオリイカ・コウイカ",
  feat:"北側の堤防がメインで、特に曲がり角付近の釣果が安定していて人気。港内にもアオリイカやコウイカが入る。",
  how:"曲がり角付近を中心に、港内もランガン。", note:"人気の釣り場なので先客に配慮。", q:"富岡港 苓北町"},
 {id:"takahama", name:"高浜港", area:"天草市・天草町(西海岸)", lat:32.377, lng:129.994, eging:3, shelter:1, current:"normal", westExposed:true, ika:"アオリイカ",
  feat:"天草西海岸の港。秋は300〜500gのアオリイカの数釣りができ、初心者でも釣果を出しやすい。",
  how:"秋に数を狙う。外海に面した堤防の先端が潮通しが良い。", note:"西寄りの風をまともに受けやすい。", q:"高浜港 天草市天草町"},
 {id:"tsuuji", name:"通詞島", area:"天草市・五和町", lat:32.5466, lng:130.1386, eging:2, shelter:1, current:"fast", ika:"アオリイカ",
  feat:"外防波堤は足場が安定していて、初心者でもエギングしやすい。周辺は潮の流れが速い。",
  how:"潮が緩む日のほうが釣りやすい。", note:"ライフジャケット必須。", q:"通詞島 天草市五和町"},
 {id:"komori", name:"小森漁港", area:"天草市・牛深町(下須島)", lat:32.1804, lng:130.0202, eging:3, shelter:1, current:"normal", ika:"アオリイカ(キロ超え実績)",
  feat:"南側の長い堤防の先端と、短い堤防の根元から降りるゴロタの地磯の2か所が好ポイント。水深は3〜4mと浅め。船道(ミオ筋)がイカの通り道。",
  how:"ミオ筋に沿って投げる。地磯側は広く探れて大型の確率が上がる。", note:"民家の隣。夜は車の音や話し声に注意。地磯は滑るのでスパイクとライフジャケット。", q:"小森漁港 天草市牛深町"},
 {id:"fukami", name:"深海漁港", area:"天草市・深海町", lat:32.2541, lng:130.0916, eging:3, shelter:1, current:"normal", light:true, ika:"アオリイカ",
  feat:"潮通しが良くアジの回遊が多いため、アジを追うアオリイカも入りやすい。波止や常夜灯まわり、浅場から深場まで探れる。夏〜秋は大型の実績。",
  how:"常夜灯まわりと波止の先端を交互に。", note:"夜は足元を照らすライトを。", q:"深海漁港 天草市深海町"}
];
var DIRS16 = ["北","北北東","北東","東北東","東","東南東","南東","南南東","南","南南西","南西","西南西","西","西北西","北西","北北西"];
var NORTHISH = ["北","北北東","北東","北北西","北西"];
var WESTISH = ["西","西北西","北西","西南西"];

function distKm(a,b){var R=6371,t=Math.PI/180,dl=(b.lat-a.lat)*t,dn=(b.lng-a.lng)*t;var x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a.lat*t)*Math.cos(b.lat*t)*Math.sin(dn/2)*Math.sin(dn/2);return 2*R*Math.asin(Math.sqrt(x));}
function hm2h(t){var p=String(t).split(":");return (+p[0])+(+p[1])/60;}
function h2hm(h){h=Math.max(0,Math.min(24,h));var H=Math.floor(h),M=Math.round((h-H)*60);if(M===60){H++;M=0;}return (H<10?"0":"")+H+":"+(M<10?"0":"")+M;}
function avg(a){return a.length?a.reduce(function(s,v){return s+v;},0)/a.length:0;}

/* 天気・潮の地域:円の中心にいちばん近い地域を使う(古い1地域の形にも対応) */
function pickArea(doc,center){
  if(!doc) return null;
  var list=doc.areas&&doc.areas.length?doc.areas:[Object.assign({name:"上天草",lat:32.52,lng:130.42},doc)];
  var best=null,bd=1e9;
  list.forEach(function(a){var d=(a.lat!=null&&center)?distKm(center,a):0;if(d<bd){bd=d;best=a;}});
  return best;
}

/* 潮位カーブ:満干の時刻からコサイン補間。前後は半周期6.2時間で外挿 */
function tideCurve(events){
  if(!events||events.length<2)return null;
  var ev=events.map(function(e){return {t:hm2h(e.time),cm:+e.cm,high:/満/.test(e.type)};}).sort(function(a,b){return a.t-b.t;});
  var hiAvg=avg(ev.filter(function(e){return e.high;}).map(function(e){return e.cm;}));
  var loAvg=avg(ev.filter(function(e){return !e.high;}).map(function(e){return e.cm;}));
  var f=ev[0],l=ev[ev.length-1];
  ev.unshift({t:f.t-6.2,cm:f.high?loAvg:hiAvg,high:!f.high});
  ev.push({t:l.t+6.2,cm:l.high?loAvg:hiAvg,high:!l.high});
  function seg(h){for(var i=0;i<ev.length-1;i++){if(h>=ev[i].t&&h<=ev[i+1].t)return i;}return -1;}
  function at(h){var i=seg(h);if(i<0)return null;var a=ev[i],b=ev[i+1],x=(h-a.t)/(b.t-a.t);return a.cm+(b.cm-a.cm)*(1-Math.cos(Math.PI*x))/2;}
  function move(h){var i=seg(h);if(i<0)return 0;var a=ev[i],b=ev[i+1];return Math.sin(Math.PI*(h-a.t)/(b.t-a.t));}
  return {at:at,move:move,events:ev.slice(1,-1)};
}
function season(month){
  if(month>=9&&month<=12)return "autumn";
  if(month>=3&&month<=6)return "spring";
  if(month===7||month===8)return "summer";
  return "winter";
}

/* 円の中のポイントに点数と理由を付ける。spots は円の中だけを渡す */
function rankSpots(c,spots,center,radiusKm){
  var out=spots.map(function(s){
    var eg=s.eging||2, sh=(s.shelter==null?1:s.shelter);
    var dk=center?distKm(center,s):0;
    var sc=eg*10 - (radiusKm?6*dk/radiusKm:0), why=[], warn=[];
    var ws=c.wind_ms, dir=c.wind_dir, north=NORTHISH.indexOf(dir)>=0, west=WESTISH.indexOf(dir)>=0, wdi=DIRS16.indexOf(dir);
    if((s.auto||s.mine)&&s._open&&wdi>=0&&ws!=null){ var fw=s._open[wdi]; sh=fw>=1.5?0:(fw>=0.3?1:2); if(ws>3) why.push(sh===2?"今日の風向きだと風裏になる":(sh===0?"今日の風は海から正面に吹きつける":"")); why=why.filter(Boolean); }
    if(s.auto) why.push("地形から自動で出した候補");
    if(s.log&&s.log.trips){ sc+=Math.min(12,s.log.hits*4)-Math.min(4,s.log.trips-s.log.hits); why.unshift("自分の釣果:"+s.log.trips+"回のうち"+s.log.hits+"回釣れた(計"+s.log.total+"杯)"); }
    if(s.mine) why.push("自分で追加したポイント");
    if(ws!=null){
      if(ws<=3){ sc+=(2-sh)*3; if(sh<2) why.push("風が弱く、外向きや潮通しの良い面を攻めやすい"); }
      else if(ws<=6){ sc+=sh*4; if(sh===2) why.push("風を避けやすい"); }
      else { sc+=sh*8-10; why.push(sh===2?"風が強い日でも釣りになりやすい":"風の影響を受けやすい"); }
      if(north&&ws>3&&s.northShelter){ sc+=6; why.push("北風に強い港"); }
      if(west&&ws>4&&s.westExposed){ sc-=6; warn.push("西寄りの風を正面から受けやすい"); }
      if(ws>=10) warn.push("風速"+ws+"m。釣行は見送りが無難");
      else if(ws>=7&&sh<2) warn.push("風が強め。足場の高い沖側は避ける");
    }
    if(s._open){ var ca=castAdvice(s._open,c,s); if(ca&&ca.best!=null&&ws!=null&&ws>4){ if(ca.rel==="tail"){sc+=3;why.push("投げる向きが追い風になる");} else if(ca.rel==="head"&&ca.alt==null){sc-=3;warn.push("どの向きに投げても向かい風になりやすい");} } }
    var t=c.tide_name, big=(t==="大潮"||t==="中潮"), small=(t==="小潮"||t==="長潮"||t==="若潮");
    if(s.current==="fast"||s.current==="complex"){
      if(t==="大潮"){ sc-=5; warn.push("大潮は流れが速すぎることがある"); }
      if(small){ sc+=8; why.push(t+"で潮が緩い日は、潮の速い場所が有利"); }
      if(t==="中潮"){ sc+=3; why.push("中潮でほどよく潮が動く"); }
    } else {
      if(big){ sc+=6; why.push(t+"で潮がよく動く"); }
      if(small){ sc-=2; }
    }
    var se=season(c.month);
    if(se==="autumn"){
      if(s.light){ sc+=4; why.push("秋は常夜灯まわりに新子が寄りやすい"); }
      if(s.id==="hiai"){ sc+=3; why.push("秋の新子は港内にも入る"); }
    } else if(se==="spring"){
      if(eg===3){ sc+=3; why.push("春の大型は潮通しの良い場所に寄る"); }
    } else if(se==="winter"){
      if(s.kou||/コウイカ/.test(s.ika||"")){ sc+=5; why.push("冬はコウイカ狙いで底を探る"); }
    }
    if(c.wave_m!=null&&c.wave_m>=1){ sc+=sh*3; if(c.wave_m>=2) warn.push("波が高い。港内側だけにする"); }
    if(c.rain_max!=null&&c.rain_max>=5) warn.push("強い雨の時間あり。雨雲を確認");
    if(s.ferry) warn.push("フェリーの時刻を確認");
    return {spot:s,score:sc,dist:dk,why:why,warn:warn};
  });
  out.sort(function(a,b){return b.score-a.score;});
  return out;
}

/* 時間ごとの狙い目:潮の動き+マヅメ(秋の常夜灯ポイントは夜も) */
function hourlyScore(c,spot){
  var curve=tideCurve(c.tide_events), sr=c.sunrise?hm2h(c.sunrise):6.5, ss=c.sunset?hm2h(c.sunset):17.5, arr=[];
  for(var i=0;i<=48;i++){
    var h=i/2, v=0;
    if(curve) v+=curve.move(h)*3;
    var dm=Math.min(Math.abs(h-sr),Math.abs(h-ss));
    if(dm<=1.25) v+=3*(1-dm/1.5);
    if(h<sr-1||h>ss+1) v-=(spot&&spot.light&&season(c.month)==="autumn")?0.5:1.5;
    if(c.wind_by_hour){ var wh=c.wind_by_hour[Math.min(23,Math.floor(h))]; if(wh!=null&&wh>6) v-=(wh-6)*0.35; }
    if(c.rain_by_hour){ var rh=c.rain_by_hour[Math.min(23,Math.floor(h))]; if(rh!=null&&rh>=3) v-=1; }
    arr.push({h:h,v:v});
  }
  return arr;
}
function bestWindows(c,spot,fromH){
  var arr=hourlyScore(c,spot).filter(function(p){return p.h>=(fromH||0);});
  if(!arr.length)return [];
  var mx=Math.max.apply(null,arr.map(function(p){return p.v;})), th=mx*0.72, wins=[], cur=null;
  arr.forEach(function(p){
    if(p.v>=th){ if(!cur){cur={s:p.h,e:p.h,peak:p.v};} else {cur.e=p.h;cur.peak=Math.max(cur.peak,p.v);} }
    else if(cur){wins.push(cur);cur=null;}
  });
  if(cur)wins.push(cur);
  wins.forEach(function(w){w.s=Math.max(0,w.s-0.25);w.e=Math.min(24,w.e+0.25);});
  wins.sort(function(a,b){return b.peak-a.peak;});
  wins=wins.slice(0,2).sort(function(a,b){return a.s-b.s;});
  var sr=c.sunrise?hm2h(c.sunrise):6.5, ss=c.sunset?hm2h(c.sunset):17.5, curve=tideCurve(c.tide_events);
  wins.forEach(function(w){
    var lab=[], mid=(w.s+w.e)/2;
    if(Math.abs(mid-sr)<1.6) lab.push("朝マヅメ");
    if(Math.abs(mid-ss)<1.6) lab.push("夕マヅメ");
    if(curve&&curve.move(mid)>0.6){ lab.push(curve.at(mid+0.25)>curve.at(mid-0.25)?"上げ潮":"下げ潮"); }
    if(!lab.length) lab.push(mid>ss?"夜":"日中");
    w.label=lab.join("+");
  });
  return wins;
}

/* ===== 投げる向き:地形(海が開いている向き)と風から決める ===== */
function dirIndex(name){return DIRS16.indexOf(name);}
function angSteps(a,b){var d=Math.abs(a-b)%16;return Math.min(d,16-d);}
/* open: 16方位それぞれの「海が続く距離(km)」。0は陸でふさがっている */
function castAdvice(open,c,spot){
  if(!open) return null;
  var sea=[]; for(var i=0;i<16;i++) if(open[i]>=0.3) sea.push(i);
  if(!sea.length) return {best:null,text:"地形データからは海の向きを読み取れませんでした。ピンを岸壁や堤防の先に直すと出せます。"};
  var ws=c.wind_ms||0, wi=dirIndex(c.wind_dir), toward=wi>=0?(wi+8)%16:-1, se=season(c.month);
  function sc(i){ var r=open[i], v=Math.min(r,5)/5*2;
    if(toward>=0&&ws>2) v+=Math.cos(angSteps(i,toward)*Math.PI/8)*Math.min(ws,10)/4;
    if(se==="autumn"&&r<1.5) v+=0.3;
    if(se==="spring"&&r>=1.5) v+=0.5;
    return v; }
  var best=sea[0]; sea.forEach(function(i){ if(sc(i)>sc(best)) best=i; });
  var lo=best, hi=best, lim=sc(best)-0.6;
  for(var k=0;k<2;k++){ var n=(lo+15)%16; if(open[n]>=0.3&&sc(n)>=lim) lo=n; else break; }
  for(var k2=0;k2<2;k2++){ var m=(hi+1)%16; if(open[m]>=0.3&&sc(m)>=lim) hi=m; else break; }
  function kind(i){ return open[i]>=1.5?"沖向き":"湾内・港内向き"; }
  function rel(i){ if(toward<0||ws<=2) return "calm"; var d=angSteps(i,toward); return d<=2?"tail":(d<=5?"cross":"head"); }
  var r=rel(best), wname=c.wind_dir||"";
  var windText={calm:"風は弱く、どの向きにも投げやすい。",
    tail:wname+"の風が背中から吹くので、飛距離が出て投げやすい。",
    cross:"横風になる。着水したらすぐ糸ふけを取り、ラインを風に流されないように。",
    head:"向かい風になる。低い弾道で投げ、重めのエギで底をしっかり取る。"}[r];
  var alt=null;
  if(r==="head"&&ws>=5){ sea.forEach(function(i){ if(rel(i)==="tail"&&(alt==null||open[i]>open[alt])) alt=i; }); }
  var label=DIRS16[lo]+(lo!==hi?"〜"+DIRS16[hi]:"");
  var text=label+"へ投げる("+kind(best)+")。"+windText+(alt!=null?" 風を背にしたいなら"+DIRS16[alt]+"("+kind(alt)+")も候補。":"");
  if(open[best]>=1.5&&sea.some(function(i){return open[i]<1.5;})&&se==="autumn") text+=" 秋は港内側にも新子が入るので、沖が荒れたら内側へ。";
  return {best:best,lo:lo,hi:hi,rel:r,alt:alt,kind:kind(best),text:text};
}

if(typeof module!=="undefined") module.exports={SPOTS:SPOTS,rankSpots:rankSpots,bestWindows:bestWindows,tideCurve:tideCurve,distKm:distKm,pickArea:pickArea,h2hm:h2hm,castAdvice:castAdvice};
