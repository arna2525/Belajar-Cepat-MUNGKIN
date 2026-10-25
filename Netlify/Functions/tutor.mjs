const ENDPOINT="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const reply=(statusCode,data)=>({statusCode,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"},body:JSON.stringify(data)});
export async function handler(event){
 if(event.httpMethod==="OPTIONS")return {statusCode:204,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST, OPTIONS"},body:""};
 if(event.httpMethod!=="POST")return reply(405,{error:"Gunakan metode POST."});
 let body;try{body=JSON.parse(event.body||"{}")}catch{return reply(400,{error:"Format JSON tidak valid."})}
 if(!body||typeof body!=="object"||Array.isArray(body))return reply(400,{error:"Isi permintaan harus objek JSON."});
 const text=typeof body.text==="string"?body.text.trim():"";if(!text)return reply(400,{error:"Teks atau pertanyaan masih kosong."});if(text.length>8000)return reply(413,{error:"Teks terlalu panjang (maksimal 8.000 karakter)."});
 const key=process.env.GEMINI_API_KEY;if(!key)return reply(500,{error:"GEMINI_API_KEY belum tersedia pada fungsi Netlify. Periksa scope Functions dan lakukan deploy baru."});
 const modes={correct:"Koreksi kalimat Jepang, partikel, tata bahasa, kosakata, dan kealamian.",translate:"Terjemahkan ke bahasa Jepang tingkat pemula dan sertakan arti Indonesia.",explain:"Jelaskan tata bahasa Jepang dengan sederhana.",question:"Jawab pertanyaan atau lakukan tanya jawab sebagai tutor Jepang.",essay:"Periksa jawaban uraian dan jelaskan bagian yang benar serta yang perlu diperbaiki."};
 const prompt=`Kamu AI Sensei bahasa Jepang untuk pelajar Indonesia pemula, fokus Minna no Nihongo N5 dan JFT-Basic. Jawab bahasa Indonesia yang ramah dan jelas. Utamakan tingkat N5; beri tahu jika materi lebih lanjut. Jangan pakai romaji kecuali diminta. Mode: ${modes[body.mode]||modes.correct}\nTingkat: ${String(body.level||"N5 pemula").slice(0,80)}\nInput:\n${text}\nBalas HANYA JSON valid dengan field string verdict, summary, corrected, translation, explanation, tip, answer. verdict salah satu: correct, mostly_correct, incorrect, explanation. Isi field yang tidak relevan dengan string kosong.`;
 try{
  const res=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:.3,responseMimeType:"application/json"}})});
  const raw=await res.json().catch(()=>({}));if(!res.ok)return reply(res.status===429?429:502,{error:raw?.error?.message||`Gemini API gagal (${res.status}).`,providerStatus:res.status});
  const out=raw?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("").trim();if(!out)return reply(502,{error:"Gemini tidak mengembalikan jawaban."});
  let data;try{data=JSON.parse(out)}catch{return reply(502,{error:"Jawaban AI bukan JSON valid. Coba lagi."})}
  if(!["correct","mostly_correct","incorrect","explanation"].includes(data.verdict))data.verdict="explanation";
  for(const k of ["summary","corrected","translation","explanation","tip","answer"])if(typeof data[k]!=="string")data[k]="";
  return reply(200,data);
 }catch{return reply(502,{error:"Tidak dapat menghubungi Gemini. Periksa koneksi fungsi dan coba lagi."})}
}