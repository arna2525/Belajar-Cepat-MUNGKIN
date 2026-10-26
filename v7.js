(function(){
const W=window.NQ_WORDS||[],K=window.NQ_KANJIS||[],C=window.NQ_CHAPTERS||[];
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KJ=/[\u4e00-\u9fff]/;

// Materi: daftar bab -> halaman detail
window.renderChapters=function(){const s=($('chaptersearch')?.value||'').toLowerCase();
$('chapterlist').innerHTML=C.filter(c=>(s||Math.floor((c.bab-1)/10)===cr)&&('bab '+c.bab+' '+c.judul+' '+c.pola.join(' ')).toLowerCase().includes(s)).map(c=>`<div class="word chapter" onclick="openChapter(${c.bab})"><div class="glyph">${c.bab}</div><div style="flex:1"><h4>Bab ${c.bab} · ${esc(c.judul)}</h4><p>${c.pola.length} pola belajar</p></div><span class="tag">›</span></div>`).join('')||'<p class="notice">Bab tidak ditemukan.</p>'};
const sec=document.createElement('section');sec.id='chapterdetail';sec.className='page';$('materi').after(sec);
const fmt=t=>esc(t).replace(/\n/g,'<br>');
window.openChapter=function(n){const c=C.find(x=>x.bab===n);if(!c)return;sec.dataset.bab=n;
sec.innerHTML=`<div class="subhead"><button class="back" onclick="go('materi')">←</button><div><h2>Bab ${c.bab}</h2><p>${esc(c.judul)}</p></div></div>`+c.pola.map((p,i)=>`<div class="pattern"><b>${i+1}. ${furi(p)}</b></div>`).join('')+`<div class="card"><b>📝 Contoh kalimat</b><div id="exbox" class="exbox">Memuat contoh…</div><button class="btn light wide" onclick="loadEx(${n},true)">🔄 Contoh lain</button></div><button class="btn wide" style="margin-top:10px" onclick="startQuiz('kotoba')">✏️ Mulai Quiz</button>`;
go('chapterdetail');loadEx(n)};
window.loadEx=async function(n,force){const c=C.find(x=>x.bab===n),key='nqex'+n,box=()=>sec.dataset.bab==n&&$('exbox');
try{const v=!force&&localStorage.getItem(key);if(v){box().innerHTML=fmt(v);return}}catch(e){}
if(box())box().textContent='Sensei sedang menyiapkan contoh… ⏳';
try{const r=await fetch('/.netlify/functions/kaiwa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'contoh',bab:n,judul:c.judul,pola:c.pola})});
const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Gagal memuat contoh.');
try{localStorage.setItem(key,d.reply)}catch(e){}if(box())box().innerHTML=fmt(d.reply)}catch(e){if(box())box().textContent=e instanceof TypeError?'Contoh kalimat baru muncul setelah situs di-deploy di Netlify.':e.message}};

// Latihan: pilih kategori kotoba + tombol quiz
var qcat='Semua';
const cats=['Semua','Kata benda','Kata kerja','Sifat い','Sifat な'];
const cp=document.createElement('div');cp.className='pills';cp.id='qcat';
cp.innerHTML=cats.map((c,i)=>`<button class="pill${i?'':' active'}" onclick="setCat('${c}',this)">${c}</button>`).join('');$('qpills').after(cp);
window.setCat=function(c,b){qcat=c;document.querySelectorAll('#qcat .pill').forEach(x=>x.classList.toggle('active',x===b));newQuiz();renderQ()};
window.newQuiz=function(){const src=qmode==='kanji'?K.map(k=>[k[0],k[2]]):W.filter(w=>qcat==='Semua'||w[3]===qcat).map(w=>[w[0],w[2]]);
const pool=src.length>6?src:W.map(w=>[w[0],w[2]]),sh=a=>a.slice().sort(()=>Math.random()-.5);
qlist=sh(src).slice(0,10).map(q=>{const wr=[];let n=0;while(wr.length<3&&n++<80){const r=pool[Math.floor(Math.random()*pool.length)][1];if(r!==q[1]&&!wr.includes(r))wr.push(r)}const o=sh(wr.concat([q[1]]));return{t:q[0],o,a:o.indexOf(q[1])}});qi=0};
const _sq=window.setQ;window.setQ=function(m,b){_sq(m,b);cp.style.display=m==='kanji'?'none':''};
window.startQuiz=function(m){go('latihan');setQ(m,document.querySelector('#qpills .pill:'+(m==='kanji'?'last-child':'first-child')))};

// Kanji: kartu berputar (belakang = bacaan hiragana), urut dasar -> rumit
window.renderKanji=function(){const s=($('kanjisearch')?.value||'').toLowerCase();
$('kanjilist').innerHTML='<button class="btn wide" onclick="startQuiz(\'kanji\')">✏️ Quiz Kanji</button><p class="notice">Urut dari kanji dasar ke rumit. Ketuk kartu untuk memutar 🔄</p><div class="kgrid">'+K.filter(k=>(k[0]+k[1]+k[2]+k[3]).toLowerCase().includes(s)).map(k=>`<div class="fcard" onclick="this.classList.toggle('on')"><div class="fin"><div class="ff"><small class="lv">${k[4]||''}</small><span class="kk">${k[0]}</span></div><div class="fb"><b>${esc(k[1])}</b><span>${esc(k[2])}</span><small>${esc(k[3])}</small></div></div></div>`).join('')+'</div>'};

// Flashcard: animasi memutar saat dibalik
const _fc=window.flipCard;window.flipCard=function(){const f=document.querySelector('#flashcard .flash');f.classList.remove('spin');void f.offsetWidth;f.classList.add('spin');setTimeout(_fc,220)};
})();
