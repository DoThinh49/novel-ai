const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('=== TOTAL USERS IN SUPABASE DATABASE ===:', users.length);
  users.forEach(u => {
    console.log(`- Email: ${u.email} | Name: ${u.name} | Role: ${u.role} | ID: ${u.id}`);
  });
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
