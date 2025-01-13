/*************************************************
 * 1) Data Array 
 *    - Include "id" for each item for easy favorite tracking
 **************************************************/
const items = [
    {
      id: 1,
      title: "Why do Jews put all World Leaders and everyone to prostrate themselves in front of the Western Wall?",
      author: "High Priest Hooded Cobra",
      link: "https://x.com/LordBaalzebul/status/1798628881898905804",
      content: "Occult knowledge is required to understand why.",
      platform: "X",
      date: "2024-06-06",
    },
    {
      id: 2,
      title: "\"Anti-Christian\" Pseudo-Satanism: A Jewish Falsehood",
      author: "High Priest Hooded Cobra",
      link: "https://x.com/LordBaalzebul/status/1800977197189980264",
      content: "Anti-Christian freaks, who pose as \"Satanic\", are merely following the antithetical \"position\" of what Christianity claims is the correct position. Unknowingly, many of them follow literally the account of Judaism (which is a slander from the Jews and their slander about \"Ancient Paganism\" and \"what it was\", when it wasn't). ",
      platform: "X",
      date: "2024-06-12",
    }
  ];
  
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
   *    - We'll store an array of item IDs that are favorited
   **************************************************/
  let favoriteIds = [];
  
  // Load favorites from localStorage if present
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
  
  // Save favorites to localStorage
  function saveFavorites() {
    localStorage.setItem("favoriteIds", JSON.stringify(favoriteIds));
  }
  
  /*************************************************
   * 4) Populate Author Filter
   **************************************************/
  function populateAuthorDropdown() {
    const uniqueAuthors = [...new Set(items.map(item => item.author))];
  
    // Clear existing except "All"
    while (authorFilter.options.length > 1) {
      authorFilter.remove(1);
    }
  
    // Add authors
    uniqueAuthors.forEach(author => {
      const option = document.createElement("option");
      option.value = author;
      option.textContent = author;
      authorFilter.appendChild(option);
    });
  }
  
  /*************************************************
   * 5) Render Cards
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
      titleEl.textContent = item.title;
      cardHeader.appendChild(titleEl);
  
      // Favorite toggle (star or heart)
      const favIcon = document.createElement("span");
      favIcon.classList.add("fav-toggle");
      // We can use a star symbol (★) or heart symbol (♥). 
      // Let's do a star here:
      favIcon.textContent = "★";
  
      // If this item is currently favorited, mark it
      if (favoriteIds.includes(item.id)) {
        favIcon.classList.add("favorited");
      }
      // Click handler
      favIcon.addEventListener("click", () => {
        toggleFavorite(item.id, favIcon);
      });
  
      cardHeader.appendChild(favIcon);
      card.appendChild(cardHeader);
  
      // CARD BODY
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");
  
      // Author
      const authorEl = document.createElement("p");
      authorEl.classList.add("author");
      authorEl.textContent = `By: ${item.author}`;
      cardBody.appendChild(authorEl);
  
      // Content
      const contentEl = document.createElement("p");
      contentEl.classList.add("content");
      contentEl.textContent = item.content;
      cardBody.appendChild(contentEl);
  
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
   * 6) Toggle Favorite
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
  
    // If the "Show Favorites" filter is active, re-run filter to update display
    if (favoriteOnlyCheckbox.checked) {
      filterData();
    }
  }
  
  /*************************************************
   * 7) Filter Data (Search, Author, Date, Favorites)
   **************************************************/
  function filterData() {
    const searchText = searchInput.value.toLowerCase().trim();
    const searchType = searchTypeSelect.value; // "title", "content", "both"
    const selectedAuthor = authorFilter.value;  // "all" or an author's name
    const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
    const showOnlyFavorites = favoriteOnlyCheckbox.checked;
  
    const filtered = items.filter(item => {
      // 1) Check favorites
      if (showOnlyFavorites && !favoriteIds.includes(item.id)) {
        return false;
      }
  
      // 2) Filter by author
      if (selectedAuthor !== "all" && item.author !== selectedAuthor) {
        return false;
      }
  
      // 3) Filter by search text
      if (searchText) {
        const titleMatch = item.title.toLowerCase().includes(searchText);
        const contentMatch = item.content.toLowerCase().includes(searchText);
  
        if (searchType === "title" && !titleMatch) {
          return false;
        } else if (searchType === "content" && !contentMatch) {
          return false;
        } else if (searchType === "both" && !titleMatch && !contentMatch) {
          return false;
        }
      }
  
      // 4) Filter by date range
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
   * 8) Event Listeners
   **************************************************/
  searchInput.addEventListener("input", filterData);
  searchTypeSelect.addEventListener("change", filterData);
  authorFilter.addEventListener("change", filterData);
  startDateInput.addEventListener("change", filterData);
  endDateInput.addEventListener("change", filterData);
  favoriteOnlyCheckbox.addEventListener("change", filterData);
  
  /*************************************************
   * 9) On Page Load
   **************************************************/
  loadFavorites();
  populateAuthorDropdown();
  renderCards(items);
