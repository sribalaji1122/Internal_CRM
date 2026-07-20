import mongoose from 'mongoose';

const workflowStepSchema = new mongoose.Schema(
  {
    stepName: { type: String, required: true },
    approverRole: { type: String, default: 'Manager' },
    autoApproveCondition: { type: String, default: '' },
    order: { type: Number, default: 1 }
  },
  { _id: false }
);

const workflowTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    module: {
      type: String,
      enum: ['Quote', 'Product', 'Discount', 'Inventory', 'Deal'],
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    steps: [workflowStepSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const WorkflowTemplate = mongoose.model('WorkflowTemplate', workflowTemplateSchema);
export default WorkflowTemplate;
