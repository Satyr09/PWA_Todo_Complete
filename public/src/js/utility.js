const dbPromise = idb.open("posts-store", 1, db => {
  if (!db.objectStoreNames.contains("posts"))
    db.createObjectStore("posts", { keyPath: "id" });
  if (!db.objectStoreNames.contains("sync-posts"))
    db.createObjectStore("sync-posts", { keyPath: "id" });
});

writeData = (st, data) => {
  console.log("WRITING TO IDB");
  return dbPromise.then(db => {
    let tr = db.transaction(st, "readwrite");
    let store = tr.objectStore(st);
    store.put(data);
    return tr.complete;
  });
};

readData = st => {
  return dbPromise.then(db => {
    let tr = db.transaction(st, "readwrite");
    let store = tr.objectStore(st);
    return store.getAll();
  });
};

clearAllData = st => {
  return dbPromise.then(db => {
    let tr = db.transaction(st, "readwrite");
    let store = tr.objectStore(st);
    store.clear();
    return tr.complete;
  });
};

deleteItemFromStore = (st, id) => {
  dbPromise
    .then(db => {
      let tr = db.transaction(st, "readwrite");
      let store = tr.objectStore(st);
      store.delete(id);
      return tr.complete;
    })
    .then(() => {
      console.log("[Utility.js] item deleted");
    });
};

dataURItoBlob = dataURI => {
  let byteString = atob(dataURI.split(",")[1]);
  let mimeString = dataURI
    .split(",")[0]
    .split(":")[1]
    .split(";")[0];

  let ab = new ArrayBuffer(byteString.length);
  let ia = new Uint8Array(ab);

  for (let i = 0; i < byteString; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  let blob = new Blob([ab], { type: mimeString });
  return blob;
};
