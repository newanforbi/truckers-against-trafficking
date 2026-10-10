export type Coords = {
  latitude: number;
  longitude: number;
};

export function milesBetween(a: Coords, b: Coords): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earth = 3958.8;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatMiles(miles: number): string {
  if (miles < 0.1) {
    return 'here';
  }
  if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  }
  return `${Math.round(miles)} mi`;
}

export function timeAgo(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return iso;
  }
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.round(hours / 24);
  if (days < 7) {
    return `${days}d`;
  }
  return `${Math.round(days / 7)}w`;
}

export function authorHandle(reporterId: string): string {
  const short = reporterId.replace(/^seed-driver-/, '').replace(/^driver-/, '');
  return `u/${short.slice(0, 12) || 'driver'}`;
}

export function stopName(locationLabel: string): string {
  const first = locationLabel.split(',')[0]?.trim();
  return first || 'truck stop';
}
