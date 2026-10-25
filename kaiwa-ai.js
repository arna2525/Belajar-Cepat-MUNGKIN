// Menyambungkan tombol "Kirim jawaban" di halaman Kaiwa ke Netlify Function.
// Dimuat SETELAH app.js, jadi fungsi checkKaiwa lama otomatis tergantikan.
window.checkKaiwa = async function () {
  const fb = document.getElementById('kaiwafeedback');
  const input = document.getElementById('kaiwaanswer');
  const btn = document.querySelector('#kaiwa .btn:not(.light)');
  const answer = input.value.trim();

  if (!answer) {
    fb.innerHTML = '<p class="muted">Coba tulis jawabanmu dulu ya 😊</p>';
    return;
  }

  const show = (title, text) => {
    fb.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'hero-mini';
    box.style.marginTop = '12px';
    const b = document.createElement('b');
    b.textContent = title;
    const p = document.createElement('p');
    p.style.whiteSpace = 'pre-wrap';
    p.textContent = text; // textContent: aman dari injeksi HTML
    box.append(b, p);
    fb.appendChild(box);
  };

  if (btn) { btn.disabled = true; btn.textContent = 'Sensei sedang membaca… ⏳'; }
  fb.innerHTML = '<p class="muted" style="margin-top:12px">Sensei sedang memeriksa jawabanmu…</p>';

  try {
    const res = await fetch('/.netlify/functions/kaiwa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: document.getElementById('kaiwaq').textContent,
        answer,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'Gagal menghubungi sensei.'), { notFound: res.status === 404 });
    show('🌱 Kata sensei', data.reply);
  } catch (e) {
    show('😅 Belum berhasil', e.message + (e.notFound || e instanceof TypeError ? '\n(Fitur ini hanya jalan setelah di-deploy di Netlify.)' : ''));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Kirim jawaban'; }
  }
};
