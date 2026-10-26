// Foto profil sendiri: dipilih dari galeri, dipotong persegi 256px, disimpan di localStorage (kunci nqpfp).
(function(){
const KEY='nqpfp',$=id=>document.getElementById(id);
const get=()=>{try{return localStorage.getItem(KEY)}catch(e){return null}};
const top=document.querySelector('.top'),streak=top.querySelector('.streak');
const right=document.createElement('div');right.className='topr';streak.before(right);
const hav=document.createElement('button');hav.type='button';hav.className='hav';hav.setAttribute('aria-label','Profil');hav.onclick=()=>go('profil');
right.append(hav,streak);
const fallback='<svg viewBox="0 0 100 120"><use href="#boy"/></svg>';
function paint(){const u=get();
 $('pfp').innerHTML=u?`<img src="${u}" alt="Foto profil">`:'<svg><use href="#boy"/></svg>';
 hav.innerHTML=u?`<img src="${u}" alt="">`:fallback;$('pfdel').style.display=u?'':'none'}
$('pfin').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(!f)return;
 if(!/^image\//.test(f.type)){alert('Pilih file gambar ya.');return}
 const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{
  const s=Math.min(im.width,im.height),c=document.createElement('canvas');c.width=c.height=256;
  c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,256,256);
  try{localStorage.setItem(KEY,c.toDataURL('image/jpeg',.85))}catch(x){alert('Foto gagal disimpan (penyimpanan penuh).')}
  paint();e.target.value=''};im.onerror=()=>alert('Gambar tidak bisa dibaca.');im.src=r.result};r.readAsDataURL(f)});
$('pfdel').onclick=()=>{try{localStorage.removeItem(KEY)}catch(e){}paint()};
paint();
})();

// Cadangan progres: ekspor/impor semua data belajar (kunci localStorage berawalan "nq") sebagai berkas JSON.
(function(){
const menu=document.querySelector('#profil .menu');if(!menu)return;
const b=document.createElement('div');b.className='pfbtns';
b.innerHTML='<button class="btn light" id="bkx" type="button">⬇ Ekspor cadangan</button><label class="btn light">⬆ Impor cadangan<input id="bki" type="file" accept="application/json,.json" hidden></label>';
menu.before(b);
document.getElementById('bkx').onclick=()=>{const o={app:'nihongo-quest',v:1,date:new Date().toISOString(),data:{}};
 try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^nq/.test(k))o.data[k]=localStorage.getItem(k)}}catch(e){}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'}));a.download='nihongo-quest-cadangan-'+o.date.slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
document.getElementById('bki').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{try{const o=JSON.parse(r.result);if(o.app!=='nihongo-quest'||!o.data)throw 0;
  if(!confirm('Impor cadangan ini? Data belajar di perangkat ini akan ditimpa.'))return;
  Object.keys(o.data).forEach(k=>{if(/^nq/.test(k))localStorage.setItem(k,o.data[k])});alert('Cadangan berhasil diimpor.');location.reload()}catch(x){alert('Berkas bukan cadangan Nihongo Quest yang valid.')}};r.readAsText(f);e.target.value=''});
})();
