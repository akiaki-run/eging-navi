
/* ===== 全国釣りナビ:ポイントと判断のルール ===== */
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


/* ===== 釣り方(エギング以外も) =====
 * kind: ポイントの地形の種類(港・岬・瀬戸(水道)・磯・海岸・入り江)ごとの向き不向き
 * time: マヅメ・夜・日中の強さ / season: よく釣れる月 / tide: 潮の動きの好み
 * cast: 投げる向きの決め方(open=沖へ遠く / inner=港内や湾内の際 / foot=足元中心) */
var METHODS={
  eging:{name:"エギング",fish:["アオリイカ","コウイカ","ヤリイカ","ケンサキイカ"],unit:"杯",tackle:"エギ",note:"アオリイカ・コウイカ",
    kind:{"岬":6,"瀬戸(水道)":5,"磯":4,"磯・海岸":4,"港":4,"入り江":1,"砂浜":-6},season:[3,4,5,6,9,10,11,12],
    time:{mazume:3,night:-1,day:0},tide:"move",cast:"eging",windMax:6,
    how:{"港":"堤防の先端や港内の常夜灯まわりで、シャクリとフォールを繰り返す。秋は港内にも新子が入る。","岬":"先端から潮目を探す。潮が動く時間に回遊が入りやすい。","瀬戸(水道)":"潮が速いので、潮止まり前後に重めのエギで底を取る。","磯・海岸":"沖のかけあがりや藻場の際を広く探る。","入り江":"風の強い日の逃げ場。浅い藻場があれば春の産卵場になる。","default":"潮通しの良い面でシャクリとフォールを繰り返し、底を取る。"}},
  aji:{name:"アジング・サビキ",fish:["アジ","サバ","イワシ","コノシロ"],unit:"匹",tackle:"ジグヘッド・サビキ",
    kind:{"砂浜":-3,"港":7,"入り江":3,"岬":0,"瀬戸(水道)":-2,"磯":-2,"磯・海岸":-1},light:6,season:[5,6,7,8,9,10,11,12],
    time:{mazume:3,night:2,day:-1},tide:"move",cast:"inner",windMax:6,
    how:{"港":"常夜灯の明暗の境目を表層から探る。サビキなら港内の足元でも群れが入れば釣れる。","default":"潮が動く時間に回遊を待つ。常夜灯が無ければマヅメに集中する。"}},
  mebaru:{name:"メバリング",fish:["メバル","カサゴ"],unit:"匹",tackle:"ジグヘッド・プラグ",
    kind:{"港":5,"磯":4,"磯・海岸":4,"入り江":4,"岬":1,"瀬戸(水道)":0},light:4,season:[11,12,1,2,3,4,5],
    time:{mazume:2,night:3,day:-2},tide:"gentle",cast:"inner",windMax:4,
    how:{"港":"常夜灯まわりや岸壁の際を、表層からゆっくり巻く。風が弱く波が穏やかな夜が良い。","default":"藻や岩の際を表層〜中層でゆっくり。潮が緩むタイミングに浮きやすい。"}},
  jig:{name:"ショアジギング(青物)",fish:["ブリ・ハマチ","ヒラマサ","サワラ","カンパチ","シイラ"],unit:"本",tackle:"メタルジグ",
    kind:{"砂浜":2,"岬":9,"瀬戸(水道)":6,"磯":5,"磯・海岸":5,"港":-1,"入り江":-4},light:0,season:[6,7,8,9,10,11,12],
    time:{mazume:5,night:-3,day:0},tide:"strong",cast:"open",windMax:8,waveMax:1.5,surf:true,
    how:{"港":"堤防の先端から沖へ遠投。ベイト(小魚)が見えたら回遊のチャンス。","default":"朝マヅメに沖の潮目へ遠投して、底から早巻き。鳥山やナブラが出たらその先へ。"}},
  chinu:{name:"チヌ(クロダイ)",fish:["チヌ","キビレ"],unit:"匹",tackle:"チニング・フカセ",
    kind:{"港":5,"入り江":5,"磯":2,"磯・海岸":2,"岬":0,"瀬戸(水道)":-1},light:1,season:[3,4,5,6,9,10,11],
    time:{mazume:2,night:1,day:1},tide:"rising",cast:"inner",windMax:7,
    how:{"港":"岸壁の際や敷石まわりを、上げ潮に合わせて狙う。少し濁った日が良い。","default":"浅場のかけあがりや牡蠣殻まわりを、満ち込みに合わせて探る。"}},
  seabass:{name:"シーバス",fish:["シーバス(スズキ)","ヒラスズキ"],unit:"本",tackle:"ミノー・バイブレーション",
    kind:{"砂浜":3,"瀬戸(水道)":6,"港":3,"入り江":3,"岬":3,"磯":2,"磯・海岸":2},light:4,season:[9,10,11,12,1,2,3,4,5],
    time:{mazume:3,night:3,day:-1},tide:"move",cast:"open",windMax:8,rainBonus:true,surf:true,
    how:{"港":"常夜灯の明暗や潮のヨレに、流れに乗せて通す。秋冬はコノシロについた大型も。","default":"潮が速く動く時間に、流れの変わり目(ヨレ)を通す。雨のあとの濁りは好機。"}},
  kisu:{name:"ちょい投げ(キス)",fish:["キス","ハゼ","カレイ"],unit:"匹",tackle:"天秤・石粉/青イソメ",
    kind:{"砂浜":9,"入り江":2,"港":2,"磯・海岸":0,"岬":-2,"瀬戸(水道)":-3,"磯":-3},light:0,season:[5,6,7,8,9,10],needSand:true,
    time:{mazume:1,night:-2,day:2},tide:"move",cast:"open",windMax:6,surf:true,
    how:{"港":"港の出入り口や外側の砂地へ投げて、ゆっくり底を引く。岩や藻の上は根掛かりするので避ける。","砂浜":"砂浜から遠投して、ゆっくり底を引く。アタリが集中する距離(かけあがり)を探す。","default":"砂地へ投げて、ゆっくり底を引く。アタリが集中する距離を探す。"}},
  hata:{name:"ハタ(ロックショア)",fish:["オオモンハタ","アカハタ","キジハタ","マハタ"],unit:"匹",tackle:"ジグヘッド・テキサスリグ",
    kind:{"磯":8,"磯・海岸":7,"岬":6,"瀬戸(水道)":3,"港":1,"入り江":0},light:0,season:[5,6,7,8,9,10,11],
    time:{mazume:3,night:-2,day:1},tide:"move",cast:"open",windMax:7,waveMax:1,
    how:{"港":"堤防の先端の根やテトラ際を、底からリフト&フォールで。","default":"沖の沈み根や岩礁帯へ投げ、着底したらすぐ巻き上げて根掛かりを避ける。水温が高い時期ほど反応が良い。"}},
  negyo:{name:"穴釣り・根魚",fish:["カサゴ(ガラカブ)","アイナメ","ソイ","ベラ"],unit:"匹",tackle:"ブラクリ",
    kind:{"港":6,"磯":5,"磯・海岸":4,"岬":2,"入り江":1,"瀬戸(水道)":0},light:1,season:[1,2,3,4,5,6,7,8,9,10,11,12],
    time:{mazume:1,night:1,day:1},tide:"any",cast:"foot",windMax:9,
    how:{"港":"テトラや敷石の隙間にブラクリを落とし、底で少し待つ。季節を問わず釣れる。","default":"岩の隙間や際に仕掛けを落として、底をとって待つ。"}}
};
var FISH_ALL=(function(){ var a=[]; Object.keys(METHODS).forEach(function(k){ METHODS[k].fish.forEach(function(f){ if(a.indexOf(f)<0)a.push(f); }); }); return a.concat(["メジナ(グレ)","タチウオ","マダイ","カワハギ","マゴチ","ヒラメ","サヨリ","タコ"]); })();

