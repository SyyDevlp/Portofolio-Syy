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
    ? req.body.message.trim().slice(0, 500)
    : "";

  if (!message) {
    return res.status(400).json({ error: "Pesan kosong." });
  }

  const profile = `
Nama: M. Sukron Al-Habsy.
Bahasa: Indonesia.
Profil: tertarik pada teknologi, coding, web development, pengembangan game, AI, dan desain antarmuka.
Status belajar: sedang mempelajari web development dari dasar; jangan mengklaim sebagai programmer profesional atau ahli.
Bidang yang dipelajari/diminati: HTML, CSS, JavaScript, programming, game development, AI & technology, UI/UX.
Proyek pribadi yang dirancang/dieksplorasi:
1. SCHOOL LIFE ONLINE: konsep simulasi sekolah online dengan kelas virtual, sistem guru/murid, jadwal, tugas, dan interaksi kelas.
2. DESERT SURVIVOR: eksplorasi game survival gurun dengan misi, inventaris, kebutuhan karakter, loot, dan UI mobile.
3. MARTABAK HORROR: konsep game horor kios martabak dengan pelanggan, pesanan, dan elemen misteri.
4. NEON ARCADE: kumpulan mini-game bergaya arcade dan eksplorasi fitur bermain online.
Pengalaman: proyek pribadi dan proses belajar; jangan mengarang pekerjaan, klien, sertifikat, pendidikan, penghargaan, atau pengalaman profesional.
`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `Kamu adalah AI Assistant untuk website portofolio M. Sukron Al-Habsy. Jawab dalam bahasa Indonesia dengan ramah, singkat, dan jelas. Jawab berdasarkan profil berikut. Jika informasi tidak tersedia, katakan belum dicantumkan. Jangan mengarang data dan jangan mengaku sebagai Sukron.\n${profile}`
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: message }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 350
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Layanan Gemini sedang bermasalah."
      });
    }

    const reply = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("\n")
      .trim();

    return res.status(200).json({
      reply: reply || "Maaf, saya belum mendapat jawaban."
    });
  } catch (error) {
    return res.status(500).json({
      error: "Gagal menghubungi layanan Gemini."
    });
  }
}

