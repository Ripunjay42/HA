// Backend is reached over the machine's LAN IP (works for physical devices
// via Expo Go/dev client, as well as the Android emulator).
const DEV_HOST = '10.134.99.151';

export const API_BASE_URL = `http://${DEV_HOST}:5000/api`;
export const UPLOADS_BASE_URL = `http://${DEV_HOST}:5000`;


// export const API_BASE_URL = `https://has-backend-one.vercel.app/api`;
// export const UPLOADS_BASE_URL = `https://has-backend-one.vercel.app`;