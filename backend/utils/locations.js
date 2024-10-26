const locations = {
  'korea-seoul': [37.5665, 126.9780],
  'korea-busan': [35.1796, 129.0756],
  'japan-tokyo': [35.6762, 139.6503],
  'japan-osaka': [34.6937, 135.5023],
  'china-beijing': [39.9042, 116.4074],
  'china-shanghai': [31.2304, 121.4737],
  'usa-west': [37.7749, -122.4194],
  'usa-east': [40.7128, -74.0060],
  'usa-central': [41.8781, -87.6298],
  'europe-west': [48.8566, 2.3522],
  'europe-east': [52.2297, 21.0122],
  'europe-north': [59.3293, 18.0686],
  'asia-southeast': [1.3521, 103.8198],
  'australia-sydney': [-33.8688, 151.2093]
};

const timezones = {
  'korea-seoul': 'Asia/Seoul',
  'korea-busan': 'Asia/Seoul',
  'japan-tokyo': 'Asia/Tokyo',
  'japan-osaka': 'Asia/Tokyo',
  'china-beijing': 'Asia/Shanghai',
  'china-shanghai': 'Asia/Shanghai',
  'usa-west': 'America/Los_Angeles',
  'usa-east': 'America/New_York',
  'usa-central': 'America/Chicago',
  'europe-west': 'Europe/Paris',
  'europe-east': 'Europe/Warsaw',
  'europe-north': 'Europe/Stockholm',
  'asia-southeast': 'Asia/Singapore',
  'australia-sydney': 'Australia/Sydney'
};

export function getLocationCoords(location) {
  if (location === 'auto' || !locations[location]) {
    return undefined;
  }
  const [latitude, longitude] = locations[location];
  return { latitude, longitude };
}

export function getLocationTimezone(location) {
  return timezones[location] || 'UTC';
}

export function getRandomLocation() {
  const locationKeys = Object.keys(locations);
  return locationKeys[Math.floor(Math.random() * locationKeys.length)];
}