import mongoose from 'mongoose';

const widgetConfigSchema = new mongoose.Schema(
  {
    widgetId: { type: String, required: true },
    title: { type: String, required: true },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    width: { type: String, enum: ['full', 'half', 'third'], default: 'half' }
  },
  { _id: false }
);

const dashboardLayoutSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: 'default_user',
      index: true
    },
    widgets: [widgetConfigSchema]
  },
  { timestamps: true }
);

const DashboardLayout = mongoose.model('DashboardLayout', dashboardLayoutSchema);
export default DashboardLayout;
