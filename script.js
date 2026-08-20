"use strict";

const MAX_PHOTOS = 15;

const $ = (id) => document.getElementById(id);


// =====================================================
// GET DATA FROM URL
// =====================================================

function getBirthdayData() {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");

    if (!data) return null;

    try {
        return JSON.parse(decodeURIComponent(data));
    } catch (error) {
        console.error("Invalid birthday data:", error);
        return null;
    }
}


// =====================================================
// CREATE PAGE
// =====================================================

const createButton = $("create");
const fileInput = $("files");

let selectedFiles = [];


// Photo selection
if (fileInput) {

    fileInput.addEventListener("change", function () {

        selectedFiles = Array.from(this.files)
            .filter(file => file.type.startsWith("image/"))
            .slice(0, MAX_PHOTOS);

        if (this.files.length > MAX_PHOTOS) {
            alert("Maximum 20 photos only 📸");
        }

        showThumbnails();
    });
}


// =====================================================
// SHOW PHOTO THUMBNAILS
// =====================================================

function showThumbnails() {

    const thumbs = $("thumbs");
    const photoCount = $("photoCount");

    if (!thumbs) return;

    thumbs.innerHTML = "";

    if (photoCount) {
        photoCount.textContent =
            `${selectedFiles.length} / ${MAX_PHOTOS} photos selected`;
    }

    selectedFiles.forEach(file => {

        const reader = new FileReader();

        reader.onload = function () {

            const img = document.createElement("img");

            img.src = reader.result;
            img.alt = "Selected photo";

            thumbs.appendChild(img);
        };

        reader.readAsDataURL(file);
    });
}


// =====================================================
// IMAGE TO BASE64
// =====================================================

function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.onerror = () =>
            reject(new Error("Unable to read image"));

        reader.readAsDataURL(file);
    });
}


// =====================================================
// CREATE SURPRISE
// =====================================================

if (createButton) {

    createButton.addEventListener("click", async function () {

        const nameInput = $("name");
        const passwordInput = $("pass");
        const wishInput = $("wish");

        const name = nameInput.value.trim();
        const password = passwordInput.value;
        const wish =
            wishInput.value.trim() ||
            "Wishing you a very happy birthday! 🎂❤️";


        // Validation
        if (!name) {
            alert("Please enter the name 💗");
            nameInput.focus();
            return;
        }

        if (!password) {
            alert("Please create a password 🔐");
            passwordInput.focus();
            return;
        }

        if (selectedFiles.length === 0) {
            alert("Please select at least one photo 📸");
            return;
        }


        createButton.disabled = true;
        createButton.textContent = "Preparing surprise... ⏳";


        try {

            // Convert photos to Base64
            const photoData = [];

            for (let i = 0; i < selectedFiles.length; i++) {

                createButton.textContent =
                    `Preparing photo ${i + 1}/${selectedFiles.length}... 📸`;

                const base64 =
                    await fileToBase64(selectedFiles[i]);

                photoData.push(base64);
            }


            // Birthday object
            const birthdayData = {

                name: name,

                password: password,

                wish: wish,

                photos: photoData
            };


            // Convert object to URL-safe data
            const encodedData =
                encodeURIComponent(
                    JSON.stringify(birthdayData)
                );


            // Create share link
            const baseURL =
                window.location.href
                    .split("?")[0]
                    .split("#")[0];


            const shareLink =
                `${baseURL}?data=${encodedData}`;


            // Show link
            const linkInput = $("link");
            const result = $("result");

            if (linkInput) {
                linkInput.value = shareLink;
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

    });
}


// =====================================================
// COPY LINK
// =====================================================

const copyButton = $("copy");

if (copyButton) {

    copyButton.addEventListener("click", async function () {

        const linkInput = $("link");

        if (!linkInput || !linkInput.value) {
            alert("No link available ❤️");
            return;
        }


        try {

            await navigator.clipboard.writeText(
                linkInput.value
            );

            this.textContent = "Copied! ❤️";

            setTimeout(() => {

                this.textContent =
                    "Copy Surprise Link ❤️";

            }, 2000);


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

    });
}


// =====================================================
// OPEN SHARED SURPRISE
// =====================================================

const birthdayData = getBirthdayData();


if (birthdayData) {

    const creator = $("creator");
    const locked = $("locked");
    const lockedName = $("lockedName");


    if (creator) {
        creator.classList.add("hidden");
    }


    if (locked) {
        locked.classList.remove("hidden");
    }


    if (lockedName) {
        lockedName.textContent =
            birthdayData.name || "Someone Special";
    }
}


// =====================================================
// PASSWORD OPEN
// =====================================================

const openButton = $("open");

if (openButton) {

    openButton.addEventListener("click", async function () {

        if (!birthdayData) {
            alert("Birthday surprise not found 😭");
            return;
        }


        const enteredPassword =
            $("unlock").value;


        if (
            enteredPassword !==
            birthdayData.password
        ) {

            $("wrong").textContent =
                "Wrong password 😭 Try again.";

            $("unlock").focus();

            return;
        }


        $("wrong").textContent = "";


        // Hide password page
        $("locked").classList.add("hidden");


        // Show surprise
        $("surprise").classList.remove("hidden");


        // Name
        $("sname").textContent =
            birthdayData.name || "You";


        // Wish
        $("swish").textContent =
            birthdayData.wish || "";


        // Photos
        createGallery(
            birthdayData.photos || []
        );


        // Animation
        startConfetti();


        // Music
        await startMusic();

    });
}


// =====================================================
// ENTER KEY
// =====================================================

const unlockInput = $("unlock");

if (unlockInput) {

    unlockInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            $("open").click();
        }

    });
}


// =====================================================
// PHOTO GALLERY
// =====================================================

function createGallery(images) {

    const gallery = $("gallery");

    if (!gallery) return;

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
        .forEach((src, index) => {

            const card =
                document.createElement("div");

            card.className =
                "photo-card";


            card.style.setProperty(
                "--rotation",
                rotations[
                    index % rotations.length
                ]
            );


            const image =
                document.createElement("img");

            image.src = src;

            image.alt =
                `Birthday memory ${index + 1}`;

            image.loading = "lazy";


            card.appendChild(image);

            gallery.appendChild(card);

        });
}


// =====================================================
// MUSIC
// =====================================================

const music = $("bgMusic");
const musicButton = $("musicBtn");
const musicStatus = $("musicStatus");


async function startMusic() {

    if (!music) return false;


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


if (musicButton && music) {

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


    for (let i = 0; i < 40; i++) {

        const item =
            document.createElement("span");


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
            18 + Math.random() * 20 + "px";

        item.style.zIndex =
            "9999";

        item.style.pointerEvents =
            "none";

        item.style.transition =
            "transform 3s linear, opacity 3s";


        document.body.appendChild(item);


        requestAnimationFrame(() => {

            item.style.transform =
                `translateY(110vh) rotate(${
                    Math.random() * 600
                }deg)`;

            item.style.opacity = "0";

        });


        setTimeout(() => {

            item.remove();

        }, 3200);
    }
}
