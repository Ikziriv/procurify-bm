import fs from 'fs';


const institutionNames = [
    // --- KABINET MERAH PUTIH (2024-2029) ---
    "Kementerian Koordinator Bidang Politik dan Keamanan",
    "Kementerian Koordinator Bidang Hukum, Hak Asasi Manusia, Imigrasi, dan Pemasyarakatan",
    "Kementerian Koordinator Bidang Perekonomian",
    "Kementerian Koordinator Bidang Pangan",
    "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan",
    "Kementerian Koordinator Bidang Pemberdayaan Masyarakat",
    "Kementerian Koordinator Bidang Infrastruktur dan Pembangunan Kewilayahan",
    "Kementerian Sekretariat Negara",
    "Kementerian Dalam Negeri",
    "Kementerian Luar Negeri",
    "Kementerian Pertahanan",
    "Kementerian Agama",
    "Kementerian Hukum",
    "Kementerian Hak Asasi Manusia",
    "Kementerian Imigrasi dan Pemasyarakatan",
    "Kementerian Keuangan",
    "Kementerian Pendidikan Dasar dan Menengah",
    "Kementerian Pendidikan Tinggi, Sains, dan Teknologi",
    "Kementerian Kebudayaan",
    "Kementerian Kesehatan",
    "Kementerian Sosial",
    "Kementerian Ketenagakerjaan",
    "Kementerian Pelindungan Pekerja Migran Indonesia/BPPMI",
    "Kementerian Perindustrian",
    "Kementerian Perdagangan",
    "Kementerian Energi Dan Sumber Daya Mineral",
    "Kementerian Pekerjaan Umum",
    "Kementerian Perumahan dan Kawasan Permukiman",
    "Kementerian Perhubungan",
    "Kementerian Komunikasi dan Digital",
    "Kementerian Pertanian",
    "Kementerian Kehutanan",
    "Kementerian Kelautan Dan Perikanan",
    "Kementerian Desa dan Pembangunan Daerah Tertinggal",
    "Kementerian Transmigrasi",
    "Kementerian Agraria dan Tata Ruang/BPN",
    "Kementerian Perencanaan Pembangunan Nasional/Bappenas",
    "Kementerian Pendayagunaan Aparatur Negara Dan Reformasi Birokrasi",
    "Kementerian Badan Usaha Milik Negara",
    "Kementerian Kependudukan dan Pembangunan Keluarga/BKKBN",
    "Kementerian Lingkungan Hidup/Badan Pengendalian Lingkungan Hidup",
    "Kementerian Investasi dan Hilirisasi/BKPM",
    "Kementerian Koperasi",
    "Kementerian Usaha Mikro, Kecil, dan Menengah",
    "Kementerian Pemberdayaan Perempuan Dan Perlindungan Anak",
    "Kementerian Pariwisata",
    "Kementerian Ekonomi Kreatif/Badan Ekonomi Kreatif",
    "Kementerian Pemuda Dan Olah Raga",

    // --- LEMBAGA PEMERINTAH NON-KEMENTERIAN ---
    "Kejaksaan Republik Indonesia",
    "Kepolisian Negara Republik Indonesia",
    "Badan Intelijen Negara",
    "Badan Gizi Nasional",
    "Badan Karantina Indonesia",
    "Badan Keamanan Laut",
    "Badan Kepegawaian Negara",
    "Badan Meteorologi, Klimatologi Dan Geofisika",
    "Badan Narkotika Nasional",
    "Badan Nasional Penanggulangan Bencana",
    "Badan Nasional Penanggulangan Terorisme",
    "Badan Nasional Pencarian dan Pertolongan",
    "Badan Nasional Pengelola Perbatasan",
    "Badan Pangan Nasional",
    "Badan Pembinaan Ideologi Pancasila",
    "Badan Pemeriksa Keuangan",
    "Badan Pengawasan Keuangan Dan Pembangunan",
    "Badan Pengawas Obat Dan Makanan",
    "Badan Pengawas Pemilihan Umum",
    "Badan Pengawas Tenaga Nuklir",
    "Badan Pengelola Investasi Daya Anagata Nusantara",
    "Badan Pusat Statistik",
    "Badan Riset dan Inovasi Nasional",
    "Badan Siber dan Sandi Negara",
    "Badan Standardisasi Nasional",
    "Badan Teknologi, Informasi, dan Intelijen Keuangan",
    "Lembaga Administrasi Negara",
    "Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah",
    "Lembaga Ketahanan Nasional",
    "Mahkamah Agung",
    "Mahkamah Konstitusi Ri",
    "Majelis Permusyawaratan Rakyat",
    "Ombudsman Republik Indonesia",
    "Otorita Ibu Kota Nusantara (OIKN)",
    "Perpustakaan Nasional Republik Indonesia",
    "Pusat Pelaporan Dan Analisis Transaksi Keuangan",
    "Sekretariat Kabinet",

    // --- PEMERINTAH DAERAH (PROVINSI) ---
    "Provinsi Aceh",
    "Provinsi Bali",
    "Provinsi Bangka Belitung",
    "Provinsi Banten",
    "Provinsi Bengkulu",
    "Provinsi DI Yogyakarta",
    "Provinsi DKI Jakarta",
    "Provinsi Gorontalo",
    "Provinsi Jambi",
    "Provinsi Jawa Barat",
    "Provinsi Jawa Tengah",
    "Provinsi Jawa Timur",
    "Provinsi Kalimantan Barat",
    "Provinsi Kalimantan Selatan",
    "Provinsi Kalimantan Tengah",
    "Provinsi Kalimantan Timur",
    "Provinsi Kalimantan Utara",
    "Provinsi Kepulauan Riau",
    "Provinsi Lampung",
    "Provinsi Maluku",
    "Provinsi Maluku Utara",
    "Provinsi Nusa Tenggara Barat",
    "Provinsi Nusa Tenggara Timur",
    "Provinsi Papua",
    "Provinsi Papua Barat",
    "Provinsi Papua Barat Daya",
    "Provinsi Papua Pegunungan",
    "Provinsi Papua Selatan",
    "Provinsi Papua Tengah",
    "Provinsi Riau",
    "Provinsi Sulawesi Barat",
    "Provinsi Sulawesi Selatan",
    "Provinsi Sulawesi Tengah",
    "Provinsi Sulawesi Tenggara",
    "Provinsi Sulawesi Utara",
    "Provinsi Sumatera Barat",
    "Provinsi Sumatera Selatan",
    "Provinsi Sumatera Utara",

    // --- CONTOH KOTA/KABUPATEN (SAMPEL) ---
    "Kota Ambon",
    "Kota Balikpapan",
    "Kota Banda Aceh",
    "Kota Bandung",
    "Kota Batam",
    "Kota Bekasi",
    "Kota Bogor",
    "Kota Depok",
    "Kota Jakarta Pusat",
    "Kota Jakarta Selatan",
    "Kota Jakarta Timur",
    "Kota Jakarta Utara",
    "Kota Jakarta Barat",
    "Kota Makassar",
    "Kota Malang",
    "Kota Medan",
    "Kota Palembang",
    "Kota Semarang",
    "Kota Surabaya",
    "Kota Tangerang",
    "Kota Tangerang Selatan",
    "Kab. Aceh Besar",
    "Kab. Bandung",
    "Kab. Bogor",
    "Kab. Gowa",
    "Kab. Malang",
    "Kab. Maros",
    "Kab. Sidoarjo",
    "Kab. Sleman",
    "Kab. Tangerang",
];

