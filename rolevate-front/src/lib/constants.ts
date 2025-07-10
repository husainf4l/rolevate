// --- ENUMS & CONSTANTS ---

export enum Industry {
  TECHNOLOGY = 'TECHNOLOGY',
  HEALTHCARE = 'HEALTHCARE',
  FINANCE = 'FINANCE',
  EDUCATION = 'EDUCATION',
  MANUFACTURING = 'MANUFACTURING',
  RETAIL = 'RETAIL',
  CONSTRUCTION = 'CONSTRUCTION',
  TRANSPORTATION = 'TRANSPORTATION',
  HOSPITALITY = 'HOSPITALITY',
  CONSULTING = 'CONSULTING',
  MARKETING = 'MARKETING',
  REAL_ESTATE = 'REAL_ESTATE',
  MEDIA = 'MEDIA',
  AGRICULTURE = 'AGRICULTURE',
  ENERGY = 'ENERGY',
  GOVERNMENT = 'GOVERNMENT',
  NON_PROFIT = 'NON_PROFIT',
  OTHER = 'OTHER'
}

export enum Country {
  AE = 'AE', SA = 'SA', QA = 'QA', KW = 'KW', BH = 'BH', OM = 'OM', EG = 'EG',
  JO = 'JO', LB = 'LB', SY = 'SY', IQ = 'IQ', YE = 'YE', MA = 'MA', TN = 'TN',
  DZ = 'DZ', LY = 'LY', SD = 'SD', SO = 'SO', DJ = 'DJ', KM = 'KM',
}

export const countryNames: Record<Country, string> = {
  AE: 'United Arab Emirates', SA: 'Saudi Arabia', QA: 'Qatar', KW: 'Kuwait', BH: 'Bahrain', OM: 'Oman',
  EG: 'Egypt', JO: 'Jordan', LB: 'Lebanon', SY: 'Syria', IQ: 'Iraq', YE: 'Yemen',
  MA: 'Morocco', TN: 'Tunisia', DZ: 'Algeria', LY: 'Libya', SD: 'Sudan', SO: 'Somalia', DJ: 'Djibouti', KM: 'Comoros',
};

export const industryNames: Record<Industry, string> = {
  TECHNOLOGY: 'Technology', HEALTHCARE: 'Healthcare', FINANCE: 'Finance', EDUCATION: 'Education',
  MANUFACTURING: 'Manufacturing', RETAIL: 'Retail', CONSTRUCTION: 'Construction', TRANSPORTATION: 'Transportation',
  HOSPITALITY: 'Hospitality', CONSULTING: 'Consulting', MARKETING: 'Marketing', REAL_ESTATE: 'Real Estate',
  MEDIA: 'Media', AGRICULTURE: 'Agriculture', ENERGY: 'Energy', GOVERNMENT: 'Government', NON_PROFIT: 'Non-Profit', OTHER: 'Other'
};

export const sizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

export interface CompanyData {
  name: string;
  industry: string;
  size: string;
  website: string;
  description: string;
  country: string;
  city: string;
  street: string;
  phone: string;
}
