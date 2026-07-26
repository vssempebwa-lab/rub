export type SiteContentKey =
  | 'business'
  | 'home'
  | 'about'
  | 'contact'
  | 'services'
  | 'portfolio'
  | 'pricing';

export type SocialLinks = {
  instagram: string;
  facebook: string;
  twitter: string;
};

export type BusinessContent = {
  businessName: string;
  tagline: string;
  phones: string[];
  emails: string[];
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  mapAddress: string;
  hoursWeekday: string;
  hoursWeekend: string;
  footerHours: string;
  footerDescription: string;
  footerCopyright: string;
  currencyCode: string;
  seoTitle: string;
  seoDescription: string;
  social: SocialLinks;
};

export type StatItem = {
  icon: string;
  value: string;
  label: string;
};

export type SectionHeading = {
  title: string;
  subtitle: string;
};

export type HeroImageFit = 'cover' | 'contain';

export type HeroImagePosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'left top'
  | 'right top'
  | 'left bottom'
  | 'right bottom';

export type HomeContent = {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    imageFit: HeroImageFit;
    imagePosition: HeroImagePosition;
  };
  stats: StatItem[];
  servicesSection: SectionHeading;
  projectsSection: SectionHeading;
  testimonialsSection: SectionHeading;
  cta: SectionHeading;
};

export type ValueItem = {
  icon: string;
  label: string;
};

export type AboutContent = {
  hero: {
    title: string;
    subtitle: string;
    imageUrl: string;
  };
  story: {
    title: string;
    paragraphs: string[];
    imageUrl: string;
    values: ValueItem[];
  };
  mission: {
    title: string;
    content: string;
  };
  vision: {
    title: string;
    content: string;
  };
  teamSection: SectionHeading;
  cta: SectionHeading;
};

export type ContactContent = {
  hero: SectionHeading;
};

export type ProcessStep = {
  step: string;
  title: string;
  description: string;
};

export type ServicesContent = {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    imageUrl: string;
  };
  howItWorks: SectionHeading & {
    steps: ProcessStep[];
  };
};

export type PortfolioContent = {
  hero: SectionHeading;
};

export type PricingContent = {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
  };
  faqTitle: string;
};

export type SiteContentMap = {
  business: BusinessContent;
  home: HomeContent;
  about: AboutContent;
  contact: ContactContent;
  services: ServicesContent;
  portfolio: PortfolioContent;
  pricing: PricingContent;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  photo_url: string | null;
  bio: string | null;
  social_links: {
    instagram?: string;
    tiktok?: string;
  } | null;
  sort_order: number;
  is_active: boolean;
};

export type SiteFaq = {
  id: string;
  question: string;
  answer: string;
  page: string;
  sort_order: number;
  is_active: boolean;
};
