export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: "Method not allowed",
      }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "GEMINI_API_KEY belum diatur di Netlify.",
      }),
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    const {
      question = "",
      answer = "",
      chapter = 1,
      topic = "",
      mode = "",
      example = "",
      explanation = "",
    } = data;

    const prompt = `
Kamu adalah sensei bahasa Jepang yang ramah
dan mengajar orang Indonesia dari tingkat pemula.

Periksa jawaban murid berdasarkan soal berikut.

Bab Minna no Nihongo: ${chapter}
Topik: ${topic}
Mode latihan: ${mode}
Soal: ${question}
Jawaban murid: ${answer}
Contoh jawaban acuan: ${example}
Penjelasan materi: ${explanation}

Nilai jawaban secara adil. Jika jawaban benar secara
makna dan tata bahasa, terima meskipun susunan kata
sedikit berbeda. Jelaskan kesalahan dalam bahasa
Indonesia dengan sederhana. Jangan mengarang soal.

Kembalikan HANYA JSON valid dengan struktur:
{
  "verdict": "correct atau incorrect",
  "title": "Judul singkat dalam bahasa Indonesia",
  "summary": "Ringkasan penilaian",
  "corrected": "Jawaban Jepang yang benar",
  "translation": "Arti jawaban dalam bahasa Indonesia",
  "explanation": "Penjelasan tata bahasa dalam bahasa Indonesia",
  "tip": "Tips singkat agar mudah diingat"
}

Jangan gunakan markdown atau pagar kode.
Pastikan semua tujuh properti tersedia.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", result);

      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: "Gemini gagal memeriksa jawaban.",
        }),
      };
    }

    const text =
      result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Respons Gemini kosong.");
    }

    const parsed = JSON.parse(text);

    const requiredFields = [
      "verdict",
      "title",
      "summary",
      "corrected",
      "translation",
      "explanation",
      "tip",
    ];

    for (const field of requiredFields) {
      if (typeof parsed[field] !== "string") {
        throw new Error(`Format respons tidak valid: ${field}`);
      }
    }

    if (!["correct", "incorrect"].includes(parsed.verdict)) {
      parsed.verdict = "incorrect";
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed),
    };
  } catch (error) {
    console.error("Tutor function error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Terjadi kesalahan saat memeriksa jawaban.",
      }),
    };
  }
};
