// Modul Cerita: baca dongeng/cerpen dengan 3 tampilan teks (asli, bantuan hiragana, latihan katakana) + romaji opsional,
// terjemahan, kosakata, kanji yang dipakai, kuis pemahaman & kuis kosakata, progres, favorit, riwayat. Data: data/stories.js
(function(){
const ST=window.NQ_STORIES||[],K=window.NQ_KANJIS||[],$=id=>document.getElementById(id),KEY='nqst';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S={v:1,mode:'asli',ro:false,tr:true,last:null,fav:[],done:[],pos:{},voc:{},quiz:{},hist:[],wrong:{}};
try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&r.v)S=Object.assign(S,r)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const kata=s=>s.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60));
const KJ=/[一-鿿]/;
// kompilasi markup -> HTML sesuai mode
function render(t,mode){
 return esc(t).replace(/([一-鿿々]+)\[([^\]]+)\]|《([^》]+)》/g,(m,k,r,w)=>{
  if(k){if(mode==='asli')return k;return `<ruby>${k}<rt>${mode==='kata'?kata(r):r}</rt></ruby>`}
  return mode==='kata'?`<span class="kt">${kata(w)}</span>`:w})}
const plain=t=>t.replace(/([一-鿿々]+)\[([^\]]+)\]/g,'$1').replace(/《([^》]+)》/g,'$1');
const kanjiOf=st=>{const o=[],seen={};st.s.forEach(x=>{(x.t.match(/([一-鿿々]+)\[([^\]]+)\]/g)||[]).forEach(m=>{const mm=m.match(/^(.+)\[(.+)\]$/);[...mm[1]].forEach(c=>{if(!seen[c]&&KJ.test(c)){seen[c]=1;o.push(c)}})})});return o};
const info={};K.forEach(k=>info[k[0]]=k);

// ---------- halaman daftar ----------
const list=document.createElement('section');list.id='cerita';list.className='page';
const rd=document.createElement('section');rd.id='ceritadetail';rd.className='page';
$('materi').after(list);list.after(rd);
window.renderCerita=function(){
 const nd=S.done.length;
 list.innerHTML=`<div class="subhead"><button class="back" onclick="go('home')">←</button><div><h2>Cerita</h2><p>Latihan membaca</p></div></div>
<div class="bpstat"><div><b>${nd}</b><small> / ${ST.length} cerita selesai dibaca</small></div><div class="progress"><span style="width:${nd/ST.length*100}%"></span></div></div>
${S.last&&ST.find(x=>x.id===S.last)?`<button class="btn wide" onclick="openCerita('${S.last}')">▶ Lanjutkan: ${esc(plain(ST.find(x=>x.id===S.last).jp))}</button>`:''}
<div class="sec" style="margin-top:12px"><h3>Daftar cerita</h3></div>
${ST.map((s,i)=>`<div class="word bgi cs" style="--i:${i}" onclick="openCerita('${s.id}')"><div class="glyph bpn">${S.done.includes(s.id)?'<svg class="i" viewBox="0 0 24 24"><use href="#i-check"/></svg>':'📖'}</div><div style="flex:1;min-width:0"><h4>${render(s.jp,'hira')}</h4><p>${esc(s.idn)}</p><span class="muted">${esc(s.tema)} · ${esc(s.level)} · ${s.s.length} kalimat</span></div><button class="fav${S.fav.includes(s.id)?' on':''}" onclick="event.stopPropagation();csFav('${s.id}')" aria-label="Favorit">★</button></div>`).join('')}
${S.hist.length?`<div class="sec" style="margin-top:12px"><h3>Riwayat baca</h3></div><p class="notice" style="text-align:left">${S.hist.slice(-5).reverse().map(id=>{const s=ST.find(x=>x.id===id);return s?esc(plain(s.jp)):''}).join(' → ')}</p>`:''}
<p class="notice">Cerita ditulis ulang/dibuat oleh penulis aplikasi (konten orisinal). Audio belum tersedia karena belum ada sumber audio yang sah.</p>`};
window.csFav=function(id){const i=S.fav.indexOf(id);if(i<0)S.fav.push(id);else S.fav.splice(i,1);save();renderCerita()};

