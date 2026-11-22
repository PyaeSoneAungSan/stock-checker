// Sample Data for Malaysian Mini-Mart (Runcit) DIY & Medicine Check
// Relative expiry dates dynamically computed from current date for realistic demos

export function getInitialItems() {
  const now = new Date();
  const addDays = (d) => {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    return date.toISOString().split('T')[0];
  };

  return [
    // --- DIY SECTION ---
    {
      id: "diy-001",
      section: "DIY",
      name: "Mentol LED 12W (Daylight)",
      aliasMalay: "Mentol Lampu Putih E27 12 Watt",
      category: "Lighting & Electrical",
      shelfLocation: "Rack D - Tengah (Shelf 2)",
      price: 8.90,
      stockStatus: "out_of_stock", // 'in_stock', 'low_stock', 'out_of_stock'
      stockQty: 0,
      priceTagChecked: true,
      checkedToday: true,
      lastCheckedTime: new Date(now.getTime() - 15 * 60000).toISOString(),
      expiryDate: "",
      notes: "Pembekal: Philips / Seng Hup. Model paling laku, pelanggan selalu cari.",
      image: "https://images.unsplash.com/photo-1550525811-e5869dd03032?w=400&auto=format&fit=crop&q=80",
      svgIcon: "bulb"
    },
    {
      id: "diy-002",
      section: "DIY",
      name: "Plug Top 3-Pin 13A (SIRIM)",
      aliasMalay: "Kepala Plug 3 Pin Hitam / Putih",
      category: "Lighting & Electrical",
      shelfLocation: "Rack D - Bawah (Bin 3)",
      price: 4.50,
      stockStatus: "in_stock",
      stockQty: 18,
      priceTagChecked: true,
      checkedToday: true,
      lastCheckedTime: new Date(now.getTime() - 12 * 60000).toISOString(),
      expiryDate: "",
      notes: "Pastikan ada logo cop SIRIM. Simpan skru dalam plastik.",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
      svgIcon: "plug"
    },
    {
      id: "diy-003",
      section: "DIY",
      name: "Gam Gajah 502 Super Glue (Cyanoacrylate)",
      aliasMalay: "Gam Gajah Original Kuat Melekat 20g",
      category: "Adhesives & Tapes",
      shelfLocation: "Counter Hook 2 (Depan Kaunter)",
      price: 2.80,
      stockStatus: "low_stock",
      stockQty: 3,
      priceTagChecked: false, // Missing tag!
      checkedToday: false,
      lastCheckedTime: null,
      expiryDate: "",
      notes: "Tanda harga tercabut dari cangkuk hook. Perlu print label baru.",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80",
      svgIcon: "glue"
    },
    {
      id: "diy-004",
      section: "DIY",
      name: "Black Electrical Tape 18mm x 10m",
      aliasMalay: "Pita Pelekat Wayar Hitam / Selotep Wayar",
      category: "Lighting & Electrical",
      shelfLocation: "Rack D - Atas (Shelf 1)",
      price: 1.50,
      stockStatus: "in_stock",
      stockQty: 24,
      priceTagChecked: true,
      checkedToday: true,
      lastCheckedTime: new Date(now.getTime() - 25 * 60000).toISOString(),
      expiryDate: "",
      notes: "Tahan voltan 600V. Jenama Nikko / Deer.",
      image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400&auto=format&fit=crop&q=80",
      svgIcon: "tape"
    },
    {
      id: "diy-005",
      section: "DIY",
      name: "Padlock Heavy Duty 40mm Brass",
      aliasMalay: "Mangga Kunci Pintu Tembaga (3 Kunci)",
      category: "Hardware & Tools",
      shelfLocation: "Rack E - Tengah (Shelf 2)",
      price: 12.90,
      stockStatus: "in_stock",
      stockQty: 8,
      priceTagChecked: true,
      checkedToday: false,
      lastCheckedTime: null,
      expiryDate: "",
      notes: "Dilengkapi 3 anak kunci spare. Jangan koyakkan seal blister pack.",
      image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=80",
      svgIcon: "lock"
    },
    {
      id: "diy-006",
      section: "DIY",
      name: "Kepala Paip PVC 1/2\" (Water Tap)",
      aliasMalay: "Kepala Paip Plastik Biru / Putih Sinki",
      category: "Plumbing & Sanitary",
      shelfLocation: "Rack E - Bawah (Kotak 4)",
      price: 5.20,
      stockStatus: "in_stock",
      stockQty: 11,
      priceTagChecked: false, // Missing tag!
      checkedToday: false,
      lastCheckedTime: null,
      expiryDate: "",
      notes: "Tanda harga hilang semasa susun semula rak plumbing pagi tadi.",
      image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&auto=format&fit=crop&q=80",
      svgIcon: "faucet"
    },
    {
      id: "diy-007",
      section: "DIY",
      name: "Cable Tie 200mm (100 Pcs / Pack)",
      aliasMalay: "Pengikat Kabel / Tali Zip Plastik Putih",
      category: "Hardware & Tools",
      shelfLocation: "Rack D - Gantung (Hook 7)",
      price: 3.90,
      stockStatus: "low_stock",
      stockQty: 2,
      priceTagChecked: true,
      checkedToday: false,
      lastCheckedTime: null,
      expiryDate: "",
      notes: "Saiz 8 inci standard. Ramai beli untuk ikat dawai pagar atau wiring motor.",
      image: "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?w=400&auto=format&fit=crop&q=80",
      svgIcon: "tie"
    },

    // --- MEDICINE SECTION ---
    {
      id: "med-001",
      section: "Medicine",
      name: "Panadol ActiFast 500mg (10 Tablets)",
      aliasMalay: "Panadol Merah Pantas Melegakan Sakit",
      category: "Pain, Fever & Headache",
      shelfLocation: "Rak Ubat 1A (Baris Atas Kiri)",
      price: 9.80,
      stockStatus: "low_stock",
      stockQty: 4,
      priceTagChecked: true,
      checkedToday: true,
      lastCheckedTime: new Date(now.getTime() - 5 * 60000).toISOString(),
      expiryDate: addDays(110), // Safe (>90 days)
      notes: "Melegakan sakit kepala berdenyut & demam pantas. Pastikan strip tidak remuk.",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
      svgIcon: "pill"
    },
    {
      id: "med-002",
      section: "Medicine",
      name: "Panadol Regular 500mg (10 Tablets)",
      aliasMalay: "Panadol Biru / Ubat Demam Standard",
      category: "Pain, Fever & Headache",
      shelfLocation: "Rak Ubat 1A (Baris Atas Kanan)",
      price: 5.50,
      stockStatus: "in_stock",
      stockQty: 32,
      priceTagChecked: true,
      checkedToday: true,
      lastCheckedTime: new Date(now.getTime() - 8 * 60000).toISOString(),
      expiryDate: addDays(320), // Safe
      notes: "Item pusingan paling laju di kaunter mini-mart.",
      image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80",
      svgIcon: "pill"
    },
    {
      id: "med-003",
      section: "Medicine",
      name: "Strepsils Honey & Lemon (8 Lozenges)",
      aliasMalay: "Ubat Hisap Sakit Tekak Kuning / Madu Lemon",
      category: "Cough & Throat Care",
      shelfLocation: "Rak Ubat 1B (Depan Kaunter)",
      price: 7.20,
      stockStatus: "out_of_stock", // Out of stock!
      stockQty: 0,
      priceTagChecked: true,
      checkedToday: false,
      lastCheckedTime: null,
      expiryDate: addDays(24), // Expiring soon! (<30 days - CRITICAL)
      notes: "Baki stok di rak habis sepenuhnya. Batch lama tamat tempoh dalam 24 hari!",
      image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=80",
      svgIcon: "lozenge"
    },
    {
      id: "med-004",
      section: "Medicine",
      name: "Minyak Cap Kapak No.3 (14ml)",
      aliasMalay: "Axe Brand Universal Oil / Minyak Angin Kapak",
      category: "Medicated Oils & Balm",
      shelfLocation: "Rak Ubat 2A (Tengah)",
      price: 6.90,
      stockStatus: "in_stock",
      stockQty: 9,
      priceTagChecked: true,
      checkedToday: false,
      lastCheckedTime: null,
      expiryDate: addDays(68), // Expiring soon! (<90 days)
      notes: "Batch sedia ada tamat tempoh dalam masa ~2 bulan. Utamakan First-In-First-Out.",
      image: "https://images.unsplash.com/photo-1608248597359-5f2105151528?w=400&auto=format&fit=crop&q=80",
      svgIcon: "oil"
    },
    {
      id: "med-005",
      section: "Medicine",
      name: "Pil Chi Kit Teck Aun (Sachet)",
      aliasMalay: "Ubat Cirit-Birit & Sakit Perut Teck Aun (Biji Kecil)",
      category: "Digestive & Stomach Care",
      shelfLocation: "Rak Ubat 2B (Gantung Sachet)",
      price: 2.50,
      stockStatus: "in_stock",
      stockQty: 15,
      priceTagChecked: false, // Missing tag!
      checkedToday: false,
      lastCheckedTime: null,
      expiryDate: addDays(380), // Safe
      notes: "Tanda harga pelekat kecil tercabut. Perlu letak label harga RM 2.50 atas kotak gantung.",
      image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&auto=format&fit=crop&q=80",
      svgIcon: "herbal"
    },
    {
      id: "med-006",
      section: "Medicine",
      name: "Gaviscon Liquid Sachet (5 x 10ml)",
      aliasMalay: "Ubat Pedih Ulu Hati & Gastrik (Perisa Pudina)",
      category: "Digestive & Stomach Care",
      shelfLocation: "Rak Ubat 2C (Tengah Kanan)",
      price: 14.50,
      stockStatus: "low_stock",
      stockQty: 2,
      priceTagChecked: true,
      checkedToday: false,
      lastCheckedTime: null,
      expiryDate: addDays(42), // Expiring soon! (<90 days)
      notes: "Tinggal 2 kotak sahaja di rak. Tarikh luput hampir (~42 hari). Perlu reorder segera.",
      image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80",
      svgIcon: "sachet"
    },
    {
      id: "med-007",
      section: "Medicine",
      name: "Counterpain Analgesic Cream 30g",
      aliasMalay: "Krim Panas Sakit Otot & Sendi Counterpain",
      category: "Muscle Relief & Balm",
      shelfLocation: "Rak Ubat 3A (Baris Bawah)",
      price: 11.20,
      stockStatus: "in_stock",
      stockQty: 7,
      priceTagChecked: true,
      checkedToday: true,
      lastCheckedTime: new Date(now.getTime() - 2 * 60000).toISOString(),
      expiryDate: addDays(270), // Safe
      notes: "Periksa tiub tidak kemek atau penutup terbuka.",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80",
      svgIcon: "cream"
    },
    {
      id: "med-008",
      section: "Medicine",
      name: "Hansaplast Plaster Kain Elastik (10 Strips)",
      aliasMalay: "Plaster Luka Kain Coklat Tahan Air",
      category: "First Aid & Bandages",
      shelfLocation: "Rak Ubat 3B (Bawah Sekali)",
      price: 3.80,
      stockStatus: "in_stock",
      stockQty: 20,
      priceTagChecked: true,
      checkedToday: false,
      lastCheckedTime: null,
      expiryDate: addDays(450), // Safe
      notes: "Stok selamat, permintaan tinggi dari pelanggan bengkel berdekatan.",
      image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&auto=format&fit=crop&q=80",
      svgIcon: "bandage"
    }
  ];
}
