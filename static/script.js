document.addEventListener("DOMContentLoaded", () => {
    const progressText = document.getElementById("progress-text");
    const bannerList = document.getElementById("banner-list");
    const ownedList = document.getElementById("owned-list");
    const addBannerBtn = document.getElementById("add-banner-btn");
    const bannerIdInput = document.getElementById("banner-id");
    const addStatus = document.getElementById("add-status");

    // Fetch all banners
    fetch('/api/banners')
        .then(response => response.json())
        .then(data => {
            bannerList.innerHTML = data.map(banner => `
                <li>${banner.id}: ${banner.name}</li>
            `).join('');
        });

    // Fetch owned banners
    const loadOwnedBanners = () => {
        fetch('/api/owned_banners')
            .then(response => response.json())
            .then(data => {
                ownedList.innerHTML = data.banners.map(banner => `
                    <li>${banner.id}: ${banner.name}</li>
                `).join('');
            });
    };

    // Fetch progress
    const loadProgress = () => {
        fetch('/api/progress')
            .then(response => response.json())
            .then(data => {
                progressText.textContent = `Progress: ${data.progress}`;
            });
    };

    loadOwnedBanners();
    loadProgress();

    // Add banner
    addBannerBtn.addEventListener("click", () => {
        const bannerId = bannerIdInput.value.trim();
        if (!bannerId) {
            addStatus.textContent = "Please enter a valid banner ID.";
            return;
        }

        fetch('/api/owned_banners', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: bannerId })
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    addStatus.style.color = "green";
                    addStatus.textContent = data.message;
                    bannerIdInput.value = "";
                    loadOwnedBanners();
                    loadProgress();
                } else {
                    addStatus.style.color = "red";
                    addStatus.textContent = data.error;
                }
            });
    });
});