export interface Country {
  value: string;
  label: string;
  code: string;
}

export interface City {
  value: string;
  label: string;
}

export const middleEastCountries: Country[] = [
  { value: 'AE', label: 'United Arab Emirates', code: 'AE' },
  { value: 'SA', label: 'Saudi Arabia', code: 'SA' },
  { value: 'QA', label: 'Qatar', code: 'QA' },
  { value: 'KW', label: 'Kuwait', code: 'KW' },
  { value: 'BH', label: 'Bahrain', code: 'BH' },
  { value: 'OM', label: 'Oman', code: 'OM' },
  { value: 'JO', label: 'Jordan', code: 'JO' },
  { value: 'LB', label: 'Lebanon', code: 'LB' },
  { value: 'EG', label: 'Egypt', code: 'EG' },
  { value: 'IQ', label: 'Iraq', code: 'IQ' },
  { value: 'SY', label: 'Syria', code: 'SY' },
  { value: 'YE', label: 'Yemen', code: 'YE' },
  { value: 'PS', label: 'Palestine', code: 'PS' },
  { value: 'IL', label: 'Israel', code: 'IL' },
  { value: 'TR', label: 'Turkey', code: 'TR' },
  { value: 'IR', label: 'Iran', code: 'IR' },
];

export const middleEastCities: Record<string, City[]> = {
  AE: [
    { value: 'Dubai', label: 'Dubai' },
    { value: 'Abu Dhabi', label: 'Abu Dhabi' },
    { value: 'Sharjah', label: 'Sharjah' },
    { value: 'Ajman', label: 'Ajman' },
    { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah' },
    { value: 'Fujairah', label: 'Fujairah' },
    { value: 'Umm Al Quwain', label: 'Umm Al Quwain' },
  ],
  SA: [
    { value: 'Riyadh', label: 'Riyadh' },
    { value: 'Jeddah', label: 'Jeddah' },
    { value: 'Mecca', label: 'Mecca' },
    { value: 'Medina', label: 'Medina' },
    { value: 'Dammam', label: 'Dammam' },
    { value: 'Khobar', label: 'Khobar' },
    { value: 'Dhahran', label: 'Dhahran' },
    { value: 'Taif', label: 'Taif' },
    { value: 'Tabuk', label: 'Tabuk' },
    { value: 'Buraydah', label: 'Buraydah' },
  ],
  QA: [
    { value: 'Doha', label: 'Doha' },
    { value: 'Al Wakrah', label: 'Al Wakrah' },
    { value: 'Al Khor', label: 'Al Khor' },
    { value: 'Al Rayyan', label: 'Al Rayyan' },
    { value: 'Umm Salal', label: 'Umm Salal' },
    { value: 'Al Daayen', label: 'Al Daayen' },
  ],
  KW: [
    { value: 'Kuwait City', label: 'Kuwait City' },
    { value: 'Hawalli', label: 'Hawalli' },
    { value: 'Al Farwaniyah', label: 'Al Farwaniyah' },
    { value: 'Al Ahmadi', label: 'Al Ahmadi' },
    { value: 'Al Jahra', label: 'Al Jahra' },
    { value: 'Mubarak Al Kabeer', label: 'Mubarak Al Kabeer' },
  ],
  BH: [
    { value: 'Manama', label: 'Manama' },
    { value: 'Riffa', label: 'Riffa' },
    { value: 'Muharraq', label: 'Muharraq' },
    { value: 'Hamad Town', label: 'Hamad Town' },
    { value: 'Aali', label: 'Aali' },
    { value: 'Isa Town', label: 'Isa Town' },
  ],
  OM: [
    { value: 'Muscat', label: 'Muscat' },
    { value: 'Salalah', label: 'Salalah' },
    { value: 'Sohar', label: 'Sohar' },
    { value: 'Nizwa', label: 'Nizwa' },
    { value: 'Sur', label: 'Sur' },
    { value: 'Al Buraimi', label: 'Al Buraimi' },
  ],
  JO: [
    { value: 'Amman', label: 'Amman' },
    { value: 'Irbid', label: 'Irbid' },
    { value: 'Zarqa', label: 'Zarqa' },
    { value: 'Aqaba', label: 'Aqaba' },
    { value: 'Madaba', label: 'Madaba' },
    { value: 'Karak', label: 'Karak' },
  ],
  LB: [
    { value: 'Beirut', label: 'Beirut' },
    { value: 'Tripoli', label: 'Tripoli' },
    { value: 'Sidon', label: 'Sidon' },
    { value: 'Tyre', label: 'Tyre' },
    { value: 'Byblos', label: 'Byblos' },
    { value: 'Baalbek', label: 'Baalbek' },
  ],
  EG: [
    { value: 'Cairo', label: 'Cairo' },
    { value: 'Alexandria', label: 'Alexandria' },
    { value: 'Giza', label: 'Giza' },
    { value: 'Shubra El Kheima', label: 'Shubra El Kheima' },
    { value: 'Port Said', label: 'Port Said' },
    { value: 'Suez', label: 'Suez' },
    { value: 'Luxor', label: 'Luxor' },
    { value: 'Aswan', label: 'Aswan' },
  ],
  IQ: [
    { value: 'Baghdad', label: 'Baghdad' },
    { value: 'Basra', label: 'Basra' },
    { value: 'Mosul', label: 'Mosul' },
    { value: 'Erbil', label: 'Erbil' },
    { value: 'Sulaymaniyah', label: 'Sulaymaniyah' },
    { value: 'Najaf', label: 'Najaf' },
  ],
  SY: [
    { value: 'Damascus', label: 'Damascus' },
    { value: 'Aleppo', label: 'Aleppo' },
    { value: 'Homs', label: 'Homs' },
    { value: 'Hama', label: 'Hama' },
    { value: 'Latakia', label: 'Latakia' },
    { value: 'Deir ez-Zor', label: 'Deir ez-Zor' },
  ],
  YE: [
    { value: 'Sanaa', label: 'Sanaa' },
    { value: 'Aden', label: 'Aden' },
    { value: 'Taiz', label: 'Taiz' },
    { value: 'Al Hudaydah', label: 'Al Hudaydah' },
    { value: 'Ibb', label: 'Ibb' },
    { value: 'Dhamar', label: 'Dhamar' },
  ],
  PS: [
    { value: 'Gaza', label: 'Gaza' },
    { value: 'Hebron', label: 'Hebron' },
    { value: 'Nablus', label: 'Nablus' },
    { value: 'Ramallah', label: 'Ramallah' },
    { value: 'Bethlehem', label: 'Bethlehem' },
    { value: 'Jericho', label: 'Jericho' },
  ],
  IL: [
    { value: 'Tel Aviv', label: 'Tel Aviv' },
    { value: 'Jerusalem', label: 'Jerusalem' },
    { value: 'Haifa', label: 'Haifa' },
    { value: 'Rishon LeZion', label: 'Rishon LeZion' },
    { value: 'Petah Tikva', label: 'Petah Tikva' },
    { value: 'Ashdod', label: 'Ashdod' },
  ],
  TR: [
    { value: 'Istanbul', label: 'Istanbul' },
    { value: 'Ankara', label: 'Ankara' },
    { value: 'Izmir', label: 'Izmir' },
    { value: 'Bursa', label: 'Bursa' },
    { value: 'Adana', label: 'Adana' },
    { value: 'Gaziantep', label: 'Gaziantep' },
  ],
  IR: [
    { value: 'Tehran', label: 'Tehran' },
    { value: 'Mashhad', label: 'Mashhad' },
    { value: 'Isfahan', label: 'Isfahan' },
    { value: 'Karaj', label: 'Karaj' },
    { value: 'Shiraz', label: 'Shiraz' },
    { value: 'Tabriz', label: 'Tabriz' },
  ],
};

// Helper function to get localized labels
export const getLocalizedCountries = (locale: string) => {
  return middleEastCountries.map(country => ({
    ...country,
    label: locale === 'ar' ? getArabicCountryName(country.code) : country.label,
  }));
};

export const getLocalizedCities = (countryCode: string, locale: string) => {
  const cities = middleEastCities[countryCode] || [];
  return cities.map(city => ({
    ...city,
    label: locale === 'ar' ? getArabicCityName(countryCode, city.value) : city.label,
  }));
};

// Arabic translations (simplified - you can expand this)
const getArabicCountryName = (code: string): string => {
  const arabicNames: Record<string, string> = {
    AE: 'الإمارات العربية المتحدة',
    SA: 'المملكة العربية السعودية',
    QA: 'قطر',
    KW: 'الكويت',
    BH: 'البحرين',
    OM: 'عمان',
    JO: 'الأردن',
    LB: 'لبنان',
    EG: 'مصر',
    IQ: 'العراق',
    SY: 'سوريا',
    YE: 'اليمن',
    PS: 'فلسطين',
    IL: 'إسرائيل',
    TR: 'تركيا',
    IR: 'إيران',
  };
  return arabicNames[code] || code;
};

const getArabicCityName = (countryCode: string, cityValue: string): string => {
  // This is a simplified implementation - you can expand with full Arabic city names
  const arabicCities: Record<string, Record<string, string>> = {
    AE: {
      'Dubai': 'دبي',
      'Abu Dhabi': 'أبوظبي',
      'Sharjah': 'الشارقة',
    },
    SA: {
      'Riyadh': 'الرياض',
      'Jeddah': 'جدة',
      'Mecca': 'مكة',
      'Medina': 'المدينة',
    },
    // Add more as needed
  };

  return arabicCities[countryCode]?.[cityValue] || cityValue;
};