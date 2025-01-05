let tg = window.Telegram.WebApp;

try {
  tg.initDataUnsafe.user.id;
  alert(tg.platform)
} catch {
  window.location.href = "nontg.html"
}

tg.setHeaderColor("#1468B1");

let platform = tg.platform;
let version = Number(tg.version)

if ((platform === "ios" || platform === "android") && version > 6) {
  tg.requestFullscreen();
  document.documentElement.style.setProperty("--InsetTop", `${60}px`);
  document.documentElement.style.setProperty("--tabBarHeight", `${70}px`);
  document.documentElement.style.setProperty("--tabBarPadding", `${12}px`);
} else {
  document.documentElement.style.setProperty("--tabBarHeight", `${55}px`);
  document.documentElement.style.setProperty("--tabBarPadding", `${9}px`);
}
tg.lockOrientation();
tg.expand();
// tg.enableClosingConfirmation();
tg.disableVerticalSwipes();

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
  swipeAllow();
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
} else if (
  currentUrl.endsWith("courses.html") &&
  link.startsWith("syllabus.html")
) {
  link = localStorage.getItem("link");
} else if (
  currentUrl.endsWith("syllabus.html") &&
  link.startsWith("step.html")
) {
  link = `courses.html?id=${idCourse}`;
} else if (currentUrl.endsWith("step.html")) {
  link = `syllabus.html?id=${idCourse}`;
}

tg.onEvent("backButtonClicked", function () {
  if (link) {
    window.location.href = link;
  } else {
  }
  tg.HapticFeedback.impactOccurred("medium");
});

function swipeAllow() {
  let startX;
  const swipeDistance = 100;

  document.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX;
  });

  document.addEventListener("touchmove", function (e) {
    const moveX = e.touches[0].clientX;
    if (startX <= 15 && moveX - startX > swipeDistance) {
      // sessionStorage.removeItem("currentTab");
      // sessionStorage.removeItem("currentLink");
      window.location.href = link;
    }
  });
}
