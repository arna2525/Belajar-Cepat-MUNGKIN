# Nihongo Quest V6

Perubahan: katalog kotoba digabung (CSV + katalog lama + tambahan) dan dipakai penuh oleh aplikasi; data kanji kini dimuat (sebelumnya NQ_KANJIS tidak terdefinisi sehingga halaman kanji/latihan error); label "Bab" yang salah pada kotoba diganti label tingkat.

Jumlah data: kotoba 1479 entri unik, kanji 604 entri unik, bunpou 89 pola (sudah dimuat di halaman Bunpou).
Data kurasi belajar, bukan salinan resmi Minna no Nihongo/IRODORI; verifikasi dengan buku. Sumber resmi: lihat data/irodori_sources.txt.


## Kaiwa AI (Netlify Function)
- Fungsi: `netlify/functions/kaiwa.js`, frontend: `kaiwa-ai.js`.
- v7.js + v7.css: tampilan baru (font besar, detail bab, kartu kanji berputar, kategori latihan). Contoh kalimat bab dibuat AI lewat fungsi yang sama (mode contoh) dan disimpan di browser.
- Di Netlify > Site configuration > Environment variables, isi salah satu: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, atau `GEMINI_API_KEY` (opsional `AI_MODEL`, mis. `gemini-3.5-flash`; kalau ada lebih dari satu key, urutan prioritas: Anthropic, OpenAI, Gemini).
- Setelah menambah/mengubah variabel, lakukan *Trigger deploy*.
- bc.css + v8.js: tema BLACK CLOVER (hitam-merah, motif semanggu daun empat, grimoire); menu bawah selalu terlihat (area halaman yang scroll, bukan seluruh layar).
- Urutan kanji: N5 (80) -> N4 (167) -> lainnya; dalam tiap level urut dari yang paling sederhana. Daftar level disusun dari daftar kanji JLPT yang beredar (tidak resmi); makna Indonesia dan contoh ditulis sendiri.
- furi.js: furigana dibuat dari kamus kotoba aplikasi (kanji + okurigana, mis. 食[た]べます).
- v9.js: beranda ala game (level + rank ksatria sihir + mana/XP, 3 Daily Quest, menu ringkas). XP: flashcard +5/+2, soal benar +10 (salah +2), kaiwa +15, putar kartu kanji +1; quest harian reset tiap hari, bonus +50 XP kalau 3 quest selesai. Data tersimpan di localStorage (kunci nqv9).
- v10.js: foto profil sendiri (pilih dari galeri, tersimpan di browser, kunci nqpfp). Aksen pedang hitam ada di hero beranda (bc.css + v9.js).
- bunpou.js + data/bunpou.js: halaman Bunpou (89 pola sering dipakai dari CSV, tiap pola punya rumus, 2 contoh kalimat, catatan, animasi, dan penanda "sudah paham"; kunci localStorage nqbp). data/bunpou.js dibuat dari data/bunpou_patterns_progress.csv ditambah satu contoh kedua per pola.
- data/ruby.js + furi.js: furigana yang sudah dicek manual untuk semua pola Bab 1-50 dan Bunpou (kalimat lain tetap memakai kamus kotoba). data/bushu.js + kanji2.js: halaman Kanji dengan level N5/N4/N3+, jadwal 15 kanji per hari (tabel berkolom atau kartu putar), kelompok bushu (N5/N4), penanda hafal (kunci localStorage nqkj).
- stories.js + data/stories.js: modul Cerita (2 cerita orisinal: Momotaro versi tulis ulang dan "Hari liburku"). Tampilan teks asli / bantuan hiragana / latihan katakana, romaji & terjemahan opsional, kosakata, kanji yang dipakai, kuis pemahaman & kosakata, favorit, riwayat, posisi baca (kunci localStorage nqst).
- jalur.js + data/jalur.js: Jalur kanji N5 -> Jembatan -> N4 (247 kanji, 17 tahap, urutan REKOMENDASI APLIKASI, bukan urutan resmi ujian). Status terkunci/tersedia/dipelajari/perlu diulang/dikuasai, Pelajari bebas, rekomendasi berikutnya, kuis uji diri, ulangi yang salah (kunci localStorage nqjalur; tanda hafal lama nqkj dimigrasi otomatis).
- Profil: ekspor/impor cadangan progres (semua kunci nq*).
