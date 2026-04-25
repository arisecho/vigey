document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("fileInput");
    const errorBox = document.getElementById("uploadError");
    const popup = document.getElementById("uploadPopup");
    const popupText = document.getElementById("uploadPopupText");

    if (!fileInput) {
        console.error("fileInput not found");
        return;
    }

    // =========================
    // GLOBAL BUTTON TRIGGER
    // =========================
    window.triggerUpload = function () {
        fileInput.click();
    };

    // =========================
    // FILE SELECT
    // =========================
    fileInput.addEventListener("change", function () {
        if (this.files && this.files.length > 0) {
            uploadVideo(this.files[0]);
        }
    });

    // =========================
    // DRAG & DROP
    // =========================
    document.documentElement.addEventListener("dragover", function (e) {
        e.preventDefault();
    });

    document.documentElement.addEventListener("drop", function (e) {
        e.preventDefault();

        const file = e.dataTransfer.files[0];
        if (file) {
            uploadVideo(file);
        }
    });

    // =========================
    // PASTE SUPPORT
    // =========================
    window.addEventListener("paste", function (e) {
        const file = e.clipboardData.files[0];
        if (file) {
            uploadVideo(file);
        }
    });

    // =========================
    // MAIN UPLOAD FUNCTION
    // =========================
    function uploadVideo(file) {
        if (!file) return;

        errorBox.style.display = "none";
        errorBox.innerText = "";

        // validasi file
        const allowedTypes = [
            "video/mp4",
            "video/quicktime"
        ];

        if (!allowedTypes.includes(file.type)) {
            errorBox.innerText = "Only MP4 and MOV files are allowed.";
            errorBox.style.display = "block";
            return;
        }

        // max 100MB
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            errorBox.innerText = "Max upload size is 100MB.";
            errorBox.style.display = "block";
            return;
        }

        // show popup
        if (popup) {
            popup.style.display = "flex";
            popupText.textContent = "Uploading...";
        }

        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", function (e) {
            if (e.lengthComputable && popupText) {
                const percent = Math.round((e.loaded / e.total) * 100);

                if (percent < 100) {
                    popupText.textContent = percent + "%";
                } else {
                    popupText.textContent = "Processing...";
                }
            }
        });

        xhr.onload = function () {
            if (xhr.status === 200) {
                try {
                    const result = JSON.parse(xhr.responseText);

                    if (popupText) {
                        popupText.textContent = "Redirecting...";
                    }

                    setTimeout(function () {
                        window.location.href = "./v/?id=" + result.id;
                    }, 700);

                } catch (e) {
                    hidePopup();
                    showError("Invalid upload response.");
                }
            } else {
                hidePopup();
                showError("Upload failed.");
            }
        };

        xhr.onerror = function () {
            hidePopup();
            showError("Network error.");
        };

        xhr.open("POST", "https://videy.co/api/upload");
        xhr.send(formData);
    }

    function hidePopup() {
        if (popup) {
            popup.style.display = "none";
        }
    }

    function showError(msg) {
        errorBox.innerText = msg;
        errorBox.style.display = "block";
    }
});

window.openTerms = function () {
    const modal = document.getElementById("pageModal");
    const title = document.getElementById("pageModalTitle");
    const content = document.getElementById("pageModalContent");

    title.textContent = "Terms of Service";

    content.innerHTML = `
        <p><strong>Effective Date:</strong> 3 Nov 2025</p>

        <p>By accessing or using Videy, you agree to the following Terms of Service ("Terms"). If you do not agree, do not use the Service. The Service is provided by PRX LLC, a New Mexico limited liability company ("we," "us," or "our").</p>

        <h3>1. Acceptance of Terms</h3>
        <p>By accessing or using the services provided by Videy, you agree to these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing Videy's services.</p>

        <h3>2. User Content</h3>
        <p>Videy allows users to upload and view short-form videos. By uploading content, you warrant that you have the legal right to do so and that the content does not violate any third-party rights.</p>

        <h3>3. License to Videy</h3>
        <p>Users retain ownership rights. By uploading, you grant Videy a perpetual, worldwide, non-exclusive, royalty-free license to reproduce, modify, publish, display, and distribute the content for service operation and promotion.</p>

        <h3>4. Content Guidelines</h3>
        <p>Strictly prohibited content includes:</p>
        <ul>
            <li>CSAM</li>
            <li>Non-consensual explicit content</li>
            <li>Terrorism promotion</li>
            <li>Fraud / scam content</li>
            <li>Illegal drug sales</li>
            <li>Obscene or illegal material</li>
            <li>Copyright infringement</li>
        </ul>

        <h3>5. Restricted Jurisdictions</h3>
        <p>Access may be blocked in sanctioned or restricted regions including North Korea, Iran, Syria, Cuba, Sudan, and others.</p>

        <h3>6. User Accounts</h3>
        <p>Accounts may be supported but are not required for upload or viewing.</p>

        <h3>7. Content Moderation</h3>
        <p>We may remove content at any time with or without notice.</p>

        <h3>8. No Warranty</h3>
        <p>Service is provided "as is" without warranties.</p>

        <h3>9. Limitation of Liability</h3>
        <p>Videy is not liable for indirect, incidental, or consequential damages.</p>

        <h3>10. Changes to Terms</h3>
        <p>Terms may be updated without prior notice.</p>

        <h3>11. Governing Law</h3>
        <p>Governed by Delaware, U.S. law with AAA arbitration.</p>

        <h3>12. Age Restrictions</h3>
        <p>Users must be at least 13 years old.</p>

        <h3>13. Indemnification</h3>
        <p>You agree to hold Videy harmless from claims related to your use.</p>

        <h3>14. Survival of Terms</h3>
        <p>Important legal clauses remain effective after termination.</p>

        <h3>15. Contact Information</h3>
        <p>legal@videy.co</p>

        <h3>16. Privacy Policy</h3>
        <p>By using the service, you agree to our privacy practices.</p>
    `;

    modal.style.display = "flex";
};

window.openReport = function () {
    const modal = document.getElementById("pageModal");
    const title = document.getElementById("pageModalTitle");
    const content = document.getElementById("pageModalContent");

    title.textContent = "Report Abuse";

    content.innerHTML = `
        <div class="report-hero-banner"></div>

        <div class="report-section">
            <p>
                We take abuse reports seriously and aim to respond to all concerns promptly. When reporting content, please:</p>
			<br>
            <ul>
                <li>Ensure your report is written in English</li>
                <li>Include the full URL of the reported content</li>
                <li>Describe the nature of the violation</li>
                <li>Provide any relevant context or additional information</li>
            </ul>
			<br>
            <p>
                We operate in accordance with both international and local laws, and will cooperate with relevant authorities where required.
            </p>
			<br>
            <a href="mailto:abuse@videy.co" class="report-send-btn">
			Send Report
			</a>
        </div>
    `;

    modal.style.display = "flex";
};

window.closePageModal = function () {
    document.getElementById("pageModal").style.display = "none";
};
