const tabBar = document.querySelectorAll(".tab-item");
tabBar.forEach((item) => {
  item.style.pointerEvents = "none";
});

const lastStepArray = localStorage.getItem("lastStepArray");

localStorage.clear();

localStorage.setItem("lastStepArray", lastStepArray);

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const referallId = urlParams.get("tgWebAppStartParam");
localStorage.setItem("referallId", referallId);

const flagFirstJoin = true;
localStorage.setItem("flagFirstJoin", flagFirstJoin);

window.location.href = "favorite.html?v=103";
