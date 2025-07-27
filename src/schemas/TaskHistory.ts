// task-history/task-history.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskHistoryDocument = HydratedDocument<TaskHistory>;

@Schema({ timestamps: true })
export class TaskHistory {
  @Prop()
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Task' })
  task_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  changed_by: Types.ObjectId;

  @Prop({ required: true })
  field: string;

  @Prop()
  old_value: any;

  @Prop()
  new_value: any;

  @Prop()
  note: string;
}

export const TaskHistorySchema = SchemaFactory.createForClass(TaskHistory);