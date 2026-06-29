// Search Variables

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");

const colorFilter = document.getElementById("colorFilter");
const rarityFilter = document.getElementById("rarityFilter");

const message = document.getElementById("message");
const cardContainer = document.getElementById("cardContainer");

searchBtn.addEventListener("click", searchCards);

randomBtn.addEventListener("click", randomCard);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchCards();
  }
});

// Favorite Variables
const favoriteBtn = document.getElementById("favoriteBtn");

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

favoriteBtn.addEventListener("click", showFavorites);

// Search Build
function buildQuery() {
  let query = searchInput.value.trim();

  if (colorFilter.value !== "") {
    query += ` color:${colorFilter.value}`;
  }

  if (rarityFilter.value !== "") {
    query += ` rarity:${rarityFilter.value}`;
  }

  return query;
}

// Search Function
async function searchCards() {
  favoriteBtn.dataset.view = "search";
  cardContainer.replaceChildren();

  message.textContent = "Laster...";

  try {
    const query = buildQuery();

    const response = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`,
    );

    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();

    message.textContent = "";

    data.data.forEach((card) => {
      createCard(card);
    });
  } catch (error) {
    message.textContent = "Fant ingen kort.";
  }
}

// Random
async function randomCard() {
  cardContainer.replaceChildren();

  message.textContent = "Laster...";

  try {
    const response = await fetch("https://api.scryfall.com/cards/random");

    const card = await response.json();

    message.textContent = "";

    createCard(card);
  } catch (error) {
    message.textContent = "Noe gikk galt.";
  }
}

// Create Card

function getCardImage(card) {
  if (card.image_uris) {
    return card.image_uris.normal;
  }

  if (card.card_faces && card.card_faces[0].image_uris) {
    return card.card_faces[0].image_uris.normal;
  }

  return "";
}

function createCard(card) {
  const article = document.createElement("article");
  article.classList.add("card");

  // Image
  const image = document.createElement("img");
  image.src = getCardImage(card);

  // Content container
  const cardContent = document.createElement("div");
  cardContent.classList.add("cardContent");

  // Title
  const title = document.createElement("h2");
  title.textContent = card.name;

  // Type
  const type = document.createElement("p");
  type.textContent = card.type_line;

  // Rarity
  const rarity = document.createElement("p");
  rarity.textContent = "Rarity: " + card.rarity;

  // Set
  const set = document.createElement("p");
  set.textContent = "Set: " + card.set_name;

  // Add text to content container
  cardContent.append(title, type, rarity, set);

  // Favorite button
  const favorite = document.createElement("button");
  favorite.classList.add("favoriteBtn");

  updateFavoriteButton();

  favorite.addEventListener("click", (event) => {
    event.stopPropagation();

    if (isFavorite(card.id)) {
      removeFavorite(card.id);

      if (favoriteBtn.dataset.view === "favorites") {
        article.remove();
      }
    } else {
      saveFavorite(card);
    }

    updateFavoriteButton();
  });

  function updateFavoriteButton() {
    if (isFavorite(card.id)) {
      favorite.textContent = "💔 Remove Favorite";
    } else {
      favorite.textContent = "❤️ Add Favorite";
    }
  }

  // Build the card
  article.append(image, cardContent, favorite);

  article.addEventListener("click", () => {
    openModal(card);
  });

  cardContainer.append(article);
}

// Favorite
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorite(card) {
  const favorites = getFavorites();

  if (!favorites.includes(card.id)) {
    favorites.push(card.id);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
}

async function showFavorites() {
  favoriteBtn.dataset.view = "favorites";
  cardContainer.replaceChildren();

  const favorites = getFavorites();

  if (favorites.length === 0) {
    message.textContent = "Ingen favoritter.";

    return;
  }

  message.textContent = "";

  for (const id of favorites) {
    const response = await fetch(`https://api.scryfall.com/cards/${id}`);

    const card = await response.json();

    createCard(card);
  }
}

// Remove Favorite
function removeFavorite(cardId) {
  let favorites = getFavorites();

  favorites = favorites.filter((id) => id !== cardId);

  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(cardId) {
  const favorites = getFavorites();

  return favorites.includes(cardId);
}

// Pop out Modal

function openModal(card) {
  modalContent.replaceChildren();

  const title = document.createElement("h2");
  title.textContent = card.name;

  const image = document.createElement("img");

  image.src = getCardImage(card);

  const type = document.createElement("p");
  type.textContent = card.type_line;

  const oracle = document.createElement("p");
  oracle.textContent = card.oracle_text || "";

  const artist = document.createElement("p");
  artist.textContent = "Artist: " + card.artist;

  const close = document.createElement("button");

  close.textContent = "Lukk";

  close.classList.add("closeBtn");

  close.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modalContent.append(title, image, type, oracle, artist, close);

  modal.classList.remove("hidden");

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      modal.classList.add("hidden");
    }
  });
}
