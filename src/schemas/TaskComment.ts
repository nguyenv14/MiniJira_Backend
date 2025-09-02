// task-comments/task-comment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskCommentDocument = HydratedDocument<TaskComment>;

@Schema({ timestamps: true })
export class TaskComment {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Task' })
  task_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  // @Prop([{ type: Types.ObjectId, ref: 'User' }])
  // mentions: Types.ObjectId[];

  // @Prop([{
  //   name: String,
  //   url: String
  // }])
  // attachments: Array<{
  //   name: string;
  //   url: string;
  // }>;
}
export const TaskCommentSchema = SchemaFactory.createForClass(TaskComment);

TaskCommentSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Important: Enable virtuals in JSON output
TaskCommentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    return ret;
  }
});

TaskCommentSchema.set('toJSON', { virtuals: true });
TaskCommentSchema.set('toObject', { virtuals: true });