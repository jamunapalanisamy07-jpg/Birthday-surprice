"use strict";


/* =====================================================
   HELPER
===================================================== */

const $ = (id) => document.getElementById(id);


/* =====================================================
   SETTINGS
===================================================== */

const MAX_PHOTOS = 15;

let photos = [];


/* =====================================================
   BASE64 ENCODE / DECODE
===================================================== */

function encodeData(data) {

  const json = JSON.stringify(data);

  const bytes =
    new TextEncoder().encode(json);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}


function decodeData(encoded) {

  try {

    let base64 =
      encoded
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    while (base64.length % 4) {
      base64 += "=";
    }

    const binary =
      atob(base64);

    const bytes =
      Uint8Array.from(
        binary,
        char => char.charCodeAt(0)
      );

    const json =
      new TextDecoder().decode(bytes);

    return JSON.parse(json);

  } catch (error) {

    console.error(
      "Decode error:",
      error
    );

    return null;
  }
}


/* =====================================================
   IMAGE COMPRESSION
   IMPORTANT FOR MOBILE
===================================================== */

function compressImage(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload = () => {

        const img =
          new Image();


        img.onload = () => {

          let width =
            img.naturalWidth;

          let height =
            img.naturalHeight;


          /*
            Smaller image = shorter share link.
            This is important for mobile browsers.
          */

          const MAX_SIZE = 280;


          if (
            Math.max(width, height)
            > MAX_SIZE
          ) {

            if (width > height) {

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


          const ctx =
            canvas.getContext(
              "2d",
              {
                alpha: false
              }
            );


          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );


          /*
            WebP is smaller than JPEG
            on most modern browsers.
          */

          let result =
            canvas.toDataURL(
              "image/webp",
              0.28
            );


          /*
            Fallback if WebP isn't supported.
          */

          if (
            !result.startsWith(
              "data:image/webp"
            )
          ) {

            result =
              canvas.toDataURL(
                "image/jpeg",
                0.32
              );
          }


          resolve(result);

        };


        img.onerror = () => {

          reject(
            new Error(
              "Unable to read image"
            )
          );

        };


        img.src =
          reader.result;
      };


      reader.onerror = () => {

        reject(
          new Error(
            "Unable to read file"
          )
        );

      };


      reader.readAsDataURL(file);

    }
  );
}


/* =====================================================
   PHOTO SELECT
===================================================== */

const fileInput =
  $("files");


if (fileInput) {

  fileInput.addEventListener(
    "change",
    async function () {

      photos = [];

      $("thumbs").innerHTML =
        "";

      $("photoCount")
        .textContent =
        "Processing photos... 📸";


      const files =
        Array.from(
          this.files
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


      for (
        let i = 0;
        i < files.length;
        i++
      ) {

        const file =
          files[i];


        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          continue;
        }


        try {

          const compressed =
            await compressImage(
              file
            );


          photos.push(
            compressed
          );


          addThumbnail(
            compressed
          );


          $("photoCount")
            .textContent =
            `${photos.length} / ${MAX_PHOTOS} photos selected`;

        } catch (error) {

          console.error(
            "Photo error:",
            error
          );

        }
      }


      if (photos.length === 0) {

        $("photoCount")
          .textContent =
          "0 / 15 photos selected";

      }

    }
  );
}


/* =====================================================
   THUMBNAIL
===================================================== */

function addThumbnail(src) {

  const img =
    document.createElement(
      "img"
    );


  img.src =
    src;

  img.alt =
    "Selected photo";

  img.loading =
    "lazy";


  $("thumbs")
    .appendChild(img);
}


/* =====================================================
   CREATE DATA
===================================================== */

function makeData() {

  return {

    name:
      $("name")
        .value
        .trim()
      ||
      "Birthday Star",


    password:
      $("pass")
        .value,


    wish:
      $("wish")
        .value
        .trim()
      ||
      "Wishing you a very happy birthday! 🎂❤️",


    photos:
      photos.slice(
        0,
        MAX_PHOTOS
      )

  };
}


/* =====================================================
   LOAD SHARE DATA
===================================================== */

function loadData() {

  const hash =
    location.hash.substring(1);


  if (!hash) {

    return null;
  }


  return decodeData(hash);
}


const data =
  loadData();


/* =====================================================
   SHOW CORRECT PAGE
===================================================== */

if (data) {

  $("creator")
    .classList
    .add("hidden");


  $("locked")
    .classList
    .remove("hidden");


  $("lockedName")
    .textContent =
    data.name ||
    "Someone Special";
}


/* =====================================================
   CREATE SHARE LINK
===================================================== */