/* 天草のポイントで釣れる魚(釣り情報サイトに書かれているもの) */
var SPOT_FISH={hiai:["アジ","コノシロ","チヌ","サヨリ","カサゴ(ガラカブ)","メバル","シーバス(スズキ)","コウイカ"],
  aitsu:["アジ","キス","チヌ","メジナ(グレ)","メバル","コウイカ"],hatonokama:["アジ","キス","チヌ","メバル"],
  iwaya:["アジ","シーバス(スズキ)","チヌ","メジナ(グレ)","カサゴ(ガラカブ)","アオリイカ"],
  himedo:["アジ","コノシロ","キス","メバル","チヌ","シーバス(スズキ)","タチウオ","コウイカ"],
  oodou:["アジ","キス","カサゴ(ガラカブ)","メバル","カワハギ","チヌ","メジナ(グレ)","マダイ","シーバス(スズキ)","タチウオ","アオリイカ","コウイカ"],
  hinoshima:["アジ","キス","メバル","チヌ","メジナ(グレ)","シーバス(スズキ)","タチウオ","アオリイカ","コウイカ"],
  tanasoko:["アジ","キス","メバル","チヌ","メジナ(グレ)","シーバス(スズキ)","アオリイカ","コウイカ"],
  miyada:["アジ","キス","メバル","チヌ","メジナ(グレ)","シーバス(スズキ)","アオリイカ","コウイカ"],
  akasaki:["アジ","キス","メバル","チヌ","メジナ(グレ)","アオリイカ","コウイカ"],fukami:["アジ","アオリイカ"]};
