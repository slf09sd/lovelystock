/* LovelyStock Liquid UI Script */

let images = [];
let currentPage = 1;
const imagesPerPage = 100;
let currentImageList = [];

window.onload = loadCSV;

/* Load CSV */
async function loadCSV() {
  try {
    const response = await fetch("https://slf09sd.github.io/lovelystock/images.csv");
    const text = await response.text();
    images = parseCSV(text);
    showRandomImages();
  } catch (e) {
    console.error(e);
    document.getElementById("imageGallery").innerHTML = "<p>Failed loading images</p>";
  }
}

/* Parse CSV */
function parseCSV(data) {
  const rows = data.split(/\r?\n/).filter(r => r.trim().length);
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const parts = smartSplit(rows[i]);
    if (parts[0]) out.push({ url: parts[0], title: parts.slice(1).join(',') });
  }
  return out;
}
function smartSplit(row) {
  let a = [], cur = '', q = false;
  for (let c of row) {
    if (c === '"') q = !q;
    else if (c === ',' && !q) { a.push(cur); cur = ''; }
    else cur += c;
  }
  a.push(cur);
  return a;
}

/* Show 100 Random Images */
function showRandomImages() {
  currentImageList = [...images].sort(() => Math.random() - 0.5);
  currentPage = 1;
  showImages(currentImageList);
}

/* Search */
document.getElementById("searchBtn").onclick = searchImages;
document.getElementById("searchBox").onkeypress = e => { if (e.key === "Enter") searchImages(); };

function searchImages() {
  const q = document.getElementById("searchBox").value.toLowerCase();
  currentImageList = images.filter(i => i.title.toLowerCase().includes(q));
  currentPage = 1;
  showImages(currentImageList);
}

/* Display Images */
function showImages(list) {
  const gal = document.getElementById("imageGallery");
  gal.innerHTML = "";

  const start = (currentPage - 1) * imagesPerPage;
  const batch = list.slice(start, start + imagesPerPage);

  batch.forEach(img => {
    const d = document.createElement("div");
    d.className = "img-box";
    d.innerHTML = `<img src="${img.url}" loading="lazy" alt="" onerror="this.style.display='none'">`;
    d.onclick = () => openPopup(img);
    gal.appendChild(d);
  });

  updatePagination(list);
}

/* Pagination */
function updatePagination(list) {
  const pg = document.getElementById("pagination");
  const total = Math.ceil(list.length / imagesPerPage);
  pg.innerHTML = `
    <div class="pagi-wrap">
      <button ${currentPage === 1 ? "disabled" : ""} onclick="goPrev()">◀</button>
      <span>${currentPage} / ${total}</span>
      <button ${currentPage === total ? "disabled" : ""} onclick="goNext(${total})">▶</button>
    </div>`;
}
function goPrev() {
  if (currentPage > 1) { currentPage--; showImages(currentImageList); }
}
function goNext(t) {
  if (currentPage < t) { currentPage++; showImages(currentImageList); }
}

/* Liquid Popup */
const popup = document.getElementById("imagePopup");
const popupImage = document.getElementById("popupImage");
const popupTitle = document.getElementById("popupTitle");
const popupDesc = document.getElementById("popupDesc");
const popupDownload = document.getElementById("popupDownload");
const popupOpenTab = document.getElementById("popupOpenTab");
const closePopupBtn = document.getElementById("closePopupBtn");

function openPopup(img) {
  popupImage.src = img.url;
  popupTitle.textContent = img.title;
  popupDesc.textContent = img.title;
  popupDownload.href = img.url;
  popupOpenTab.onclick = () => window.open(img.url, "_blank");
  popup.setAttribute("aria-hidden", "false");
  popup.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closePopup() {
  popup.classList.remove("show");
  popup.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "auto";
}
closePopupBtn.onclick = closePopup;
popup.onclick = e => { if (e.target === popup) closePopup(); };
