import mongoose from 'mongoose';

// Auto-generate company code: COMP-XXXX
function generateCompanyCode() {
  return 'COMP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

const CompanySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    companyCode: {
      type: String,
      unique: true,
      default: generateCompanyCode
    },
    industry: {
      type: String,
      trim: true,
      default: 'Other'
    },
    website: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^$|^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    addressLine1: { type: String, trim: true },
    addressLine2: { type: String, trim: true },
    country: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    employeeCount: { type: Number, min: 0, default: 0 },
    annualRevenue: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: 'USD' },
    companyType: {
      type: String,
      enum: {
        values: ['Customer', 'Partner', 'Vendor', 'Prospect', 'Distributor', 'Supplier', 'Internal'],
        message: '{VALUE} is not a valid company type'
      },
      default: 'Prospect'
    },
    ownership: { type: String, trim: true },
    parentCompany: { type: String, trim: true },
    ceo: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive', 'Prospect', 'Archived'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Prospect'
    },
    accountOwner: { type: String, trim: true, default: 'Jane Doe' },
    description: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Company', CompanySchema);
