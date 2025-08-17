// task-history/task-history.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskHistoryDocument = HydratedDocument<TaskHistory>;

@Schema({ timestamps: true })
export class TaskHistory {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Task' })
  task_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  changed_by: Types.ObjectId;

  @Prop()
  note: string;
}

export const TaskHistorySchema = SchemaFactory.createForClass(TaskHistory);