SPOTS.forEach(function(s){ s.fish=SPOT_FISH[s.id]||["アオリイカ"]; s.kind=s.kind||"港"; });
/* 砂地がある(キスの実績がある、または砂地と書かれている)ポイント */
SPOTS.forEach(function(s){ if(s.fish.indexOf("キス")>=0||s.id==="akasaki") s.sand=true; });
function isSandy(s){ return !!(s.sand||s.kind==="砂浜"); }

/* 地形の種類:海が何km開けているか(16方位)から決める。どのポイントも同じ基準で判定する */
function classify(open){
  if(!open) return null;
  var sea=[],long=0,maxR=0,sx=0,sy=0;
  for(var i=0;i<16;i++){ var r=open[i]; if(r>=0.3){sea.push(i);sx+=Math.sin(i*Math.PI/8)*r;sy+=Math.cos(i*Math.PI/8)*r;} if(r>=1.5)long++; if(r>maxR)maxR=r; }
  if(!sea.length) return null;
  var face=Math.round(((Math.atan2(sx,sy)*8/Math.PI)+16))%16, perp=open[face];
  if(perp<1.2&&maxR>=2.5&&long>=2) return {type:"瀬戸(水道)",face:face,maxR:maxR,eging:3,current:"fast"};
  if(long>=6) return {type:"岬",face:face,maxR:maxR,eging:3,current:"normal"};
  if(long>=3) return {type:"磯・海岸",face:face,maxR:maxR,eging:2,current:"normal"};
  return {type:"入り江",face:face,maxR:maxR,eging:2,current:"normal",calm:true};
}
function methodOf(c){ return METHODS[(c&&c.method)||"eging"]||METHODS.eging; }
function spotKind(s){ var k=s.kind||(s.mine?"":"港"); return (k==="堤防"||k==="釣り場")?"港":k; }
function fishHit(list,m){ return (list||[]).some(function(f){ return m.fish.some(function(x){ return f===x||f.indexOf(x.split("(")[0])===0||x.indexOf(f.split("(")[0])===0; }); }); }

