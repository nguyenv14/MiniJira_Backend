// task-watchers/task-watcher.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskWatcherDocument = HydratedDocument<TaskWatcher>;

@Schema({ timestamps: true })
export class TaskWatcher {
  @Prop()
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Task' })
  task_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ default: true })
  is_notified: boolean;
}

export const TaskWatcherSchema = SchemaFactory.createForClass(TaskWatcher);