"use strict";

/* =========================
   HELPER
========================= */

const $ = (id) => document.getElementById(id);


/* =========================
   GLOBAL PHOTO ARRAY
========================= */

let photos = [];

const MAX_PHOTOS = 15;


/* =========================
   ENCODE
========================= */

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


/* =========================
   DECODE
========================= */

function decodeData(encoded) {

  const binary =
    atob(encoded);

  const bytes =
    Uint8Array.from(
      binary,
      char => char.charCodeAt(0)
    );

  const json =
    new TextDecoder().decode(bytes);

  return JSON.parse(json);
}


/* =========================
   IMAGE RESIZE
========================= */

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


        const maxSize = 650;


        if (
          Math.max(width, height)
          > maxSize
        ) {

          if (width > height) {

            height =
              Math.round(
                height *
                maxSize /
                width
              );

            width = maxSize;

          } else {

            width =
              Math.round(
                width *
                maxSize /
                height
              );

            height = maxSize;
          }
        }


        const canvas =
          document.createElement(
            "canvas"
          );


        canvas.width = width;

        canvas.height = height;


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


        resolve(
          canvas.toDataURL(
            "image/jpeg",
            0.55
          )
        );

      };


      img.onerror = function () {
        reject(
          new Error(
            "Could not load image"
          )
        );
      };


      img.src =
        reader.result;
    };


    reader.onerror = function () {
      reject(
        new Error(
          "Could not read file"
        )
      );
    };


    reader.readAsDataURL(file);

  });
}


/* =========================
   PHOTO SELECT
========================= */

const fileInput =
  $("files");


if (fileInput) {

  fileInput.addEventListener(
    "change",
    async function () {

      const selected =
        Array.from(
          this.files
        ).slice(0, MAX_PHOTOS);


      photos = [];


      const thumbs =
        $("thumbs");


      if (thumbs) {
        thumbs.innerHTML = "";
      }


      if (this.files.length > MAX_PHOTOS) {

        alert(
          "Maximum 15 photos only 📸"
        );
      }


      for (
        const file of selected
      ) {

        if (
          !file.type.startsWith(
            "image/"
          )
        ) {
          continue;
        }


        try {

          const image =
            await resizeImage(
              file
            );


          photos.push(
            image
          );


          const thumb =
            document.createElement(
              "img"
            );


          thumb.src = image;

          thumb.alt =
            "Selected photo";


          thumbs.appendChild(
            thumb
          );


        } catch (error) {

          console.error(
            error
          );

          alert(
            "One photo could not be loaded."
          );
        }

      }

    }
  );

}


/* =========================
   CREATE DATA
========================= */

function makeData() {

  return {

    name:
      $("name").value.trim()
      ||
      "Birthday Star",

    password:
      $("pass").value,

    wish:
      $("wish").value.trim()
      ||
      "Wishing you a very happy birthday! 🎂❤️",

    photos:
      photos.slice(
        0,
        MAX_PHOTOS
      )

  };
}


/* =========================
   LOAD DATA FROM URL
========================= */

function loadData() {

  try {

    const hash =
      location.hash.substring(1);


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


/* =========================
   INITIAL SCREEN
========================= */

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


/* =========================
   CREATE LINK
========================= */

const createButton =
  $("create");


if (createButton) {

  createButton.onclick =
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
        "Please enter a name 💗"
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


    if (photos.length > MAX_PHOTOS) {

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
        "Could not create the surprise."
      );

      return;
    }


    const baseURL =
      location.href.split(
        "#"
      )[0];


    const shareLink =
      baseURL +
      "#" +
      encoded;


    $("link").value =
      shareLink;


    $("result")
      .classList
      .remove("hidden");


    $("result")
      .scrollIntoView({
        behavior: "smooth"
      });

  };

}


/* =========================
   COPY LINK
========================= */

const copyButton =
  $("copy");


if (copyButton) {

  copyButton.onclick =
  async function () {

    const link =
      $("link").value;


    if (!link) {
      return;
    }


    try {

      await navigator
        .clipboard
        .writeText(link);


      this.textContent =
        "Copied! ❤️";


    } catch (error) {

      const input =
        $("link");


      input.focus();

      input.select();

      input.setSelectionRange(
        0,
        input.value.length
      );


      try {

        document.execCommand(
          "copy"
        );


        this.textContent =
          "Copied! ❤️";


      } catch (copyError) {

        alert(
          "Long press the link and choose Copy 📋"
        );

      }

    }

  };

}


/* =========================
   PASSWORD UNLOCK
========================= */

const openButton =
  $("open");


if (openButton) {

  openButton.onclick =
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
      .textContent = "";


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


    /* Try music after user interaction */

    playMusic();

  };

}


/* =========================
   ENTER KEY
========================= */

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

        $("open").click();

      }

    }
  );

}


/* =========================
   CREATE VERTICAL GALLERY
========================= */

function createGallery(
  images
) {

  const gallery =
    $("gallery");


  if (!gallery) {
    return;
  }


  gallery.innerHTML = "";


  const rotations = [
    "-2deg",
    "2deg",
    "-1deg",
    "1.5deg",
    "-2.5deg"
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


        image.src = src;

        image.alt =
          "Birthday memory " +
          (index + 1);


        image.loading =
          "lazy";


        card.appendChild(
          image
        );


        gallery.appendChild(
          card
        );

      }
    );

}


/* =========================
   MUSIC
========================= */

const music =
  $("bgMusic");


const musicButton =
  $("musicBtn");


async function playMusic() {

  if (!music) {
    return;
  }


  try {

    await music.play();


    if (musicButton) {

      musicButton.textContent =
        "🔊 Music On";

    }


  } catch (error) {

    /*
      Some mobile browsers
      block autoplay.

      The user can press
      Play Music manually.
    */

    if (musicButton) {

      musicButton.textContent =
        "🎵 Play Music";

    }

  }

}


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

          await music.play();

          this.textContent =
            "🔊 Music On";

        } else {

          music.pause();

          this.textContent =
            "🎵 Play Music";

        }

      } catch (error) {

        alert(
          "Music file கிடைக்கவில்லை.\n\n" +
          "music.mp3 file-ஐ index.html இருக்கும் அதே folder-ல் வை."
        );

      }

    }
  );

}


/* =========================
   CONFETTI
========================= */

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
      "99999";


    item.style.pointerEvents =
      "none";


    item.style.transition =
      "transform 3s linear, opacity 3s";


    document.body
      .appendChild(
        item
      );


    requestAnimationFrame(
      function () {

        item.style.transform =
          "translateY(110vh) rotate(" +
          (
            Math.random() *
            600
          ) +
          "deg)";


        item.style.opacity =
          "0";

      }
    );


    setTimeout(
      function () {

        item.remove();

      },
      3200
    );

  }

}
