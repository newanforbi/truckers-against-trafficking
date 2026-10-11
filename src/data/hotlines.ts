import type { Hotline } from '@/types';

export const EMERGENCY_PHONE = '911';

export const TEXT_TIP = {
  number: '233733',
  display: '233733',
  keyword: 'HELP',
};

export const hotlines: Hotline[] = [
  {
    id: 'us',
    region: 'United States',
    label: 'National Human Trafficking Hotline',
    phone: '18883737888',
    displayPhone: '1-888-373-7888',
    note: '24/7. Interpreters available by phone. Also text 233733.',
  },
  {
    id: 'ca',
    region: 'Canada',
    label: 'Canadian Human Trafficking Hotline',
    phone: '18339001010',
    displayPhone: '1-833-900-1010',
    note: '24/7 support and referrals across Canada.',
  },
  {
    id: 'mx',
    region: 'Mexico',
    label: 'Mexico trafficking hotline',
    phone: '018005533000',
    displayPhone: '01-800-5533-000',
    note: 'Use when the incident is in Mexico.',
  },
];

export const officialResources = [
  {
    id: 'tat-training',
    title: 'Official TAT training',
    url: 'https://tatnonprofit.org/',
    detail: 'Free Truckers Against Trafficking courses and industry materials.',
  },
  {
    id: 'tat-app',
    title: 'Official TAT app',
    url: 'https://tatnonprofit.org/tat-app/',
    detail: 'TAT’s own iOS and Android app, including local numbers where available.',
  },
  {
    id: 'nhth-tip',
    title: 'Submit a tip online',
    url: 'https://humantraffickinghotline.org/en/report-trafficking',
    detail: 'National Human Trafficking Hotline web form. Call or text if it happened in the last 24 hours.',
  },
  {
    id: 'dot-indicators',
    title: 'USDOT trafficking indicators',
    url: 'https://www.transportation.gov/stop-human-trafficking/indicators',
    detail: 'Highway and truck-stop indicators published by the U.S. Department of Transportation.',
  },
];
