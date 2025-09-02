import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProjectsModule } from './modules/projects/project.module';
import { TaskModule } from './modules/tasks/task.module';
import { DashboardModule } from './modules/Dashboard/Dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Biến môi trường dùng được toàn cục
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/minijra',
      {
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('MongoDB connected successfully!');
          });
          connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
          });
          return connection;
        },
        connectTimeoutMS: Number(30000),
        retryAttempts: 5,
        retryDelay: 3000,
      },
    ),
    // Import other modules here
    UserModule, // Uncomment this line to include the UserModule
    AuthModule, // Uncomment this line to include the AuthModule
    ProfileModule,
    ProjectsModule,
    TaskModule,
    DashboardModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
