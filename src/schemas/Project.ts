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
}

export const ProjectSchema = SchemaFactory.createForClass(Project);