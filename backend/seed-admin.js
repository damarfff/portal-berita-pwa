const bcrypt = require('bcrypt');
const prisma = require('./prisma');

async function seedAdmin() {
  // Admin pertama
  const password1 = 'admin123';
  const hashedPassword1 = await bcrypt.hash(password1, 10);
  
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword1,
      nama: 'Administrator'
    }
  });
  
  // Admin kedua
  const password2 = 'editor123';
  const hashedPassword2 = await bcrypt.hash(password2, 10);
  
  await prisma.admin.upsert({
    where: { username: 'editor' },
    update: {},
    create: {
      username: 'editor',
      password: hashedPassword2,
      nama: 'Editor Utama'
    }
  });
  
  console.log('Admin selesai di-seed');
}

seedAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());