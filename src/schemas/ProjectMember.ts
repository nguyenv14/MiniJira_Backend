// project-members/project-member.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProjectMemberDocument = HydratedDocument<ProjectMember>;

@Schema({ timestamps: true })
export class ProjectMember {

  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  project_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({
    required: true,
  })
  role: number;

  @Prop({ required: true })
  joined_at: Date;

  // @Prop({
  //   can_edit: Boolean,
  //   can_delete: Boolean,
  //   can_assign: Boolean
  // })
  // permissions: {
  //   can_edit: boolean;
  //   can_delete: boolean;
  //   can_assign: boolean;
  // };
}

export const ProjectMemberSchema = SchemaFactory.createForClass(ProjectMember);