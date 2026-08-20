"use strict";

/*
=========================================================
 SPECIAL SURPRISE
 NO FIREBASE
 MATCHES YOUR CURRENT index.html
=========================================================
*/


// =====================================================
// HELPER
// =====================================================

const $ = (id) => document.getElementById(id);


// =====================================================
// SETTINGS
// =====================================================

const MAX_PHOTOS = 15;


// =====================================================
// VARIABLES
// =====================================================

let selectedFiles = [];

let birthdayData = null;


// =====================================================
// READ DATA FROM SHARE LINK
// =====================================================

function getBirthdayData() {

    const hash = window.location.hash;

    if (!hash.startsWith("#data=")) {
        return null;
    }

    try {

        const encodedData =
            hash.substring(6);

        const decoded =
            decodeURIComponent(
                atob(encodedData)
            );

        return JSON.parse(decoded);

    } catch (error) {

        console.error(
            "Invalid birthday data:",
            error
        );

        return null;
    }
}


// =====================================================
// PHOTO SELECTION
// =====================================================

const fileInput = $("files");


if (fileInput) {

    fileInput.addEventListener(
        "change",
        function () {

            selectedFiles =
                Array.from(this.files)
                    .filter(
                        function (file) {

                            return file.type.startsWith(
                                "image/"
                            );

                        }
                    )
                    .slice(
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


// =====================================================
// SHOW PHOTO THUMBNAILS
// =====================================================

function showThumbnails() {

    const thumbs =
        $("thumbs");

    const photoCount =
        $("photoCount");


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


// =====================================================
// FILE TO BASE64
// =====================================================

function fileToBase64(file) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Unable to read photo"
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// =====================================================
// CREATE SURPRISE
// =====================================================

const createButton =
    $("create");


if (createButton) {

    createButton.addEventListener(
        "click",
        async function () {

            const nameInput =
                $("name");

            const passwordInput =
                $("pass");

            const wishInput =
                $("wish");


            if (
                !nameInput ||
                !passwordInput ||
                !wishInput
            ) {

                alert(
                    "Form fields not found 😭"
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


            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

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


            // -----------------------------------------
            // BUTTON
            // -----------------------------------------

            createButton.disabled =
                true;

            createButton.textContent =
                "Creating surprise... ⏳";


            try {

                /*
                -----------------------------------------
                PHOTO DATA
                -----------------------------------------
                */

                const photos = [];


                for (
                    let i = 0;
                    i < selectedFiles.length;
                    i++
                ) {

                    createButton.textContent =
                        `Preparing photo ${i + 1}/${selectedFiles.length}... 📸`;


                    const base64 =
                        await fileToBase64(
                            selectedFiles[i]
                        );


                    photos.push(
                        base64
                    );

                }


                /*
                -----------------------------------------
                CREATE DATA
                -----------------------------------------
                */

                const data = {

                    name:
                        name,

                    password:
                        password,

                    wish:
                        wish,

                    photos:
                        photos

                };


                /*
                -----------------------------------------
                CONVERT DATA
                -----------------------------------------
                */

                const json =
                    JSON.stringify(
                        data
                    );


                const encodedData =
                    btoa(
                        encodeURIComponent(
                            json
                        )
                    );


                /*
                -----------------------------------------
                CREATE SHARE LINK
                -----------------------------------------
                */

                const baseURL =
                    window.location.href
                        .split("#")[0];


                const shareLink =
                    baseURL +
                    "#data=" +
                    encodedData;


                /*
                -----------------------------------------
                SHOW LINK
                -----------------------------------------
                */

                const linkInput =
                    $("link");

                const result =
                    $("result");


                if (linkInput) {

                    linkInput.value =
                        shareLink;

                }


                if (result) {

                    result.classList.remove(
                        "hidden"
                    );


                    result.scrollIntoView({
                        behavior:
                            "smooth",

                        block:
                            "center"
                    });

                }


                createButton.textContent =
                    "Surprise Created ❤️";


                console.log(
                    "SURPRISE LINK:",
                    shareLink
                );


                /*
                -----------------------------------------
                CHECK URL SIZE
                -----------------------------------------
                */

                if (
                    shareLink.length >
                    1800000
                ) {

                    alert(
                        "Photos are too large 😭\n\n" +
                        "Please try fewer photos."
                    );

                } else {

                    alert(
                        "Surprise created successfully! 🎂❤️"
                    );

                }


            } catch (error) {

                console.error(
                    "Create error:",
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


// =====================================================
// COPY LINK
// =====================================================

const copyButton =
    $("copy");


if (copyButton) {

    copyButton.addEventListener(
        "click",
        async function () {

            const linkInput =
                $("link");


            if (
                !linkInput ||
                !linkInput.value
            ) {

                alert(
                    "First create the surprise link ❤️"
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
                    function () {

                        copyButton.textContent =
                            "Copy Surprise Link ❤️";

                    },
                    2000
                );


            } catch (error) {

                linkInput.focus();

                linkInput.select();

                linkInput.setSelectionRange(
                    0,
                    linkInput.value.length
                );


                alert(
                    "Link selected. Copy it manually 📋"
                );

            }

        }
    );

}


// =====================================================
// CHECK IF THIS IS A SHARED LINK
// =====================================================

birthdayData =
    getBirthdayData();


if (birthdayData) {

    const creator =
        $("creator");

    const locked =
        $("locked");

    const lockedName =
        $("lockedName");


    /*
    -----------------------------------------
    HIDE CREATE PAGE
    -----------------------------------------
    */

    if (creator) {

        creator.classList.add(
            "hidden"
        );

    }


    /*
    -----------------------------------------
    SHOW PASSWORD PAGE
    -----------------------------------------
    */

    if (locked) {

        locked.classList.remove(
            "hidden"
        );

    }


    /*
    -----------------------------------------
    SHOW NAME
    -----------------------------------------
    */

    if (lockedName) {

        lockedName.textContent =
            birthdayData.name ||
            "Someone Special";

    }

}


// =====================================================
// PASSWORD OPEN
// =====================================================

const openButton =
    $("open");


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
            -----------------------------------------
            CHECK PASSWORD
            -----------------------------------------
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
            -----------------------------------------
            CORRECT PASSWORD
            -----------------------------------------
            */

            const wrong =
                $("wrong");


            if (wrong) {

                wrong.textContent =
                    "";

            }


            /*
            -----------------------------------------
            HIDE LOCK
            -----------------------------------------
            */

            const locked =
                $("locked");


            if (locked) {

                locked.classList.add(
                    "hidden"
                );

            }


            /*
            -----------------------------------------
            SHOW SURPRISE
            -----------------------------------------
            */

            const surprise =
                $("surprise");


            if (surprise) {

                surprise.classList.remove(
                    "hidden"
                );

            }


            /*
            -----------------------------------------
            NAME
            -----------------------------------------
            */

            const sname =
                $("sname");


            if (sname) {

                sname.textContent =
                    birthdayData.name ||
                    "You";

            }


            /*
            -----------------------------------------
            MESSAGE
            -----------------------------------------
            */

            const swish =
                $("swish");


            if (swish) {

                swish.textContent =
                    birthdayData.wish ||
                    "";

            }


            /*
            -----------------------------------------
            PHOTOS
            -----------------------------------------
            */

            createGallery(
                Array.isArray(
                    birthdayData.photos
                )
                    ? birthdayData.photos
                    : []
            );


            /*
            -----------------------------------------
            CONFETTI
            -----------------------------------------
            */

            startConfetti();


            /*
            -----------------------------------------
            MUSIC
            -----------------------------------------
            */

            await startMusic();

        }
    );

}


// =====================================================
// ENTER KEY
// =====================================================

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


                if ($("open")) {

                    $("open").click();

                }

            }

        }
    );

}


// =====================================================
// PHOTO GALLERY
// =====================================================

function createGallery(images) {

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
            function (src, index) {

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


// =====================================================
// MUSIC
// =====================================================

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


// =====================================================
// MUSIC BUTTON
// =====================================================

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
