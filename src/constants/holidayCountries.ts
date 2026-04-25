export interface HolidayCountry {
  code: string;
  name: string;
  id: string; // The part before #holiday
  flag: string;
  desc: string;
}

export const HOLIDAY_COUNTRIES: HolidayCountry[] = [
  { code: 'IN', name: 'India', id: 'en.indian', flag: '🇮🇳', desc: 'Public holidays and observances' },
  { code: 'US', name: 'United States', id: 'en.usa', flag: '🇺🇸', desc: 'Federal holidays' },
  { code: 'GB', name: 'United Kingdom', id: 'en.uk', flag: '🇬🇧', desc: 'Bank holidays and public events' },
  { code: 'AU', name: 'Australia', id: 'en.australian', flag: '🇦🇺', desc: 'National and state holidays' },
  { code: 'CA', name: 'Canada', id: 'en.canadian', flag: '🇨🇦', desc: 'Federal and provincial holidays' },
  { code: 'FR', name: 'France', id: 'en.french', flag: '🇫🇷', desc: 'Jours fériés nationaux' },
  { code: 'DE', name: 'Germany', id: 'en.german', flag: '🇩🇪', desc: 'Gesetzliche Feiertage' },
  { code: 'JP', name: 'Japan', id: 'en.japanese', flag: '🇯🇵', desc: '祝日 (National holidays)' },
  { code: 'BR', name: 'Brazil', id: 'en.brazilian', flag: '🇧🇷', desc: 'Feriados nacionais' },
  { code: 'CN', name: 'China', id: 'en.china', flag: '🇨🇳', desc: '中国公共假期' },
  { code: 'IT', name: 'Italy', id: 'en.italian', flag: '🇮🇹', desc: 'Festività nazionali' },
  { code: 'ES', name: 'Spain', id: 'en.spain', flag: '🇪🇸', desc: 'Festivos nacionales' },
  { code: 'RU', name: 'Russia', id: 'en.russian', flag: '🇷🇺', desc: 'Государственные праздники' },
  { code: 'MX', name: 'Mexico', id: 'en.mexican', flag: '🇲🇽', desc: 'Días festivos oficiales' },
  { code: 'SG', name: 'Singapore', id: 'en.singapore', flag: '🇸🇬', desc: 'Public holidays' },
  { code: 'KR', name: 'South Korea', id: 'en.south_korea', flag: '🇰🇷', desc: '공휴일 (Public holidays)' },
  { code: 'NZ', name: 'New Zealand', id: 'en.new_zealand', flag: '🇳🇿', desc: 'National and regional holidays' },
  { code: 'IE', name: 'Ireland', id: 'en.irish', flag: '🇮🇪', desc: 'Bank holidays' },
  { code: 'ZA', name: 'South Africa', id: 'en.sa', flag: '🇿🇦', desc: 'Public holidays' },
  { code: 'AE', name: 'United Arab Emirates', id: 'en.ae', flag: '🇦🇪', desc: 'National and religious holidays' },
  { code: 'NL', name: 'Netherlands', id: 'en.dutch', flag: '🇳🇱', desc: 'Nationale feestdagen' },
  { code: 'CH', name: 'Switzerland', id: 'en.swiss', flag: '🇨🇭', desc: 'Nationale Feiertage' },
  { code: 'SE', name: 'Sweden', id: 'en.swedish', flag: '🇸🇪', desc: 'Allmänna helgdagar' },
  { code: 'NO', name: 'Norway', id: 'en.norwegian', flag: '🇳🇴', desc: 'Offentlige høytidsdager' },
  { code: 'DK', name: 'Denmark', id: 'en.danish', flag: '🇩🇰', desc: 'Danske helligdage' },
  { code: 'FI', name: 'Finland', id: 'en.finnish', flag: '🇫🇮', desc: 'Suomalaiset juhlapyhät' },
];
