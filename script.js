"use strict";

// =====================================================
// SETTINGS
// =====================================================

const MAX_PHOTOS = 15;

function $(id) {
    return document.getElementById(id);
}


// =====================================================
// SAFE BASE64 - SUPPORT EMOJIS / TAMIL / UNICODE
// =====================================================

function encodeData(data) {

    const json = JSON.stringify(data);

    const bytes = new TextEncoder().encode(json);

    let binary = "";

    bytes.forEach(function (byte) {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}


function decodeData(encoded) {

    try {

        encoded = encoded
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        while (encoded.length % 4) {
            encoded += "=";
        }

        const binary = atob(encoded);

        const bytes = Uint8Array.from(
            binary,
            function (char) {
                return char.charCodeAt(0);
            }
        );

        const json =
            new TextDecoder().decode(bytes);

        return JSON.parse(json);

    } catch (error) {

        console.error(
            "Data decode error:",
            error
        );

        return null;
    }
}


// =====================================================
// READ SHARED LINK
// =====================================================

function getBirthdayData() {

    const hash = window.location.hash;

    if (!hash) {
        return null;
    }

    if (!hash.startsWith("#data=")) {
        return null;
    }

    const encoded =
        hash.substring("#data=".length);

    if (!encoded) {
        return null;
    }

    return decodeData(encoded);
}


// =====================================================
// PHOTO SELECTION
// =====================================================

const fileInput = $("files");

let selectedFiles = [];

if (fileInput) {

    fileInput.addEventListener(
        "change",
        function () {

            selectedFiles =
                Array.from(this.files)
                    .filter(function (file) {
                        return file.type.startsWith("image/");
                    })
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


// =====================================================
// SHOW THUMBNAILS
// =====================================================

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

    selectedFiles.forEach(function (file) {

        const reader =
            new FileReader();

        reader.onload = function () {

            const img =
                document.createElement("img");

            img.src = reader.result;

            img.alt = "Selected photo";

            thumbs.appendChild(img);
        };

        reader.readAsDataURL(file);
    });
}


// =====================================================
// FILE → BASE64
// =====================================================

function fileToBase64(file) {

    return new Promise(function (resolve, reject) {

        const reader =
            new FileReader();

        reader.onload = function () {
            resolve(reader.result);
        };

        reader.onerror = function () {

            reject(
                new Error(
                    "Unable to read image"
                )
            );
        };

        reader.readAsDataURL(file);
    });
}


// =====================================================
// CREATE SURPRISE
// =====================================================

const createButton = $("create");

if (createButton) {

    createButton.addEventListener(
        "click",
        async function () {

            const nameInput = $("name");
            const passwordInput = $("pass");
            const wishInput = $("wish");

            const name =
                nameInput.value.trim();

            const password =
                passwordInput.value;

            const wish =
                wishInput.value.trim() ||
                "Wishing you a very happy birthday! 🎂❤️";


            // -----------------------------
            // VALIDATION
            // -----------------------------

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


            // -----------------------------
            // DISABLE BUTTON
            // -----------------------------

            createButton.disabled = true;

            createButton.textContent =
                "Preparing surprise... ⏳";


            try {

                // -----------------------------
                // CONVERT PHOTOS
                // -----------------------------

                const photoData = [];

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

                    photoData.push(base64);
                }


                // -----------------------------
                // CREATE OBJECT
                // -----------------------------

                const birthdayData = {

                    name: name,

                    password: password,

                    wish: wish,

                    photos: photoData
                };


                // -----------------------------
                // ENCODE
                // -----------------------------

                const encodedData =
                    encodeData(
                        birthdayData
                    );


                // -----------------------------
                // CREATE SHARE LINK
                // -----------------------------

                const baseURL =
                    window.location.href
                        .split("#")[0];


                const shareLink =
                    baseURL +
                    "#data=" +
                    encodedData;


                // -----------------------------
                // SHOW LINK
                // -----------------------------

                const linkInput = $("link");
                const result = $("result");

                if (linkInput) {

                    linkInput.value =
                        shareLink;
                }


                if (result) {

                    result.classList.remove(
                        "hidden"
                    );

                    result.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }


                createButton.textContent =
                    "Surprise Created ❤️";


                console.log(
                    "Surprise link:",
                    shareLink
                );


            } catch (error) {

                console.error(error);

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


// =====================================================
// COPY LINK - MOBILE + LAPTOP
// =====================================================

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
                    "First create the surprise link ❤️"
                );

                return;
            }


            const text =
                linkInput.value.trim();


            // -----------------------------
            // MODERN CLIPBOARD
            // -----------------------------

            try {

                if (
                    navigator.clipboard &&
                    window.isSecureContext
                ) {

                    await navigator.clipboard
                        .writeText(text);

                    copyButton.textContent =
                        "Copied! ❤️";

                    setTimeout(
                        function () {

                            copyButton.textContent =
                                "Copy Surprise Link ❤️";

                        },
                        2000
                    );

                    return;
                }

            } catch (error) {

                console.log(
                    "Clipboard API failed:",
                    error
                );
            }


            // -----------------------------
            // MOBILE FALLBACK
            // -----------------------------

            linkInput.focus();

            linkInput.select();

            linkInput.setSelectionRange(
                0,
                linkInput.value.length
            );


            try {

                const success =
                    document.execCommand(
                        "copy"
                    );

                if (success) {

                    copyButton.textContent =
                        "Copied! ❤️";

                    setTimeout(
                        function () {

                            copyButton.textContent =
                                "Copy Surprise Link ❤️";

                        },
                        2000
                    );

                    return;
                }

            } catch (error) {

                console.log(
                    "Fallback copy failed:",
                    error
                );
            }


            alert(
                "Link selected ❤️\n\n" +
                "Long press the link → Copy"
            );
        }
    );
}


// =====================================================
// OPEN SHARED SURPRISE
// =====================================================

const birthdayData =
    getBirthdayData();


if (birthdayData) {

    const creator = $("creator");
    const locked = $("locked");
    const lockedName = $("lockedName");


    // Hide create page
    if (creator) {

        creator.classList.add(
            "hidden"
        );
    }


    // Show password page
    if (locked) {

        locked.classList.remove(
            "hidden"
        );
    }


    // Show recipient name
    if (lockedName) {

        lockedName.textContent =
            birthdayData.name ||
            "Someone Special";
    }
}


// =====================================================
// OPEN SURPRISE
// =====================================================

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
                unlockInput.value;


            // -----------------------------
            // CHECK PASSWORD
            // -----------------------------

            if (
                enteredPassword !==
                birthdayData.password
            ) {

                $("wrong").textContent =
                    "Wrong password 😭 Try again.";

                unlockInput.focus();

                return;
            }


            $("wrong").textContent = "";


            // -----------------------------
            // HIDE LOCK
            // -----------------------------

            $("locked").classList.add(
                "hidden"
            );


            // -----------------------------
            // SHOW SURPRISE
            // -----------------------------

            $("surprise").classList.remove(
                "hidden"
            );


            // -----------------------------
            // NAME
            // -----------------------------

            $("sname").textContent =
                birthdayData.name ||
                "You";


            // -----------------------------
            // MESSAGE
            // -----------------------------

            $("swish").textContent =
                birthdayData.wish || "";


            // -----------------------------
            // PHOTOS
            // -----------------------------

            createGallery(
                birthdayData.photos || []
            );


            // -----------------------------
            // CONFETTI
            // -----------------------------

            startConfetti();


            // -----------------------------
            // MUSIC
            // -----------------------------

            await startMusic();
        }
    );
}


