import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const fullName = process.env.ADMIN_FULL_NAME?.trim() || 'System Administrator';

if (!email || !password) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set.');
}

const adminEmail: string = email;
const adminPassword: string = password;

const dbUrl = new URL(
  process.env.DATABASE_URL ?? 'mysql://root:123456@127.0.0.1:3306/ecommerce_db',
);

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port || '3306', 10),
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', ''),
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      password: hashedPassword,
      fullName,
      role: Role.ADMIN,
      isActive: true,
    },
    update: {
      password: hashedPassword,
      fullName,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log(`Admin account is ready for ${user.email}.`);
}

main()
  .catch((error) => {
    console.error('Unable to create the admin account:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
