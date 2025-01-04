localStorage.clear();

try {
  const userId = tg.initDataUnsafe.user.id;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const referallId = urlParams.get("tgWebAppStartParam");
  localStorage.setItem("referallId", referallId);

  const flagFirstJoin = true;
  localStorage.setItem("flagFirstJoin", flagFirstJoin);

  window.location.href = "favorite.html";
} catch {
  window.location.href = "nontg.html";
}
