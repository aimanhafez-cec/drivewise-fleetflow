export type LeadSourceType = 
  | 'aggregator' 
  | 'broker' 
  | 'direct' 
  | 'tourism' 
  | 'phone_email' 
  | 'social';

export interface LeadSource {
  id: string;
  name: string;
  type: LeadSourceType;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  description: string;
}

export const leadSources: Record<string, LeadSource> = {
  // Aggregators - Blue variants
  'booking_com': {
    id: 'booking_com',
    name: 'Booking.com',
    type: 'aggregator',
    color: '#0071C2',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: '🔵',
    description: 'Leading global accommodation platform'
  },
  'kayak': {
    id: 'kayak',
    name: 'Kayak',
    type: 'aggregator',
    color: '#00A5E0',
    bgColor: 'bg-sky-100 dark:bg-sky-950',
    textColor: 'text-sky-700 dark:text-sky-300',
    icon: '🔵',
    description: 'Travel search engine'
  },
  'expedia': {
    id: 'expedia',
    name: 'Expedia',
    type: 'aggregator',
    color: '#003B95',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    icon: '🔵',
    description: 'Global travel booking platform'
  },
  'travelocity': {
    id: 'travelocity',
    name: 'Travelocity',
    type: 'aggregator',
    color: '#0090FF',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    textColor: 'text-blue-600 dark:text-blue-400',
    icon: '🔵',
    description: 'Online travel agency'
  },
  'rentalcars': {
    id: 'rentalcars',
    name: 'RentalCars.com',
    type: 'aggregator',
    color: '#1E3A8A',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    textColor: 'text-blue-900 dark:text-blue-200',
    icon: '🔵',
    description: 'Car rental comparison site'
  },

  // International Brokers - Purple variants (B2C focused)
  'eu_travel': {
    id: 'eu_travel',
    name: 'EU Travel Partners',
    type: 'broker',
    color: '#9333EA',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    textColor: 'text-purple-700 dark:text-purple-300',
    icon: '🟣',
    description: 'European travel broker network'
  },
  'asia_travel': {
    id: 'asia_travel',
    name: 'Asian Travel Network',
    type: 'broker',
    color: '#A855F7',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    textColor: 'text-purple-600 dark:text-purple-400',
    icon: '🟣',
    description: 'Asian market travel services'
  },
  'mena_broker': {
    id: 'mena_broker',
    name: 'MENA Travel Services',
    type: 'broker',
    color: '#7C3AED',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    textColor: 'text-purple-800 dark:text-purple-200',
    icon: '🟣',
    description: 'Middle East & North Africa broker'
  },
  'gcc_travel': {
    id: 'gcc_travel',
    name: 'GCC Travel Alliance',
    type: 'broker',
    color: '#8B5CF6',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    textColor: 'text-purple-700 dark:text-purple-300',
    icon: '🟣',
    description: 'GCC regional travel partner'
  },

  // Direct Channels - Green variants
  'website': {
    id: 'website',
    name: 'Website Portal',
    type: 'direct',
    color: '#10B981',
    bgColor: 'bg-green-100 dark:bg-green-950',
    textColor: 'text-green-700 dark:text-green-300',
    icon: '🟢',
    description: 'Company website bookings'
  },
  'mobile_app': {
    id: 'mobile_app',
    name: 'Mobile App',
    type: 'direct',
    color: '#059669',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    icon: '🟢',
    description: 'Mobile application bookings'
  },
  'whatsapp': {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    type: 'direct',
    color: '#25D366',
    bgColor: 'bg-green-100 dark:bg-green-950',
    textColor: 'text-green-600 dark:text-green-400',
    icon: '💬',
    description: 'WhatsApp inquiry channel'
  },
  'walk_in': {
    id: 'walk_in',
    name: 'Walk-in',
    type: 'direct',
    color: '#84CC16',
    bgColor: 'bg-lime-100 dark:bg-lime-950',
    textColor: 'text-lime-700 dark:text-lime-300',
    icon: '🚶',
    description: 'Physical location visit'
  },

  // Tourism Partners - Teal/Cyan
  'dubai_tourism': {
    id: 'dubai_tourism',
    name: 'Dubai Tourism',
    type: 'tourism',
    color: '#14B8A6',
    bgColor: 'bg-teal-100 dark:bg-teal-950',
    textColor: 'text-teal-700 dark:text-teal-300',
    icon: '🔷',
    description: 'Dubai Department of Tourism'
  },
  'visit_abudhabi': {
    id: 'visit_abudhabi',
    name: 'Visit Abu Dhabi',
    type: 'tourism',
    color: '#06B6D4',
    bgColor: 'bg-cyan-100 dark:bg-cyan-950',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    icon: '🔷',
    description: 'Abu Dhabi tourism partner'
  },
  'tour_operators': {
    id: 'tour_operators',
    name: 'Tour Operators',
    type: 'tourism',
    color: '#22D3EE',
    bgColor: 'bg-cyan-100 dark:bg-cyan-950',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    icon: '🔷',
    description: 'Licensed UAE tour operators'
  },
  'hotel_concierge': {
    id: 'hotel_concierge',
    name: 'Hotel Concierge',
    type: 'tourism',
    color: '#0891B2',
    bgColor: 'bg-cyan-100 dark:bg-cyan-950',
    textColor: 'text-cyan-800 dark:text-cyan-200',
    icon: '🏨',
    description: 'UAE hotel partnerships'
  },

  // Phone/Email - Gray
  'phone': {
    id: 'phone',
    name: 'Phone Inquiry',
    type: 'phone_email',
    color: '#64748B',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-300',
    icon: '📞',
    description: 'Telephone inquiries'
  },
  'email': {
    id: 'email',
    name: 'Email Direct',
    type: 'phone_email',
    color: '#6B7280',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    icon: '📧',
    description: 'Direct email inquiries'
  },

  // Social Media - Pink/Red
  'instagram': {
    id: 'instagram',
    name: 'Instagram',
    type: 'social',
    color: '#E4405F',
    bgColor: 'bg-pink-100 dark:bg-pink-950',
    textColor: 'text-pink-700 dark:text-pink-300',
    icon: '📷',
    description: 'Instagram DM inquiries'
  },
  'facebook': {
    id: 'facebook',
    name: 'Facebook',
    type: 'social',
    color: '#1877F2',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    textColor: 'text-blue-600 dark:text-blue-400',
    icon: '👍',
    description: 'Facebook Messenger'
  },
  'tiktok': {
    id: 'tiktok',
    name: 'TikTok',
    type: 'social',
    color: '#000000',
    bgColor: 'bg-slate-100 dark:bg-slate-900',
    textColor: 'text-slate-900 dark:text-slate-100',
    icon: '🎵',
    description: 'TikTok inquiries'
  }
};

export const sourceTypes = [
  { value: 'aggregator', label: 'Aggregators', color: 'blue' },
  { value: 'broker', label: 'International Brokers', color: 'purple' },
  { value: 'direct', label: 'Direct Channels', color: 'green' },
  { value: 'tourism', label: 'Tourism Partners', color: 'teal' },
  { value: 'phone_email', label: 'Phone/Email', color: 'gray' },
  { value: 'social', label: 'Social Media', color: 'pink' }
];
