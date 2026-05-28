import SiteSettings from '../models/SiteSettings.js';
import { defaultSiteSettings } from './siteSettingsDefaults.js';

export async function getOrCreateSiteSettings() {
  let settings = await SiteSettings.findOne({ singletonKey: 'main' });
  if (settings) return settings;

  settings = await SiteSettings.create(defaultSiteSettings);
  return settings;
}
