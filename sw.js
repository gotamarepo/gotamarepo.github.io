const ref = 2;

// (A) CREATE/INSTALL CACHE
self.addEventListener("install", evt => {
    self.skipWaiting();
    evt.waitUntil(
      caches.open("serv")
      .then(cache => cache.addAll([
        "/",
        "index.html",
        "init.js",
        "param.js",
        "favicon.ico",
        "manifest.json",
        "/pages/home.html",
        "/pages/train.html",
        "/pages/profile.html",
        "/lib/mannequin.js",
        "/lib/three.min.js",
        "/lib/ml.js",
        "/lib/main.js",
        "/lib/auth.js",
        "/lib/login.js",
      ]))
      .catch(err => console.error(err))
    );
  });
  
  // (B) CLAIM CONTROL INSTANTLY
  self.addEventListener("activate", evt => self.clients.claim());
  
  // (C) LOAD FROM CACHE FIRST, FALLBACK TO NETWORK IF NOT FOUND
  // self.addEventListener("fetch", evt => evt.respondWith(
  //   caches.match(evt.request).then(res => res || fetch(evt.request))
  // ));
  
  // (C) LOAD WITH NETWORK FIRST, FALLBACK TO CACHE IF OFFLINE
  self.addEventListener("fetch", evt => evt.respondWith(
    fetch(evt.request).catch(() => caches.match(evt.request))
  ));