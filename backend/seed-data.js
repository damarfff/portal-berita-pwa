const prisma = require('./prisma');

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

async function seedData() {
  try {
    console.log('Mulai seeding data...');

    const admin = await prisma.admin.findFirst();
    if (!admin) {
      console.error('Admin belum ada! Jalankan dulu: node seed-admin.js');
      return;
    }

    const categoriesData = [
      { nama: 'Teknologi', slug: 'teknologi' },
      { nama: 'Politik', slug: 'politik' },
      { nama: 'Olahraga', slug: 'olahraga' },
      { nama: 'Ekonomi', slug: 'ekonomi' },
      { nama: 'Kesehatan', slug: 'kesehatan' }
    ];

    const categories = [];
    for (const cat of categoriesData) {
      const existing = await prisma.category.findUnique({
        where: { slug: cat.slug }
      });

      if (existing) {
        categories.push(existing);
        console.log(`Kategori "${cat.nama}" sudah ada, dilewati.`);
      } else {
        const created = await prisma.category.create({ data: cat });
        categories.push(created);
        console.log(`Kategori "${cat.nama}" berhasil dibuat.`);
      }
    }

    const articlesData = [
      {
        judul: 'Kemajuan Teknologi AI di Indonesia 2026',
        categoryName: 'Teknologi',
        isi: `Artikel ini membahas perkembangan kecerdasan buatan di Indonesia. Berbagai startup lokal mulai mengembangkan solusi berbasis AI untuk mengatasi masalah nyata di masyarakat.

Dari aplikasi pertanian pintar hingga sistem diagnosa medis, AI telah menjadi bagian penting dari ekosistem digital Indonesia. Para ahli memprediksi tren ini akan terus berkembang dalam beberapa tahun ke depan.

Pemerintah juga menunjukkan dukungan terhadap perkembangan AI melalui berbagai inisiatif dan program pendanaan untuk peneliti serta pengembang lokal. Beberapa universitas terkemuka bahkan sudah membuka program studi khusus AI dan machine learning.

Tantangan terbesar saat ini adalah memastikan bahwa teknologi AI dapat diakses dan dimanfaatkan oleh semua lapisan masyarakat, bukan hanya kalangan tertentu saja.`,
        status: 'published'
      },
      {
        judul: 'Pemilu 2026: Persiapan Menuju Pesta Demokrasi',
        categoryName: 'Politik',
        isi: `Komisi Pemilihan Umum mulai mempersiapkan berbagai hal terkait pelaksanaan pemilu mendatang. Berbagai daerah telah memulai proses pendataan pemilih dan distribusi logistik.

Partisipasi masyarakat menjadi kunci sukses pelaksanaan demokrasi. Pemerintah mengajak seluruh elemen masyarakat untuk aktif berpartisipasi dalam proses ini, terutama generasi muda yang baru pertama kali menggunakan hak pilihnya.

Sosialisasi mengenai cara pencoblosan, pentingnya verifikasi data pemilih, dan edukasi politik telah digencarkan melalui berbagai platform digital dan media tradisional.

Aksesibilitas TPS bagi penyandang disabilitas juga menjadi perhatian khusus. KPU memastikan setiap warga negara memiliki kesempatan yang sama untuk menyampaikan suaranya tanpa hambatan.`,
        status: 'published'
      },
      {
        judul: 'Timnas Indonesia Lolos Babak Final Piala Asia',
        categoryName: 'Olahraga',
        isi: `Tim nasional sepak bola Indonesia berhasil mencatat sejarah dengan lolos ke babak final Piala Asia setelah mengalahkan tim kuat dengan skor tipis. Kemenangan ini disambut antusias oleh pecinta sepak bola tanah air.

Pelatih kepala mengungkapkan bahwa kunci kesuksesan tim adalah disiplin taktik dan semangat juang yang tinggi dari para pemain. Strategi bertahan yang solid membuat lawan kesulitan menembus pertahanan.

Dukungan suporter yang hadir di stadion juga menjadi faktor penting yang mendorong para pemain memberikan penampilan terbaik. Atmosfer pertandingan yang luar biasa membuat tim tuan rumah sempat tertekan.

Pertandingan final akan menjadi tantangan berat berikutnya. Tim akan mempersiapkan diri secara matang dengan latihan intensif selama beberapa hari ke depan untuk menghadapi lawan tangguh di partai puncak.`,
        status: 'published'
      },
      {
        judul: 'Ekonomi Digital Tumbuh Pesat di Asia Tenggara',
        categoryName: 'Ekonomi',
        isi: `Pertumbuhan ekonomi digital di kawasan Asia Tenggara menunjukkan tren yang sangat positif. Indonesia menjadi salah satu negara dengan pertumbuhan tercepat berkat populasi digital yang besar dan adopsi teknologi yang cepat.

E-commerce, fintech, dan layanan digital lainnya menjadi sektor yang paling berkembang. UMKM lokal pun mulai memanfaatkan platform digital untuk memperluas jangkauan pasar mereka, baik di dalam negeri maupun ke luar negeri.

Investor global menunjukkan ketertarikan yang besar terhadap startup teknologi dari Indonesia. Beberapa unicorn baru bermunculan dengan valuasi yang terus meningkat seiring dengan ekspansi bisnis mereka.

Tantangan ke depan adalah memastikan inklusi digital merata, terutama untuk daerah pedesaan dan kelompok masyarakat yang masih kesulitan mengakses teknologi.`,
        status: 'published'
      },
      {
        judul: 'Pentingnya Aksesibilitas Digital untuk Semua',
        categoryName: 'Teknologi',
        isi: `Aksesibilitas digital menjadi topik yang semakin penting di era informasi saat ini. Setiap individu, terlepas dari kondisi fisik atau keterbatasan yang dimiliki, berhak mendapatkan akses yang sama terhadap informasi digital.

Pengguna dengan gangguan penglihatan seperti low vision dan buta warna sering mengalami kesulitan dalam mengakses website yang tidak dirancang dengan baik. Ukuran teks yang terlalu kecil, kontras warna yang rendah, dan struktur halaman yang tidak terorganisir dapat menjadi hambatan serius.

Web Content Accessibility Guidelines atau WCAG menjadi standar internasional yang membantu pengembang membangun website yang inklusif. Empat prinsip utamanya adalah perceivable, operable, understandable, dan robust.

Penerapan fitur seperti pengaturan ukuran teks, mode kontras tinggi, filter buta warna, dan text-to-speech dapat secara signifikan meningkatkan pengalaman pengguna dengan kebutuhan khusus dalam mengakses konten digital.`,
        status: 'published'
      },
      {
        judul: 'Tips Menjaga Kesehatan Mata di Era Digital',
        categoryName: 'Kesehatan',
        isi: `Penggunaan layar digital yang berlebihan dapat menyebabkan berbagai masalah kesehatan mata. Dokter spesialis mata menyarankan penerapan aturan 20-20-20: setiap 20 menit, lihat objek berjarak 20 kaki selama 20 detik.

Pencahayaan ruangan juga sangat berpengaruh terhadap kenyamanan mata saat menggunakan perangkat digital. Hindari menggunakan layar di ruangan yang gelap atau dengan pencahayaan terlalu terang.

Pengaturan kontras dan ukuran teks pada perangkat sesuai dengan kemampuan visual masing-masing individu sangat dianjurkan. Tidak ada satu ukuran yang cocok untuk semua orang.

Periksakan mata secara berkala ke dokter spesialis untuk mendeteksi gangguan penglihatan sejak dini. Banyak masalah mata yang dapat dicegah atau diobati jika ditangani lebih awal sebelum berkembang menjadi kondisi yang lebih serius.`,
        status: 'published'
      },
      {
        judul: 'Draft: Berita yang Belum Dipublikasikan',
        categoryName: 'Teknologi',
        isi: `Ini adalah contoh artikel dengan status draft. Artikel ini sengaja dibuat untuk menguji fitur draft di sistem.

Draft tidak akan muncul di halaman publik. Hanya admin yang bisa melihat dan mengeditnya melalui dashboard admin.

Saat siap dipublikasikan, admin tinggal mengklik tombol publish dan artikel akan langsung tayang di portal berita.`,
        status: 'draft'
      }
    ];

    for (const articleData of articlesData) {
      const category = categories.find(c => c.nama === articleData.categoryName);
      if (!category) continue;

      const slug = generateSlug(articleData.judul);
      
      const existing = await prisma.article.findUnique({
        where: { slug }
      });

      if (existing) {
        console.log(`Artikel "${articleData.judul}" sudah ada, dilewati.`);
        continue;
      }

      await prisma.article.create({
        data: {
          judul: articleData.judul,
          slug,
          isi: articleData.isi,
          status: articleData.status,
          publishedAt: articleData.status === 'published' ? new Date() : null,
          adminId: admin.id,
          categoryId: category.id
        }
      });
      console.log(`Artikel "${articleData.judul}" (${articleData.status}) berhasil dibuat.`);
    }

    console.log('\nSeeding selesai!');
    console.log(`Total: ${categories.length} kategori dan ${articlesData.length} artikel.`);

  } catch (error) {
    console.error('Error saat seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();