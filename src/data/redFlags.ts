import type { RedFlag } from '@/types';

export const redFlags: RedFlag[] = [
  {
    id: 'dropoff',
    title: 'Brief drop-off and pick-up',
    detail:
      'A vehicle drops someone at a truck or lot and comes back in about 15–20 minutes.',
    source: 'USDOT TLAHT / TAT public materials',
  },
  {
    id: 'out-of-place',
    title: 'Out-of-place van or RV',
    detail:
      'A van, RV, or other vehicle sitting among trucks in a mainly male lot, or carrying several people who do not appear free to leave.',
    source: 'USDOT TLAHT / TAT public materials',
  },
  {
    id: 'truck-to-truck',
    title: 'Truck-to-truck movement',
    detail:
      'A person is going from truck to truck, or is being directed to do so.',
    source: 'USDOT TLAHT',
  },
  {
    id: 'cb-signals',
    title: 'CB chatter or light signals',
    detail:
      'CB talk about a “commercial company,” or flashing lights used to signal a buyer.',
    source: 'USDOT TLAHT',
  },
  {
    id: 'showers',
    title: 'Prolonged time in showers or restrooms',
    detail:
      'Someone is spending unusual amounts of time in or around truck-stop showers and bathrooms, or is being watched while they do.',
    source: 'USDOT TLAHT',
  },
  {
    id: 'control',
    title: 'Someone else is in control',
    detail:
      'They do not keep their own ID or money, cannot speak for themselves, do not know where they are, or cannot come and go.',
    source: 'TAT visor card',
  },
  {
    id: 'quota',
    title: 'Quota, pimp, or “daddy” talk',
    detail:
      'Any mention of making a quota or of a pimp / “daddy,” or of exchanging sex for a ride, food, or a debt.',
    source: 'TAT visor card',
  },
  {
    id: 'injury',
    title: 'Fear, bruising, or branding',
    detail:
      'Visible injuries, fear of another person nearby, or a tattoo/brand of a name — often on the neck.',
    source: 'TAT visor card',
  },
];

export const doNotDo = [
  'Do not approach or confront a suspected trafficker.',
  'Do not try to rescue someone yourself. That can put you and them in danger and can harm a later case.',
  'Do not put yourself at risk for a photo. If you cannot snap safely, skip the picture.',
  'When you call, say you suspect human trafficking — not “prostitution.”',
];

export const tellTheOperator = [
  'Where you are: highway, mile marker, exit, truck stop name, stall or lot number.',
  'When you saw it: date and time, and whether it is still happening.',
  'Vehicles: make, model, color, plate, truck number, USDOT number.',
  'People: height, clothing, hair, age range, and who appeared in control.',
  'What you saw, in plain facts. Do not guess motives.',
];