/* エギング以外の点数 */
/* どのポイントにも同じ基準で点を付ける。使うのは、
 *  ・地形(海岸線から計算した種類と、どちらに海が開けているか)
 *  ・そのポイントの風・波・雨の予報、近くの観測地点の潮
 *  ・季節(月)
 *  ・自分の釣果の記録
 * 手で入れた説明(釣り情報サイトの魚の実績・常夜灯など)は表示だけにして、点数には入れない。 */
function rankGeneric(c,s,center,radiusKm){
  var m=methodOf(c), why=[], warn=[], geo=classify(s._open);
  var dk=center?distKm(center,s):0, sc=20;
  var k=(s.kind&&s.kind!=="")?spotKind(s):(geo?geo.type:"");
  if(k==="港"&&geo&&geo.type==="瀬戸(水道)") k="瀬戸(水道)";
  var current=geo?geo.current:(s.current||"normal");
  var kb=m.kind[k]; if(kb==null) kb=0; sc+=kb;
  if(m.needSand&&isSandy(s)&&k!=="砂浜"){ sc+=4; why.push("近くに砂地がある"); }
  if(kb>=5) why.push(k+"は"+m.name+"の好ポイント"); else if(kb<=-2) warn.push(k+"は"+m.name+"にはあまり向かない");
  if(s.log&&s.log.trips){ sc+=Math.min(12,s.log.hits*4)-Math.min(4,s.log.trips-s.log.hits); why.unshift("自分の釣果:"+s.log.trips+"回のうち"+s.log.hits+"回釣れた(計"+s.log.total+m.unit+")"); }
  var ws=c.wind_ms, wdi=DIRS16.indexOf(c.wind_dir), sh=1;
  if(s._open&&wdi>=0){ var fw=s._open[wdi]; sh=fw>=1.5?0:(fw>=0.3?1:2); }
  if(ws!=null){
    if(ws>3&&sh===2) why.push("今日の風向き("+c.wind_dir+")だと風裏になる");
    if(ws>3&&sh===0) warn.push("今日の風("+c.wind_dir+")が海から正面に吹きつける");
    if(ws>m.windMax){ sc-=(ws-m.windMax)*2*(2-sh); if(sh<2) warn.push("風が強め(この釣りの目安は"+m.windMax+"m以下)"); }
    else if(ws<=3&&(m.cast==="open"||m.cast==="eging")){ sc+=2; why.push("風が弱く、沖へ投げやすい"); }
    if(ws>=10) warn.push("風速"+ws+"m。釣行は見送りが無難");
  }
  if(s._open&&ws!=null&&ws>4){ var ca=castAdvice(s._open,c,s); if(ca&&ca.best!=null){ if(ca.rel==="tail"){sc+=3;why.push("投げる向きが追い風になる");} else if(ca.rel==="head"&&ca.alt==null){sc-=3;warn.push("どの向きに投げても向かい風になりやすい");} } }
  if(m.waveMax&&c.wave_m!=null&&c.wave_m>m.waveMax){ sc-=5; warn.push("波が"+c.wave_m+"mあり、足場の低い磯は危ない"); }
  else if(c.wave_m!=null&&c.wave_m>=1.5){ sc-=(2-sh)*2; if(c.wave_m>=2) warn.push("波が高い。港内側だけにする"); }
  var t=c.tide_class||c.tide_name, tL=(c.tide_range!=null?"干満差"+Math.round(c.tide_range)+"cm"+(c.tide_station?"("+c.tide_station+")":""):t), big=(t==="大潮"||t==="中潮"), small=(t==="小潮"||t==="長潮"||t==="若潮");
  if(current==="fast"){
    if(t==="大潮"){ sc-=4; warn.push("潮の速い場所なので、"+tL+"だと流れが速すぎることがある"); }
    if(small){ sc+=5; why.push(tL+"で潮が緩い日は、潮の速い場所が釣りやすい"); }
  } else if(m.tide==="strong"||m.tide==="move"){ if(big){ sc+=(m.tide==="strong"?6:4); why.push(tL+"で潮がよく動く"); } if(small) sc-=2; }
  else if(m.tide==="gentle"){ if(small){ sc+=3; why.push(tL+"で潮が緩く、釣りやすい"); } if(t==="大潮") sc-=1; }
  else if(m.tide==="rising"){ if(big){ sc+=3; why.push(tL+"で満ち込みがはっきりしている"); } }
  if(m.season.indexOf(c.month)>=0){ sc+=4; why.push(c.month+"月は"+m.name+"のシーズン"); } else { sc-=4; warn.push(c.month+"月はシーズン外で数は期待しにくい"); }
  if(m.rainBonus&&c.rain_max!=null&&c.rain_max>=1&&c.rain_max<5){ sc+=2; why.push("雨で濁りが入りやすい"); }
  if(c.rain_max!=null&&c.rain_max>=5) warn.push("強い雨の時間あり。雨雲を確認");
  if(s.ferry) warn.push("フェリーの時刻を確認");
  return {spot:s,score:sc,dist:dk,why:why,warn:warn,kind:k};
}
function howFor(c,s){ var m=methodOf(c); if(m===METHODS.eging&&s.how) return s.how; var k=spotKind(s); if(!k){ var g=classify(s._open||s.open); k=g?g.type:""; } return m.how[k]||m.how["default"]; }

