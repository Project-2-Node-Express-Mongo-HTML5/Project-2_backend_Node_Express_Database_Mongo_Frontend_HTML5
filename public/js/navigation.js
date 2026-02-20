/**
 * Navigation JavaScript
 *
 * This script handles the navigation bar functionality, including: Highlighting the active page link
 */

function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "home.html";
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (
      href === currentPage ||
      (currentPage === "" && href === "home.html") ||
      (currentPage === "index.html" && href === "home.html")
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNavLink();
});