const abbreviations = {
    "Kementerian Koordinator Bidang Politik dan Keamanan": "Kemenko Polkam",
    "Kementerian Koordinator Bidang Hukum, Hak Asasi Manusia, Imigrasi, dan Pemasyarakatan": "Kemenko Kumham Imipas",
    "Kementerian Koordinator Bidang Perekonomian": "Kemenko Perekonomian",
    "Kementerian Koordinator Bidang Pangan": "Kemenko Pangan",
    "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan": "Kemenko PMK",
    "Kementerian Koordinator Bidang Pemberdayaan Masyarakat": "Kemenko Dayamas",
    "Kementerian Koordinator Bidang Infrastruktur dan Pembangunan Kewilayahan": "Kemenko Infrastruktur",
    "Kementerian Sekretariat Negara": "Setneg",
    "Kementerian Dalam Negeri": "Kemendagri",
    "Kementerian Luar Negeri": "Kemlu",
    "Kementerian Pertahanan": "Kemhan",
    "Kementerian Agama": "Kemenag",
    "Kementerian Hukum": "Kemenkum",
    "Kementerian Hak Asasi Manusia": "Kemenham",
    "Kementerian Imigrasi dan Pemasyarakatan": "Kemenimipas",
    "Kementerian Keuangan": "Kemenkeu",
    "Kementerian Pendidikan Dasar dan Menengah": "Kemendikdasmen",
    "Kementerian Pendidikan Tinggi, Sains, dan Teknologi": "Kemendiktisaintek",
    "Kementerian Kebudayaan": "Kemenbud",
    "Kementerian Kesehatan": "Kemenkes",
    "Kementerian Sosial": "Kemensos",
    "Kementerian Ketenagakerjaan": "Kemnaker",
    "Kementerian Perindustrian": "Kemenperin",
    "Kementerian Perdagangan": "Kemendag",
    "Kementerian Pekerjaan Umum": "Kemenpu",
    "Kementerian Perumahan dan Kawasan Permukiman": "Kemenperumahan",
    "Kementerian Perhubungan": "Kemenhub",
    "Kementerian Komunikasi dan Digital": "Komdigi",
    "Kementerian Pertanian": "Kementan",
    "Kementerian Kehutanan": "Kemenhut",
    "Kementerian Kelautan Dan Perikanan": "KKP",
    "Kementerian Agraria dan Tata Ruang/BPN": "ATR/BPN",
    "Kementerian Perencanaan Pembangunan Nasional/Bappenas": "Bappenas",
    "Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah": "LKPP",
    "Badan Pemeriksa Keuangan": "BPK",
    "Badan Pengawasan Keuangan Dan Pembangunan": "BPKP",
    "Komisi Pemberantasan Korupsi": "KPK",
};

