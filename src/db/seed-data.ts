/**
 * Data awal. Sumber paket: "Paket Wisata Sentul by Aboet Adventure".
 * tiers = [nama tier, harga, min peserta]
 *  - harga_mulai & min_peserta  = tier pertama
 *  - tier lain ditampilkan di deskripsi
 */
export type Tier = [string, number, number];

export type SeedPaket = {
  nama: string;
  slug: string;
  satuan?: 'Orang' | 'Unit' | 'Pax';
  lokasi: string;
  deskripsi: string;
  ikon: string;
  durasi: string;
  medan: 'Mudah' | 'Sedang' | 'Sulit';
  tiers: Tier[];
  termasuk: string[];
};

export const SEED_KATEGORI = [
  { nama: 'Rafting & Aktivitas Air', slug: 'rafting-air', ikon: 'water', warnaBg: '#dcf0e2', warnaIkon: '#2f9e58', urutan: 1 },
  { nama: 'Fun Trekking & Hiking', slug: 'fun-trekking-hiking', ikon: 'hiking', warnaBg: '#dbeefb', warnaIkon: '#2f8fd1', urutan: 2 },
  { nama: 'Adventure & Trail', slug: 'adventure-trail', ikon: 'directions_run', warnaBg: '#fde7d6', warnaIkon: '#e0793e', urutan: 3 },
];

const trekkingDasar = [
  'Tiket kawasan & retribusi jalur',
  'Guide & sweeper',
  'Air mineral 600 ml',
  'Trekking pole (dipinjamkan)',
  'P3K, asuransi perjalanan & jas hujan',
  'Foto & video',
];
const raftingDasar = [
  'Tim rescue & guide pendamping',
  'Perlengkapan APD, perahu karet & dayung',
  'Air mineral 600 ml & kelapa muda',
  'Coffee break',
  'P3K & asuransi wisata',
  'Foto & video',
];
const outboundDasar = [
  'Design program & games master',
  'Fasilitator & tim support',
  'Property games & teknik lapangan',
  'Holy powder',
  'Sound system',
];
const offroadTiers: Tier[] = [['Paket 1', 350000, 8], ['Paket 2', 400000, 30], ['Fullboard', 475000, 30]];

