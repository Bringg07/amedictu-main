import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUsers() {
  console.log('--- MEMPERBAIKI PENUGASAN POLI ---');
  await prisma.user.updateMany({
    where: { username: { in: ['dr.sari', 'dr.colin'] } },
    data: { id_poli: 1 }
  });
  console.log('Update berhasil.');

  const users = await (prisma.user as any).findMany({
    where: { role: 'tenaga_medis' },
    include: { poli: true }
  });
  console.log('\n--- DAFTAR TENAGA MEDIS TERBARU ---');
  users.forEach((u: any) => {
    console.log(`Username: ${u.username}, Poli: ${u.poli?.nama_poli || 'TIDAK ADA'}, ID Poli: ${u.id_poli}`);
  });
}

fixUsers().catch(console.error);

