import fetchData from "./fetch.js";

localStorage.clear();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const referallId = urlParams.get("tgWebAppStartParam");
localStorage.setItem("referallId", referallId);

const flagFirstJoin = true;
localStorage.setItem("flagFirstJoin", flagFirstJoin);

window.location.href = "favorite.html";
