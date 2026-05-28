import React from 'react';
import PageHero from '../components/common/PageHero';
import SectionHeading from '../components/common/SectionHeading';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function AboutPage() {
  const { t, language } = useLanguage();
  const { branding, getImage, getText } = useSiteSettings();
  const values = getText(language, 'about.values', t('about.values'));
  const valuesImages = getImage('aboutValuesImages', [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80'
  ]);

  return (
    <main>
      <PageHero
        eyebrow={branding.brandName || 'ELORA'}
        title={getText(language, 'about.heroTitle', t('about.heroTitle'))}
        text={getText(language, 'about.heroText', t('about.heroText'))}
        image={getImage('aboutHero', 'https://images.unsplash.com/photo-1643297654416-057ab661f8f7?auto=format&fit=crop&w=1400&q=80')}
      />

      <section className="px-4 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.95fr_1.05fr]">
          <div className="premium-card overflow-hidden">
            <img src={getImage('aboutStory', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80')} alt="ELORA clinic" className="h-[280px] w-full object-cover sm:h-[420px] lg:h-full" />
          </div>
          <div>
            <SectionHeading
              eyebrow={branding.brandName || 'ELORA'}
              title={getText(language, 'about.storyTitle', t('about.storyTitle'))}
              text={getText(language, 'about.storyText', t('about.storyText'))}
              align="start"
            />
            <div className="grid gap-5">
              {values.map((value, index) => (
                <div key={value.title} className="premium-card overflow-hidden sm:grid sm:grid-cols-[220px_1fr]">
                  <img src={valuesImages[index]} alt={value.title} className="h-52 w-full object-cover sm:h-full" />
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold">{value.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/68">{value.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
