var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
let form = document.querySelector("form");
let titleInput = document.querySelector("#title");
let locationInput = document.querySelector("#location");
let videoPlayer = document.querySelector("#player");
let canvasElement = document.querySelector("#canvas");
let captureBtn = document.querySelector("#capture-btn");
let imgPicker = document.querySelector("#image-picker");
let pickImageArea = document.querySelector("#pick-image");
let picture;
let picturenew;

function initMedia() {
  console.log("INIT MEDIA");
  if (!("mediaDevices" in navigator)) {
    navigator.mediaDevices = {};
    console.log("no media devices in nav");
  }

  if (!("getUserMedia" in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      let getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) {
        return Promise.reject(new Error("User Media cant be accessed"));
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraint, resolve, reject);
      });
    };
  }

  console.log(navigator.mediaDevices);

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(stream => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = "block";
    })
    .catch(err => {
      pickImageArea.style.display = "block";
    });
}

captureBtn.addEventListener("click", event => {
  canvasElement.style.display = "block";
  videoPlayer.style.display = "none";
  captureBtn.style.display = "none";

  let context = canvasElement.getContext("2d");
  context.drawImage(
    videoPlayer,
    0,
    0,
    canvas.width,
    videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width)
  );

  videoPlayer.srcObject.getVideoTracks().forEach(track => {
    track.stop();
  }, this);

  picture = dataURItoBlob(canvasElement.toDataURL());
  picturenew = canvasElement.toDataURL();
  console.log(picturenew);
});
function openCreatePostModal() {
  createPostArea.style.display = "block";
  console.log(firebase);
  initMedia();
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(userChoiceResult => {
      if (userChoiceResult.outcome == "dismissed") {
        console.log("[Feed.js] User cancelled installation");
      } else {
        console.log("[Feed.js] User installed our app successfully!");
      }
    });
    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = "none";

  pickImageArea.style.display = "none";
  videoPlayer.style.display = "none";
  canvasElement.style.display = "none";

  videoPlayer.srcObject.getVideoTracks().forEach(track => {
    track.stop();
  }, this);
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastElementChild);
  }
}

function createCard(data) {
  console.log(data);
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = "url(" + data.image + ")";
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "200px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent =
    data.Location + "\n" + "This is your task,you have added this at : ";
  cardSupportingText.style.textAlign = "center";
  /*let cardSavebutton = document.createElement("button");
  cardSavebutton.textContent = "Save";
  cardSavebutton.addEventListener("click", onSaveBtnClicked);
  cardSupportingText.appendChild(cardSavebutton);*/
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

updateUI = data => {
  clearCards();
  for (let i = 0; i < data.length; i++) createCard(data[i]);
};

sendData = data => {
  let postData = new FormData();
  postData.append("id", data.id);
  postData.append("title", data.title);
  postData.append("Location", data.Location);
  postData.append("file", picture, id + ".png");

  fetch(url, {
    method: "POST",
    //body:JSON.stringify(data),
    body: postData
    /*headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }*/
  }).then(res => {
    //updateUI();
    console.log("SENT DATA TO SERVER", res);
  });
};

const url = "https://pwatodo-devfeb.firebaseio.com/posts.json";
let netWorkDataReceived = false;

fetch(url)
  .then(res => {
    netWorkDataReceived = true;
    return res.json();
  })
  .then(data => {
    let dataArray = [];
    for (let elem in data) {
      dataArray.push(data[elem]);
    }
    console.log("POSTS FROM FETCH");
    updateUI(dataArray);
  });

/*
if ("caches" in window) {
  caches
    .match(url)
    .then(res => {
      if (res) return res.json();
    })
    .then(response => {
      let dataArray = [];
      console.log("POSTS FROM CACHE");
      for (data in response) {
        dataArray.push(response[data]);
      }
      if (netWorkDataReceived === false) updateUI(dataArray);
    });
}*/

if ("indexedDB" in window) {
  console.log("Trying to read indexed db ...");
  readData("posts").then(data => {
    if (!netWorkDataReceived) {
      console.log("From IDB", data);
      updateUI(data);
    }
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  console.log(titleInput.value, "  ", locationInput.value);

  let post = {
    id: new Date().toISOString(),
    title: titleInput.value,
    Location: locationInput.value
    //   image:
    //     "https://firebasestorage.googleapis.com/v0/b/pwatodo-devfeb.appspot.com/o/bg.jpg?alt=media&token=2e7e2daf-f720-4b50-9e62-e817bf063edb"
    // }
    //picture: picture
  };

  console.log("[Submit] ", post.picture);
  closeCreatePostModal();

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    console.log("Will attempt to sync");
    navigator.serviceWorker.ready.then(sw => {
      let metadata = {
        contentType: "image/png"
      };
      let storageRef = firebase.storage().ref();
      // Upload file and metadata to the object 'images/mountains.jpg'
      let uploadTask = storageRef
        .child(post.id + ".png")
        .putString(picturenew, "data_url");

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function(snapshot) {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          let progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log("Upload is paused");
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log("Upload is running");
              break;
          }
        },
        function(error) {
          // // A full list of error codes is available at
          // // https://firebase.google.com/docs/storage/web/handle-errors
          // switch (error.code) {
          //   case 'storage/unauthorized':
          //     // User doesn't have permission to access the object
          //     break;
          //   case 'storage/canceled':
          //     // User canceled the upload
          //     break;
          //   ...
          //   case 'storage/unknown':
          //     // Unknown error occurred, inspect error.serverResponse
          //     break;
          // }
          console.log("[FireBase Storage] Oops,something broke!");
        },
        function() {
          // Upload completed successfully, now we can get the download URL
          uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            console.log("File available at", downloadURL);
            post.image = downloadURL;
            writeData("sync-posts", post)
              .then(args => {
                console.log("STORED FOR SYNC", args, post);
                return sw.sync.register("sync-new-post");
              })
              .then(() => {
                let snackBarContainer = document.querySelector(
                  "#confirmation-toast"
                );
                let data = { message: "Your message was saved for syncing!" };
                snackBarContainer.MaterialSnackbar.showSnackbar(data);
              })
              .catch(err => {
                console.log("Data was not saved for syncing :(", err);
              });
          });
        }
      );

      /*writeData("sync-posts", post)
        .then(args => {
          console.log("STORED FOR SYNC", args, post);
          return sw.sync.register("sync-new-post");
        })
        .then(() => {
          let snackBarContainer = document.querySelector("#confirmation-toast");
          let data = { message: "Your message was saved for syncing!" };
          snackBarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch(err => {
          console.log("Data was not saved for syncing :(", err);
        });*/
    });

    //   {

    // });
  } else {
    sendData(post);
  }
});
