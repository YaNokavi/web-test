localStorage.clear();

let initDataURLSP = new URLSearchParams(tg.initData);
const url = tg.initDataURLSP.get('photo_url')
alert(url)

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const referallId = urlParams.get("tgWebAppStartParam");

localStorage.setItem("referallId", referallId);

// window.location.href = "favorite.html"
