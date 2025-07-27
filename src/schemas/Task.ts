// tasks/task.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop()
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  project_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignee: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  created_by: Types.ObjectId;

  @Prop()
  start_date: Date;

  @Prop()
  end_date: Date;

  @Prop({ default: 0 })
  status: number;

  @Prop({ default: 0 })
  priority: number;

  @Prop([String])
  tags: string[];

  @Prop([{
    name: String,
    url: String
  }])
  attachments: Array<{
    name: string;
    url: string;
  }>;

  @Prop()
  estimated_hours: number;

  @Prop()
  actual_hours: number;

  @Prop()
  completed_at: Date; 

  @Prop()
  parent_task_id: Types.ObjectId; 

  @Prop({ default: false })
  is_subtask: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);