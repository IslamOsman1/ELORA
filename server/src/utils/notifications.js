import Notification from '../models/Notification.js';

export async function createNotification({ user, title, message, type, link = '' }) {
  if (!user || !title || !message || !type) return null;

  try {
    return await Notification.create({
      user: user._id || user,
      title,
      message,
      type,
      link
    });
  } catch (error) {
    console.error('Failed to create notification', error);
    return null;
  }
}