// ---------- pembaca ----------
let cur=null,tmr;
window.openCerita=function(id){const s=ST.find(x=>x.id===id);if(!s)return;cur=s;S.last=id;if(!S.hist.length||S.hist[S.hist.length-1]!==id)S.hist.push(id);S.hist=S.hist.slice(-20);save();drawReader();go('ceritadetail');rd.scrollTop=S.pos[id]||0};
function drawReader(){const s=cur,seg=(m,l)=>`<button class="${S.mode===m?'on':''}" onclick="csMode('${m}')">${l}</button>`;
 const kj=kanjiOf(s),vk=S.voc[s.id]||[];
 rd.innerHTML=`<div class="subhead"><button class="back" onclick="go('cerita');renderCerita()">←</button><div><h2 class="csh">${render(s.jp,'hira')}</h2><p>${esc(s.idn)}</p></div></div>
<div class="cstool"><div class="seg">${seg('asli','Teks asli')}${seg('hira','Bantuan hiragana')}${seg('kata','Latihan katakana')}</div>
<div class="tg"><label><input type="checkbox" ${S.ro?'checked':''} onchange="csRo(this.checked)"> Tampilkan romaji</label><label><input type="checkbox" ${S.tr?'checked':''} onchange="csTr(this.checked)"> Tampilkan terjemahan</label><button class="mini" onclick="csMode('asli')">↺ Kembali ke teks asli</button></div></div>
${S.mode==='kata'?'<div class="hero-mini"><p><b>Mode latihan:</b> sebagian kata berhuruf kana diubah ke katakana hanya untuk melatih membaca katakana, dan bacaan kanji ditulis dengan katakana. Ini <b>bukan</b> cara penulisan standar Jepang. Partikel dan akhiran kata tidak diubah.</p></div>':''}
${S.mode==='hira'?'<div class="hero-mini"><p>Bacaan hiragana ditampilkan di atas kanji.</p></div>':''}
<div class="csbody">${s.s.map((x,i)=>`<div class="cssent" onclick="this.classList.toggle('tr')"><span class="no">${i+1}</span><div class="jpl">${render(x.t,S.mode)}</div>${S.ro?`<div class="rom">${esc(x.ro)}</div>`:''}<div class="idl"${S.tr?'':' style="display:none"'}>${esc(x.id)}</div></div>`).join('')}</div>
<p class="notice">Ketuk kalimat untuk membuka/menutup terjemahannya.</p>
<div class="sec"><h3>Kosakata penting</h3></div>
<div class="csvoc">${s.vocab.map((v,i)=>`<div class="cv${vk.includes(i)?' ok':''}${S.wrong[s.id+':'+i]?' bad':''}" onclick="csVoc(${i})"><b>${esc(v[0])}</b><span>${esc(v[1])}</span><em>${esc(v[2])}</em><i>${vk.includes(i)?'✓ dipelajari':S.wrong[s.id+':'+i]?'⚠ perlu diulang':'ketuk bila sudah hafal'}</i></div>`).join('')}</div>
<div class="sec"><h3>Kanji yang dipakai</h3></div>
<div class="cskj">${kj.map(c=>`<div class="ck"><span>${c}</span><small>${info[c]?esc(info[c][2].split(/[;/]/)[0]):'—'}</small></div>`).join('')}</div>
<div class="hero-mini" style="margin-top:12px"><p><b>Sumber & lisensi:</b> ${esc(s.sumber)} <b>Lisensi:</b> ${esc(s.lisensi)}.</p></div>
<div class="sec"><h3>Latihan setelah membaca</h3></div>
<div class="bpact"><button class="btn" onclick="csQuiz('comp')">📝 Kuis pemahaman</button><button class="btn" onclick="csQuiz('voc')">🔤 Kuis kosakata</button></div>
${(S.quiz[s.id]||{}).comp?`<p class="notice">Skor terakhir pemahaman: ${S.quiz[s.id].comp[0]}/${S.quiz[s.id].comp[1]}${S.quiz[s.id].voc?` · kosakata: ${S.quiz[s.id].voc[0]}/${S.quiz[s.id].voc[1]}`:''}</p>`:''}
<div class="bpact" style="margin-top:8px"><button class="btn light" onclick="csDone()">${S.done.includes(s.id)?'✓ Sudah dibaca (ketuk untuk batalkan)':'Tandai selesai dibaca'}</button></div>
${(()=>{const i=ST.findIndex(x=>x.id===s.id),n=ST[i+1];return n?`<button class="btn wide" style="margin-top:10px" onclick="openCerita('${n.id}')">Cerita berikutnya ›</button>`:''})()}`}
function redraw(){const y=rd.scrollTop;drawReader();rd.scrollTop=y}
window.csMode=m=>{S.mode=m;save();redraw()};
window.csRo=v=>{S.ro=v;save();redraw()};
window.csTr=v=>{S.tr=v;save();redraw()};
window.csVoc=i=>{const a=S.voc[cur.id]=S.voc[cur.id]||[],k=a.indexOf(i);if(k<0){a.push(i);delete S.wrong[cur.id+':'+i]}else a.splice(k,1);save();redraw()};
window.csDone=()=>{const k=S.done.indexOf(cur.id);if(k<0)S.done.push(cur.id);else S.done.splice(k,1);save();redraw()};
rd.addEventListener('scroll',()=>{if(!cur||!rd.classList.contains('active'))return;clearTimeout(tmr);tmr=setTimeout(()=>{S.pos[cur.id]=rd.scrollTop;save()},300)});

