import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  actionType: { type: String, required: true, index: true },
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  summary: { type: String, default: '' },
  oldData: { type: mongoose.Schema.Types.Mixed, default: null },
  newData: { type: mongoose.Schema.Types.Mixed, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
