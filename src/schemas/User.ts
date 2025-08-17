// users/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RoleInWeb } from 'src/utils/role';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: RoleInWeb.ADMIN }) // admin | user | ...
  role: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ required: true })
  position: number

  @Prop({ required: true })
  department: number
}

export const UserSchema = SchemaFactory.createForClass(User);
