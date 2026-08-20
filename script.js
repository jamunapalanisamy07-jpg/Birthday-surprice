"use strict";

/*
=========================================================
  BIRTHDAY SURPRISE - NO FIREBASE
  Matches current index.html IDs
=========================================================
*/

const MAX_PHOTOS = 15;
const MAX_IMAGE_SIZE = 900;
const IMAGE_QUALITY = 0.65;

const $ = (id) => document.getElementById(id);

let selectedFiles = [];
let birthdayData = null;


/*
=========================================================
  GET DATA FROM URL HASH
=========================================================
*/

function getBirthdayData() {

    const hash = window.location.hash;

    if (!hash.startsWith("#data=")) {
        return null;
    }

    try {

        const encodedData =
            hash.substring("#data=".length);

        const json =
            decodeURIComponent(encodedData);

        return JSON.parse(json);

    } catch (error) {

        console.error(
            "Could not read birthday data:",
            error
        );

        return null;
    }
}


/*
=========================================================
  COMPRESS IMAGE
=========================================================
*/

function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function () {

            const image = new Image();

            image.onload = function () {

                let width = image.naturalWidth;
                let height = image.naturalHeight;

                /*
                 Reduce image size so the shared URL
                 does not become unnecessarily huge.
                */

                if (
                    width > MAX_IMAGE_SIZE ||
                    height > MAX_IMAGE_SIZE
                ) {

                    if (width > height) {

                        height =
                            Math.round(
                                height *
                                MAX_IMAGE_SIZE /
                                width
                            );

                        width = MAX_IMAGE_SIZE;

                    } else {

                        width =
                            Math.round(
                                width *
                                MAX_IMAGE_SIZE /
                                height
                            );

                        height = MAX_IMAGE_SIZE;
                    }
                }


                const canvas =
                    document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;


                const ctx =
                    canvas.getContext("2d");

                ctx.drawImage(
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

                        resolve(blob);

                    },
                    "image/jpeg",
                    IMAGE_QUALITY
                );

            };


            image.onerror = function () {

                reject(
                    new Error(
                        "Could not load image"
                    )
                );

            };


            image.src = reader.result;
        };


        reader.onerror = function () {

            reject(
                new Error(
                    "Could not read image"
                )
            );

        };


        reader.readAsDataURL(file);
    });
}


/*
=========================================================
  FILE TO BASE64
=========================================================
*/

function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => {

            resolve(reader.result);

        };

        reader.onerror = () => {

            reject(
                new Error(
                    "Could not read photo"
                )
            );

        };

        reader.readAsDataURL(file);
    });
}


/*
=========================================================
  PHOTO SELECTION
=========================================================
*/

const fileInput = $("files");


