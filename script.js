"use strict";

/*
=========================================================
 FIREBASE IMPORTS
=========================================================
*/

import {
  initializeApp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInAnonymously
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


/*
=========================================================
 FIREBASE CONFIG

 IMPORTANT:
 Replace these with YOUR Firebase Web App config.
=========================================================
*/

const firebaseConfig = {

  apiKey:
    "PASTE_YOUR_API_KEY_HERE",

  authDomain:
    "PASTE_YOUR_PROJECT.firebaseapp.com",

  projectId:
    "PASTE_YOUR_PROJECT_ID_HERE",

  storageBucket:
    "PASTE_YOUR_STORAGE_BUCKET_HERE",

  messagingSenderId:
    "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",

  appId:
    "PASTE_YOUR_APP_ID_HERE"

};


/*
=========================================================
 FIREBASE INITIALIZE
=========================================================
*/

const app =
  initializeApp(
    firebaseConfig
  );


const auth =
  getAuth(app);


const db =
  getFirestore(app);


const storage =
  getStorage(app);


/*
=========================================================
 HELPER
=========================================================
*/

const $ =
  (id) =>
    document.getElementById(id);


/*
=========================================================
 SETTINGS
=========================================================
*/

const MAX_PHOTOS = 15;

let selectedFiles = [];


/*
=========================================================
 FIREBASE LOGIN
=========================================================
*/

let firebaseReady =
  false;


async function initializeFirebase() {

  try {

    await signInAnonymously(
      auth
    );

    firebaseReady = true;

    console.log(
      "Firebase ready ❤️"
    );

  } catch (error) {

    console.error(
      "Firebase authentication error:",
      error
    );

    alert(
      "Firebase setup problem. Please check Anonymous Authentication."
    );

  }

}


await initializeFirebase();


/*
=========================================================
 IMAGE COMPRESSION
=========================================================
*/

function compressImage(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload =
        function () {

          const image =
            new Image();


          image.onload =
            function () {

              let width =
                image.naturalWidth;

              let height =
                image.naturalHeight;


              /*
                Keep good quality while
                reducing upload size.
              */

              const MAX_SIZE =
                1400;


              if (
                Math.max(
                  width,
                  height
                ) > MAX_SIZE
              ) {

                if (
                  width >
                  height
                ) {

                  height =
                    Math.round(
                      height *
                      MAX_SIZE /
                      width
                    );

                  width =
                    MAX_SIZE;

                } else {

                  width =
                    Math.round(
                      width *
                      MAX_SIZE /
                      height
                    );

                  height =
                    MAX_SIZE;

                }

              }


              const canvas =
                document.createElement(
                  "canvas"
                );


              canvas.width =
                width;

              canvas.height =
                height;


              const context =
                canvas.getContext(
                  "2d"
                );


              context.drawImage(
                image,
                0,
                0,
                width,
                height
              );


              canvas.toBlob(
                function (blob) {

                  if (!blob) {

                    reject(
                      new Error(
                        "Image compression failed"
                      )
                    );

                    return;
                  }


                  resolve(
                    blob
                  );

                },
                "image/jpeg",
                0.78
              );

            };


          image.onerror =
            function () {

              reject(
                new Error(
                  "Could not load image"
                )
              );

            };


          image.src =
            reader.result;

        };


      reader.onerror =
        function () {

          reject(
            new Error(
              "Could not read image"
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/*
=========================================================
 PHOTO SELECT
=========================================================
*/

const fileInput =
  $("files");


if (fileInput) {

  fileInput.addEventListener(
    "change",
    function () {

      selectedFiles =
        Array.from(
          this.files
        ).filter(
          file =>
            file.type.startsWith(
              "image/"
            )
        ).slice(
          0,
          MAX_PHOTOS
        );


      if (
        this.files.length >
        MAX_PHOTOS
      ) {

        alert(
          "Maximum 15 photos only 📸"
        );

      }


      showThumbnails();

    }
  );

}


/*
=========================================================
 SHOW THUMBNAILS
=========================================================
*/

function showThumbnails() {

  const thumbs =
    $("thumbs");


  if (!thumbs) {
    return;
  }


  thumbs.innerHTML =
    "";


  if ($("photoCount")) {

    $("photoCount")
      .textContent =
      `${selectedFiles.length} / ${MAX_PHOTOS} photos selected`;

  }


  selectedFiles.forEach(
    function (file) {

      const reader =
        new FileReader();


      reader.onload =
        function () {

          const img =
            document.createElement(
              "img"
            );


          img.src =
            reader.result;


          img.alt =
            "Selected photo";


          thumbs.appendChild(
            img
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/*
=========================================================
 UPLOAD ONE PHOTO
=========================================================
*/

async function uploadPhoto(
  file,
  surpriseId,
  index
) {

  const compressed =
    await compressImage(
      file
    );


  const fileName =
    `photo-${index + 1}.jpg`;


  const storagePath =
    `surprises/${surpriseId}/${fileName}`;


  const storageReference =
    ref(
      storage,
      storagePath
    );


  await uploadBytes(
    storageReference,
    compressed,
    {
      contentType:
        "image/jpeg"
    }
  );


  const downloadURL =
    await getDownloadURL(
      storageReference
    );


  return downloadURL;

}


/*
=========================================================
 CREATE SURPRISE
=========================================================
*/

const createButton =
  $("create");


if (createButton) {

  createButton.addEventListener(
    "click",
    async function () {

      if (!firebaseReady) {

        alert(
          "Firebase is still loading. Please try again."
        );

        return;
      }


      const name =
        $("name")
          .value
          .trim();


      const password =
        $("pass")
          .value;


      const wish =
        $("wish")
          .value
          .trim()
        ||
        "Wishing you a very happy birthday! 🎂❤️";


      /*
        VALIDATION
      */

      if (!name) {

        alert(
          "Please enter the name 💗"
        );

        $("name").focus();

        return;
      }


      if (!password) {

        alert(
          "Please create a password 🔐"
        );

        $("pass").focus();

        return;
      }


      if (
        selectedFiles.length === 0
      ) {

        alert(
          "Please select at least one photo 📸"
        );

        return;
      }


      /*
        BUTTON STATE
      */

      createButton.disabled =
        true;

      createButton.textContent =
        "Creating surprise... ⏳";


      try {

        /*
          STEP 1:
          Create Firestore document first.
        */

        const surpriseRef =
          await addDoc(
            collection(
              db,
              "surprises"
            ),
            {
              name:
                name,

              password:
                password,

              wish:
                wish,

              photos:
                [],

              createdAt:
                serverTimestamp()
            }
          );


        const surpriseId =
          surpriseRef.id;


        /*
          STEP 2:
          Upload photos.

          IMPORTANT:
          Photos are NOT placed
          inside the URL.
        */

        const photoURLs =
          [];


        for (
          let i = 0;
          i < selectedFiles.length;
          i++
        ) {

          createButton.textContent =
            `Uploading photo ${i + 1}/${selectedFiles.length}... 📸`;


          const url =
            await uploadPhoto(
              selectedFiles[i],
              surpriseId,
              i
            );


          photoURLs.push(
            url
          );

        }


        /*
          STEP 3:
          Save photo URLs in
          Firestore.
        */

        await import(
          "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
        ).then(
          async ({
            updateDoc
          }) => {

            await updateDoc(
              doc(
                db,
                "surprises",
                surpriseId
              ),
              {
                photos:
                  photoURLs
              }
            );

          }
        );


        /*
          STEP 4:
          Create SHORT URL.

          Only Firebase document ID
          goes into the URL.
        */

        const baseURL =
          window.location.href
            .split("?")[0]
            .split("#")[0];


        const shareLink =
          `${baseURL}?id=${encodeURIComponent(
            surpriseId
          )}`;


        $("link").value =
          shareLink;


        $("result")
          .classList
          .remove("hidden");


        $("result")
          .scrollIntoView({
            behavior:
              "smooth",

            block:
              "center"
          });


        createButton.textContent =
          "Surprise Created ❤️";


      } catch (error) {

        console.error(
          "Create surprise error:",
          error
        );


        alert(
          "Something went wrong 😭\n\n" +
          error.message
        );


        createButton.textContent =
          "Create Surprise 💗";

      }


      createButton.disabled =
        false;

    }
  );

}


/*
=========================================================
 COPY LINK
=========================================================
*/

const copyButton =
  $("copy");


if (copyButton) {

  copyButton.addEventListener(
    "click",
    async function () {

      const link =
        $("link").value;


      if (!link) {
        return;
      }


      try {

        await navigator.clipboard
          .writeText(
            link
          );


        this.textContent =
          "Copied! ❤️";


        setTimeout(
          () => {

            this.textContent =
              "Copy Surprise Link ❤️";

          },
          2000
        );


      } catch (error) {

        /*
          Mobile fallback
        */

        $("link").focus();

        $("link").select();

        $("link").setSelectionRange(
          0,
          $("link").value.length
        );


        this.textContent =
          "Long press to copy 📋";

      }

    }
  );

}


/*
=========================================================
 GET ID FROM URL
=========================================================
*/

function getSurpriseId() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  return params.get(
    "id"
  );

}


const surpriseId =
  getSurpriseId();


/*
=========================================================
 LOAD SURPRISE FROM FIRESTORE
=========================================================
*/

let surpriseData =
  null;


async function loadSurprise() {

  if (!surpriseId) {

    return;

  }


  try {

    const surpriseRef =
      doc(
        db,
        "surprises",
        surpriseId
      );


    const snapshot =
      await getDoc(
        surpriseRef
      );


    if (!snapshot.exists()) {

      alert(
        "Surprise link not found 😭"
      );

      return;

    }


    surpriseData =
      snapshot.data();


    /*
      Show lock page
    */

    $("creator")
      ?.classList
      .add("hidden");


    $("locked")
      ?.classList
      .remove("hidden");


    $("lockedName")
      .textContent =
      surpriseData.name ||
      "Someone Special";


  } catch (error) {

    console.error(
      "Load surprise error:",
      error
    );


    alert(
      "Unable to load this surprise 😭"
    );

  }

}


/*
=========================================================
 PASSWORD OPEN
=========================================================
*/

const openButton =
  $("open");


if (openButton) {

  openButton.addEventListener(
    "click",
    async function () {

      if (!surpriseData) {

        return;

      }


      const enteredPassword =
        $("unlock").value;


      if (
        enteredPassword !==
        surpriseData.password
      ) {

        $("wrong")
          .textContent =
          "Wrong password 😭";


        $("unlock")
          .focus();


        return;

      }


      $("wrong")
        .textContent =
        "";


      /*
        Hide lock page
      */

      $("locked")
        .classList
        .add("hidden");


      /*
        Show surprise
      */

      $("surprise")
        .classList
        .remove("hidden");


      $("sname")
        .textContent =
        surpriseData.name ||
        "You";


      $("swish")
        .textContent =
        surpriseData.wish ||
        "";


      /*
        Create vertical gallery
      */

      createGallery(
        Array.isArray(
          surpriseData.photos
        )
          ? surpriseData.photos
          : []
      );


      startConfetti();


      /*
        Password button click is
        a real user gesture,
        so music has a better chance
        of playing on mobile.
      */

      await startMusic();

    }
  );

}


/*
=========================================================
 ENTER KEY
=========================================================
*/

const unlock =
  $("unlock");


if (unlock) {

  unlock.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();

        $("open").click();

      }

    }
  );

}


/*
=========================================================
 VERTICAL GALLERY
=========================================================
*/

function createGallery(
  images
) {

  const gallery =
    $("gallery");


  if (!gallery) {
    return;
  }


  gallery.innerHTML =
    "";


  const rotations = [
    "-3deg",
    "2deg",
    "-2deg",
    "3deg",
    "-1deg"
  ];


  images
    .slice(
      0,
      MAX_PHOTOS
    )
    .forEach(
      function (
        src,
        index
      ) {

        const card =
          document.createElement(
            "div"
          );


        card.className =
          "photo-card";


        card.style.setProperty(
          "--rotation",
          rotations[
            index %
            rotations.length
          ]
        );


        const image =
          document.createElement(
            "img"
          );


        image.src =
          src;


        image.alt =
          `Memory ${index + 1}`;


        image.loading =
          "lazy";


        image.decoding =
          "async";


        card.appendChild(
          image
        );


        gallery.appendChild(
          card
        );

      }
    );

}


/*
=========================================================
 MUSIC
=========================================================
*/

const music =
  $("bgMusic");


const musicButton =
  $("musicBtn");


const musicStatus =
  $("musicStatus");


async function startMusic() {

  if (!music) {

    return false;

  }


  try {

    music.volume =
      0.65;


    await music.play();


    if (musicButton) {

      musicButton.textContent =
        "🔊 Music On";

    }


    if (musicStatus) {

      musicStatus.textContent =
        "Background music is playing 💗";

    }


    return true;


  } catch (error) {

    console.log(
      "Music needs manual tap:",
      error
    );


    if (musicButton) {

      musicButton.textContent =
        "🎵 Play Music";

    }


    if (musicStatus) {

      musicStatus.textContent =
        "Tap Play Music to start 🎵";

    }


    return false;

  }

}


if (
  musicButton &&
  music
) {

  musicButton.addEventListener(
    "click",
    async function () {

      if (
        music.paused
      ) {

        await startMusic();

      } else {

        music.pause();


        this.textContent =
          "🎵 Play Music";


        if (musicStatus) {

          musicStatus.textContent =
            "Music paused 💗";

        }

      }

    }
  );

}


/*
=========================================================
 MUSIC ERROR
=========================================================
*/

if (music) {

  music.addEventListener(
    "error",
    function () {

      if (musicStatus) {

        musicStatus.textContent =
          "Keep music.mp3 beside index.html 🎵";

      }

    }
  );

}


/*
=========================================================
 CONFETTI
=========================================================
*/

function startConfetti() {

  const emojis = [
    "🎉",
    "💗",
    "✨",
    "🎈",
    "🌸",
    "🥳",
    "💕"
  ];


  for (
    let i = 0;
    i < 35;
    i++
  ) {

    const item =
      document.createElement(
        "span"
      );


    item.textContent =
      emojis[
        Math.floor(
          Math.random() *
          emojis.length
        )
      ];


    item.style.position =
      "fixed";


    item.style.left =
      Math.random() *
      100 +
      "vw";


    item.style.top =
      "-40px";


    item.style.fontSize =
      18 +
      Math.random() *
      20 +
      "px";


    item.style.zIndex =
      "9999";


    item.style.pointerEvents =
      "none";


    item.style.transition =
      "transform 3s linear, opacity 3s";


    document.body.appendChild(
      item
    );


    requestAnimationFrame(
      () => {

        item.style.transform =
          `translateY(110vh) rotate(${
            Math.random() * 600
          }deg)`;


        item.style.opacity =
          "0";

      }
    );


    setTimeout(
      () => {

        item.remove();

      },
      3200
    );

  }

}


/*
=========================
