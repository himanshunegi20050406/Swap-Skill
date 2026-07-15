// sw.js - SwapSkill Service Worker

const CACHE_NAME = 'swapskill-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/login.html',
  '/signup.html',
  '/request.html',
  '/chat.html',
  '/logo.png',
  '/tts.js'
];

// Install Event: Cache Static Assets
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Forces the new service worker to activate immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // Take control of all open pages immediately
});

// Fetch Event: Bypass APIs and Firebase, only intercept static GET requests
self.addEventListener('fetch', (e) => {
  const requestUrl = new URL(e.request.url);

  // 🚨 CRITICAL FIX: Ignore all Firebase, Firestore, external APIs, and POST requests.
  // Letting the browser handle these normally prevents the continuous connection drops.
  if (
    requestUrl.hostname.includes('firestore.googleapis.com') ||
    requestUrl.hostname.includes('firebasestorage.googleapis.com') ||
    requestUrl.hostname.includes('api.imgbb.com') ||
    requestUrl.hostname.includes('purgomalum.com') ||
    e.request.method !== 'GET'
  ) {
    return; // Do nothing, let the browser fetch it natively
  }

  // For safe, static assets, check cache first, then network
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