// ---------- kuis ----------
const qz=document.createElement('section');qz.id='ceritaquiz';qz.className='page';rd.after(qz);
let Q=null;
const sh=a=>a.slice().sort(()=>Math.random()-.5);
window.csQuiz=function(kind){const s=cur;let qs;
 if(kind==='comp')qs=sh(s.quiz).map(q=>{const o=q.o.map((t,i)=>({t,ok:i===q.a}));return {q:q.q,o:sh(o),e:q.e}});
 else{const V=s.vocab;qs=sh(V.map((v,i)=>i)).slice(0,Math.min(6,V.length)).map(i=>{const v=V[i],wr=sh(V.filter((x,j)=>j!==i&&x[2]!==v[2])).slice(0,3);
   return {q:`Apa arti 「${v[0]}」(${v[1]})?`,o:sh([{t:v[2],ok:true}].concat(wr.map(w=>({t:w[2],ok:false})))),e:`${v[0]}（${v[1]}）= ${v[2]}`,vi:i}})}
 Q={kind,qs,i:0,sc:0,ans:false,t0:Date.now()};drawQ();go('ceritaquiz')};
function drawQ(){const q=Q.qs[Q.i];
 qz.innerHTML=`<div class="subhead"><button class="back" onclick="csQuit()">←</button><div><h2>${Q.kind==='comp'?'Kuis pemahaman':'Kuis kosakata'}</h2><p>${esc(plain(cur.jp))}</p></div></div>
<div class="bpstat"><div><b>${Q.i+1}</b><small> / ${Q.qs.length} soal · skor ${Q.sc}</small></div><div class="progress"><span style="width:${Q.i/Q.qs.length*100}%"></span></div></div>
<div class="hero-mini"><h3>${esc(q.q)}</h3></div>
<div>${q.o.map((o,j)=>`<button class="quizopt" onclick="csAns(${j},this)">${esc(o.t)}</button>`).join('')}</div><div id="csfb"></div>`}
window.csAns=function(j,btn){if(Q.ans)return;Q.ans=true;const q=Q.qs[Q.i],ok=q.o[j].ok;if(ok)Q.sc++;
 document.querySelectorAll('#ceritaquiz .quizopt').forEach((b,x)=>{b.disabled=true;if(q.o[x].ok)b.classList.add('ok');else if(x===j)b.classList.add('bad')});
 if(q.vi!==undefined){if(ok){const a=S.voc[cur.id]=S.voc[cur.id]||[];if(!a.includes(q.vi))a.push(q.vi);delete S.wrong[cur.id+':'+q.vi]}else{S.wrong[cur.id+':'+q.vi]=1;const a=S.voc[cur.id]||[],k=a.indexOf(q.vi);if(k>=0)a.splice(k,1)}save()}
 $('csfb').innerHTML=`<div class="hero-mini" style="background:${ok?'#e8f8f0':'#fff0f4'}"><b>${ok?'🎉 Benar!':'🌱 Belum tepat'}</b><p>${esc(q.e)}</p></div><button class="btn wide" onclick="csNext()">${Q.i<Q.qs.length-1?'Soal berikutnya →':'Lihat hasil'}</button>`};
window.csNext=function(){Q.i++;Q.ans=false;if(Q.i<Q.qs.length)drawQ();else{const n=Q.qs.length,sc=Q.sc,sec=Math.round((Date.now()-Q.t0)/1000),acc=Math.round(sc/n*100);
 S.quiz[cur.id]=S.quiz[cur.id]||{};S.quiz[cur.id][Q.kind]=[sc,n];save();
 qz.innerHTML=`<div class="subhead"><button class="back" onclick="csQuit()">←</button><div><h2>Hasil</h2></div></div><div class="jbig"><div class="bigk" style="font-size:70px">${acc>=80?'🎉':acc>=50?'👍':'🌱'}</div><h3>Skor ${sc} / ${n}</h3><div class="jread">Akurasi ${acc}% · Waktu ${sec} detik</div></div>
 <div class="bpact"><button class="btn" onclick="csQuiz('${Q.kind}')">↻ Ulangi</button><button class="btn light" onclick="csQuit()">Kembali ke cerita</button></div>`}};
window.csQuit=function(){go('ceritadetail');redraw()};

const g=window.go;window.go=function(id,b){g(id,b);if(id==='cerita')renderCerita()};
renderCerita();
})();
