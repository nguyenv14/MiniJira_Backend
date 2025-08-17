// task-checklists/task-checklist.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskChecklistDocument = HydratedDocument<TaskChecklist>;

@Schema({ timestamps: true })
export class TaskChecklist {
  @Prop()
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Task' })
  task_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop([{
    text: String,
    completed: { type: Boolean, default: false },
  }])
  items: Array<{
    text: string;
    completed: boolean;
  }>;
}

export const TaskChecklistSchema = SchemaFactory.createForClass(TaskChecklist);