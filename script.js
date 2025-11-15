// ===============================
// LovelyStock Image Gallery Script
// ===============================

let images = [];
let currentPage = 1;
const imagesPerPage = 100;
let currentImageList = [];

// ===============================
// Load single CSV file
// ===============================
async function loadCSV() {
    showLoading(true);
    try {
        const response = await fetch("https://slf09sd.github.io/lovelystock/images.csv");
        console.log("CSV Fetch Status:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log("CSV Content Sample:", text.slice(0, 200));
        
        if (!text || text.trim().length === 0) {
            throw new Error("CSV file is empty");
        }
        
        images = parseCSV(text);
        console.log(`Parsed ${images.length} images`);
        
        if (images.length === 0) {
            throw new Error("No images found in CSV");
        }
        
        showRandomImages();
    } catch (error) {
        console.error("Error loading CSV:", error);
        displayErrorMessage("Error loading image data. Please try again later.");
    } finally {
        showLoading(false);
    }
}

// ===============================
// Show Random Images (No Filters)
// ===============================
function showRandomImages() {
    // Simply shuffle all images randomly
    currentImageList = [...images].sort(() => 0.5 - Math.random());
    currentPage = 1;
    showImages(currentImageList);
}

// ===============================
// Search Images
// ===============================
function searchImages() {
    showLoading(true);
    setTimeout(() => {
        let query = document.getElementById("searchBox").value.toLowerCase().trim();
        
        if (query === "") {
            showRandomImages();
            return;
        }
        
        let filteredImages = images.filter(img =>
            img.title.toLowerCase().includes(query)
        );
        
        currentImageList = filteredImages;
        currentPage = 1;
        showImages(currentImageList);
        showLoading(false);
    }, 300);
}

function handleSearchKeyPress(event) {
    if (event.key === "Enter") {
        searchImages();
    }
}

// ===============================
// Home Button Function
// ===============================
function goToHomePage() {
    document.getElementById("searchBox").value = "";
    showRandomImages();
}

// ===============================
// Display Images and Pagination
// ===============================
function showImages(imageList) {
    const gallery = document.getElementById("imageGallery");
    const pagination = document.getElementById("pagination");

    const start = (currentPage - 1) * imagesPerPage;
    const paginatedImages = imageList.slice(start, start + imagesPerPage);

    gallery.innerHTML = "";

    if (paginatedImages.length === 0) {
        displayErrorMessage("No images found. Try a different search term.");
        pagination.innerHTML = "";
        return;
    }

    console.log(`Displaying ${paginatedImages.length} images`);

    paginatedImages.forEach((img, index) => {
        const div = document.createElement("div");
        div.className = "image-card";
        div.style.animationDelay = `${(index % 6) * 0.05 + 0.1}s`;
        
        // Escape quotes in title for the onclick function
        const escapedTitle = img.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        div.innerHTML = `
            <img 
                src="${img.url}" 
                loading="lazy" 
                alt="${escapedTitle}" 
                onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=\"image-error\">Image failed to load</div>';"
                onclick="openPopup('${img.url}', '${escapedTitle}')"
            >
        `;
        gallery.appendChild(div);
    });

    updatePagination(imageList);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===============================
// Image Popup
// ===============================
function openPopup(imageUrl, title) {
    const popup = document.getElementById("imagePopup");
    const popupImage = document.getElementById("popupImage");
    const popupTitle = document.getElementById("popupTitle");
    const popupDownload = document.getElementById("popupDownload");

    // Set popup content
    popupImage.src = imageUrl;
    popupTitle.innerText = title;
    popupDownload.href = imageUrl;
    popupDownload.download = `lovelystock-${title.substring(0, 30).replace(/[^a-z0-9]/gi, '-')}.jpg`;

    // Show popup with animation
    popup.style.display = "flex";
    setTimeout(() => {
        popup.classList.add("show");
    }, 10);

    // Close popup when clicking outside or pressing ESC
    popup.onclick = function (event) {
        if (event.target === popup) {
            closePopup();
        }
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.body.style.overflow = "hidden";
}

function closePopup() {
    const popup = document.getElementById("imagePopup");
    popup.classList.remove("show");
    
    setTimeout(() => {
        popup.style.display = "none";
        document.body.style.overflow = "auto";
        document.removeEventListener('keydown', handleEscapeKey);
    }, 300);
}

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closePopup();
    }
}

// ===============================
// Loading Spinner
// ===============================
function showLoading(show) {
    const spinner = document.getElementById("loadingSpinner");
    spinner.style.display = show ? "flex" : "none";
}

// ===============================
// Utility Functions
// ===============================
function displayErrorMessage(message) {
    const gallery = document.getElementById("imageGallery");
    gallery.innerHTML = `<p class="error-message">${message}</p>`;
}

function parseCSV(data) {
    let rows = data.split("\n");
    rows = rows.map(row => row.trim()).filter(row => row.length > 0);

    console.log(`Found ${rows.length} rows in CSV`);
    
    const result = [];
    for (let i = 1; i < rows.length; i++) {
        let row = smartSplit(rows[i]);
        if (row.length >= 2) {
            const imageObj = {
                url: row[0].trim(),
                title: row.slice(1).join(",").trim()
            };
            
            // Validate URL
            if (imageObj.url && imageObj.url.startsWith('http')) {
                result.push(imageObj);
            } else {
                console.warn('Invalid URL skipped:', imageObj.url);
            }
        }
    }
    
    console.log(`Successfully parsed ${result.length} valid images`);
    return result;
}

function smartSplit(row) {
    const items = [];
    let currentItem = "";
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            items.push(currentItem.trim());
            currentItem = "";
        } else {
            currentItem += char;
        }
    }
    items.push(currentItem.trim());
    return items;
}

// ===============================
// Pagination Controls
// ===============================
function updatePagination(imageList) {
    const pagination = document.getElementById("pagination");
    const totalPages = Math.ceil(imageList.length / imagesPerPage);

    const paginationHTML = `
        <div class="pagination-info">
            Page ${currentPage} of ${totalPages}
            <button class="page-button" onclick="goToPreviousPage()" ${currentPage === 1 ? "disabled" : ""}>
                < Back
            </button>
            <button class="page-button" onclick="goToNextPage(${totalPages})" ${currentPage === totalPages ? "disabled" : ""}>
                Next >
            </button>
        </div>
        <div class="page-jump">
            Go to 
            <input type="number" id="pageNumber" min="1" max="${totalPages}" placeholder="${currentPage}" 
                   onkeypress="handlePageJumpKeyPress(event, ${totalPages})">
            page
        </div>
    `;

    pagination.innerHTML = paginationHTML;
}

function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        showImages(currentImageList);
    }
}

function goToNextPage(totalPages) {
    if (currentPage < totalPages) {
        currentPage++;
        showImages(currentImageList);
    }
}

function handlePageJumpKeyPress(event, totalPages) {
    if (event.key === "Enter") {
        const pageNumber = parseInt(document.getElementById("pageNumber").value);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            currentPage = pageNumber;
            showImages(currentImageList);
        } else {
            document.getElementById("pageNumber").value = currentPage;
        }
    }
}

// ===============================
// Initialize on Page Load
// ===============================
window.onload = loadCSV;