export const SEED_PAKET: Record<string, SeedPaket[]> = {
  'rafting-air': [
    {
      nama: 'Rafting Kalibaru Sentul', slug: 'rafting-kalibaru-sentul', lokasi: 'Sungai Kalibaru, Sentul',
      deskripsi: 'Arung jeram di Sungai Kalibaru sepanjang 7–8 km dengan lintasan seru dan aman, cocok untuk keluarga maupun rombongan.',
      ikon: 'water', durasi: '2–3 Jam', medan: 'Sedang',
      tiers: [['Paket 1', 250000, 30], ['Paket 2', 300000, 30], ['Fullboard', 500000, 30]], termasuk: raftingDasar,
    },
    {
      nama: 'Rafting Ciliwung Sentul', slug: 'rafting-ciliwung-sentul', lokasi: 'Sungai Ciliwung, Sentul',
      deskripsi: 'Arung jeram di Sungai Ciliwung sepanjang 8–11 km dengan riam yang lebih panjang dan menantang.',
      ikon: 'water', durasi: '3–4 Jam', medan: 'Sedang',
      tiers: [['Paket 1', 300000, 30], ['Paket 2', 350000, 30], ['Fullboard', 550000, 30]], termasuk: raftingDasar,
    },
    {
      nama: 'Rafting Cisadane Bogor', slug: 'rafting-cisadane-bogor', lokasi: 'Sungai Cisadane, Bogor',
      deskripsi: 'Arung jeram di Sungai Cisadane sepanjang 8–12 km dengan jeram alami bervariasi bersama pemandu profesional.',
      ikon: 'water', durasi: '3–4 Jam', medan: 'Sedang',
      tiers: [['Paket 1', 250000, 30], ['Paket 2', 300000, 30], ['Fullboard', 550000, 30]], termasuk: raftingDasar,
    },
    {
      nama: 'River Tubing Sentul', slug: 'river-tubing-sentul', lokasi: 'Sungai Ciherang, Sukamantri',
      deskripsi: 'Meluncur di atas ban menyusuri arus Sungai Ciherang sepanjang 1–2 km. Santai, segar, dan seru untuk semua usia.',
      ikon: 'kayaking', durasi: '1 Jam', medan: 'Mudah',
      tiers: [['Paket 1', 175000, 10], ['Paket 2', 200000, 10], ['Fullboard', 400000, 30]],
      termasuk: ['Tiket kawasan', 'Guide pendamping', 'Perlengkapan APD, ban warna & pelampung', 'Air mineral 600 ml', 'P3K & asuransi wisata', 'Foto & video'],
    },
    {
      nama: 'Canyoning Sentul', slug: 'canyoning-sentul', lokasi: 'Curug Cibingbin – Curug Ngumpet',
      deskripsi: 'Menyusuri tebing dan air terjun dengan teknik canyoning sepanjang 3–6 km, lengkap dengan makan siang dan tim porter.',
      ikon: 'water_drop', durasi: '3–4 Jam', medan: 'Sulit',
      tiers: [['Paket 1', 450000, 5], ['Paket 2', 400000, 10], ['Fullboard', 375000, 30]],
      termasuk: ['Tiket masuk kawasan & tiket parkir', 'Guide pendamping & porter tim', 'Perlengkapan APD & safety gear', 'Makan siang, hot drink & pop mie', 'Penitipan barang', 'P3K, asuransi wisata & foto video'],
    },
  ],
  'fun-trekking-hiking': [
    {
      nama: 'Fun Trekking Easy', slug: 'fun-trekking-easy', lokasi: 'Sentul, Bogor',
      deskripsi: 'Trekking santai 3–4 km pergi-pulang. Pilihan rute: Curug Leuwi Asih – Bukit Ilalang • Curug Kencana – Curug Love • Leuwi Hejo – Curug Barong • Hutan Pinus – Kawah Merah • Curug Cibingbin – Curug Ngumpet • Curug Bidadari. Sebutkan rute pilihan saat chat.',
      ikon: 'hiking', durasi: '2–3 Jam', medan: 'Mudah',
      tiers: [['Easy 1', 175000, 4], ['Easy 2', 250000, 10], ['Fullboard', 350000, 50]], termasuk: trekkingDasar,
    },
    {
      nama: 'Fun Trekking Medium', slug: 'fun-trekking-medium', lokasi: 'Sentul, Bogor',
      deskripsi: 'Trekking 6–8 km pergi-pulang. Pilihan rute: Goa Garunggang – Curug Leuwi Asih • Curug Cibaliung – Leuwi Hejo • Bukit Paniisan via Gunung Pancar • Curug Hordeng – Curug Ciburial • Gunung Kuta – Curug Mariuk • Bukit Daolong – Bukit Silala. Sebutkan rute pilihan saat chat.',
      ikon: 'hiking', durasi: '3–4 Jam', medan: 'Sedang',
      tiers: [['Medium 1', 200000, 4], ['Medium 2', 275000, 10], ['Fullboard', 375000, 50]], termasuk: trekkingDasar,
    },
    {
      nama: 'Fun Trekking Cisadon', slug: 'fun-trekking-cisadon', lokasi: 'Kampung Cisadon, Bogor',
      deskripsi: 'Eksplor Kampung Cisadon sejauh 8–15 km: Kampung Awan, Pondok Pemburu, Bukit Cisadon, hingga Dusun Cisadon.',
      ikon: 'hiking', durasi: '6–7 Jam', medan: 'Sulit',
      tiers: [['Paket 1', 250000, 4], ['Paket 2', 300000, 10], ['Fullboard', 400000, 50]], termasuk: trekkingDasar,
    },
  ],
  'adventure-trail': [
    {
      nama: 'Paket Wisata Jeep', slug: 'paket-wisata-jeep', lokasi: 'Sungai Ciherang – Hambalang Hills',
      deskripsi: 'Offroad Jeep melintasi Sungai Ciherang hingga Hambalang Hills sejauh 8–15 km bersama driver profesional.',
      ikon: 'directions_car', durasi: '2–3 Jam', medan: 'Sedang', tiers: offroadTiers,
      termasuk: ['Armada Jeep + BBM', 'Driver profesional', 'Retribusi jalur offroad', 'Air mineral 600 ml & jas hujan', 'P3K, asuransi perjalanan & back up car'],
    },
    {
      nama: 'Paket Wisata Landrover', slug: 'paket-wisata-landrover', lokasi: 'Sungai Ciherang – Hambalang Hills',
      deskripsi: 'Offroad Landrover klasik melintasi Sungai Ciherang hingga Hambalang Hills sejauh 8–15 km bersama driver profesional.',
      ikon: 'directions_car', durasi: '2–3 Jam', medan: 'Sedang', tiers: offroadTiers,
      termasuk: ['Armada Landrover + BBM', 'Driver profesional', 'Retribusi jalur offroad', 'Air mineral 600 ml & jas hujan', 'P3K, asuransi perjalanan & back up car'],
    },
    {
      nama: 'Sewa ATV Adventure', slug: 'sewa-atv-adventure', satuan: 'Unit', lokasi: 'Sungai Ciherang – Hambalang Hills',
      deskripsi: 'Berpetualang dengan ATV 300 cc sejauh 8–12 km didampingi marshal profesional.',
      ikon: 'two_wheeler', durasi: '2–3 Jam', medan: 'Sedang',
      tiers: [['Paket 1', 1500000, 2], ['Paket 2', 1750000, 2], ['Fullboard', 1850000, 2]],
      termasuk: ['ATV 300 cc', 'Marshal profesional', 'Retribusi jalur ATV & back up ATV', 'P3K, asuransi perjalanan & jas hujan', 'Foto & video'],
    },
    {
      nama: 'Trail Adventure (Trabas)', slug: 'trail-adventure-trabas', satuan: 'Unit', lokasi: 'Hambalang Hills – Cisadon',
      deskripsi: 'Trabas motor cross sejauh 15–30 km dari Hambalang Hills hingga Cisadon bersama marshal profesional.',
      ikon: 'two_wheeler', durasi: '6–7 Jam', medan: 'Sulit',
      tiers: [['Paket 1', 1050000, 2], ['Paket 2', 1250000, 2], ['Fullboard', 1500000, 2]],
      termasuk: ['Motor cross, helm & sepatu boots', 'Marshal profesional', 'Retribusi jalur & back up trail', 'P3K, asuransi perjalanan & jas hujan', 'Foto & video'],
    },
    {
      nama: 'Outbound Fun Games', slug: 'outbound-fun-games', lokasi: 'Sentul, Bogor',
      deskripsi: 'Outbound seru untuk gathering dan team building dengan games, fasilitator, dan holy powder.',
      ikon: 'groups', durasi: '3–4 Jam', medan: 'Mudah',
      tiers: [['Half Day', 175000, 30], ['One Day', 200000, 30], ['Fullboard', 400000, 30]], termasuk: outboundDasar,
    },
    {
      nama: 'Inflatable Balon', slug: 'inflatable-balon', lokasi: 'Sentul, Bogor',
      deskripsi: 'Permainan inflatable balon yang seru untuk gathering keluarga dan perusahaan.',
      ikon: 'celebration', durasi: '3–4 Jam', medan: 'Mudah',
      tiers: [['Half Day', 400000, 30], ['One Day', 450000, 30], ['Fullboard', 600000, 30]], termasuk: outboundDasar,
    },
    {
      nama: 'Main Paint Ball', slug: 'main-paint-ball', lokasi: 'Sentul, Bogor',
      deskripsi: 'Perang paintball dengan instruktur, body protector, dan seragam army.',
      ikon: 'sports_esports', durasi: '2–3 Jam', medan: 'Sedang',
      tiers: [['Half Day', 175000, 30], ['One Day', 250000, 30], ['Fullboard', 500000, 30]],
      termasuk: ['Instruktur', 'Body protector & pelindung wajah', 'Marker Tippman 98 Custom', 'Seragam army', 'Amunisi 40 butir per orang'],
    },
    {
      nama: 'Main Archery War', slug: 'main-archery-war', lokasi: 'Sentul, Bogor',
      deskripsi: 'Perang panah seru dengan instruktur, body protector, dan pelindung wajah.',
      ikon: 'target', durasi: '2–3 Jam', medan: 'Sedang',
      tiers: [['Half Day', 175000, 30], ['One Day', 250000, 30], ['Fullboard', 500000, 30]],
      termasuk: ['Instruktur', 'Body protector & pelindung wajah', 'Busur panah', 'Brigade anak panah'],
    },
    {
      nama: 'Camping Ceria', slug: 'camping-ceria', lokasi: 'Sentul, Bogor',
      deskripsi: 'Camping di alam Sentul lengkap dengan tenda, api unggun, dan makan. Paket ini 2 hari 1 malam.',
      ikon: 'camping', durasi: '12 Jam', medan: 'Mudah',
      tiers: [['Camping 2H-1M', 375000, 4], ['Camping 3H-2M', 750000, 30], ['Glamping 2H-1M', 650000, 30]],
      termasuk: ['Camping ground & tiket masuk lokasi', 'Tenda, matras & sleeping bag', 'Api unggun', 'Snack, makan siang & air mineral', 'Ranger, keamanan, parkir, toilet & listrik'],
    },
  ],
};

const rp = (n: number) => 'Rp' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** "Pilihan paket lain: Paket 2 Rp300.000 (min. 30 orang) • Fullboard Rp500.000 (min. 30 orang)." */
export function ringkasTier(tiers: Tier[], satuan: string): string {
  const lain = tiers.slice(1);
  if (!lain.length) return '';
  const teks = lain.map(([n, h, m]) => `${n} ${rp(h)} (min. ${m} ${satuan.toLowerCase()})`);
  return `Pilihan paket lain: ${teks.join(' • ')}.`;
}
