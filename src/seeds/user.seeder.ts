// src/seeds/user.seeder.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/schemas/User';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RoleInWeb } from 'src/utils/role';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));

  const exists = await userModel.findOne({ email: 'admin@example.com' });
  if (!exists) {
    const password = await bcrypt.hash('123456', 10);

    await userModel.create({
      username: 'admin',
      email: 'admin@example.com',
      password,
      role: RoleInWeb.ADMIN,
      isActive: true,
      isAdmin: true,
    });

    await userModel.create({
      username: 'User',
      email: 'user@example.com',
      password,
      role: RoleInWeb.LEADER,
      isActive: true,
      isAdmin: true,
    });

    console.log('✅ Admin user seeded successfully');
  } else {
    console.log('ℹ️ Admin user already exists, skipping...');
  }

  await app.close();
}
bootstrap();