// =====================================================
// ENTER KEY FOR PASSWORD
// =====================================================

const unlockInput = $("unlock");

if (unlockInput) {

    unlockInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                $("open").click();
            }
        }
    );
}


// =====================================================
// PHOTO GALLERY
// =====================================================

function createGallery(images) {

    const gallery = $("gallery");

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
                    `Birthday memory ${index + 1}`;

                image.loading = "lazy";


                card.appendChild(image);

                gallery.appendChild(card);
            }
        );
}


// =====================================================
// MUSIC
// =====================================================

const music = $("bgMusic");

const musicButton =
    $("musicBtn");

const musicStatus =
    $("musicStatus");


async function startMusic() {

    if (!music) {
        return false;
    }


    try {

        music.volume = 0.65;

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


if (
    musicButton &&
    music
) {

    musicButton.addEventListener(
        "click",
        async function () {

            if (music.paused) {

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


// =====================================================
// CONFETTI
// =====================================================

function startConfetti() {

    const emojis = [
        "🎉",
        "💗",
        "✨",
        "🎈",
        "🌸",
        "🥳",
        "💕",
        "🎂"
    ];


    for (
        let i = 0;
        i < 40;
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
            Math.random() * 100 + "vw";

        item.style.top =
            "-40px";

        item.style.fontSize =
            18 +
            Math.random() * 20 +
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
            function () {

                item.style.transform =
                    `translateY(110vh) rotate(${
                        Math.random() * 600
                    }deg)`;

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


// =====================================================
// FINISHED ❤️
// =====================================================
