import fetchData from "./fetch";

localStorage.clear();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const referallId = urlParams.get("tgWebAppStartParam");
localStorage.setItem("referallId", referallId);
const tg = window.Telegram.WebApp;
alert(tg.initDataUnsafe.user)

// if (!referallId || referallId === userIdData) {

// }
// else {
//   data = {}
//   await fetchData(
//     `https://cunaedubot-test-anderm.amvera.io/webhook`,
//     "POST",
//     data,
//     false
//   );
// }

const flagFirstJoin = true;
localStorage.setItem("flagFirstJoin", flagFirstJoin);

// window.location.href = "favorite.html";