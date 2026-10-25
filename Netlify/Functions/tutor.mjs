export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Gunakan metode POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY belum diatur di Netlify." }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Format permintaan tidak valid." }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const userText = String(body?.message ?? body?.text ?? "").trim();
  if (!userText) {
    return new Response(JSON.stringify({ error: "Tulis pertanyaan atau jawaban Jepangmu dulu." }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
  if (userText.length > 4000) {
    return new Response(JSON.stringify({ error: "Pesan terlalu panjang (maksimal 4000 karakter)." }), {
      status: 413,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const prompt = `Kamu AI Sensei untuk pelajar bahasa Jepang pemula Indonesia. Jawab dalam bahasa Indonesia, gunakan bahasa Jepang dengan bacaan hiragana bila membantu, dan jangan memakai romaji kecuali diminta. Jika pengguna mengirim jawaban latihan/kaiwa, periksa jawaban yang mereka tulis terlebih dahulu. Sebutkan apakah benar, berikan koreksi dan alasan, lalu jelaskan kosakata/partikel yang relevan. Jangan memberi contoh jawaban sebelum pengguna mencoba. Sesuaikan tata bahasa dengan level/bab yang disebut pengguna dan jangan menganggap jawaban harus sama persis jika maknanya benar. Pesan pengguna: ${userText}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || "AI Tutor gagal merespons." }), {
        status: 502,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }
    const answer = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();
    if (!answer) throw new Error("Jawaban AI kosong.");
    return new Response(JSON.stringify({ answer, text: answer }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || "Terjadi kesalahan pada AI Tutor." }), {
      status: 502,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};
