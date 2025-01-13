/*************************************************
 * 1) Global Variables
 **************************************************/
let items = [];          // We'll load this from Pastebin
let favoriteIds = [];    // For localStorage favorites

/*************************************************
 * 2) DOM Elements
 **************************************************/
const cardsContainer = document.getElementById("cardsContainer");
const searchInput = document.getElementById("searchInput");
const searchTypeSelect = document.getElementById("searchType");
const authorFilter = document.getElementById("authorFilter");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const favoriteOnlyCheckbox = document.getElementById("favoriteOnly");

/*************************************************
 * 3) Local Storage for Favorites
 **************************************************/
function loadFavorites() {
  const stored = localStorage.getItem("favoriteIds");
  if (stored) {
    try {
      favoriteIds = JSON.parse(stored);
    } catch (err) {
      favoriteIds = [];
    }
  }
}
function saveFavorites() {
  localStorage.setItem("favoriteIds", JSON.stringify(favoriteIds));
}

/*************************************************
 * 4) Fetch items from Pastebin
 **************************************************/
function fetchItems() {
  // Note: The raw pastebin link must return valid JSON
  // (e.g. [{"id":1,"title":"...","date":"...","author":"..."}...])
  fetch("https://pastebin.com/raw/Qjmzmmmu") 
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      items = data; 
      // Now that items are loaded, initialize the UI
      populateAuthorDropdown();
      renderCards(items);
    })
    .catch(error => {
      console.error("Error fetching items:", error);
      // Fallback or error handling logic...
    });
}

/*************************************************
 * 5) Populate Author Filter
 **************************************************/
function populateAuthorDropdown() {
  // Clear existing options except the first "All"
  while (authorFilter.options.length > 1) {
    authorFilter.remove(1);
  }

  // Collect unique authors
  const uniqueAuthors = [...new Set(items.map(item => item.author))];

  // Populate
  uniqueAuthors.forEach(author => {
    const option = document.createElement("option");
    option.value = author;
    option.textContent = author;
    authorFilter.appendChild(option);
  });
}

/*************************************************
 * 6) Render Cards
 **************************************************/
function renderCards(data) {
  cardsContainer.innerHTML = "";

  data.forEach(item => {
    // Card container
    const card = document.createElement("div");
    card.classList.add("card");

    // CARD HEADER (gold bar)
    const cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header");

    const titleEl = document.createElement("h2");
    titleEl.textContent = item.title || "Untitled";
    cardHeader.appendChild(titleEl);

    // Favorite toggle (star)
    const favIcon = document.createElement("span");
    favIcon.classList.add("fav-toggle");
    favIcon.textContent = "★";

    // If this item is currently favorited, mark it
    if (favoriteIds.includes(item.id)) {
      favIcon.classList.add("favorited");
    }
    // Click => toggle favorite
    favIcon.addEventListener("click", () => {
      toggleFavorite(item.id, favIcon);
    });

    cardHeader.appendChild(favIcon);
    card.appendChild(cardHeader);

    // CARD BODY
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    // Author
    if (item.author) {
      const authorEl = document.createElement("p");
      authorEl.classList.add("author");
      authorEl.textContent = `By: ${item.author}`;
      cardBody.appendChild(authorEl);
    }

    // Content
    if (item.content) {
      const contentEl = document.createElement("p");
      contentEl.classList.add("content");
      contentEl.textContent = item.content;
      cardBody.appendChild(contentEl);
    }

    // Platform
    if (item.platform) {
      const platformEl = document.createElement("p");
      platformEl.classList.add("platform");
      platformEl.textContent = `Platform: ${item.platform}`;
      cardBody.appendChild(platformEl);
    }

    // Date
    if (item.date) {
      const dateEl = document.createElement("p");
      dateEl.classList.add("date");
      dateEl.textContent = `Date: ${item.date}`;
      cardBody.appendChild(dateEl);
    }

    // Link
    if (item.link) {
      const linkEl = document.createElement("p");
      linkEl.classList.add("link");
      linkEl.innerHTML = `Link: <a href="${item.link}" target="_blank">${item.link}</a>`;
      cardBody.appendChild(linkEl);
    }

    card.appendChild(cardBody);
    cardsContainer.appendChild(card);
  });
}

/*************************************************
 * 7) Toggle Favorite
 **************************************************/
function toggleFavorite(itemId, iconElement) {
  // If in favorites, remove it
  if (favoriteIds.includes(itemId)) {
    favoriteIds = favoriteIds.filter(id => id !== itemId);
    iconElement.classList.remove("favorited");
  } else {
    // Otherwise, add it
    favoriteIds.push(itemId);
    iconElement.classList.add("favorited");
  }
  // Save to local storage
  saveFavorites();

  // If the "Show Favorites" filter is active, update
  if (favoriteOnlyCheckbox.checked) {
    filterData();
  }
}

/*************************************************
 * 8) Filter Data (Search, Author, Date, Favorites)
 **************************************************/
function filterData() {
  const searchText = searchInput.value.toLowerCase().trim();
  const searchType = searchTypeSelect.value; 
  const selectedAuthor = authorFilter.value;
  const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
  const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
  const showOnlyFavorites = favoriteOnlyCheckbox.checked;

  const filtered = items.filter(item => {
    // 1) Favorites
    if (showOnlyFavorites && !favoriteIds.includes(item.id)) {
      return false;
    }

    // 2) Author
    if (selectedAuthor !== "all" && item.author !== selectedAuthor) {
      return false;
    }

    // 3) Search text
    if (searchText) {
      const titleMatch = (item.title || "").toLowerCase().includes(searchText);
      const contentMatch = (item.content || "").toLowerCase().includes(searchText);

      if (searchType === "title" && !titleMatch) {
        return false;
      } else if (searchType === "content" && !contentMatch) {
        return false;
      } else if (searchType === "both" && !titleMatch && !contentMatch) {
        return false;
      }
    }

    // 4) Date range
    if (item.date) {
      const itemDate = new Date(item.date);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
    }

    return true;
  });

  renderCards(filtered);
}

/*************************************************
 * 9) Event Listeners
 **************************************************/
searchInput.addEventListener("input", filterData);
searchTypeSelect.addEventListener("change", filterData);
authorFilter.addEventListener("change", filterData);
startDateInput.addEventListener("change", filterData);
endDateInput.addEventListener("change", filterData);
favoriteOnlyCheckbox.addEventListener("change", filterData);

/*************************************************
 * 10) Initial Load 
 **************************************************/
// Load favorites from local storage
loadFavorites();

// Fetch items from Pastebin (instead of using hard-coded array)
fetchItems();
