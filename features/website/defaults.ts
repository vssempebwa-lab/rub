import type { SiteContentMap } from './types';

export const defaultSiteContent: SiteContentMap = {
  business: {
    businessName: 'Rub Shoots',
    tagline: 'Photography Studio',
    phones: ['0705 500291'],
    emails: ['hello@rubshoots.com', 'bookings@rubshoots.com'],
    addressLine1: 'Adonai Plaza Opp Be Energy Petrol Station',
    addressLine2: 'Kampala - Entebbe Rd',
    city: 'Kampala',
    country: 'Uganda',
    mapAddress: 'Adonai Plaza Opp Be Energy Petrol Station, Kampala - Entebbe Rd, Kampala, Uganda',
    hoursWeekday: 'Monday - Saturday: 9:00 AM - 6:00 PM',
    hoursWeekend: 'Sunday: By appointment',
    footerHours: 'Mon–Sat, 9AM–6PM',
    footerDescription:
      'Professional photography for weddings, portraits, graduations, and events across Uganda. This is our public studio website — bookings and portfolio live here.',
    footerCopyright: 'Rub Shoots Photography. All rights reserved.',
    currencyCode: 'UGX',
    seoTitle: 'Rub Shoots Photography | Professional Photography Services',
    seoDescription:
      'Wedding, portrait, graduation, corporate, and event photography. Book your session today.',
    social: {
      instagram: '',
      facebook: '',
      twitter: '',
    },
  },
  home: {
    hero: {
      badge: 'Professional Photography',
      title: "Capturing Life's Beautiful Moments",
      subtitle:
        'Wedding, portrait, graduation, and event photography that tells your unique story with artistry and passion.',
      imageUrl:
        'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1920',
      imageFit: 'cover',
      imagePosition: 'center',
    },
    stats: [
      { icon: 'Camera', value: '500+', label: 'Events Covered' },
      { icon: 'Users', value: '1000+', label: 'Happy Clients' },
      { icon: 'Award', value: '15+', label: 'Years Experience' },
      { icon: 'Star', value: '4.9', label: 'Average Rating' },
    ],
    servicesSection: {
      title: 'Our Services',
      subtitle:
        'From intimate portraits to grand celebrations, we bring expertise and creativity to every shoot.',
    },
    projectsSection: {
      title: 'Latest Projects',
      subtitle: 'Browse our most recent photography work',
    },
    testimonialsSection: {
      title: 'What Clients Say',
      subtitle: 'Real stories from the people we have had the pleasure of working with',
    },
    cta: {
      title: 'Ready to Capture Your Story?',
      subtitle:
        'Let us create timeless memories together. Book your session today and experience photography that goes beyond the ordinary.',
    },
  },
  about: {
    hero: {
      title: 'Our Story',
      subtitle:
        "Two decades of capturing joy, love, and life's most precious moments across Uganda and beyond.",
      imageUrl:
        'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=1920',
    },
    story: {
      title: 'Passion Meets Precision',
      paragraphs: [
        'Founded in 2008, Rub Shoots Photography began as a small studio in Kampala with a simple mission: to capture authentic moments that families and couples would treasure forever.',
        'What started as a one-person operation has grown into a full-service photography company with a team of talented photographers, editors, and creative professionals.',
        'We believe every moment deserves to be remembered. From the nervous excitement before a wedding to the proud smiles at graduation, we are there to preserve it all.',
      ],
      imageUrl:
        'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=800',
      values: [
        { icon: 'Heart', label: 'Passion Driven' },
        { icon: 'Award', label: 'Award Winning' },
        { icon: 'Users', label: 'Client First' },
      ],
    },
    mission: {
      title: 'Our Mission',
      content:
        'To provide exceptional photography services that capture the essence of every moment, delivering images that evoke emotion and preserve memories for generations. We strive to make every client feel comfortable and confident in front of the camera.',
    },
    vision: {
      title: 'Our Vision',
      content:
        'To be the most trusted and sought-after photography studio in East Africa, known for our artistry, professionalism, and innovative approach to visual storytelling. We aim to set the standard for excellence in the photography industry.',
    },
    teamSection: {
      title: 'Meet the Team',
      subtitle: 'Talented professionals dedicated to capturing your perfect moments',
    },
    cta: {
      title: 'Let Us Tell Your Story',
      subtitle:
        'Every story is unique. We would love to hear yours and create something beautiful together.',
    },
  },
  contact: {
    hero: {
      title: 'Get In Touch',
      subtitle:
        'Have a question or ready to book? We would love to hear from you. Reach out and let us start a conversation.',
    },
  },
  services: {
    hero: {
      badge: 'What We Offer',
      title: 'Our Services',
      subtitle:
        'Comprehensive photography solutions tailored to capture every special moment in your life.',
      imageUrl:
        'https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg?auto=compress&cs=tinysrgb&w=1920',
    },
    howItWorks: {
      title: 'How It Works',
      subtitle: 'Simple steps to your perfect photos',
      steps: [
        { step: '01', title: 'Book', description: 'Choose your package and schedule your session' },
        { step: '02', title: 'Shoot', description: 'Our team captures your special moments' },
        { step: '03', title: 'Review', description: 'Preview and select your favorite images' },
        { step: '04', title: 'Deliver', description: 'Receive your edited photos in high resolution' },
      ],
    },
  },
  portfolio: {
    hero: {
      title: 'Portfolio',
      subtitle: 'Explore our collection of weddings, portraits, events, and more.',
    },
  },
  pricing: {
    hero: {
      badge: 'Transparent Pricing',
      title: 'Investment in Memories',
      subtitle:
        'Choose the package that fits your needs. Every package includes our signature quality and attention to detail.',
    },
    faqTitle: 'Common Questions',
  },
};
