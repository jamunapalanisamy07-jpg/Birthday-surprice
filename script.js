"use strict";

/* =========================================
   HELPER
========================================= */

const $ = id => document.getElementById(id);

let photos = [];


/* =========================================
   ENCODE / DECODE
========================================= */

function encodeData(data) {

  const json = JSON.stringify(data);

  const bytes =
    new TextEncoder().encode(json);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}


function decodeData(encoded) {

  const binary = atob(encoded);

  const bytes =
    Uint8Array.from(
      binary,
      c => c.charCodeAt(0)
    );

  const json =
    new TextDecoder().decode(bytes);

  return JSON.parse(json);
}


/* =========================================
   IMAGE COMPRESSION
   MOBILE FRIENDLY
========================================= */

function resizeImage(file) {

  return new Promise((resolve, reject) => {

    const reader =
      new FileReader();

    reader.onload = function () {

      const img =
        new Image();

      img.onload = function () {

        let width =
          img.naturalWidth;

        let height =
          img.naturalHeight;


        /*
          Small size = better mobile link
        */

        const MAX_SIZE = 420;


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
            "2d"
          );

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );


        /*
          JPEG compression
        */

        const compressed =
          canvas.toDataURL(
            "image/jpeg",
            0.38
          );


        resolve(compressed);

      };


      img.onerror = function () {
        reject(
          new Error(
            "Image could not load"
          )
        );
      };


      img.src =
        reader.result;
    };


    reader.onerror = function () {
      reject(
        new Error(
          "File could not read"
        )
      );
    };


    reader.readAsDataURL(file);

  });

}


/* =========================================
   PHOTO SELECT
   MAXIMUM 15
========================================= */

const fileInput =
  $("files");

if (fileInput) {

  fileInput.addEventListener(
    "change",
    async function () {

      photos = [];

      $("thumbs").innerHTML = "";


      let selectedFiles =
        Array.from(
          this.files
        );


      if (
        selectedFiles.length > 15
      ) {

        alert(
          "Maximum 15 photos only 📸"
        );

        selectedFiles =
          selectedFiles.slice(
            0,
            15
          );
      }


      $("photoCount")
        .textContent =
        `Processing ${selectedFiles.length} photos...`;


      /*
        Process ONE BY ONE.
        This is more reliable on mobile.
      */

      for (
        let i = 0;
        i < selectedFiles.length;
        i++
      ) {

        const file =
          selectedFiles[i];


        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          continue;
        }


        try {

          const compressed =
            await resizeImage(
              file
            );


          photos.push(
            compressed
          );


          /*
            Thumbnail
          */

          const thumb =
            document.createElement(
              "img"
            );

          thumb.src =
            compressed;

          thumb.alt =
            "Selected photo";

          thumb.className =
            "thumb";


          $("thumbs")
            .appendChild(
              thumb
            );


          $("photoCount")
            .textContent =
            `${photos.length} / 15 photos selected`;

        } catch (error) {

          console.error(
            "Photo error:",
            error
          );
        }
      }


      $("photoCount")
        .textContent =
        `${photos.length} / 15 photos selected`;

    }
  );

}


/* =========================================
   CREATE DATA
========================================= */

function makeData() {

  return {

    name:
      $("name")
        .value
        .trim()
      ||
      "Special Person",

    password:
      $("pass")
        .value,

    wish:
      $("wish")
        .value
        .trim()
      ||
      "Wishing you lots of happiness and beautiful memories! 💗",

    photos:
      photos.slice(
        0,
        15
      )

  };

}


/* =========================================
   LOAD LINK DATA
========================================= */

function loadData() {

  try {

    const hash =
      location.hash.slice(1);


    if (!hash) {
      return null;
    }


    return decodeData(
      hash
    );

  } catch (error) {

    console.error(
      "Invalid surprise link:",
      error
    );

    return null;
  }

}


const data =
  loadData();


/* =========================================
   SHOW LOCK SCREEN
========================================= */

if (data) {

  $("creator")
    .classList
    .add("hidden");


  $("locked")
    .classList
    .remove("hidden");


  $("lockedName")
    .textContent =
    data.name;

}


/* =========================================
   CREATE SURPRISE LINK
========================================= */

