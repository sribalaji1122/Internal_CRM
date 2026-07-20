import mongoose from 'mongoose';

const TaskChecklistSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required']
    },
    text: {
      type: String,
      required: [true, 'Checklist item text is required'],
      trim: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    completedBy: {
      type: String,
      trim: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

TaskChecklistSchema.index({ taskId: 1, sortOrder: 1 });

export default mongoose.model('TaskChecklist', TaskChecklistSchema);
