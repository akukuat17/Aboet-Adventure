export const SETTING_DEFAULTS: Record<string, { nilai: string | null; tipe: 'text' | 'textarea' | 'image'; label: string }> = {
  wa_number: { nilai: '6285799001985', tipe: 'text', label: 'Nomor WhatsApp Aboet' },
  wa_template_family: {
    nilai: 'Halo Aboet Adventure, saya ingin memesan:\nPaket: {paket}\nNama: {nama}\nTanggal: {tanggal}\nJumlah: {jumlah} {satuan}\nEstimasi: {estimasi}\nCatatan: {catatan}',
    tipe: 'textarea',
    label: 'Template WA Family',
  },
  wa_template_korporat: {
    nilai: 'Halo Aboet Adventure, saya mewakili perusahaan/instansi dan ingin menanyakan penawaran korporat untuk paket {paket}. Mohon info penawarannya. Terima kasih.',
    tipe: 'textarea',
    label: 'Template WA Korporat',
  },
  profil_tentang: {
    nilai: 'Aboet Adventure Sentul didirikan tahun 2015, awalnya penyedia jasa outbound inflatable balon dan wisata trekking untuk keluarga dan rombongan di Sentul. Kami berpengalaman dalam kegiatan indoor dan outdoor, standar keselamatan tinggi, suasana alam pegunungan Sentul.',
    tipe: 'textarea',
    label: 'Tentang Aboet',
  },
  profil_alamat: { nilai: 'Jl. Raya Jungleland Sentul, Karang Tengah, Babakan Madang, Bogor 16811', tipe: 'text', label: 'Alamat' },
  profil_jam: {
    nilai: 'Senin-Jumat: 06.00-17.00 WIB\nSabtu-Minggu & hari libur: 06.00-18.00 WIB\nArea camping & api unggun buka 24 jam (reservasi diutamakan)',
    tipe: 'textarea',
    label: 'Jam Operasional',
  },
  profil_telepon: { nilai: '0857-9900-1985', tipe: 'text', label: 'Nomor Telepon' },
  profil_instagram: { nilai: 'https://instagram.com/aboetadventure', tipe: 'text', label: 'Instagram' },
  profil_facebook: { nilai: 'https://facebook.com/aboetadventure', tipe: 'text', label: 'Facebook' },
  profil_foto: { nilai: null, tipe: 'image', label: 'Foto Profil' },
};

export type SettingKey = keyof typeof SETTING_DEFAULTS;
