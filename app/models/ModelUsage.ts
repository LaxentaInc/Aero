import mongoose from 'mongoose';

const ModelUsageSchema = new mongoose.Schema({
  modelId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  modelName: {
    type: String,
    required: true
  },
  uses: {
    type: Number,
    default: 0
  },
  baseCount: {
    type: Number,
    default: function() {
      return Math.floor(Math.random() * 500) + 1000;
    }
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  isNSFW: {
    type: Boolean,
    default: false
  },
  userPreferences: [{
    userId: String,
    count: Number
  }]
}, {
  timestamps: true
});

ModelUsageSchema.methods.getTotalUses = function() {
  return this.baseCount + this.uses;
};

export default mongoose.models.ModelUsage || mongoose.model('ModelUsage', ModelUsageSchema);
