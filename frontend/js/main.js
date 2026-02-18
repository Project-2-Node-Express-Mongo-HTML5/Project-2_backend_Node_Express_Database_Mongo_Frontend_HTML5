import { loadProfiles, handleProfileSubmit } from "./profiles.js";
import { handleRecommendClick } from "./recommend.js";

function init() {
  const profileForm = document.getElementById("profileForm");
  const recommendBtn = document.getElementById("recommendBtn");

  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileSubmit);
  }

  if (recommendBtn) {
    recommendBtn.addEventListener("click", handleRecommendClick);
  }

  loadProfiles();
}

document.addEventListener("DOMContentLoaded", init);
