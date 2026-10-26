// Furigana dari kamus kotoba aplikasi: kanji + okurigana (食べます -> 食[た]べます), tanpa menyalin teks buku.
(function(){
const W=window.NQ_WORDS||[],KJ=/[\u4e00-\u9fff]/,HI=/[\u3041-\u309f]/;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const extra={'一方':'いっぽう','他動詞':'たどうし','自動詞':'じどうし','位置語':'いちご','使役受身':'しえきうけみ','使役形':'しえきけい','切替':'きりかえ','受身形':'うけみけい','受身':'うけみ','可能形':'かのうけい','尊敬語':'そんけいご','謙譲語':'けんじょうご','導入':'どうにゅう','形容詞':'けいようし','普通形':'ふつうけい','辞書形':'じしょけい','状態':'じょうたい','迷惑':'めいわく','時間':'じかん'};
const full={},verb={};
function add(w,r){if(!KJ.test(w))return;let e=w.length;while(e>0&&HI.test(w[e-1]))e--;
 const K=w.slice(0,e),S=w.slice(e);
 if(S&&K&&r.length>S.length&&r.endsWith(S)){(verb[K]=verb[K]||[]).push({r:r.slice(0,-S.length),S})}
 else if(!full[w])full[w]=r}
Object.keys(extra).forEach(k=>full[k]=extra[k]);
W.forEach(w=>add(w[0],w[1]));
const fk=Object.keys(full).sort((a,b)=>b.length-a.length),vk=Object.keys(verb).sort((a,b)=>b.length-a.length);
const FD=window.NQ_FD||{w:{},c:[]},fdk=Object.keys(FD.w).sort((a,b)=>b.length-a.length);
function nqRule(t,i){const rest=t.slice(i);
 for(const [w,nx,r,pv] of FD.c){if(!rest.startsWith(w))continue;if(nx&&!new RegExp(nx).test(rest.slice(w.length)))continue;if(pv&&!new RegExp(pv).test(t.slice(0,i)))continue;return [w,r]}
 const k=fdk.find(x=>rest.startsWith(x));return k?[k,FD.w[k]]:null}
const rb=(k,r)=>'<ruby>'+esc(k)+'<rt>'+esc(r)+'</rt></ruby>';
window.furi=function(t){t=String(t);if(window.NQ_RUBYHTML&&window.NQ_RUBYHTML[t])return window.NQ_RUBYHTML[t];let o='',i=0;
 while(i<t.length){const c=t[i];
  if(KJ.test(c)){
   const R=nqRule(t,i);if(R){o+=rb(R[0],R[1]);i+=R[0].length;continue}
   let k=fk.find(x=>t.startsWith(x,i));if(k){o+=rb(k,full[k]);i+=k.length;continue}
   const nx=t[i+1];
   if(c==='来'&&nx&&HI.test(nx)){o+=rb('来','まてたそ'.includes(nx)?'き':'ないよ'.includes(nx)?'こ':'く');i++;continue}
   k=vk.find(x=>t.startsWith(x,i)&&HI.test(t[i+x.length]||''));
   if(k){const l=verb[k],a=t.slice(i+k.length),e=l.find(x=>a.startsWith(x.S))||l.find(x=>a[0]===x.S[0])||l[0];o+=rb(k,e.r);i+=k.length;continue}
  }
  o+=esc(c);i++}
 return o};
})();
