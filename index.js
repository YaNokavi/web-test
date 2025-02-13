const lastStep = localStorage.getItem("lastStep")

localStorage.clear();

localStorage.setItem("lastStep", lastStep)

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const referallId = urlParams.get("tgWebAppStartParam");
localStorage.setItem("referallId", referallId);

const flagFirstJoin = true;
localStorage.setItem("flagFirstJoin", flagFirstJoin);

window.location.href = "favorite.html";
