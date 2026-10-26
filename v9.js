// Beranda ala game: HUD level/XP + Daily Quest + menu ringkas (tanpa scroll).
(function(){
const $=id=>document.getElementById(id),KEY='nqv9',today=()=>new Date().toISOString().slice(0,10);
const Q=[{id:'fc',ic:'i-cards',t:'Nilai 10 flashcard',n:10,xp:30},{id:'qz',ic:'i-pencil',t:'Jawab 10 soal latihan',n:10,xp:40},{id:'kj',ic:'i-kanji',t:'Putar 5 kartu kanji',n:5,xp:20}];
let S=null;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||S.d!==today())S={xp:(S&&S.xp)||0,d:today(),p:{},done:[],bonus:false};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const lvl=x=>Math.floor(x/100)+1;
const app=document.querySelector('.app'),tt=document.createElement('div');tt.className='toast';app.appendChild(tt);
let tm;const toast=m=>{tt.textContent=m;tt.classList.add('on');clearTimeout(tm);tm=setTimeout(()=>tt.classList.remove('on'),2200)};
const RANK=[[1,'Rakyat Biasa'],[2,'Murid Akademi'],[3,'Calon Ksatria'],[4,'Ksatria Sihir'],[6,'Kapten Skuad'],[9,'Raja Penyihir']];
const rank=l=>RANK.filter(r=>l>=r[0]).pop()[1];
const ico=n=>`<svg class="i" viewBox="0 0 24 24"><use href="#${n}"/></svg>`;
$('home').innerHTML=`<div class="bchero"><svg class="wm" viewBox="0 0 60 60"><use href="#clover"/></svg><div class="kan">魔</div><svg class="sw blade blade2" viewBox="0 0 40 200"><use href="#sword"/></svg><svg class="sw blade" viewBox="0 0 40 200"><use href="#sword"/></svg>
<div class="kick">魔法騎士団 · Magic Knights</div><h2>Jadilah <em>Raja Penyihir</em> Bahasa Jepang</h2><p>Kumpulkan mana, selesaikan misi, kuasai grimoire Nihongo.</p>
<div class="hud"><div class="lvl">LV <span id="hlv">1</span></div><div class="xpw"><div class="rk"><span id="hrank"></span><small id="hxpt"></small></div><div class="xpbar"><span id="hxp"></span></div></div></div></div>
<div class="sec"><h3>Misi Harian</h3><small id="dqt"></small></div>
<div class="dq">${Q.map(q=>`<div class="dqr" id="dq_${q.id}"><span class="ic">${ico(q.ic)}</span><div class="tx"><div>${q.t}</div><div class="pb"><span></span></div></div><div class="rw"></div></div>`).join('')}</div>
<div class="slash"><svg class="sw" viewBox="0 0 40 200"><use href="#sword"/></svg></div><div class="sec"><h3>Pilih Jalur</h3></div>
<div class="gm"><button onclick="go('materi')"><span>${ico('i-book')}</span>Materi</button><button onclick="go('flashcard')"><span>${ico('i-cards')}</span>Flashcard</button><button onclick="go('latihan')"><span>${ico('i-pencil')}</span>Latihan</button><button onclick="go('kaiwa')"><span>${ico('i-chat')}</span>Kaiwa</button><button onclick="go('kanji')" class="jp"><span>漢</span>Kanji</button><button onclick="go('kotoba')"><span>${ico('i-list')}</span>Kotoba</button><button onclick="go('bunpou')" class="jp"><span>文</span>Bunpou</button><button onclick="go('cerita')"><span>${ico('i-book')}</span>Cerita</button><button onclick="go('konjugasi')"><span>${ico('i-flame')}</span>Kata Kerja</button></div>
<button class="btn wide" onclick="go('flashcard')">▶ Mulai Berlatih</button>`;
function render(){if(!$('hlv'))return;$('hlv').textContent=lvl(S.xp);$('hrank').textContent=rank(lvl(S.xp));const r=S.xp%100;$('hxp').style.width=r+'%';$('hxpt').textContent=r+' / 100 mana';
Q.forEach(q=>{const row=$('dq_'+q.id),p=Math.min(S.p[q.id]||0,q.n),d=S.done.includes(q.id);row.classList.toggle('ok',d);row.querySelector('.pb span').style.width=p/q.n*100+'%';row.querySelector('.rw').innerHTML=d?ico('i-check'):p+'/'+q.n+' · +'+q.xp+' XP'});
$('dqt').textContent=S.done.length+'/'+Q.length+(S.bonus?' 🏆':'')}
function gain(n){const a=lvl(S.xp);S.xp+=n;save();render();if(lvl(S.xp)>a)setTimeout(()=>toast('⬆️ Naik ke Level '+lvl(S.xp)+'!'),a?300:0)}
function bump(id){const q=Q.find(x=>x.id===id);if(!q||S.done.includes(id))return;S.p[id]=(S.p[id]||0)+1;
if(S.p[id]>=q.n){S.done.push(id);gain(q.xp);toast('🎉 Quest selesai! +'+q.xp+' XP');
if(S.done.length===Q.length&&!S.bonus){S.bonus=true;gain(50);setTimeout(()=>toast('🏆 Semua quest selesai! Bonus +50 XP'),2400)}}save();render()}
const _r=window.rateCard;window.rateCard=function(k){_r(k);gain(k?5:2);bump('fc')};
const _c=window.checkQ;window.checkQ=function(){const ok=!answered&&qsel>=0&&qlist&&qlist[qi]&&qsel===qlist[qi].a,was=answered;_c();if(!was&&answered){gain(ok?10:2);bump('qz')}};
const _k=window.checkKaiwa;window.checkKaiwa=async function(){const has=$('kaiwaanswer').value.trim();await _k();if(has&&!/Belum berhasil/.test($('kaiwafeedback').textContent))gain(15)};
document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('.fcard');if(c&&c.classList.contains('on')){gain(1);bump('kj')}});
render();
})();
