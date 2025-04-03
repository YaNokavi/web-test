const lastStepArray = localStorage.getItem("lastStepArray");

localStorage.clear();

localStorage.setItem("lastStepArray", lastStepArray);

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const referallId = urlParams.get("tgWebAppStartParam");
localStorage.setItem("referallId", referallId);

const flagFirstJoin = true;
localStorage.setItem("flagFirstJoin", flagFirstJoin);

// window.location.href = "favorite.html";

const modal = document.getElementById("modal");
modal.style.display = "flex"
