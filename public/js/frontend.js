console.log("Hello from the frontend JS file!");

function Listings() {
  const me = {};
  // Get params from the URL
  const params = new URLSearchParams(window.location.search);
  let page = parseInt(params.get("page")) || 1;
  const pageSize = parseInt(params.get("pageSize")) || 20;
  const query = params.get("query") || "";

  console.log("Listings params:", { page, pageSize, query });

  me.showError = ({ msg, res, type = "danger" } = {}) => {
    // Show an error using bootstrap alerts in the main tag
    const main = document.querySelector("main");
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.role = type;
    alert.innerText = `${msg}: ${res.status} ${res.statusText}`;
    main.prepend(alert);
  };

  const renderPagination = ({ maxPage = 20 } = {}) => {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    // Render pages for +/- 3 around the current page
    const startPage = Math.max(1, page - 3);
    const endPage = Math.min(maxPage, page + 3);

    for (let i = startPage; i <= endPage; i++) {
      const li = document.createElement("li");
      li.className = "page-item";
      if (i === page) {
        li.classList.add("active");
      }
      const a = document.createElement("a");
      a.className = "page-link";
      li.appendChild(a);
      a.href = `?page=${i}&pageSize=${pageSize}&query=${query}`;
      a.innerText = i;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        page = i;
        me.refreshListings();
      });
      pagination.appendChild(li);
    }
  };

  const renderListings = (listings) => {
    const listingsDiv = document.getElementById("listings");
    for (const { title, address, price } of listings) {
      const card = document.createElement("div");
      card.className = "card mb-3";

      card.innerHTML = `
        <div>${title} ${address} ${price}</div>
        `;
      listingsDiv.appendChild(card);
    }
  };

  me.refreshListings = async () => {
    const res = await fetch(
      `/api/listings?page=${page}&pageSize=${pageSize}&query=${query}`
    );
    if (!res.ok) {
      console.error("Failed to fetch listings", res.status, res.statusText);
      me.showError({ msg: "Failed to fetch listings", res });
      return;
    }

    const data = await res.json();
    console.log("Fetched listings", data);

    const listingsDiv = document.getElementById("listings");
    listingsDiv.innerHTML = "";

    renderListings(data.listings);
    renderPagination();
  };

  return me;
}

const myListings = Listings();

myListings.refreshListings();