/* 円の中のポイントに点数と理由を付ける。spots は円の中だけを渡す */
function rankSpots(base,spots,center,radiusKm){
  var out=spots.map(function(s){
    var c=base.condFor?base.condFor(s):base;
    return rankGeneric(c,s,center,radiusKm);
  });
  out.forEach(function(r){ r.score=Math.round(r.score*10)/10; });
  out.sort(function(a,b){ return b.score-a.score||(a.spot.id<b.spot.id?-1:1); });
  return out;
}

/* 時間ごとの狙い目:潮の動き+マヅメ(秋の常夜灯ポイントは夜も) */
function hourlyScore(c,spot){
  var curve=tideCurve(c.tide_events), sr=c.sunrise?hm2h(c.sunrise):6.5, ss=c.sunset?hm2h(c.sunset):17.5, arr=[];
  for(var i=0;i<=48;i++){
    var h=i/2, v=0;
    if(curve) v+=curve.move(h)*3;
    var dm=Math.min(Math.abs(h-sr),Math.abs(h-ss));
    var mt=methodOf(c).time;
    if(mt){
      if(dm<=1.25) v+=mt.mazume*(1-dm/1.5);
      var night=(h<sr-1||h>ss+1);
      if(night) v+=mt.night; else if(dm>1.25) v+=mt.day;
      if(methodOf(c).tide==="rising"&&curve&&curve.at(h+0.25)>curve.at(h-0.25)) v+=1.2;
      if(methodOf(c).tide==="gentle"&&curve) v-=curve.move(h)*1.5;
    } else {
      if(dm<=1.25) v+=3*(1-dm/1.5);
      if(h<sr-1||h>ss+1) v-=1.5;
    }
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
    if(!lab.length||(mid<sr-1||mid>ss+1)) lab.unshift((mid<sr-1||mid>ss+1)?"夜":"日中");
    lab=lab.filter(function(x,i){return lab.indexOf(x)===i;});
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
  var lg=spot&&spot.log, ws=c.wind_ms||0, wi=dirIndex(c.wind_dir), toward=wi>=0?(wi+8)%16:-1, se=season(c.month), M=methodOf(c), mode=M.cast||"eging";
  function sc(i){ var r=open[i], v=mode==="inner"?(r<1.5?1.6:0.4)+Math.min(r,1.5)/1.5*0.4:(mode==="open"?Math.min(r,5)/5*3:Math.min(r,5)/5*2);
    if(toward>=0&&ws>2) v+=Math.cos(angSteps(i,toward)*Math.PI/8)*Math.min(ws,10)/4;
    if(mode==="eging"&&se==="autumn"&&r<1.5) v+=0.3;
    if(mode==="eging"&&se==="spring"&&r>=1.5) v+=0.5;
    if(lg&&lg.dirs){ v+=Math.min(1.2,(lg.dirs[i]||0)*0.4)+Math.min(0.4,((lg.dirs[(i+1)%16]||0)+(lg.dirs[(i+15)%16]||0))*0.15); }
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
    head:"向かい風になる。低い弾道で投げ、重めの"+(M.tackle||"仕掛け").split("・")[0]+"で底をしっかり取る。"}[r];
  var alt=null;
  if(r==="head"&&ws>=5){ sea.forEach(function(i){ if(rel(i)==="tail"&&(alt==null||open[i]>open[alt])) alt=i; }); }
  var label=DIRS16[lo]+(lo!==hi?"〜"+DIRS16[hi]:"");
  var text=label+"へ投げる("+kind(best)+")。"+windText+(alt!=null?" 風を背にしたいなら"+DIRS16[alt]+"("+kind(alt)+")も候補。":"");
  if(mode==="eging"&&open[best]>=1.5&&sea.some(function(i){return open[i]<1.5;})&&se==="autumn") text+=" 秋は港内側にも新子が入るので、沖が荒れたら内側へ。";
  if(mode==="foot") text="遠くへ投げる釣りではないので、足元のテトラや岩の隙間に落として探る。"+(r==="calm"?"":"風は"+DIRS16[(toward+8)%16]+"から。")+" 海側の開けた向きは"+label+"。";
  if(mode==="open"&&(M===METHODS.jig||M===METHODS.seabass)&&open[best]>=3) text+=" 沖まで開けているので、潮目やベイトの群れを探して遠投。";
  if(M===METHODS.kisu) text+=" 砂地の上を、遠くから手前までゆっくり引いてくる。";
  if(M===METHODS.hata) text+=" 沖の沈み根や岩礁の上を通す。";
  if(mode==="inner"&&open[best]<1.5) text+=" 港内・湾内の際や常夜灯の明暗を狙う。";
  var isPort=spot&&(spot.kind==="港"||spot.port);
  if(isPort&&mode!=="foot"&&(ws>=5||(c.wave_m||0)>=1)) text+=" 外が荒れているので、港内に入って投げるのも手。港内は向きにこだわらず、岸壁沿い・船の陰・常夜灯の明暗などを何方向か打ち分ける。";
  else if(isPort&&mode==="eging") text+=" 港内側なら向きは自由。岸壁沿いや船の陰、常夜灯の明暗を打ち分ける。";
  if(lg&&lg.dirs){ var ks=Object.keys(lg.dirs).sort(function(a,b){return lg.dirs[b]-lg.dirs[a];});
    if(ks.length) text+=" 自分の記録では、ここで"+ks.slice(0,3).map(function(k){return DIRS16[k]+"へ"+lg.dirs[k]+"回";}).join("・")+"釣れている。"; }
  if(lg&&lg.water&&(lg.water.inner||lg.water.outer)) text+="(港内・湾内で"+(lg.water.inner||0)+"回、外海側で"+(lg.water.outer||0)+"回)";
  return {best:best,lo:lo,hi:hi,rel:r,alt:alt,kind:kind(best),text:text};
}

if(typeof module!=="undefined") module.exports={classify:classify,isSandy:isSandy,METHODS:METHODS,FISH_ALL:FISH_ALL,howFor:howFor,fishHit:fishHit,SPOTS:SPOTS,rankSpots:rankSpots,bestWindows:bestWindows,tideCurve:tideCurve,distKm:distKm,pickArea:pickArea,h2hm:h2hm,castAdvice:castAdvice};
