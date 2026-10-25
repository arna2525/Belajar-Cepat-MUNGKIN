const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  body: JSON.stringify(body),
});

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Gunakan metode POST." });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json(503, { error: "OPENAI_API_KEY belum diatur di Netlify." });

  let payload;
  try { payload = await req.json(); } catch { return json(400, { error: "Data jawaban tidak terbaca." }); }
  const question = String(payload.question || "").slice(0, 1200);
  const answer = String(payload.answer || "").trim().slice(0, 1500);
  const chapter = Math.max(1, Math.min(50, Number(payload.chapter) || 1));
  const topic = String(payload.topic || "").slice(0, 300);
  const mode = String(payload.mode || "mixed").slice(0, 30);
  const example = String(payload.example || "").slice(0, 600);
  const explanation = String(payload.explanation || "").slice(0, 1000);
  if (!answer) return json(400, { error: "Jawaban masih kosong." });

  const instructions = `Kamu adalah tutor bahasa Jepang untuk pemula Indonesia yang sedang belajar Minna no Nihongo dan JFT Basic A2. Jelaskan dalam bahasa Indonesia yang sederhana. Jangan gunakan romaji sama sekali. Utamakan hiragana/katakana; kanji boleh ditampilkan bersama bacaan hiragana dalam kurung jika membantu. Periksa makna, partikel, tata bahasa, konjugasi, dan kewajaran kalimat. Jangan menyatakan salah hanya karena jawaban berbeda dari contoh jika maknanya benar. Jika soal berada di bab awal, jangan menuntut tata bahasa bab lanjut. Kembalikan JSON valid saja dengan field: verdict (correct, mostly_correct, incorrect, or needs_context), title, summary, corrected, translation, explanation, tip. corrected harus berupa kalimat Jepang yang benar. Jika jawaban pengguna benar, puji secara wajar dan jangan mengubahnya tanpa alasan.`;
  const userInput = `Bab ${chapter}: ${topic}\nMode: ${mode}\nSoal Indonesia: ${question}\nJawaban pelajar: ${answer}\nContoh yang tersedia (petunjuk, bukan satu-satunya jawaban): ${example}\nPenjelasan materi yang tersedia: ${explanation}\nNilai jawaban pelajar dan jelaskan dengan ramah.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-6-luna",
        instructions,
        input: userInput,
        max_output_tokens: 500,
        text: { format: { type: "json_object" } }
      })
    });
    const result = await response.json();
    if (!response.ok) {
      const message = result?.error?.message || "Permintaan ke layanan AI gagal.";
      return json(response.status === 429 ? 429 : 502, { error: message.slice(0, 300) });
    }
    const outputText = (result.output || []).flatMap(item => item.content || []).filter(item => item.type === "output_text").map(item => item.text).join("\n");
    if (!outputText) return json(502, { error: "AI tidak mengembalikan jawaban. Coba lagi." });
    let parsed;
    try { parsed = JSON.parse(outputText); } catch { return json(502, { error: "Format jawaban AI tidak terbaca. Coba lagi." }); }
    const allowed = new Set(["correct", "mostly_correct", "incorrect", "needs_context"]);
    if (!allowed.has(parsed.verdict)) parsed.verdict = "needs_context";
    return json(200, parsed);
  } catch {
    return json(502, { error: "Tidak bisa menghubungi AI. Periksa koneksi dan coba lagi." });
  }
};
