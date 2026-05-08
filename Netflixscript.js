const API_BASE = "http://localhost:5000";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

let myList = JSON.parse(localStorage.getItem("myList")) || [];
let continueWatching = JSON.parse(localStorage.getItem("continue")) || [];

// ================= FETCH =================
async function fetchMovies(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  const data = await res.json();
  return data.results || [];
}

// ================= RENDER =================
function renderMovies(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  list.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${IMG_URL + movie.poster_path}" />
      <span>${movie.title}</span>
    `;

    card.onclick = () => {
      showMovie(movie);
      addContinue(movie);
    };

    container.appendChild(card);
  });
}

// ================= HERO =================
function setHero(movie) {
  const hero = document.querySelector(".hero");

  hero.style.backgroundImage =
    `linear-gradient(to top, rgba(0,0,0,1), transparent),
     url(${IMG_URL + movie.backdrop_path})`;

  hero.innerHTML = `
    <div class="hero-content">
      <h2>${movie.title}</h2>
      <p>${movie.overview?.substring(0, 150) || ""}</p>
    </div>
  `;
}

// ================= TRAILER =================
async function getTrailer(id) {
  const res = await fetch(`${API_BASE}/trailer/${id}`);
  const data = await res.json();

  const video = data.results?.find(
    v => v.site === "YouTube" && v.key
  );

  return video ? video.key : null;
}

// ================= MODAL =================
async function showMovie(movie) {
  const key = await getTrailer(movie.id);

  let modal = document.getElementById("modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <h2>${movie.title}</h2>
      <p>${movie.overview}</p>

      ${
        key
          ? `<iframe width="100%" height="300"
              src="https://www.youtube.com/embed/${key}?autoplay=1"
              allowfullscreen></iframe>`
          : `<p>Trailer not available</p>`
      }

      <button onclick="closeModal()">Close</button>
    </div>
  `;
}

// ================= CONTINUE =================
function addContinue(movie) {
  continueWatching = continueWatching.filter(m => m.id !== movie.id);
  continueWatching.unshift(movie);
  continueWatching = continueWatching.slice(0, 10);

  localStorage.setItem("continue", JSON.stringify(continueWatching));
  renderContinue();
}

function renderContinue() {
  const container = document.getElementById("continue");
  if (!container) return;

  container.innerHTML = "";

  continueWatching.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${IMG_URL + movie.poster_path}" />
      <span>${movie.title}</span>
    `;

    card.onclick = () => showMovie(movie);
    container.appendChild(card);
  });
}

// ================= MY LIST =================
function renderMyList() {
  const container = document.getElementById("myList");
  if (!container) return;

  container.innerHTML = "";

  myList.forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${IMG_URL + movie.poster_path}" />
      <span>${movie.title}</span>
    `;

    container.appendChild(card);
  });
}

// ================= INIT =================
async function init() {
  const popular = await fetchMovies("/popular");
  const trending = await fetchMovies("/trending");
  const topRated = await fetchMovies("/toprated");

  renderMovies(popular, "movieRow");
  renderMovies(trending, "trending");
  renderMovies(topRated, "toprated");

  renderMyList();
  renderContinue();

  if (popular.length > 0) {
    setHero(popular[0]);
  }
}

document.addEventListener("DOMContentLoaded", init);

// ================= CLOSE MODAL =================
function closeModal() {
  document.getElementById("modal")?.remove();
}