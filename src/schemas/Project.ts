// projects/project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  basicInfo: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  features: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  created_by: Types.ObjectId;

  @Prop({ required: true })
  project_type: number;

  @Prop({ required: true, type: [{ type: Number }] })
  categories: number[];

  @Prop({ required: true, type: Number })
  industry: number;

  @Prop()
  start_date: Date;

  @Prop()
  end_date: Date;

  @Prop()
  actual_start_date: Date;

  @Prop()
  actual_end_date: Date;

  @Prop([String])
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  manager: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  color: number;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.virtual('createdByUser', {
  ref: 'User', // Tên của model User
  localField: 'created_by', // Trường trong Project schema
  foreignField: '_id', // Trường trong User schema
  justOne: true // Mỗi project chỉ có 1 created_by
});

// Virtual cho manager
ProjectSchema.virtual('managerUser', {
  ref: 'User', // Tên của model User
  localField: 'manager', // Trường trong Project schema
  foreignField: '_id', // Trường trong User schema
  justOne: true // Mỗi project chỉ có 1 manager
});

ProjectSchema.set('toObject', { virtuals: true });
ProjectSchema.set('toJSON', { virtuals: true });
