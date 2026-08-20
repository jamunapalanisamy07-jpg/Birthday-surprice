// =====================================================
// CREATE SURPRISE - SIMPLE NO FIREBASE VERSION
// =====================================================

const createButton = $("create");

if (createButton) {

    createButton.addEventListener("click", function () {

        const nameInput = $("name");
        const passwordInput = $("pass");
        const wishInput = $("wish");

        const name = nameInput.value.trim();
        const password = passwordInput.value;
        const wish =
            wishInput.value.trim() ||
            "Wishing you a very happy birthday! 🎂❤️";


        // -----------------------------
        // VALIDATION
        // -----------------------------

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


        // -----------------------------
        // CREATE DATA
        // -----------------------------

        const birthdayData = {
            name: name,
            password: password,
            wish: wish
        };


        // -----------------------------
        // ENCODE DATA
        // -----------------------------

        try {

            const encodedData =
                btoa(
                    encodeURIComponent(
                        JSON.stringify(birthdayData)
                    )
                );


            // -----------------------------
            // CREATE LINK
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


            console.log(
                "Birthday link:",
                shareLink
            );


        } catch (error) {

            console.error(error);

            alert(
                "Link create panna mudiyala 😭\n\n" +
                error.message
            );
        }

    });
}


// =====================================================
// COPY LINK
// =====================================================

const copyButton = $("copy");

if (copyButton) {

    copyButton.addEventListener(
        "click",
        async function () {

            const linkInput = $("link");

            if (!linkInput || !linkInput.value) {

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


                setTimeout(() => {

                    this.textContent =
                        "Copy Surprise Link ❤️";

                }, 2000);


            } catch (error) {

                linkInput.focus();
                linkInput.select();

                alert(
                    "Link selected. Copy it manually 📋"
                );
            }

        }
    );
}
