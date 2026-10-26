// Halaman Bunpou: 89 pola tata bahasa yang sering dipakai + contoh + animasi (data: data/bunpou.js).
(function(){
const B=window.NQ_BUNPOU||[],$=id=>document.getElementById(id),KEY='nqbp';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fu=t=>{try{return window.furi?window.furi(t):esc(t)}catch(e){return esc(t)}};
let done=[];try{done=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(done))}catch(e){}};
const cats=['Semua'].concat([...new Set(B.map(b=>b.c))]);
let cat='Semua',cur=0;
const ico=n=>`<svg class="i" viewBox="0 0 24 24"><use href="#${n}"/></svg>`;

const list=document.createElement('section');list.id='bunpou';list.className='page';
list.innerHTML=`<div class="subhead"><button class="back" onclick="go('home')">←</button><div><h2>Bunpou</h2><p>89 pola tata bahasa</p></div></div>
<div class="bpstat"><div><b id="bpdone">0</b><small> / ${B.length} sudah paham</small></div><div class="progress"><span id="bpbar"></span></div></div>
<input class="search" id="bpsearch" placeholder="🔎 Cari pola atau arti..." oninput="renderBunpou()">
<div class="pills" id="bpcats">${cats.map((c,i)=>`<button class="pill${i?'':' active'}" onclick="bpCat(${i},this)">${c}</button>`).join('')}</div>
<div id="bplist"></div><p class="notice">Pola dipilih dari yang paling sering dipakai. Ketuk pola untuk melihat rumus, contoh, dan animasinya.</p>`;
const det=document.createElement('section');det.id='bunpoudetail';det.className='page';
$('materi').after(list);list.after(det);

window.bpCat=function(i,b){cat=cats[i];document.querySelectorAll('#bpcats .pill').forEach(x=>x.classList.toggle('active',x===b));renderBunpou()};
window.renderBunpou=function(){
 const s=($('bpsearch')?.value||'').toLowerCase();let n=0;
 $('bplist').innerHTML=B.map((b,i)=>[b,i]).filter(([b])=>(cat==='Semua'||b.c===cat)&&(b.p+b.f+b.e[1]+b.e[0]).toLowerCase().includes(s)).map(([b,i])=>
 `<div class="word bgi${done.includes(i)?' ok':''}" style="--i:${Math.min(n++,14)}" onclick="openBunpou(${i})"><div class="glyph bpn">${done.includes(i)?ico('i-check'):i+1}</div><div style="flex:1;min-width:0"><h4>${fu(b.p)}</h4><p>${esc(b.f)}</p></div><span class="tag">${esc(b.c.split(' ')[0])}</span></div>`).join('')||'<p class="notice">Pola tidak ditemukan.</p>';
 $('bpdone').textContent=done.length;$('bpbar').style.width=done.length/B.length*100+'%'};

function chips(r){return r.split(' + ').map((t,k)=>(k?`<span class="plus" style="--k:${k*2-1}">+</span>`:'')+`<span class="chip" style="--k:${k*2}">${fu(t)}</span>`).join('')}
function ex(e,k,n){return `<div class="bex" style="--d:${k}" onclick="this.classList.toggle('on')"><span class="exn">Contoh ${n}</span><div class="jp">${fu(e[0])}</div><div class="idn"><span>${esc(e[1])}</span></div><small class="tap">ketuk untuk melihat arti</small></div>`}
window.openBunpou=function(i,dir){if(i<0||i>=B.length)return;cur=i;const b=B[i];
 det.innerHTML=`<div class="subhead"><button class="back" onclick="go('bunpou')">←</button><div><h2>Pola ${i+1}</h2><p>${esc(b.c)}</p></div></div>
<div class="bpcard ${dir||''}"><div class="bptitle"><span>${fu(b.p)}</span></div><div class="bpf">${esc(b.f)}</div></div>
<div class="sec"><h3>Rumus</h3></div><div class="formula">${chips(b.r)}</div>
<div class="sec"><h3>Contoh kalimat</h3></div>${ex(b.e,0,1)}${ex(b.e2,1,2)}
<div class="bnote"><b>Catatan</b><p>${fu(b.n)}</p></div>
<div class="bpact"><button class="btn light" onclick="openBunpou(${i},'');">↻ Ulangi animasi</button><button class="btn ${done.includes(i)?'light':''}" onclick="bpDone(${i})">${done.includes(i)?'✓ Sudah paham':'Tandai paham'}</button></div>
<div class="bpnav"><button class="btn light" ${i?'':'disabled'} onclick="openBunpou(${i-1},'fromL')">‹ Sebelumnya</button><span>${i+1} / ${B.length}</span><button class="btn light" ${i<B.length-1?'':'disabled'} onclick="openBunpou(${i+1},'fromR')">Berikutnya ›</button></div>`;
 if(!$('bunpoudetail').classList.contains('active'))go('bunpoudetail');else det.scrollTop=0};
window.bpDone=function(i){const k=done.indexOf(i);if(k<0)done.push(i);else done.splice(k,1);save();openBunpou(i,'still')};

const g=window.go;window.go=function(id,b){g(id,b);if(id==='bunpou')renderBunpou()};
renderBunpou();
})();
