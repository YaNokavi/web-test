import fetchData from "./fetch.js";

localStorage.clear();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const referallId = urlParams.get("tgWebAppStartParam");
localStorage.setItem("referallId", referallId);
const tg = window.Telegram.WebApp;
// alert(tg.initDataUnsafe.user);

if (!referallId || referallId === userIdData) {
  alert("Вы зашли");
} else {
  sendUserBot();
}

async function sendUserBot() {
  data = {
    chat: {
      id: tg.initDataUnsafe.user.id,
    },
    text: `https://t.me/CunaEduBot?startapp=${tg.initDataUnsafe.user.id}`,
    from: {
      id: tg.initDataUnsafe.user.id,
    },
  };
  const response = await fetchData(
    `https://cunaedubot-test-anderm.amvera.io/webhook`,
    "POST",
    data,
    false
  );
}

const flagFirstJoin = true;
localStorage.setItem("flagFirstJoin", flagFirstJoin);

// window.location.href = "favorite.html";
