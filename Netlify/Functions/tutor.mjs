// Endpoint contoh untuk tutor Gemini. Atur GEMINI_API_KEY di Netlify environment variables.
export default async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "GEMINI_API_KEY belum diatur di Netlify." }, { status: 503 });
  try {
    const { question, answer } = await req.json();
    const prompt = `Kamu guru bahasa Jepang pemula. Pertanyaan: ${question}. Jawaban siswa: ${answer}. Koreksi dengan lembut dalam bahasa Indonesia. Jangan berikan contoh jawaban sebelum siswa menjawab. Jelaskan bagian salah dan berikan satu versi perbaikan jika diperlukan.`;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
    const data = await r.json();
    if (!r.ok) return Response.json({ error: data.error?.message || "Tutor API gagal." }, { status: r.status });
    return Response.json({ feedback: data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("\n") || "Belum ada koreksi." });
  } catch { return Response.json({ error: "Permintaan tutor tidak valid." }, { status: 400 }); }
};
