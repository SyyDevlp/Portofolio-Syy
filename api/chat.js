const MODEL = "gemini-3.5-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY di Vercel Environment Variables."
    });
  }

  const message = typeof req.body?.message === "string"
    ? req.body.message.trim().slice(0, 2000)
    : "";

  if (!message) {
    return res.status(400).json({ error: "Pesan kosong." });
  }

  // Riwayat hanya berisi percakapan teks user/model, bukan system instruction.
  // Batasi jumlah dan panjang pesan agar request tetap terkendali.
  const history = Array.isArray(req.body?.history)
    ? req.body.history
        .filter(item =>
          item &&
          (item.role === "user" || item.role === "model") &&
          typeof item.text === "string" &&
          item.text.trim()
        )
        .slice(-20)
        .map(item => ({
          role: item.role,
          parts: [{ text: item.text.trim().slice(0, 2000) }]
        }))
    : [];

  const profile = `
Informasi portofolio M. Sukron Al-Habsy:
- Tertarik pada teknologi, coding, web development, pengembangan game, AI, dan desain antarmuka.
- Sedang mempelajari web development dari dasar. Jangan menyebutnya programmer profesional atau ahli.
- Bidang yang dipelajari/diminati: HTML, CSS, JavaScript, programming, game development, AI & technology, UI/UX.
- SCHOOL LIFE ONLINE: konsep simulasi sekolah online dengan kelas virtual, sistem guru/murid, jadwal, tugas, dan interaksi kelas.
- DESERT SURVIVOR: eksplorasi game survival gurun dengan misi, inventaris, kebutuhan karakter, loot, dan UI mobile.
- MARTABAK HORROR: konsep game horor kios martabak dengan pelanggan, pesanan, dan elemen misteri.
- NEON ARCADE: kumpulan mini-game bergaya arcade dan eksplorasi fitur bermain online.
- Pengalaman yang dicantumkan adalah proyek pribadi dan proses belajar. Jangan mengarang pekerjaan, klien, sertifikat, pendidikan, penghargaan, atau pengalaman profesional.
`;

  const systemInstruction = `
Kamu adalah asisten AI yang menemani pengunjung website portofolio M. Sukron Al-Habsy.
Gunakan bahasa Indonesia secara natural, santai, ramah, dan jelas. Ikuti gaya bahasa lawan bicara.
Kamu adalah teman ngobrol serbaguna: jawab pertanyaan umum, ngobrol santai, membahas teknologi,
hiburan, ide, pelajaran, kreativitas, dan topik lain. Jangan memaksa setiap percakapan kembali
ke topik portofolio. Pindah topik dengan wajar sesuai pesan terbaru dan konteks percakapan.

Jika ditanya tentang Sukron, portofolio, keahlian, pengalaman, atau proyeknya, gunakan hanya
informasi profil di bawah. Jika detail tidak tersedia, katakan belum dicantumkan; jangan mengarang.
Jangan mengaku sebagai Sukron. Untuk topik umum di luar profil, jawab berdasarkan pengetahuanmu
dan jelaskan ketidakpastian bila memang relevan.

Informasi profil:
${profile}
`;

  try {
    const contents = [
      ...history,
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents,
        generationConfig: {
          maxOutputTokens: 1000
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data.error?.message || response.status);
      return res.status(response.status).json({
        error: data.error?.message || "Layanan Gemini sedang bermasalah."
      });
    }

    const reply = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("\n")
      .trim();

    return res.status(200).json({
      reply: reply || "Maaf, saya belum mendapat jawaban. Coba kirim pesan sekali lagi."
    });
  } catch (error) {
    console.error("Gemini request failed:", error);
    return res.status(500).json({
      error: "Gagal menghubungi layanan Gemini. Coba lagi sebentar."
    });
  }
}
