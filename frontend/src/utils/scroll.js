// Navbar menempel di atas (sticky), jadi setiap lompatan antar-section perlu
// disisakan ruang segini supaya judulnya tidak tertutup navbar.
export const NAV_OFFSET = 96;

// Dipakai bersama oleh Navbar dan tombol "Lihat Berita Lainnya" di beranda.
// Mengembalikan false kalau elemennya belum ada di halaman ini — pemanggil
// bisa memakai itu untuk memutuskan perlu pindah halaman dulu atau tidak.
export const scrollKeSection = (id, offset = NAV_OFFSET) => {
  const el = document.getElementById(id);
  if (!el) return false;

  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  return true;
};

export const SECTION_ARTIKEL = 'daftar-artikel';
export const SECTION_TENTANG = 'tentang';
