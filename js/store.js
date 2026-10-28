/* ===== 保存先 =====
 * ログインしていないとき:この端末(ブラウザ)の中に保存。
 * ログインしたとき:Firebase(Google の無料サービス)に保存し、スマホと PC で同じ記録を見られる。
 * どちらも同じ関数で扱えるようにしている。 */
var Store=(function(){
  var subs={}, mode="local", uid=null, userName="", fb=null, db=null, unsubs=[], groupUnsubs={};
  var data={spots:{},catches:{},trips:{},pos:{},area:null,groups:[],groupSpots:{},activeTrip:undefined};
  function emit(k){ (subs[k]||[]).forEach(function(f){ try{ f(get(k)); }catch(e){ console.error(e); } }); }
  function get(k){
    if(k==="spots"||k==="catches"||k==="trips") return Object.keys(data[k]).map(function(id){return Object.assign({id:id},data[k][id]);});
    return data[k];
  }
  function on(k,f){ (subs[k]=subs[k]||[]).push(f); f(get(k)); }
  function lsGet(k,d){ try{ var v=JSON.parse(localStorage.getItem("en."+k)); return v==null?d:v; }catch(e){ return d; } }
  function lsSet(k,v){ try{ localStorage.setItem("en."+k,JSON.stringify(v)); }catch(e){} }
  function loadLocal(){
    data.spots=lsGet("spots",{}); data.catches=lsGet("catches",{}); data.trips=lsGet("trips",{}); data.pos=lsGet("pos",{}); data.area=lsGet("area",null);
    data.groups=[]; data.groupSpots={};
    ["spots","catches","trips","pos","area","groups","groupSpots"].forEach(emit);
  }
  function newId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
  function clean(o){ return JSON.parse(JSON.stringify(o)); }
  /* クラウドへの書き込み:電波が無いと完了の返事が来ないので、少し待って返事が無ければ「端末にためた」として先へ進む */
  function fw(p,val){ var done=false; p.then(function(){done=true;},function(e){ console.warn("書き込みに失敗",e); });
    return Promise.race([p.then(function(){return val;}),new Promise(function(ok){ setTimeout(function(){ if(!done) ok(val); },2500); })]); }

  /* --- Firebase --- */
  function loadScript(src){ return new Promise(function(ok,ng){ var s=document.createElement("script"); s.src=src; s.onload=ok; s.onerror=ng; document.head.appendChild(s); }); }
  function cloudReady(){ return mode==="cloud"&&db&&uid; }
  function u(){ return db.collection("users").doc(uid); }
  function startCloud(user){
    mode="cloud"; uid=user.uid; userName=user.displayName||"";
    data={spots:{},catches:{},trips:{},pos:{},area:null,groups:[],groupSpots:{}};
    unsubs.forEach(function(f){f();}); unsubs=[];
    ["spots","catches","trips","pos","groups","groupSpots"].forEach(emit);
    function col(name,key){ unsubs.push(u().collection(name).onSnapshot(function(q){ var m={}; q.forEach(function(d){ m[d.id]=d.data(); }); data[key]=m; emit(key); },function(e){ console.warn(e); })); }
    col("spots","spots"); col("catches","catches"); col("trips","trips"); col("spotpos","pos");
    unsubs.push(u().onSnapshot(function(d){ var x=d.exists?d.data():{}; data.area=x.area||null; data.groups=x.groups||[]; data.activeTrip=x.activeTrip||null; emit("area"); emit("groups"); emit("activeTrip"); watchGroups(); },function(e){ console.warn(e); }));
    emit("auth");
  }
  function stopCloud(){
    unsubs.forEach(function(f){f();}); unsubs=[]; Object.keys(groupUnsubs).forEach(function(c){groupUnsubs[c]();}); groupUnsubs={};
    mode="local"; uid=null; userName=""; loadLocal(); emit("auth");
  }
  function watchGroups(){
    var codes={}; data.groups.forEach(function(g){codes[g.code]=1;});
    Object.keys(groupUnsubs).forEach(function(c){ if(!codes[c]){ groupUnsubs[c](); delete groupUnsubs[c]; delete data.groupSpots[c]; } });
    data.groups.forEach(function(g){ if(groupUnsubs[g.code]) return;
      groupUnsubs[g.code]=db.collection("groups").doc(g.code).collection("spots").onSnapshot(function(q){
        data.groupSpots[g.code]=q.docs.map(function(d){ return Object.assign({},d.data(),{docId:d.id}); }); emit("groupSpots");
      },function(e){ console.warn(e); }); });
    emit("groupSpots");
  }
  function init(){
    loadLocal();
    var cfg=window.FIREBASE_CONFIG;
    if(!cfg||!cfg.apiKey){ emit("auth"); return Promise.resolve(false); }
    var v="10.12.2", base="https://www.gstatic.com/firebasejs/"+v+"/";
    return loadScript(base+"firebase-app-compat.js").then(function(){ return Promise.all([loadScript(base+"firebase-auth-compat.js"),loadScript(base+"firebase-firestore-compat.js")]); })
      .then(function(){
        fb=firebase.initializeApp(cfg); db=firebase.firestore();
        /* 電波が無くても書き込みを端末にため、つながったら自動で送る */
        try{ db.enablePersistence({synchronizeTabs:true}).catch(function(e){ console.warn("端末への保存を使えません",e); }); }catch(e){}
        firebase.auth().onAuthStateChanged(function(user){ if(user) startCloud(user); else if(mode==="cloud") stopCloud(); else emit("auth"); });
        firebase.auth().getRedirectResult().catch(function(){});
        return true;
      }).catch(function(e){ console.warn("Firebase を読み込めません",e); emit("auth"); return false; });
  }
  function signIn(){
    if(!fb) return Promise.reject(new Error("ログインの設定がまだです"));
    var p=new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(p).catch(function(e){
      if(e&&(e.code==="auth/popup-blocked"||e.code==="auth/operation-not-supported-in-this-environment")) return firebase.auth().signInWithRedirect(p);
      throw e; });
  }
  function signOut(){ return fb?firebase.auth().signOut():Promise.resolve(); }

  /* --- 書き込み(ローカル/クラウド共通) --- */
  function putLocal(k,id,v){ if(v==null) delete data[k][id]; else data[k][id]=v; lsSet(k,data[k]); emit(k); }
  function saveSpot(id,obj){ obj=clean(obj); if(cloudReady()) return fw(u().collection("spots").doc(id).set(obj)); putLocal("spots",id,obj); return Promise.resolve(); }
  function deleteSpot(id){
    if(cloudReady()){ data.groups.forEach(function(g){ db.collection("groups").doc(g.code).collection("spots").doc(uid+"_"+id).delete().catch(function(){}); });
      return u().collection("spots").doc(id).delete(); }
    putLocal("spots",id,null); return Promise.resolve(); }
  function savePos(id,ll){ if(cloudReady()) return fw(u().collection("spotpos").doc(id).set(ll)); putLocal("pos",id,ll); return Promise.resolve(); }
  function addCatch(rec){ rec=clean(rec); var id=newId(); if(cloudReady()) return fw(u().collection("catches").doc(id).set(rec),id); putLocal("catches",id,rec); return Promise.resolve(id); }
  /* 写真:縮めた JPEG を、ログイン時は Firestore の photos に、ログインなしは端末の IndexedDB に入れる */
  function idb(){ return new Promise(function(ok,ng){ try{ var r=indexedDB.open("en-photos",1); r.onupgradeneeded=function(){ r.result.createObjectStore("p"); }; r.onsuccess=function(){ ok(r.result); }; r.onerror=function(){ ng(r.error); }; }catch(e){ ng(e); } }); }
  function savePhoto(id,dataUrl){
    if(cloudReady()) return fw(u().collection("photos").doc(id).set({img:dataUrl,at:new Date().toISOString()}));
    return idb().then(function(d){ return new Promise(function(ok,ng){ var t=d.transaction("p","readwrite"); t.objectStore("p").put(dataUrl,id); t.oncomplete=function(){ok();}; t.onerror=function(){ng(t.error);}; }); });
  }
  function getPhoto(id){
    if(cloudReady()) return u().collection("photos").doc(id).get().then(function(d){ return d.exists?d.data().img:null; });
    return idb().then(function(d){ return new Promise(function(ok){ var q=d.transaction("p").objectStore("p").get(id); q.onsuccess=function(){ok(q.result||null);}; q.onerror=function(){ok(null);}; }); }).catch(function(){return null;});
  }
  function updateCatch(id,patch){ patch=clean(patch); if(cloudReady()) return fw(u().collection("catches").doc(id).set(patch,{merge:true})); var o=Object.assign({},data.catches[id]||{},patch); putLocal("catches",id,o); return Promise.resolve(); }
  function addTrip(rec){ rec=clean(rec); var id=rec.id||newId(); delete rec.id; if(cloudReady()) return fw(u().collection("trips").doc(id).set(rec),id); putLocal("trips",id,rec); return Promise.resolve(id); }
  function deleteTrip(id){ if(cloudReady()) return fw(u().collection("trips").doc(id).delete()); putLocal("trips",id,null); return Promise.resolve(); }
  function deleteCatch(id){ if(cloudReady()) return fw(u().collection("catches").doc(id).delete()); putLocal("catches",id,null); return Promise.resolve(); }
  function saveActiveTrip(t){ if(cloudReady()) return fw(u().set({activeTrip:t||null},{merge:true})); return Promise.resolve(); }
  function saveArea(a){ if(cloudReady()) return u().set({area:a},{merge:true}); data.area=a; lsSet("area",a); return Promise.resolve(); }

  /* --- 端末の記録をアカウントへ移す --- */
  function localCounts(){ var s=lsGet("spots",{}), c=lsGet("catches",{}), t=lsGet("trips",{}); return {spots:Object.keys(s).length,catches:Object.keys(c).length+Object.keys(t).length}; }
  function migrateLocal(){
    if(!cloudReady()) return Promise.reject(new Error("ログインしていません"));
    var s=lsGet("spots",{}), c=lsGet("catches",{}), tr=lsGet("trips",{}), p=lsGet("pos",{}), b=db.batch(), n=0;
    Object.keys(tr).forEach(function(id){ b.set(u().collection("trips").doc(id),tr[id]); n++; });
    Object.keys(s).forEach(function(id){ b.set(u().collection("spots").doc(id),s[id]); n++; });
    Object.keys(c).forEach(function(id){ b.set(u().collection("catches").doc(id),c[id]); n++; });
    Object.keys(p).forEach(function(id){ b.set(u().collection("spotpos").doc(id),p[id]); n++; });
    if(n>450) return Promise.reject(new Error("件数が多すぎます"));
    return b.commit().then(function(){ ["spots","catches","trips","pos"].forEach(function(k){ try{ localStorage.removeItem("en."+k); }catch(e){} }); return migratePhotos(); }).then(function(){ return n; });
  }
  function migratePhotos(){
    return idb().then(function(d){ return new Promise(function(ok){ var st=d.transaction("p").objectStore("p"), ks=st.getAllKeys(), vs=st.getAll();
      vs.onsuccess=function(){ ok({d:d,keys:ks.result||[],vals:vs.result||[]}); }; vs.onerror=function(){ ok(null); }; }); })
    .then(function(r){ if(!r||!r.keys.length) return;
      return Promise.all(r.keys.map(function(k,i){ return fw(u().collection("photos").doc(String(k)).set({img:r.vals[i],at:new Date().toISOString()})); }))
        .then(function(){ var t=r.d.transaction("p","readwrite"); t.objectStore("p").clear(); }); }).catch(function(e){ console.warn("写真を移せませんでした",e); });
  }

  /* --- 仲間グループ --- */
  function newCode(){ var a="abcdefghjkmnpqrstuvwxyz23456789", r=new Uint32Array(10), s=""; crypto.getRandomValues(r); for(var i=0;i<10;i++) s+=a[r[i]%a.length]; return s; }
  function saveGroups(list){ return u().set({groups:list},{merge:true}); }
  function createGroup(name){
    if(!cloudReady()) return Promise.reject(new Error("ログインが必要です"));
    var code=newCode(), g=db.collection("groups").doc(code);
    return g.set({name:name,createdBy:uid,createdAt:new Date().toISOString()})
      .then(function(){ return g.collection("members").doc(uid).set({name:userName,joinedAt:new Date().toISOString()}); })
      .then(function(){ return saveGroups(data.groups.concat([{code:code,name:name}])); }).then(function(){ return code; });
  }
  function joinGroup(code,alias){
    if(!cloudReady()) return Promise.reject(new Error("ログインが必要です"));
    var g=db.collection("groups").doc(code);
    return g.get().then(function(d){ if(!d.exists) throw new Error("そのコードのグループが見つかりません");
      return g.collection("members").doc(uid).set({name:userName,joinedAt:new Date().toISOString()}).then(function(){ return saveGroups(data.groups.concat([{code:code,name:alias||d.data().name||"仲間のグループ"}])); }); });
  }
  function leaveGroup(code){
    if(!cloudReady()) return Promise.resolve();
    var g=db.collection("groups").doc(code);
    var mine=(data.groupSpots[code]||[]).filter(function(x){return x.by===uid;});
    return Promise.all(mine.map(function(x){ return g.collection("spots").doc(x.docId).delete().catch(function(){}); }))
      .then(function(){ return g.collection("members").doc(uid).delete().catch(function(){}); })
      .then(function(){ return saveGroups(data.groups.filter(function(x){return x.code!==code;})); });
  }
  function shareSpot(code,s,on){
    if(!cloudReady()) return Promise.reject(new Error("ログインが必要です"));
    var ref=db.collection("groups").doc(code).collection("spots").doc(uid+"_"+s.id);
    if(!on) return ref.delete();
    var body={name:s.name,lat:s.lat,lng:s.lng,note:s.note||"",feat:s.feat||"",how:s.how||"",kind:s.kind||"",eging:s.eging||2,current:s.current||"normal",open:s.open||s._open||null,by:uid,byName:userName,sharedAt:new Date().toISOString()};
    return ref.set(clean(body));
  }

  return {init:init,on:on,get:get,signIn:signIn,signOut:signOut,
    saveSpot:saveSpot,deleteSpot:deleteSpot,savePos:savePos,addCatch:addCatch,saveActiveTrip:saveActiveTrip,addTrip:addTrip,deleteTrip:deleteTrip,savePhoto:savePhoto,getPhoto:getPhoto,updateCatch:updateCatch,deleteCatch:deleteCatch,saveArea:saveArea,
    localCounts:localCounts,migrateLocal:migrateLocal,createGroup:createGroup,joinGroup:joinGroup,leaveGroup:leaveGroup,shareSpot:shareSpot,
    get mode(){return mode;}, get uid(){return uid;}, get userName(){return userName;}, get configured(){return !!fb;}};
})();