if ($("create")) {

  $("create").onclick =
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
        "Please enter recipient's name 💗"
      );

      return;
    }


    if (!password) {

      alert(
        "Please create a password 🔐"
      );

      return;
    }


    if (photos.length === 0) {

      alert(
        "Please select at least one photo 📸"
      );

      return;
    }


    /*
      Maximum 15
    */

    if (photos.length > 15) {

      alert(
        "Maximum 15 photos only 📸"
      );

      return;
    }


    const surpriseData =
      makeData();


    const encoded =
      encodeData(
        surpriseData
      );


    const baseURL =
      location.href
        .split("#")[0];


    const shareLink =
      baseURL +
      "#" +
      encoded;


    $("link")
      .value =
      shareLink;


    $("result")
      .classList
      .remove(
        "hidden"
      );


    $("result")
      .scrollIntoView({
        behavior: "smooth"
      });

  };

}


/* =========================================
   COPY LINK
========================================= */

if ($("copy")) {

  $("copy").onclick =
  async function () {

    const link =
      $("link").value;


    if (!link) {
      return;
    }


    /*
      Try Clipboard API
    */

    try {

      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {

        await navigator
          .clipboard
          .writeText(
            link
          );

        this.textContent =
          "Copied! ❤️";

        return;
      }

    } catch (error) {

      console.log(
        "Clipboard failed"
      );

    }


    /*
      Mobile fallback
    */

    const input =
      $("link");


    input.focus();

    input.select();

    input.setSelectionRange(
      0,
      input.value.length
    );


    try {

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
        "Select & Copy 📋";

    }

  };

}


/* =========================================
   PASSWORD UNLOCK
========================================= */

if ($("open")) {

  $("open").onclick =
  async function () {

    if (!data) {
      return;
    }


    const entered =
      $("unlock")
        .value;


    if (
      entered !==
      data.password
    ) {

      $("wrong")
        .textContent =
        "Wrong password 😭";

      return;
    }


    $("wrong")
      .textContent =
      "";


    $("locked")
      .classList
      .add("hidden");


    $("surprise")
      .classList
      .remove("hidden");


    $("sname")
      .textContent =
      data.name;


    $("swish")
      .textContent =
      data.wish;


    createGallery(
      data.photos || []
    );


    startConfetti();


    /*
      Mobile browsers allow
      audio when it is started
      from a user tap.
    */

    playMusic();

  };

}


/* =========================================
   ENTER = UNLOCK
========================================= */

if ($("unlock")) {

  $("unlock")
    .addEventListener(
      "keydown",
      function (event) {

        if (
          event.key ===
          "Enter"
        ) {

          $("open").click();

        }

      }
    );

}


/* =========================================
   CREATE POLAROID GALLERY
========================================= */

function createGallery(
  images
) {

  const gallery =
    $("gallery");


  gallery.innerHTML =
    "";


  const rotations = [
    "-4deg",
    "3deg",
    "-2deg",
    "4deg",
    "-3deg",
    "2deg"
  ];


  images
    .slice(0, 15)
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


        const img =
          document.createElement(
            "img"
          );


        img.src =
          src;

        img.alt =
          "Beautiful memory";

        img.loading =
          "lazy";


        card.appendChild(
          img
        );


        gallery.appendChild(
          card
        );

      }
    );

}


/* =========================================
   MUSIC
========================================= */

const music =
  $("bgMusic");

const musicButton =
  $("musicBtn");


async function playMusic() {

  if (!music) {
    return;
  }


  try {

    music.volume =
      0.55;


    await music.play();


    if (musicButton) {

      musicButton.textContent =
        "🔊 Music On";

    }

  } catch (error) {

    /*
      Mobile browser may block
      automatic playback.
    */

    if (musicButton) {

      musicButton.textContent =
        "🎵 Tap to Play Music";

    }

  }

}


if (musicButton) {

  musicButton.onclick =
  async function () {

    if (!music) {
      return;
    }


    try {

      if (
        music.paused
      ) {

        await music.play();

        this.textContent =
          "🔊 Music On";

      } else {

        music.pause();

        this.textContent =
          "🎵 Music Off";

      }

    } catch (error) {

      alert(
        "music.mp3 file missing 😭"
      );

    }

  };

}


/* =========================================
   CONFETTI
========================================= */

function startConfetti() {

  const emojis = [
    "🎉",
    "💗",
    "✨",
    "🎈",
    "🌸",
    "🥳"
  ];


  for (
    let i = 0;
    i < 30;
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


    item.className =
      "confetti";


    item.style.left =
      Math.random() *
      100 +
      "vw";


    item.style.fontSize =
      18 +
      Math.random() *
      20 +
      "px";


    item.style.animationDuration =
      2.5 +
      Math.random() *
      2 +
      "s";


    document.body
      .appendChild(
        item
      );


    setTimeout(
      () => item.remove(),
      5000
    );

  }

}
