export const defaultSiteSettings = {
  singletonKey: 'main',
  branding: {
    brandName: 'ELORA',
    brandFullAr: 'إيلورا لطب الأسنان التجميلي',
    brandFullEn: 'ELORA Esthetic Dental Care',
    logoUrl: '/logo.png'
  },
  contact: {
    location: 'Istanbul / Cairo',
    locationUrl: '',
    phone: '+20 100 000 0000',
    email: 'contact@elora-dental.com',
    locationIcon: 'MapPin',
    phoneIcon: 'Phone',
    emailIcon: 'Mail',
    whatsapp: '+20 100 000 0000',
    instagram: 'elora.dental',
    facebook: 'eloradentalcare',
    whatsappIcon: 'MessageCircle',
    instagramIcon: 'Instagram',
    facebookIcon: 'Facebook'
  },
  workingHours: [
    { dayKey: 'sunday', labelAr: 'الأحد', labelEn: 'Sunday', enabled: true, from: '10:00', to: '17:00' },
    { dayKey: 'monday', labelAr: 'الاثنين', labelEn: 'Monday', enabled: true, from: '10:00', to: '17:00' },
    { dayKey: 'tuesday', labelAr: 'الثلاثاء', labelEn: 'Tuesday', enabled: true, from: '10:00', to: '17:00' },
    { dayKey: 'wednesday', labelAr: 'الأربعاء', labelEn: 'Wednesday', enabled: true, from: '10:00', to: '17:00' },
    { dayKey: 'thursday', labelAr: 'الخميس', labelEn: 'Thursday', enabled: true, from: '10:00', to: '17:00' },
    { dayKey: 'friday', labelAr: 'الجمعة', labelEn: 'Friday', enabled: false, from: '10:00', to: '17:00' },
    { dayKey: 'saturday', labelAr: 'السبت', labelEn: 'Saturday', enabled: true, from: '10:00', to: '17:00' }
  ],
  images: {
    homeShowcaseImages: [
      'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=1200&q=80'
    ],
    aboutHero: 'https://images.unsplash.com/photo-1643297654416-057ab661f8f7?auto=format&fit=crop&w=1400&q=80',
    aboutStory: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80',
    aboutValuesImages: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80'
    ],
    servicesHero: 'https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?auto=format&fit=crop&w=1400&q=80',
    doctorsHero: 'https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?auto=format&fit=crop&w=1400&q=80',
    bookingHero: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1400&q=80',
    contactHero: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1400&q=80'
  },
  homeStats: {
    experienceYears: '12+',
    treatedCases: '18K+',
    patientRating: '4.9/5'
  },
  copyOverrides: {
    ar: {
      footer: {
        tagline: 'نقدم رعاية أسنان تجمع بين الدقة الطبية والراحة والنتائج الجمالية في تجربة علاجية هادئة وواضحة.'
      }
    },
    en: {
      footer: {
        tagline: 'We provide dental care that balances clinical precision, patient comfort, and naturally beautiful results.'
      }
    }
  }
};
