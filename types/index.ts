import type { Database } from './database';

export type { Database } from './database';

export type UserRole = 'photographer';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export type Category = Database['public']['Tables']['categories']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Testimonial = Database['public']['Tables']['testimonials']['Row'];
export type PricingPackage = Database['public']['Tables']['pricing_packages']['Row'];
