export type TipDraft = {
  id: string;
  updatedAt: string;
  observedAt: string;
  locationLabel: string;
  latitude: number | null;
  longitude: number | null;
  vehicles: string;
  people: string;
  observation: string;
  photos: string[];
};

export type Hotline = {
  id: string;
  region: string;
  label: string;
  phone: string;
  displayPhone: string;
  note: string;
};

export type RedFlag = {
  id: string;
  title: string;
  detail: string;
  source: string;
};
