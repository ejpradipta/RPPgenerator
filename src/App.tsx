import React, { useState } from "react";
import {
  Download,
  FileText,
  User,
  BookOpen,
  GraduationCap,
  Clock,
  Calendar,
  Target,
  Layout,
  CheckCircle,
  PencilLine,
  Map,
} from "lucide-react";

const App = () => {
  const [step, setStep] = useState("input");
  const [formData, setFormData] = useState({
    namaGuru: "",
    mapel: "",
    satuanPendidikan: "",
    fase: "",
    kelas: "",
    semester: "",
    tahunPelajaran: "",
    topik: "",
    jumlahPertemuan: "2",
    alokasiWaktu: "",
    cp: "",
  });

  const [loading, setLoading] = useState(false);
  const [rppData, setRppData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Helper to ensure we are mapping over an array
  const ensureArray = (data) => {
    if (Array.isArray(data)) return data;
    if (!data) return [];
    return [data];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateRPP = async () => {
    setLoading(true);
    setErrorMsg("");

    const systemPrompt = `Anda adalah RPP Generator Pembelajaran Mendalam (Deep Learning) untuk Guru Indonesia. 
    Tugas Anda menyusun RPP berdasarkan CP sebagai acuan tunggal.
    ATURAN KHUSUS PENGALAMAN BELAJAR:
    1. RINCIAN DETAIL: Setiap langkah kegiatan harus operasional. Sebutkan apa yang dilakukan guru dan apa yang dilakukan MURID secara spesifik.
    2. KEGIATAN AWAL: Harus mencakup apersepsi yang kontekstual dan pertanyaan pemantik yang menantang berpikir kritis.
    3. KEGIATAN INTI: Harus membagi porsi antara Memahami (Input/Konsep), Mengaplikasi (Praktik/Kolaborasi), dan Merefleksi (Evaluasi Proses). Gunakan pendekatan Deep Learning (6C).
    4. KEGIATAN PENUTUP: Harus menyertakan cara guru memberikan umpan balik dan rincian refleksi murid.
    5. KELUARAN HARUS JSON VALID.`;

    const userQuery = `Buatkan RPP dengan rincian kegiatan yang sangat detail untuk:
    Nama Guru: ${formData.namaGuru}
    Mata Pelajaran: ${formData.mapel}
    Topik: ${formData.topik}
    CP: ${formData.cp}
    
    Hasilkan dalam JSON terstruktur:
    {
      "identitas": { "mataPelajaran": "${formData.mapel}", "faseKelas": "${formData.fase}/${formData.kelas}", "semester": "${formData.semester}", "tahunPelajaran": "${formData.tahunPelajaran}", "topikMateri": "${formData.topik}", "alokasiWaktu": "${formData.alokasiWaktu}" },
      "identifikasi": { "cp": "", "dimensiProfilLulusan": ["array string"] },
      "desain": { 
        "tujuanPembelajaran": ["min 3 TP terperinci"], 
        "praktikPedagogis": { "model": "", "metode": "", "sintak": ["array string"] },
        "kemitraan": [{ "mitra": "", "peran": "" }],
        "digital": { "perencanaan": "", "pelaksanaan": "", "asesmen": "" }
      },
      "pengalamanBelajar": [
        { 
          "pertemuanKe": 1, 
          "alokasiWaktu": "", 
          "fokusTP": "", 
          "kegiatanAwal": ["Langkah detail: salam, doa, presensi, apersepsi spesifik, pertanyaan pemantik"], 
          "kegiatanInti": { 
            "memahami": {"durasi": "", "aktivitas": "Detail langkah eksplorasi konsep/materi"}, 
            "mengaplikasi": {"durasi": "", "aktivitas": "Detail langkah praktik/diskusi kelompok/proyek"}, 
            "merefleksi": {"durasi": "", "aktivitas": "Detail langkah presentasi/konfirmasi pemahaman"} 
          }, 
          "kegiatanPenutup": ["Langkah detail: kesimpulan bersama, refleksi perasaan, info pertemuan depan, doa"] 
        }
      ],
      "asesmen": { "formatif": "", "sumatif": "", "instrumen": [{ "pertanyaan": "", "kriteria": "" }] },
      "lkpd": { "judul": "", "tujuan": "", "langkah": ["langkah instruksi kerja detail"], "kriteria": "" },
      "rubrik": [{ "indikator": "", "berkembang": "", "cakap": "", "mahir": "" }]
    }`;

    const fetchWithRetry = async (retries = 5, delay = 1000) => {
      const apiKey = "";
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                  responseMimeType: "application/json",
                },
              }),
            }
          );

          if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
          return await response.json();
        } catch (err) {
          if (i === retries - 1) throw err;
          await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
        }
      }
    };

    try {
      const data = await fetchWithRetry();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textContent) throw new Error("Gagal menerima respons dari AI.");

      const generatedContent = JSON.parse(textContent);
      setRppData(generatedContent);
      setStep("preview");
    } catch (error) {
      console.error("Error generating RPP:", error);
      setErrorMsg("Terjadi kesalahan. Pastikan CP telah diisi dengan benar.");
    } finally {
      setLoading(false);
    }
  };

  const downloadDoc = () => {
    const content = document.getElementById("rpp-content").innerHTML;
    const header =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>RPP</title><style>table {border-collapse: collapse; width: 100%; margin-bottom: 10pt;} th, td {border: 1px solid black; padding: 5pt; text-align: left; vertical-align: top;} .title {text-align: center; font-weight: bold; font-size: 14pt;} body {font-family: 'Arial', sans-serif; font-size: 11pt;} .section-title {background-color: #f1f5f9; font-weight: bold; padding: 5px; margin-top: 15px; border-left: 5px solid #2563eb;}</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const blob = new Blob(["\ufeff", sourceHTML], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `RPP_Detail_${formData.mapel || "Materi"}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            Generator RPP Pembelajaran Mendalam
          </h1>
          <p className="text-xs mt-1 opacity-80 italic">
            Rincian Kegiatan Pembelajaran Berbasis Deep Learning
          </p>
        </div>

        {step === "input" ? (
          <div className="p-6 space-y-6">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                {errorMsg}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold flex items-center gap-2 text-slate-600">
                  <User size={14} /> Nama Guru
                </label>
                <input
                  name="namaGuru"
                  value={formData.namaGuru}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Nama Lengkap & Gelar"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold flex items-center gap-2 text-slate-600">
                  <BookOpen size={14} /> Mata Pelajaran
                </label>
                <input
                  name="mapel"
                  value={formData.mapel}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Misal: Bahasa Indonesia"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold flex items-center gap-2 text-slate-600">
                  <GraduationCap size={14} /> Satuan Pendidikan
                </label>
                <input
                  name="satuanPendidikan"
                  value={formData.satuanPendidikan}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Nama Sekolah"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">
                    Fase / Kelas
                  </label>
                  <input
                    name="fase"
                    value={formData.fase}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="Fase D / VII"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">
                    Topik
                  </label>
                  <input
                    name="topik"
                    value={formData.topik}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="Materi Utama"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold flex items-center gap-2 text-slate-600">
                <Target size={14} /> Capaian Pembelajaran (CP)
              </label>
              <textarea
                name="cp"
                value={formData.cp}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed"
                placeholder="Tempel teks CP di sini..."
              ></textarea>
            </div>

            <button
              onClick={generateRPP}
              disabled={loading || !formData.cp}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Menyusun Rincian Kegiatan...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Hasilkan RPP Detail
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <button
                onClick={() => setStep("input")}
                className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                ← KEMBALI
              </button>
              <button
                onClick={downloadDoc}
                className="bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg font-bold text-sm"
              >
                <Download size={18} /> UNDUH DOC
              </button>
            </div>

            <div
              id="rpp-content"
              className="bg-white p-2 text-slate-900 leading-relaxed text-[11pt]"
            >
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold underline uppercase">
                  RENCANA PELAKSANAAN PEMBELAJARAN
                </h1>
                <p className="font-bold">
                  PEMBELAJARAN MENDALAM (DEEP LEARNING)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 mb-6">
                <div className="flex gap-2">
                  <strong>Mata Pelajaran:</strong>{" "}
                  {rppData?.identitas?.mataPelajaran}
                </div>
                <div className="flex gap-2">
                  <strong>Satuan Pendidikan:</strong>{" "}
                  {formData.satuanPendidikan}
                </div>
                <div className="flex gap-2">
                  <strong>Fase / Kelas:</strong> {rppData?.identitas?.faseKelas}
                </div>
                <div className="flex gap-2">
                  <strong>Topik:</strong> {rppData?.identitas?.topikMateri}
                </div>
              </div>

              <div className="space-y-8">
                {/* A. IDENTIFIKASI */}
                <section>
                  <div className="bg-slate-100 p-2 font-bold border-l-4 border-blue-600 uppercase text-xs">
                    A. Identifikasi Pembelajaran
                  </div>
                  <div className="mt-2 space-y-3 px-2 text-sm">
                    <p>
                      <strong>Capaian Pembelajaran (CP):</strong>{" "}
                      <span className="italic">
                        "{rppData?.identifikasi?.cp}"
                      </span>
                    </p>
                    <p>
                      <strong>Dimensi Profil Lulusan:</strong>{" "}
                      {ensureArray(
                        rppData?.identifikasi?.dimensiProfilLulusan
                      ).join(", ")}
                      .
                    </p>
                  </div>
                </section>

                {/* B. DESAIN */}
                <section>
                  <div className="bg-slate-100 p-2 font-bold border-l-4 border-blue-600 uppercase text-xs">
                    B. Desain Pembelajaran
                  </div>
                  <div className="mt-2 space-y-3 px-2 text-sm">
                    <p className="font-bold underline text-xs">
                      Tujuan Pembelajaran (TP):
                    </p>
                    <ul className="list-decimal ml-5">
                      {ensureArray(rppData?.desain?.tujuanPembelajaran).map(
                        (t, i) => (
                          <li key={i}>{t}</li>
                        )
                      )}
                    </ul>
                    <p>
                      <strong>Model:</strong>{" "}
                      {rppData?.desain?.praktikPedagogis?.model} |{" "}
                      <strong>Metode:</strong>{" "}
                      {rppData?.desain?.praktikPedagogis?.metode}
                    </p>
                  </div>
                </section>

                {/* C. PENGALAMAN BELAJAR - THE DETAILED PART */}
                <section>
                  <div className="bg-slate-100 p-2 font-bold border-l-4 border-blue-600 uppercase text-xs">
                    C. Pengalaman Belajar (Detail)
                  </div>
                  {ensureArray(rppData?.pengalamanBelajar).map(
                    (pertemuan, idx) => (
                      <div
                        key={idx}
                        className="mt-4 border border-slate-200 rounded-lg p-4 bg-white mb-6"
                      >
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                          <h4 className="font-bold text-blue-700 uppercase">
                            Pertemuan {pertemuan.pertemuanKe}
                          </h4>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                            {pertemuan.alokasiWaktu}
                          </span>
                        </div>

                        <div className="space-y-6">
                          {/* Awal */}
                          <div>
                            <p className="font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded inline-block mb-2">
                              I. KEGIATAN AWAL (Pendahuluan)
                            </p>
                            <ul className="list-disc ml-5 text-xs space-y-1 text-slate-700">
                              {ensureArray(pertemuan.kegiatanAwal).map(
                                (k, i) => (
                                  <li key={i}>{k}</li>
                                )
                              )}
                            </ul>
                          </div>

                          {/* Inti */}
                          <div>
                            <p className="font-bold text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded inline-block mb-2">
                              II. KEGIATAN INTI (Eksplorasi & Aplikasi)
                            </p>
                            <div className="space-y-4 ml-2 border-l-2 border-emerald-100 pl-4 mt-2">
                              <div>
                                <p className="font-bold text-[10px] text-emerald-800 uppercase flex items-center gap-2">
                                  1. Memahami (Concept Acquisition){" "}
                                  <span className="text-slate-400 font-normal">
                                    [{pertemuan.kegiatanInti?.memahami?.durasi}]
                                  </span>
                                </p>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed text-justify">
                                  {pertemuan.kegiatanInti?.memahami?.aktivitas}
                                </p>
                              </div>
                              <div>
                                <p className="font-bold text-[10px] text-emerald-800 uppercase flex items-center gap-2">
                                  2. Mengaplikasi (Practice & Collaboration){" "}
                                  <span className="text-slate-400 font-normal">
                                    [
                                    {
                                      pertemuan.kegiatanInti?.mengaplikasi
                                        ?.durasi
                                    }
                                    ]
                                  </span>
                                </p>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed text-justify">
                                  {
                                    pertemuan.kegiatanInti?.mengaplikasi
                                      ?.aktivitas
                                  }
                                </p>
                              </div>
                              <div>
                                <p className="font-bold text-[10px] text-emerald-800 uppercase flex items-center gap-2">
                                  3. Merefleksi (Presentation & Feedback){" "}
                                  <span className="text-slate-400 font-normal">
                                    [
                                    {pertemuan.kegiatanInti?.merefleksi?.durasi}
                                    ]
                                  </span>
                                </p>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed text-justify">
                                  {
                                    pertemuan.kegiatanInti?.merefleksi
                                      ?.aktivitas
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Penutup */}
                          <div>
                            <p className="font-bold text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded inline-block mb-2">
                              III. KEGIATAN PENUTUP (Kesimpulan)
                            </p>
                            <ul className="list-disc ml-5 text-xs space-y-1 text-slate-700">
                              {ensureArray(pertemuan.kegiatanPenutup).map(
                                (k, i) => (
                                  <li key={i}>{k}</li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </section>

                {/* D. ASESMEN & LKPD */}
                <section>
                  <div className="bg-slate-100 p-2 font-bold border-l-4 border-blue-600 uppercase text-xs">
                    D. Asesmen & Lampiran
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 border rounded bg-slate-50">
                      <p className="font-bold border-b mb-2">
                        Asesmen Formatif
                      </p>
                      <p>{rppData?.asesmen?.formatif}</p>
                    </div>
                    <div className="p-3 border rounded bg-slate-50">
                      <p className="font-bold border-b mb-2">Asesmen Sumatif</p>
                      <p>{rppData?.asesmen?.sumatif}</p>
                    </div>
                  </div>

                  {/* LKPD Preview */}
                  <div className="mt-6 border-2 border-blue-100 p-6 rounded-xl bg-blue-50/20">
                    <p className="text-center font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                      LEMBAR KERJA PESERTA DIDIK (LKPD)
                    </p>
                    <p className="text-xs font-bold uppercase">
                      {rppData?.lkpd?.judul}
                    </p>
                    <p className="text-[10px] italic mt-1">
                      {rppData?.lkpd?.tujuan}
                    </p>
                    <div className="mt-4">
                      <p className="font-bold text-[10px] text-slate-700 underline mb-2">
                        Instruksi Kerja Murid:
                      </p>
                      <ol className="list-decimal ml-5 text-xs space-y-2">
                        {ensureArray(rppData?.lkpd?.langkah).map((l, i) => (
                          <li key={i}>{l}</li>
                        ))}
                      </ol>
                    </div>
                    <p className="mt-4 text-[10px] font-bold text-green-700">
                      Kriteria Berhasil: {rppData?.lkpd?.kriteria}
                    </p>
                  </div>
                </section>
              </div>

              {/* FOOTER */}
              <div className="mt-16 grid grid-cols-2 gap-10 text-center text-sm">
                <div className="space-y-16">
                  <p>
                    Mengetahui,
                    <br />
                    Kepala Sekolah
                  </p>
                  <p className="font-bold">
                    ( ........................................ )
                  </p>
                </div>
                <div className="space-y-16">
                  <p>
                    Hormat Kami,
                    <br />
                    Guru Mata Pelajaran
                  </p>
                  <p className="font-bold">
                    {formData.namaGuru ||
                      "( ........................................ )"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
