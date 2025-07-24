// src/seeds/user.seeder.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/schemas/User';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RoleInWeb } from 'src/utils/role';
import { faker } from '@faker-js/faker';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));

  const exists = await userModel.findOne({ email: 'admin@example.com' });
  if (!exists) {
    const password = await bcrypt.hash('Abc123', 10);

    await userModel.create({
      username: 'admin',
      email: 'admin@example.com',
      password,
      role: RoleInWeb.ADMIN,
      isActive: true,
      isAdmin: true,
      position: 1,
      department: 1
    });

    await userModel.create({
      username: 'User',
      email: 'user@example.com',
      password,
      role: RoleInWeb.LEADER,
      isActive: true,
      isAdmin: true,
      position: 1,
      department: 1
    });

    console.log('✅ Admin user seeded successfully');
  } else {
    console.log('ℹ️ Admin user already exists, skipping...');
  }
  const password = await bcrypt.hash('Abc123', 10);
  const userList = Array.from({ length: 100 }, (_, i) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    return {
      username: `${firstName} ${lastName}`,
      email,
      password,
      role: faker.helpers.arrayElement([
        RoleInWeb.LEADER,
        RoleInWeb.MEMBER,
        RoleInWeb.ADMIN,
      ]),
      isActive: faker.datatype.boolean(),
      isAdmin: false,
      position: faker.helpers.arrayElement([
        1, 2, 3, 4, 5, 6
      ]),
      department: faker.helpers.arrayElement([
        1, 2, 3
      ]),
    };
  });

  await userModel.insertMany(userList);
  console.log('✅ 100 fake users seeded');

  await app.close();
}
bootstrap();
