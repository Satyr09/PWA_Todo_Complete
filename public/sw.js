importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

const versionNumber = "1.1.16";
const STATIC_CACHE = "static-cache" + versionNumber;
const DYNAMIC_CACHE = "dynamic-cache" + versionNumber;

const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "src/js/idb.js",
  "src/js/utility.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/css/help.css",
  "/src/js/material.min.js",
  "/src/images/main-image.jpg",

  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
  "https://fonts.googleapis.com/icon?family=Material+Icons"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log("[Service Worker] Precaching App Shell");
      /*return*/ cache.addAll(urlsToCache).catch(err => console.log(err));
    })
  );
});

self.addEventListener("activate", e => {
  console.log("[Service Worker] activated", e);

  //CACHE MANAGEMENT , delete previous versions of static and dynamic caches
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            console.log("[Service Worker] Removing Old Cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

const url = "https://pwatodo-devfeb.firebaseio.com/posts.json";

self.addEventListener("fetch", e => {
  //   console.log("[Service Worker] Fetch event(s) received");
  //   e.respondWith(fetch(e.request));

  if (e.request.url.indexOf(url) > -1) {
    console.log("Intercepted post fetch call");
    e.respondWith(
      fetch(e.request).then(res => {
        return caches.open(DYNAMIC_CACHE).then(cache => {
          let resClone = res.clone();
          resClone.json().then(dataJSON => {
            let dataArray = [];
            for (let key in dataJSON) {
              writeData("posts", dataJSON[key]);
            }
          });
          return res;
        });
      })
      /*.catch(() => {
          return caches.match(e.request).then(response => {
            return response;
          });
        })*/
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(res => {
        if (res) return res;
        else {
          return fetch(e.request)
            .then(response => {
              return caches.open(DYNAMIC_CACHE).then(cache => {
                cache.put(e.request, response.clone());
                return response;
              });
            })
            .catch(err => {
              return caches.open(STATIC_CACHE).then(cache => {
                if (e.request.headers.get("accept").includes("text/html"))
                  return cache.match("/offline.html");
              });
            });
        }
      })
    );
  }
});

self.addEventListener("sync", event => {
  if (event.tag == "sync-new-post") {
    console.log("sync event caught");
    event.waitUntil(
      readData("sync-posts").then(data => {
        for (let dt of data) {
          // let postData = new FormData();
          // postData.append("id", dt.id);
          // postData.append("title", dt.title);
          // postData.append("Location", dt.Location);
          // postData.append("file", dt.picture, dt.id + ".png");

          let Location = dt.Location;
          fetch(url, {
            method: "POST",
            //postData

            body: JSON.stringify({
              id: dt.id,
              title: dt.title,
              Location,
              image: dt.image
            }),
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            }
          })
            .then(res => {
              if (res.ok) {
                deleteItemFromStore("sync-posts", dt.id);
              }
              console.log("[Service Worker] SENT STORED DATA TO SERVER", res);
            })
            .catch(err =>
              console.log(
                "[Service Worker] Couldn't fetch after syncing...",
                err
              )
            );
        }
      })
    );
  }
});
