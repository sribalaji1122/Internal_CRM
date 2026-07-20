import mongoose from 'mongoose';

const TaskCommentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required']
    },
    user: {
      type: String,
      trim: true,
      default: 'Jane Doe'
    },
    comment: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

TaskCommentSchema.index({ taskId: 1, createdAt: -1 });

export default mongoose.model('TaskComment', TaskCommentSchema);