const createButton =
  $("create");


if (createButton) {

  createButton.addEventListener(
    "click",
    function () {

      const name =
        $("name")
          .value
          .trim();


      const password =
        $("pass")
          .value;


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


      if (photos.length === 0) {

        alert(
          "Please select at least one photo 📸"
        );

        return;
      }


      if (
        photos.length >
        MAX_PHOTOS
      ) {

        alert(
          "Maximum 15 photos only 📸"
        );

        return;
      }


      const surpriseData =
        makeData();


      let encoded;


      try {

        encoded =
          encodeData(
            surpriseData
          );

      } catch (error) {

        alert(
          "Unable to create link 😭"
        );

        return;
      }


      const baseURL =
        location.href
          .split("#")[0];


      const shareLink =
        baseURL +
        "#" +
        encoded;


      /*
        Show generated link.
      */

      $("link").value =
        shareLink;


      $("result")
        .classList
        .remove("hidden");


      $("result")
        .scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

    }
  );
}


/* =====================================================
   COPY LINK
===================================================== */

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


      /*
        Modern clipboard
      */

      try {

        if (
          navigator.clipboard &&
          window.isSecureContext
        ) {

          await navigator
            .clipboard
            .writeText(link);


          this.textContent =
            "Copied! ❤️";


          setTimeout(
            () => {

              this.textContent =
                "Copy Surprise Link ❤️";

            },
            2000
          );


          return;
        }

      } catch (error) {

        console.log(
          "Clipboard API unavailable"
        );

      }


      /*
        Mobile fallback
      */

      try {

        const input =
          $("link");


        input.focus();

        input.select();

        input.setSelectionRange(
          0,
          input.value.length
        );


        const success =
          document.execCommand(
            "copy"
          );


        if (success) {

          this.textContent =
            "Copied! ❤️";

        } else {

          this.textContent =
            "Select & Copy 📋";

        }

      } catch (error) {

        this.textContent =
          "Long press to copy 📋";

      }

    }
  );
}


/* =====================================================
   PASSWORD OPEN
===================================================== */

const openButton =
  $("open");


if (openButton) {

  openButton.addEventListener(
    "click",
    async function () {

      if (!data) {

        return;
      }


      const enteredPassword =
        $("unlock")
          .value;


      if (
        enteredPassword !==
        data.password
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
        data.name;


      $("swish")
        .textContent =
        data.wish;


      /*
        Create vertical gallery
      */

      createGallery(
        Array.isArray(
          data.photos
        )
          ? data.photos
          : []
      );


      /*
        CONFETTI
      */

      startConfetti();


      /*
        IMPORTANT:
        The password button click is
        a real user gesture.

        So mobile browsers are more
        likely to allow audio here.
      */

      await startMusic();


    }
  );
}


/* =====================================================
   ENTER KEY FOR PASSWORD
===================================================== */

const unlockInput =
  $("unlock");


if (unlockInput) {

  unlockInput.addEventListener(
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


/* =====================================================
   VERTICAL POLAROID GALLERY
===================================================== */

function createGallery(
  images
) {

  const gallery =
    $("gallery");


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
      (src, index) => {

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


/* =====================================================
   BACKGROUND MUSIC
===================================================== */

const music =
  $("bgMusic");


const musicButton =
  $("musicBtn");


const musicStatus =
  $("musicStatus");


/*
  IMPORTANT:
  We do NOT show "music file missing"
  popup automatically.

  The browser checks the actual
  music.mp3 file.
*/


if (music) {

  music.addEventListener(
    "error",
    function () {

      if (musicStatus) {

        musicStatus.textContent =
          "Please keep music.mp3.mpeg beside index.html 🎵";

      }

    }
  );

}


/* =====================================================
   START MUSIC
===================================================== */

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

    /*
      Mobile browser may block
      playback until another tap.
    */

    console.log(
      "Autoplay blocked:",
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


/* =====================================================
   MUSIC BUTTON
===================================================== */

if (
  musicButton &&
  music
) {

  musicButton.addEventListener(
    "click",
    async function () {

      try {

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

      } catch (error) {

        console.error(
          "Music error:",
          error
        );

        if (musicStatus) {

          musicStatus.textContent =
            "Check that music.mp3 is uploaded 🎵";

        }

      }

    }
  );
}


/* =====================================================
   CONFETTI
===================================================== */

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


    document.body
      .appendChild(
        item
      );


    requestAnimationFrame(
      () => {

        item.style.transform =
          `translateY(110vh)
           rotate(${Math.random() * 600}deg)`;


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
