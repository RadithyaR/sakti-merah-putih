const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...\n');

  // Delete all existing data
  console.log('🗑️  Cleaning existing data...');
  await prisma.member.deleteMany();
  await prisma.ktpRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.koperasi.deleteMany();
  console.log('✅ Existing data cleaned\n');

  // Create cooperatives
  console.log('🏢 Creating cooperatives...');
  const koperasi1 = await prisma.koperasi.create({
    data: {
      nama: 'Koperasi Desa Merah Putih',
      alamat: 'Jl. Merdeka No. 1, Desa Merah Putih',
      kode: 'KMP001'
    }
  });

  const koperasi2 = await prisma.koperasi.create({
    data: {
      nama: 'Koperasi Sejahtera',
      alamat: 'Jl. Sejahtera No. 2',
      kode: 'KSS002'
    }
  });

  const koperasi3 = await prisma.koperasi.create({
    data: {
      nama: 'Koperasi Makmur',
      alamat: 'Jl. Makmur No. 3',
      kode: 'KSM003'
    }
  });
  console.log(`✅ Created ${3} cooperatives\n`);

  // Create admin users for each cooperative
  console.log('👤 Creating admin users...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.create({
    data: {
      username: 'admin1',
      password: hashedPassword,
      nama: 'Admin Koperasi Merah Putih',
      role: 'Admin',
      koperasiId: koperasi1.id
    }
  });

  await prisma.user.create({
    data: {
      username: 'admin2',
      password: hashedPassword,
      nama: 'Admin Koperasi Sejahtera',
      role: 'Admin',
      koperasiId: koperasi2.id
    }
  });

  await prisma.user.create({
    data: {
      username: 'admin3',
      password: hashedPassword,
      nama: 'Admin Koperasi Makmur',
      role: 'Admin',
      koperasiId: koperasi3.id
    }
  });
  console.log(`✅ Created 3 admin users (admin1, admin2, admin3 - password: admin123)\n`);

  // Indonesian names data
  const maleNames = [
    'Ahmad Sudirman',
    'Budi Santoso',
    'Cahyo Wibowo',
    'Dedi Kurniawan',
    'Eko Prasetyo',
    'Fajar Hidayat',
    'Gunawan Pratama',
    'Hendra Wijaya',
    'Irfan Maulana',
    'Joko Susilo',
    'Kurniawan Adi',
    'Lukman Hakim',
    'Muhammad Rizki',
    'Nanda Putra',
    'Oki Setiawan',
  ];

  const femaleNames = [
    'Ani Yudhoyono',
    'Bunga Citra',
    'Cindy Claudia',
    'Dewi Lestari',
    'Eka Sari',
    'Fitri Handayani',
    'Gita Puspita',
    'Hani Mohamad',
    'Indah Permata',
    'Julia Perez',
    'Kartika Sari',
    'Lina Marlina',
    'Maya Angelina',
    'Nurul Hidayah',
    'Okky Pratama',
  ];

  const cities = [
    'Jakarta',
    'Bandung',
    'Surabaya',
    'Medan',
    'Semarang',
    'Makassar',
    'Palembang',
    'Depok',
    'Bekasi',
    'Tangerang',
    'Bogor',
    'Yogyakarta',
    'Malang',
    'Solo',
    'Denpasar',
  ];

  const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha'];

  const jobs = [
    'Wiraswasta',
    'Pegawai Negeri Sipil',
    'Guru',
    'Dokter',
    'Perawat',
    'Petani',
    'Pedagang',
    'Karyawan Swasta',
    'Buruh',
    'TNI',
    'POLRI',
    'Pensiunan',
    'Ibu Rumah Tangga',
    'Mahasiswa',
    'Pengacara',
  ];

  // Generate 30 KTP records
  console.log('📝 Creating 30 KTP records...');
  const ktpRecords = [];
  const rfidSamples = [];

  for (let i = 0; i < 30; i++) {
    const isMale = i < 15; // First 15 male, next 15 female
    const name = isMale ? maleNames[i] : femaleNames[i - 15];
    const gender = isMale ? 'L' : 'P';

    // Generate NIK: 32010101XXXXYYYY
    const sequence = String(i + 1).padStart(4, '0');
    const year = 1985 + Math.floor(Math.random() * 14); // 1985-1998
    const nik = `32010101${sequence}${year}`;

    // Generate birth date
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const tanggalLahir = new Date(`${year}-${month}-${day}`);

    // Generate address
    const streetNumber = Math.floor(Math.random() * 100) + 1;
    const streets = [
      'Jl. Merdeka',
      'Jl. Sudirman',
      'Jl. Thamrin',
      'Jl. Gatot Subroto',
      'Jl. Ahmad Yani',
      'Jl. Diponegoro',
      'Jl. Imam Bonjol',
      'Jl. Pahlawan',
      'Jl. Kartini',
      'Jl. Kebon Jati',
    ];
    const alamat = `${streets[Math.floor(Math.random() * streets.length)]} No. ${streetNumber}`;

    // Generate RT/RW
    const rt = String(Math.floor(Math.random() * 10) + 1).padStart(3, '0');
    const rw = String(Math.floor(Math.random() * 5) + 1).padStart(3, '0');
    const rtRw = `${rt}/${rw}`;

    // Generate RFID UID: RFID-XXXX-YYYY
    const rfidNumber = String(i + 1).padStart(4, '0');
    const rfidHex = Math.floor(Math.random() * 65535)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
    const rfidUid = `RFID-${rfidNumber}-${rfidHex}`;

    const ktpData = {
      nik: nik,
      nama: name,
      tempatLahir: cities[Math.floor(Math.random() * cities.length)],
      tanggalLahir: tanggalLahir,
      jenisKelamin: gender,
      alamat: alamat,
      rtRw: rtRw,
      kelurahan: 'Desa Merah Putih',
      kecamatan: 'Kecamatan Maju',
      kabupaten: 'Kabupaten Sejahtera',
      provinsi: 'DKI Jakarta',
      agama: religions[Math.floor(Math.random() * religions.length)],
      statusPerkawinan: Math.random() > 0.5 ? 'Kawin' : 'Belum Kawin',
      pekerjaan: jobs[Math.floor(Math.random() * jobs.length)],
      rfidUid: rfidUid,
    };

    ktpRecords.push(ktpData);

    // Store first 5 RFID samples
    if (i < 5) {
      rfidSamples.push(rfidUid);
    }
  }

  // Add 4 physical RFID card records
  const physicalCards = [
    {
      nik: '3201010200011990',
      nama: 'Ahmad Suryadi',
      tempatLahir: 'Jakarta',
      tanggalLahir: new Date('1990-05-15'),
      jenisKelamin: 'L',
      alamat: 'Jl. Merdeka No. 10',
      rtRw: '001/002',
      kelurahan: 'Desa Merah Putih',
      kecamatan: 'Kecamatan Maju',
      kabupaten: 'Kabupaten Sejahtera',
      provinsi: 'DKI Jakarta',
      agama: 'Islam',
      statusPerkawinan: 'Kawin',
      pekerjaan: 'Wiraswasta',
      rfidUid: '0013910654',
    },
    {
      nik: '3201010200021988',
      nama: 'Siti Nurhaliza',
      tempatLahir: 'Bandung',
      tanggalLahir: new Date('1988-08-20'),
      jenisKelamin: 'P',
      alamat: 'Jl. Sudirman No. 25',
      rtRw: '002/003',
      kelurahan: 'Desa Merah Putih',
      kecamatan: 'Kecamatan Maju',
      kabupaten: 'Kabupaten Sejahtera',
      provinsi: 'DKI Jakarta',
      agama: 'Islam',
      statusPerkawinan: 'Kawin',
      pekerjaan: 'Guru',
      rfidUid: '0013624776',
    },
    {
      nik: '3201010200031992',
      nama: 'Budi Santoso',
      tempatLahir: 'Surabaya',
      tanggalLahir: new Date('1992-03-10'),
      jenisKelamin: 'L',
      alamat: 'Jl. Thamrin No. 15',
      rtRw: '003/001',
      kelurahan: 'Desa Merah Putih',
      kecamatan: 'Kecamatan Maju',
      kabupaten: 'Kabupaten Sejahtera',
      provinsi: 'DKI Jakarta',
      agama: 'Kristen',
      statusPerkawinan: 'Belum Kawin',
      pekerjaan: 'Programmer',
      rfidUid: '4167398946',
    },
    {
      nik: '3201010200041995',
      nama: 'Dewi Lestari',
      tempatLahir: 'Yogyakarta',
      tanggalLahir: new Date('1995-11-25'),
      jenisKelamin: 'P',
      alamat: 'Jl. Gatot Subroto No. 30',
      rtRw: '004/002',
      kelurahan: 'Desa Merah Putih',
      kecamatan: 'Kecamatan Maju',
      kabupaten: 'Kabupaten Sejahtera',
      provinsi: 'DKI Jakarta',
      agama: 'Islam',
      statusPerkawinan: 'Belum Kawin',
      pekerjaan: 'Desainer Grafis',
      rfidUid: '4167372726',
    },
  ];

  // Add physical cards to the list
  ktpRecords.push(...physicalCards);

  // Create all KTP records
  for (const ktp of ktpRecords) {
    await prisma.ktpRecord.create({
      data: ktp,
    });
  }

  console.log(`✅ Created ${ktpRecords.length} KTP records\n`);

  // Display summary
  console.log('📊 Seed Summary:');
  console.log(`   - Cooperatives: 3`);
  console.log(`   - Admin users: 3 (admin1, admin2, admin3)`);
  console.log(`   - KTP records: ${ktpRecords.length}`);
  console.log(`   - Male: ${ktpRecords.filter((k) => k.jenisKelamin === 'L').length}`);
  console.log(`   - Female: ${ktpRecords.filter((k) => k.jenisKelamin === 'P').length}`);
  console.log(`   - Religions: ${[...new Set(ktpRecords.map((k) => k.agama))].join(', ')}`);

  console.log('\n🔑 Sample RFID UIDs for testing:');
  rfidSamples.forEach((rfid, index) => {
    console.log(`   ${index + 1}. ${rfid}`);
  });

  console.log('\n✨ Seed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
