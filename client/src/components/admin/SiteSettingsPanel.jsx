import React from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';

function getValue(source, path) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), source);
}

function setValue(target, path, value) {
  const keys = path.split('.');
  const result = structuredClone(target);
  let cursor = result;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    if (cursor[key] === undefined) {
      cursor[key] = Number.isInteger(Number(keys[index + 1])) ? [] : {};
    }
    cursor = cursor[key];
  }

  cursor[keys[keys.length - 1]] = value;
  return result;
}

function field(label, path, options = {}) {
  return { label, path, multiline: false, ...options };
}

function textField(label, path) {
  return { label, path, multiline: true };
}

function FieldGrid({ fields, form, setForm }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((item) => {
        const value = getValue(form, item.path) ?? '';

        return (
          <label key={item.path} className={item.multiline ? 'md:col-span-2' : ''}>
            <span className="mb-2 block text-sm text-white/55">{item.label}</span>
            {item.multiline ? (
              <textarea
                className="input min-h-28"
                value={value}
                onChange={(event) => setForm((current) => setValue(current, item.path, event.target.value))}
              />
            ) : (
              <input
                className="input"
                value={value}
                onChange={(event) => setForm((current) => setValue(current, item.path, event.target.value))}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}

function SettingsCard({ title, hint, children }) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-white/55">{hint}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const groups = {
  branding: [
    field('اسم البراند الأساسي / Brand Name', 'branding.brandName'),
    field('الاسم الكامل بالعربية', 'branding.brandFullAr'),
    field('الاسم الكامل بالإنجليزية', 'branding.brandFullEn'),
    field('رابط الشعار / Logo URL', 'branding.logoUrl')
  ],
  contact: [
    field('الموقع / Location', 'contact.location'),
    field('رقم الهاتف / Phone', 'contact.phone'),
    field('البريد الإلكتروني / Email', 'contact.email'),
    field('واتساب / WhatsApp', 'contact.whatsapp'),
    field('إنستجرام / Instagram', 'contact.instagram'),
    field('فيس بوك / Facebook', 'contact.facebook'),
    field('أيقونة الموقع / Location Icon', 'contact.locationIcon'),
    field('أيقونة الهاتف / Phone Icon', 'contact.phoneIcon'),
    field('أيقونة البريد / Email Icon', 'contact.emailIcon'),
    field('أيقونة واتساب / WhatsApp Icon', 'contact.whatsappIcon'),
    field('أيقونة إنستجرام / Instagram Icon', 'contact.instagramIcon'),
    field('أيقونة فيس بوك / Facebook Icon', 'contact.facebookIcon')
  ],
  homeImages: [
    field('صورة الواجهة 1', 'images.homeShowcaseImages.0'),
    field('صورة الواجهة 2', 'images.homeShowcaseImages.1'),
    field('صورة الواجهة 3', 'images.homeShowcaseImages.2')
  ],
  aboutImages: [
    field('صورة بانر من نحن', 'images.aboutHero'),
    field('صورة قصة العيادة', 'images.aboutStory'),
    field('صورة قيمة 1', 'images.aboutValuesImages.0'),
    field('صورة قيمة 2', 'images.aboutValuesImages.1'),
    field('صورة قيمة 3', 'images.aboutValuesImages.2')
  ],
  pageHeroes: [
    field('صورة بانر الخدمات', 'images.servicesHero'),
    field('صورة بانر الأطباء', 'images.doctorsHero'),
    field('صورة بانر الحجز', 'images.bookingHero'),
    field('صورة بانر التواصل', 'images.contactHero')
  ],
  homeArabic: [
    textField('Home Eyebrow AR', 'copyOverrides.ar.home.eyebrow'),
    textField('Home Title AR', 'copyOverrides.ar.home.title'),
    textField('Home Description AR', 'copyOverrides.ar.home.description'),
    textField('Home Features Title AR', 'copyOverrides.ar.home.featuresTitle'),
    textField('Home Showcase Text AR', 'copyOverrides.ar.home.showcaseText')
  ],
  homeEnglish: [
    textField('Home Eyebrow EN', 'copyOverrides.en.home.eyebrow'),
    textField('Home Title EN', 'copyOverrides.en.home.title'),
    textField('Home Description EN', 'copyOverrides.en.home.description'),
    textField('Home Features Title EN', 'copyOverrides.en.home.featuresTitle'),
    textField('Home Showcase Text EN', 'copyOverrides.en.home.showcaseText')
  ],
  aboutArabic: [
    textField('About Hero Title AR', 'copyOverrides.ar.about.heroTitle'),
    textField('About Hero Text AR', 'copyOverrides.ar.about.heroText'),
    textField('About Story Title AR', 'copyOverrides.ar.about.storyTitle'),
    textField('About Story Text AR', 'copyOverrides.ar.about.storyText')
  ],
  aboutEnglish: [
    textField('About Hero Title EN', 'copyOverrides.en.about.heroTitle'),
    textField('About Hero Text EN', 'copyOverrides.en.about.heroText'),
    textField('About Story Title EN', 'copyOverrides.en.about.storyTitle'),
    textField('About Story Text EN', 'copyOverrides.en.about.storyText')
  ],
  serviceDoctorArabic: [
    textField('Services Hero Title AR', 'copyOverrides.ar.services.heroTitle'),
    textField('Services Hero Text AR', 'copyOverrides.ar.services.heroText'),
    textField('Doctors Hero Title AR', 'copyOverrides.ar.doctors.heroTitle'),
    textField('Doctors Hero Text AR', 'copyOverrides.ar.doctors.heroText')
  ],
  serviceDoctorEnglish: [
    textField('Services Hero Title EN', 'copyOverrides.en.services.heroTitle'),
    textField('Services Hero Text EN', 'copyOverrides.en.services.heroText'),
    textField('Doctors Hero Title EN', 'copyOverrides.en.doctors.heroTitle'),
    textField('Doctors Hero Text EN', 'copyOverrides.en.doctors.heroText')
  ],
  bookingContactArabic: [
    textField('Booking Hero Title AR', 'copyOverrides.ar.booking.heroTitle'),
    textField('Booking Hero Text AR', 'copyOverrides.ar.booking.heroText'),
    textField('Contact Hero Title AR', 'copyOverrides.ar.contact.heroTitle'),
    textField('Contact Hero Text AR', 'copyOverrides.ar.contact.heroText'),
    textField('Footer Tagline AR', 'copyOverrides.ar.footer.tagline')
  ],
  bookingContactEnglish: [
    textField('Booking Hero Title EN', 'copyOverrides.en.booking.heroTitle'),
    textField('Booking Hero Text EN', 'copyOverrides.en.booking.heroText'),
    textField('Contact Hero Title EN', 'copyOverrides.en.contact.heroTitle'),
    textField('Contact Hero Text EN', 'copyOverrides.en.contact.heroText'),
    textField('Footer Tagline EN', 'copyOverrides.en.footer.tagline')
  ]
};

export default function SiteSettingsPanel() {
  const { isArabic } = useLanguage();
  const { refreshSettings } = useSiteSettings();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/site-settings')
      .then((response) => setForm(response.data))
      .finally(() => setLoading(false));
  }, []);

  async function save(event) {
    event.preventDefault();
    try {
      setSaving(true);
      const response = await api.put('/admin/site-settings', form);
      setForm(response.data);
      await refreshSettings();
      toast.success(isArabic ? 'تم حفظ إعدادات الموقع' : 'Site settings saved');
    } catch (error) {
      toast.error(error.response?.data?.message || (isArabic ? 'تعذر حفظ الإعدادات' : 'Unable to save settings'));
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <div className="text-white/65">{isArabic ? 'جارٍ تحميل الإعدادات...' : 'Loading settings...'}</div>;
  }

  return (
    <form onSubmit={save} className="grid gap-6">
      <SettingsCard
        title={isArabic ? '1. الهيدر والفوتر والهوية' : '1. Header, footer, and branding'}
        hint={isArabic ? 'هذه الحقول تظهر في أعلى وأسفل الموقع: الشعار، اسم البراند، معلومات التواصل، أزرار السوشيال ميديا، ونص الفوتر. للأيقونات استخدم أسماء مثل: MapPin, Phone, Mail, MessageCircle, Instagram, Facebook.' : 'These fields appear across the global shell: logo, brand name, contact info, social buttons, and footer tagline. For icons use names like: MapPin, Phone, Mail, MessageCircle, Instagram, Facebook.'}
      >
        <div className="grid gap-6">
          <FieldGrid fields={groups.branding} form={form} setForm={setForm} />
          <FieldGrid fields={groups.contact} form={form} setForm={setForm} />
          <div className="grid gap-4 md:grid-cols-2">
            <SettingsCard
              title={isArabic ? 'نص الفوتر بالعربية' : 'Arabic footer tagline'}
              hint={isArabic ? 'يظهر أسفل الموقع داخل الفوتر.' : 'Shown at the bottom of the site footer.'}
            >
              <FieldGrid fields={[textField('Footer Tagline AR', 'copyOverrides.ar.footer.tagline')]} form={form} setForm={setForm} />
            </SettingsCard>
            <SettingsCard
              title={isArabic ? 'نص الفوتر بالإنجليزية' : 'English footer tagline'}
              hint={isArabic ? 'يظهر عند التحويل للإنجليزية.' : 'Shown when the site language is English.'}
            >
              <FieldGrid fields={[textField('Footer Tagline EN', 'copyOverrides.en.footer.tagline')]} form={form} setForm={setForm} />
            </SettingsCard>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title={isArabic ? '2. الصفحة الرئيسية' : '2. Home page'}
        hint={isArabic ? 'هذا القسم يتحكم في واجهة الصفحة الرئيسية: الصور الثلاث، العنوان الرئيسي، والنصوص التعريفية.' : 'This section controls the homepage hero and showcase content.'}
      >
        <div className="grid gap-6">
          <FieldGrid fields={groups.homeImages} form={form} setForm={setForm} />
          <div className="grid gap-4 xl:grid-cols-2">
            <SettingsCard
              title={isArabic ? 'نصوص الرئيسية بالعربية' : 'Home copy in Arabic'}
              hint={isArabic ? 'تظهر في الهيرو وفي قسم التعريف أسفلها.' : 'Shown in the main hero and the intro section beneath it.'}
            >
              <FieldGrid fields={groups.homeArabic} form={form} setForm={setForm} />
            </SettingsCard>
            <SettingsCard
              title={isArabic ? 'نصوص الرئيسية بالإنجليزية' : 'Home copy in English'}
              hint={isArabic ? 'نفس المواضع لكن عند التحويل للإنجليزية.' : 'Same positions when the language is English.'}
            >
              <FieldGrid fields={groups.homeEnglish} form={form} setForm={setForm} />
            </SettingsCard>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title={isArabic ? '3. صفحة من نحن' : '3. About page'}
        hint={isArabic ? 'يتحكم هذا القسم في بانر صفحة من نحن، صورة القصة، ونصوص التعريف.' : 'Controls the About hero, story image, and supporting text.'}
      >
        <div className="grid gap-6">
          <FieldGrid fields={groups.aboutImages} form={form} setForm={setForm} />
          <div className="grid gap-4 xl:grid-cols-2">
            <SettingsCard
              title={isArabic ? 'من نحن بالعربية' : 'About copy in Arabic'}
              hint={isArabic ? 'العنوان والنصوص الظاهرة في صفحة من نحن.' : 'Title and text shown on the About page.'}
            >
              <FieldGrid fields={groups.aboutArabic} form={form} setForm={setForm} />
            </SettingsCard>
            <SettingsCard
              title={isArabic ? 'من نحن بالإنجليزية' : 'About copy in English'}
              hint={isArabic ? 'نفس المحتوى عند التحويل للإنجليزية.' : 'Same content for the English version.'}
            >
              <FieldGrid fields={groups.aboutEnglish} form={form} setForm={setForm} />
            </SettingsCard>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title={isArabic ? '4. صفحات الخدمات والأطباء' : '4. Services and doctors pages'}
        hint={isArabic ? 'هنا تعدّل صور البانر والعناوين التعريفية لصفحتي الخدمات والأطباء.' : 'Edit hero images and intro copy for the services and doctors pages.'}
      >
        <div className="grid gap-6">
          <FieldGrid fields={groups.pageHeroes.slice(0, 2)} form={form} setForm={setForm} />
          <div className="grid gap-4 xl:grid-cols-2">
            <SettingsCard
              title={isArabic ? 'الخدمات والأطباء بالعربية' : 'Services and doctors in Arabic'}
              hint={isArabic ? 'يظهر في أعلى الصفحتين.' : 'Displayed in the hero section of both pages.'}
            >
              <FieldGrid fields={groups.serviceDoctorArabic} form={form} setForm={setForm} />
            </SettingsCard>
            <SettingsCard
              title={isArabic ? 'الخدمات والأطباء بالإنجليزية' : 'Services and doctors in English'}
              hint={isArabic ? 'النسخة الإنجليزية من نفس الحقول.' : 'English version of the same fields.'}
            >
              <FieldGrid fields={groups.serviceDoctorEnglish} form={form} setForm={setForm} />
            </SettingsCard>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title={isArabic ? '5. صفحات الحجز والتواصل' : '5. Booking and contact pages'}
        hint={isArabic ? 'يتحكم في صور البانر والنصوص التعريفية لصفحة الحجز وصفحة التواصل.' : 'Controls the banner images and top copy for booking and contact pages.'}
      >
        <div className="grid gap-6">
          <FieldGrid fields={groups.pageHeroes.slice(2)} form={form} setForm={setForm} />
          <div className="grid gap-4 xl:grid-cols-2">
            <SettingsCard
              title={isArabic ? 'الحجز والتواصل بالعربية' : 'Booking and contact in Arabic'}
              hint={isArabic ? 'العنوان والوصف العلوي لكل صفحة.' : 'Hero title and description for each page.'}
            >
              <FieldGrid fields={groups.bookingContactArabic.slice(0, 4)} form={form} setForm={setForm} />
            </SettingsCard>
            <SettingsCard
              title={isArabic ? 'الحجز والتواصل بالإنجليزية' : 'Booking and contact in English'}
              hint={isArabic ? 'النسخة الإنجليزية من نفس الحقول.' : 'English version of the same page copy.'}
            >
              <FieldGrid fields={groups.bookingContactEnglish.slice(0, 4)} form={form} setForm={setForm} />
            </SettingsCard>
          </div>
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <button className="btn-gold min-w-56" disabled={saving}>
          {saving ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...') : (isArabic ? 'حفظ إعدادات الموقع' : 'Save site settings')}
        </button>
      </div>
    </form>
  );
}
