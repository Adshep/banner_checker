document.addEventListener("DOMContentLoaded", () => {
    const bannerInput = document.getElementById("banner-input");
    const suggestionsList = document.getElementById("suggestions");
    const addBannerBtn = document.getElementById("add-banner-btn");
    const addStatus = document.getElementById("add-status");
    const progressText = document.getElementById("progress-text");
    const ownedList = document.getElementById("owned-list");

    let selectedBannerId = null; // Store the selected banner ID

    // Fetch autocomplete suggestions
    bannerInput.addEventListener("input", () => {
        const query = bannerInput.value.trim();
        if (query.length < 2) {
            suggestionsList.innerHTML = ''; // Clear suggestions
            selectedBannerId = null; // Reset the selected ID
            return;
        }

        fetch(`/api/search_banners?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                suggestionsList.innerHTML = data.map(banner => `
                    <li data-id="${banner.id}" data-name="${banner.name}">
                        ${banner.name}
                    </li>
                `).join('');
            });
    });

    // Handle suggestion click
    suggestionsList.addEventListener("click", (event) => {
        if (event.target.tagName === 'LI') {
            const selectedName = event.target.getAttribute("data-name");
            selectedBannerId = event.target.getAttribute("data-id"); // Store the ID
            bannerInput.value = selectedName; // Display only the name in the input
            suggestionsList.innerHTML = ''; // Clear suggestions
        }
    });

    // Add banner when button is clicked
    addBannerBtn.addEventListener("click", () => {
        // Use the selectedBannerId if available, otherwise fall back to raw input
        const bannerId = selectedBannerId || bannerInput.value.trim();

        if (!bannerId) {
            addStatus.textContent = "Please select or enter a valid banner ID.";
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
                    bannerInput.value = "";
                    selectedBannerId = null;
                    loadOwnedBanners(); //Refresh the owned banners
                    loadProgress(); //Refresh the progress
                } else {
                    addStatus.style.color = "red";
                    addStatus.textContent = data.error;
                }
            });
    });

    function loadProgress() { //Load banner progress
        fetch('/api/progress')
            .then(response => response.json())
            .then(data => {
                progressText.textContent = data.progress;
            })
            .catch(err => {
                progressText.textContent = "Error loading progress";
                console.error(err);
            });
    }

    function loadOwnedBanners() { //Load the list of owned banners
        fetch('/api/owned_banners')
            .then(response => response.json())
            .then(data => {
                const ownedList = document.getElementById("owned-list");
                ownedList.innerHTML = ''; // Clear the list first

                data.banners.forEach(banner => {
                    const listItem = document.createElement("li");
                    listItem.dataset.id = banner.id;
                    listItem.innerHTML = `
                        ${banner.name}
                        <span class="delete-bin" title="Delete">🗑️</span>
                    `;

                    // Attach delete functionality to the bin icon
                    listItem.querySelector('.delete-bin').addEventListener('click', () => {
                        deleteOwnedBanner(banner.id);
                    });

                    ownedList.appendChild(listItem);
                });
            });
    }

    // Function to delete an owned banner
    function deleteOwnedBanner(bannerId) {
        fetch(`/api/owned_banners`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: bannerId }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    loadOwnedBanners(); // Reload the owned banners
                    loadProgress(); // Update progress
                } else {
                    alert(data.error || 'Failed to delete the banner.');
                }
            });
    }
    // Initial load
    loadProgress();
    loadOwnedBanners();
});
