const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Vui lòng cung cấp email của tài khoản cần đặt làm ADMIN.');
    console.error('Ví dụ: node scripts/make-admin.js user@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.error(`Không tìm thấy người dùng nào có email: ${email}`);
      process.exit(1);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
    });

    console.log('\n✅ Cập nhật quyền thành công!');
    console.log(`- Tên: ${updatedUser.name}`);
    console.log(`- Email: ${updatedUser.email}`);
    console.log(`- Quyền hiện tại: ${updatedUser.role}`);
    console.log('\nBây giờ bạn đã có thể đăng nhập bằng tài khoản này để trải nghiệm các tính năng Admin.');
  } catch (error) {
    console.error('Lỗi khi cập nhật quyền:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
