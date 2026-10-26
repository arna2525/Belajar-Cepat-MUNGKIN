// Halaman Kanji baru: level N5/N4/N3+, jadwal harian 15 kanji, tabel berkolom (kanji | bacaan | arti | bushu), dan kelompok bushu.
(function(){
const K=window.NQ_KANJIS||[],BU=window.NQ_BUSHU||{},BN=window.NQ_BUSHUNAME||{},$=id=>document.getElementById(id),PER=15,KEY='nqkj';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let hafal=[];try{hafal=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(hafal))}catch(e){}};
const LV=['N5','N4','N3+'];
let lv='N5',mode='path',day=null,view='table';
const by=l=>K.filter(k=>k[4]===l);
const days=l=>{const a=by(l),r=[];for(let i=0;i<a.length;i+=PER)r.push(a.slice(i,i+PER));return r};
const rad=k=>BU[k[0]]?`<span class="bu"><b>${BU[k[0]]}</b><small>${esc((BN[BU[k[0]]]||[''])[0])}</small></span>`:'<span class="bu"><small>–</small></span>';
const row=k=>`<div class="krow"><div class="kc kk1">${k[0]}</div><div class="kc kk2">${esc(k[1])}<small>${esc(k[3])}</small></div><div class="kc kk3">${esc(k[2])}</div><div class="kc kk4">${rad(k)}</div><button class="kchk${hafal.includes(k[0])?' on':''}" onclick="kjTog('${k[0]}',this)" aria-label="hafal"><svg class="i" viewBox="0 0 24 24"><use href="#i-check"/></svg></button></div>`;
const card=k=>`<div class="fcard" onclick="this.classList.toggle('on')"><div class="fin"><div class="ff"><small class="lv">${k[4]||''}</small><span class="kk">${k[0]}</span></div><div class="fb"><b>${esc(k[1])}</b><span>${esc(k[2])}</span><small>${esc(k[3])}</small></div></div></div>`;
const head='<div class="khead"><div>Kanji</div><div>Bacaan · contoh</div><div>Arti</div><div>Bushu</div><div></div></div>';
const done=a=>a.filter(k=>hafal.includes(k[0])).length;

window.kjTog=function(k,b){const i=hafal.indexOf(k);if(i<0){hafal.push(k);b.classList.add('on')}else{hafal.splice(i,1);b.classList.remove('on')}save();const p=document.getElementById('kjprog');if(p&&day!==null){const a=days(lv)[day];p.textContent=done(a)+' / '+a.length}};
window.kjLv=function(l){lv=l;day=null;if(l==='N3+'&&mode==='bushu')mode='plan';renderKanji()};
window.kjMode=function(m){mode=m;day=null;renderKanji()};
window.kjDay=function(i){day=i;renderKanji();$('kanji').scrollTop=0};
window.kjView=function(v){view=v;renderKanji()};

window.renderKanji=function(){
 const q=($('kanjisearch')?.value||'').trim().toLowerCase(),el=$('kanjilist');
 const bar=mode==='path'?'':`<div class="pills">${LV.map(l=>`<button class="pill${l===lv?' active':''}" onclick="kjLv('${l}')">${l} · ${by(l).length}</button>`).join('')}</div>`;
 if(q){const r=K.filter(k=>(k[0]+k[1]+k[2]+k[3]).toLowerCase().includes(q));
  el.innerHTML=`<div class="ktable">${head}${r.map(row).join('')||'<p class="notice">Kanji tidak ditemukan.</p>'}</div>`;return}
 const modes=[['path','Jalur N5→N4'],['plan','Harian · 15/hari'],['bushu','Bushu'],['all','Semua']].filter(m=>!(m[0]==='bushu'&&lv==='N3+'));
 const mb=`<div class="pills">${modes.map(m=>`<button class="pill${m[0]===mode?' active':''}" onclick="kjMode('${m[0]}')">${m[1]}</button>`).join('')}</div>`;
 const D=days(lv);let h=bar+mb;
 if(mode==='path'){h+=window.NQJ?NQJ.html():''}else if(mode==='plan'&&day!==null&&D[day]){const a=D[day];
  h+=`<div class="kdayh"><button class="back" onclick="kjDay(null)">←</button><div><h3>Hari ${day+1} <small>· ${lv}</small></h3><span class="muted">Hafal: <b id="kjprog">${done(a)} / ${a.length}</b></span></div><div class="kview"><button class="${view==='table'?'on':''}" onclick="kjView('table')">Tabel</button><button class="${view==='card'?'on':''}" onclick="kjView('card')">Kartu</button></div></div>`;
  h+=view==='table'?`<div class="ktable">${head}${a.map(row).join('')}</div><p class="notice">Ketuk ✓ untuk menandai kanji yang sudah hafal.</p>`:`<div class="kgrid">${a.map(card).join('')}</div><p class="notice">Ketuk kartu untuk memutar 🔄</p>`;
  h+=`<div class="bpnav"><button class="btn light" ${day?'':'disabled'} onclick="kjDay(${day-1})">‹ Hari ${day}</button><span></span><button class="btn light" ${day<D.length-1?'':'disabled'} onclick="kjDay(${day+1})">Hari ${day+2} ›</button></div>`;
 }else if(mode==='plan'){
  h+=`<div class="bpstat"><div><b>${D.length}</b><small> hari · ${PER} kanji per hari · ${by(lv).length} kanji</small></div><div class="progress"><span style="width:${done(by(lv))/by(lv).length*100}%"></span></div></div>`;
  h+=D.map((a,i)=>`<div class="word bgi kday${done(a)===a.length?' ok':''}" style="--i:${Math.min(i,14)}" onclick="kjDay(${i})"><div class="glyph bpn">${done(a)===a.length?'<svg class="i" viewBox="0 0 24 24"><use href="#i-check"/></svg>':i+1}</div><div style="flex:1;min-width:0"><h4>Hari ${i+1}</h4><p class="kprev">${a.map(k=>k[0]).join('')}</p></div><span class="tag">${done(a)}/${a.length}</span></div>`).join('');
 }else if(mode==='bushu'){
  const g={};by(lv).forEach(k=>(g[BU[k[0]]||'?']=g[BU[k[0]]||'?']||[]).push(k));
  h+=Object.keys(g).sort((a,b)=>g[b].length-g[a].length).map((r,i)=>{const n=BN[r]||['',''];
   return `<div class="bgrp bgi" style="--i:${Math.min(i,14)}"><div class="bgh"><span class="bgc">${r}</span><div><b>${esc(n[0])}</b><small>${esc(n[1])}</small></div><span class="tag">${g[r].length}</span></div><div class="bgk">${g[r].map(k=>`<button class="bgb${hafal.includes(k[0])?' on':''}" onclick="kjOne('${k[0]}')"><span>${k[0]}</span><small>${esc(k[2].split(/[;/]/)[0])}</small></button>`).join('')}</div></div>`}).join('');
 }else{
  h+=`<div class="ktable">${head}${by(lv).map(row).join('')}</div>`;
 }
 el.innerHTML=h};
window.kjOne=function(c){const k=K.find(x=>x[0]===c);if(!k)return;$('kanjisearch').value=c;renderKanji();$('kanjisearch').value=''};
})();
