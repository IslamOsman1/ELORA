import ActivityLog from '../models/ActivityLog.js';

export async function createActivityLog({
  actor,
  actionType,
  entityType,
  entityId,
  summary = '',
  oldData = null,
  newData = null,
  metadata = null
}) {
  try {
    await ActivityLog.create({
      actor: actor?._id || actor || null,
      actionType,
      entityType,
      entityId: String(entityId),
      summary,
      oldData,
      newData,
      metadata
    });
  } catch (error) {
    console.error('Failed to write activity log', error);
  }
}
