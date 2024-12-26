let tg = window.Telegram.WebApp;

tg.setHeaderColor("#1468B1");

let platform = tg.platform;

if (platform === "ios" || platform === "android") {
  tg.requestFullscreen();
  document.documentElement.style.setProperty("--InsetTop", `${60}px`);
  document.documentElement.style.setProperty("--tabBarHeight", `${70}px`);
} else {
  document.documentElement.style.setProperty("--tabBarHeight", `${55}px`);
}
tg.lockOrientation();
tg.expand();
// tg.enableClosingConfirmation();
tg.disableVerticalSwipes()

document.getElementById("tab").addEventListener("click", function () {
  tg.HapticFeedback.impactOccurred("medium");
});

let currentUrl = window.location.pathname;
const BackButton = tg.BackButton;
if (
  currentUrl.endsWith("courses.html") ||
  currentUrl.endsWith("syllabus.html") ||
  currentUrl.endsWith("step.html")
) {
  BackButton.show();
} else {
  BackButton.hide();
}

let link = document.referrer.split("/").pop();
if (!link) link = "favorite.html";
let idCourse;
const queryString = window.location.search;
const params = new URLSearchParams(queryString);

if (currentUrl.endsWith("syllabus.html")) {
  idCourse = params.get("id");
} else if (currentUrl.endsWith("step.html")) {
  idCourse = params.get("syllabusId");
}

if (
  currentUrl.endsWith("courses.html") &&
  (link == "favorite.html" || link == "catalog.html")
) {
  localStorage.setItem("link", link);
  console.log("Из курса идем в каталог или в мои курсы");
} else if (
  currentUrl.endsWith("courses.html") &&
  link.startsWith("syllabus.html")
) {
  link = localStorage.getItem("link");
  console.log("Из курса идем в каталог или в мои курсы");
} else if (
  currentUrl.endsWith("syllabus.html") &&
  link.startsWith("step.html")
) {
  link = `courses.html?id=${idCourse}`;
  console.log("Из содержания в курс");
} else if (currentUrl.endsWith("step.html")) {
  link = `syllabus.html?id=${idCourse}`;
  console.log("Из шага в содержание");
}

tg.onEvent("backButtonClicked", function () {
  if (link) {
    window.location.href = link;
  } else {
    console.log("Нет предыдущей страницы для перехода.");
  }
  tg.HapticFeedback.impactOccurred("medium");
});
