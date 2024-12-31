localStorage.clear();

alert(tg.initDataUnsafe.receiver.is_bot)

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const referallId = urlParams.get("tgWebAppStartParam");

localStorage.setItem("referallId", referallId);

// window.location.href = "favorite.html"