const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/[(]/g, '-')
        .replace(/[)]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

const categorize = (name) => {
    if (name.startsWith("Kementerian")) return "MINISTRY";
    if (name.startsWith("Provinsi") || name === "Aceh") return "PROVINCE";
    if (name.startsWith("Kota")) return "CITY";
    if (name.startsWith("Kab.")) return "REGENCY";
    if (name.startsWith("Badan") || name.startsWith("Lembaga") || name.startsWith("Komisi") || name.startsWith("Pusat") || name.startsWith("Sekretariat") || name.startsWith("Dewan") || name.startsWith("Kejaksaan") || name.startsWith("Kepolisian") || name.startsWith("Arsip") || name.startsWith("Mahkamah") || name.startsWith("Majelis") || name.startsWith("Ombudsman") || name.startsWith("Otorita") || name.startsWith("Perpustakaan")) return "AGENCY";
    if (name.startsWith("PT.") || name.startsWith("PT ") || name.startsWith("PDAM") || name.startsWith("Perumda") || name.startsWith("Perumdam") || name.startsWith("Perusahaan") || name.startsWith("Bank") || name.startsWith("BUMD") || name.startsWith("PD ")) return "ENTERPRISE";
    if (name.startsWith("Universitas") || name.startsWith("Institut")) return "EDUCATION";
    if (name.startsWith("RSUD") || name.startsWith("Fasilitas Kesehatan") || name.startsWith("BPJS")) return "HEALTH";
    return "OTHER";
};

// Mapping of regencies to province (Sample logic)
const findProvinceId = (name) => {
    if (name.includes("Aceh")) return "provinsi-aceh";
    if (name.includes("Bandung") || name.includes("Bekasi") || name.includes("Bogor") || name.includes("Depok") || name.includes("Tasikmalaya")) return "provinsi-jawa-barat";
    if (name.includes("Semarang") || name.includes("Sleman")) return "provinsi-jawa-tengah";
    if (name.includes("Surabaya") || name.includes("Sidoarjo") || name.includes("Malang")) return "provinsi-jawa-timur";
    if (name.includes("Makassar") || name.includes("Gowa") || name.includes("Maros")) return "provinsi-sulawesi-selatan";
    if (name.includes("Jakarta")) return "provinsi-dki-jakarta";
    return undefined;
};

const data = institutionNames.map(name => {
    const category = categorize(name);
    const id = slugify(name);
    const item = {
        id: id,
        name: name,
        category: category,
    };

    if (abbreviations[name]) {
        item.abbreviation = abbreviations[name];
    }

    if (category === "CITY" || category === "REGENCY") {
        item.provinceId = findProvinceId(name);
    }

    return item;
});

// Remove duplicates if any (based on slug/ID)
const uniqueMap = new Map();
data.forEach(item => {
    if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
    }
});
const uniqueData = Array.from(uniqueMap.values());

const outputPath = 'c:/Users/user/Documents/GitHub/procurify-bm/sveltekit/src/lib/data/klpd.json';
fs.writeFileSync(outputPath, JSON.stringify(uniqueData, null, 2));
console.log(`Successfully generated klpd.json with ${uniqueData.length} institutions at ${outputPath}`);