if (fileInput) {

    fileInput.addEventListener(
        "change",
        function () {

            selectedFiles =
                Array.from(this.files)
                    .filter(
                        file =>
                            file.type.startsWith("image/")
                    )
                    .slice(0, MAX_PHOTOS);


            if (this.files.length > MAX_PHOTOS) {

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

    const thumbs = $("thumbs");
    const photoCount = $("photoCount");

    if (!thumbs) {
        return;
    }


    thumbs.innerHTML = "";


    if (photoCount) {

        photoCount.textContent =
            `${selectedFiles.length} / ${MAX_PHOTOS} photos selected`;
    }


    selectedFiles.forEach(
        function (file) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    const img =
                        document.createElement("img");

                    img.src =
                        reader.result;

                    img.alt =
                        "Selected photo";

                    thumbs.appendChild(img);
                };


            reader.readAsDataURL(file);
        }
    );
}


/*
=========================================================
  CREATE SURPRISE
=========================================================
*/

const createButton = $("create");


if (createButton) {

    createButton.addEventListener(
        "click",
        async function () {

            const nameInput = $("name");
            const passwordInput = $("pass");
            const wishInput = $("wish");


            if (
                !nameInput ||
                !passwordInput ||
                !wishInput
            ) {

                alert(
                    "Form elements missing 😭"
                );

                return;
            }


            const name =
                nameInput.value.trim();


            const password =
                passwordInput.value;


            const wish =
                wishInput.value.trim() ||
                "Wishing you a very happy birthday! 🎂❤️";


            /*
            =============================================
              VALIDATION
            =============================================
            */

            if (!name) {

                alert(
                    "Please enter the name 💗"
                );

                nameInput.focus();

                return;
            }


            if (!password) {

                alert(
                    "Please create a password 🔐"
                );

                passwordInput.focus();

                return;
            }


            if (selectedFiles.length === 0) {

                alert(
                    "Please select at least one photo 📸"
                );

                return;
            }


            /*
            =============================================
              BUTTON LOADING
            =============================================
            */

            createButton.disabled = true;

            createButton.textContent =
                "Preparing surprise... ⏳";


            try {

                const photoData = [];


                /*
                =========================================
                  COMPRESS + CONVERT PHOTOS
                =========================================
                */

                for (
                    let i = 0;
                    i < selectedFiles.length;
                    i++
                ) {

                    createButton.textContent =
                        `Preparing photo ${i + 1}/${selectedFiles.length}... 📸`;


                    const compressed =
                        await compressImage(
                            selectedFiles[i]
                        );


                    const base64 =
                        await fileToBase64(
                            compressed
                        );


                    photoData.push(base64);
                }


                /*
                =========================================
                  CREATE DATA OBJECT
                =========================================
                */

                const data = {

                    name: name,

                    password: password,

                    wish: wish,

                    photos: photoData
                };


                /*
                =========================================
                  CONVERT TO URL DATA
                =========================================
                */

                createButton.textContent =
                    "Creating your link... 💗";


                const json =
                    JSON.stringify(data);


                const encoded =
                    encodeURIComponent(json);


                /*
                =========================================
                  CREATE SHARE LINK

                  # is used instead of ? so the data
                  stays on the client side.
                =========================================
                */

                const baseURL =
                    window.location.href
                        .split("#")[0];


                const shareLink =
                    `${baseURL}#data=${encoded}`;


                /*
                =========================================
                  SHOW RESULT
                =========================================
                */

                const linkInput = $("link");
                const result = $("result");


                if (linkInput) {

                    linkInput.value =
                        shareLink;
                }


                if (result) {

                    result.classList.remove("hidden");

                    result.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }


                createButton.textContent =
                    "Surprise Created ❤️";


                /*
                =========================================
                  CHECK URL SIZE
                =========================================
                */

                if (
                    shareLink.length >
                    1800000
                ) {

                    alert(
                        "Photos are too large for a reliable share link 😭\n\n" +
                        "Please use fewer or smaller photos."
                    );

                } else {

                    alert(
                        "Birthday surprise created successfully! 🎂💗"
                    );
                }


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


            createButton.disabled = false;
        }
    );
}


/*
=========================================================
  COPY LINK
=========================================================
*/

const copyButton = $("copy");


if (copyButton) {

    copyButton.addEventListener(
        "click",
        async function () {

            const linkInput = $("link");


            if (
                !linkInput ||
                !linkInput.value
            ) {

                alert(
                    "No surprise link available ❤️"
                );

                return;
            }


            try {

                await navigator.clipboard.writeText(
                    linkInput.value
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
                =========================================
                  MOBILE FALLBACK
                =========================================
                */

                linkInput.focus();

                linkInput.select();

                linkInput.setSelectionRange(
                    0,
                    linkInput.value.length
                );


                alert(
                    "Link selected. Long press and copy 📋"
                );
            }
        }
    );
}


/*
=========================================================
  LOAD SHARED SURPRISE
=========================================================
*/

birthdayData =
    getBirthdayData();


if (birthdayData) {

    const creator = $("creator");
    const locked = $("locked");
    const lockedName = $("lockedName");


    /*
    Hide creator page
    */

    if (creator) {

        creator.classList.add("hidden");
    }


    /*
    Show password page
    */

    if (locked) {

        locked.classList.remove("hidden");
    }


    /*
    Show recipient name
    */

    if (lockedName) {

        lockedName.textContent =
            birthdayData.name ||
            "Someone Special";
    }
}


/*
=========================================================
  PASSWORD OPEN
=========================================================
*/

const openButton = $("open");


if (openButton) {

    openButton.addEventListener(
        "click",
        async function () {

            if (!birthdayData) {

                alert(
                    "Birthday surprise not found 😭"
                );

                return;
            }


            const unlockInput =
                $("unlock");


            const enteredPassword =
                unlockInput
                    ? unlockInput.value
                    : "";


            /*
            =============================================
              CHECK PASSWORD
            =============================================
            */

            if (
                enteredPassword !==
                birthdayData.password
            ) {

                const wrong =
                    $("wrong");


                if (wrong) {

                    wrong.textContent =
                        "Wrong password 😭 Try again.";
                }


                if (unlockInput) {

                    unlockInput.focus();
                }


                return;
            }


            /*
            =============================================
              CORRECT PASSWORD
            =============================================
            */

            const wrong =
                $("wrong");


            if (wrong) {

                wrong.textContent = "";
            }


            /*
            Hide locked page
            */

            const locked =
                $("locked");


            if (locked) {

                locked.classList.add("hidden");
            }


            /*
            Show surprise page
            */

            const surprise =
                $("surprise");


            if (surprise) {

                surprise.classList.remove("hidden");
            }


            /*
            Name
            */

            const sname =
                $("sname");


            if (sname) {

                sname.textContent =
                    birthdayData.name ||
                    "You";
            }


            /*
            Wish
            */

            const swish =
                $("swish");


            if (swish) {

                swish.textContent =
                    birthdayData.wish ||
                    "";
            }


            /*
            Photos
            */

            createGallery(
                Array.isArray(
                    birthdayData.photos
                )
                    ? birthdayData.photos
                    : []
            );


            /*
            Confetti
            */

            startConfetti();


            /*
            Music

            Password button click is a user
            gesture, so mobile browsers
            have a better chance of allowing it.
            */

            await startMusic();
        }
    );
}


/*
=========================================================
  ENTER KEY FOR PASSWORD
=========================================================
*/

const unlockInput = $("unlock");


if (unlockInput) {

    unlockInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                if ($("open")) {

                    $("open").click();
                }
            }
        }
    );
}


/*
=========================================================
  PHOTO GALLERY
=========================================================
*/

function createGallery(images) {

    const gallery =
        $("gallery");


    if (!gallery) {

        return;
    }


    gallery.innerHTML = "";


    const rotations = [
        "-3deg",
        "2deg",
        "-2deg",
        "3deg",
        "-1deg"
    ];


    images
        .slice(0, MAX_PHOTOS)
        .forEach(
            function (src, index) {

                const card =
                    document.createElement("div");


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
                    document.createElement("img");


                image.src =
                    src;


                image.alt =
                    `Birthday memory ${index + 1}`;


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


        if (musicS
