const tg = window.Telegram.WebApp;

const platform = tg.platform;
const version = Number(tg.version);

// try {
//   tg.initDataUnsafe.user.id;
//   if (platform == "web") {
//     window.location.href = "webversion.html";
//   }
// } catch {
//   window.location.href = "nontg.html";
// }

tg.onEvent('themeChanged', function() {
  // const newThemeParams = tg.ThemeParams;
  // alert(`Новая тема: Цвет фона - ${newThemeParams.bg_color}`);
  const theme = tg.ThemeParams.color_scheme; // Получаем текущую цветовую схему

    if (theme === 'light') {
      alert(`Светлая`);
        // document.body.classList.add('light-theme');
        // document.body.classList.remove('dark-theme');
    } else {
      alert(`темная`);
        // document.body.classList.add('dark-theme');
        // document.body.classList.remove('light-theme');
    }
});

const initialTheme = tg.ThemeParams.color_scheme;
if (initialTheme === 'light') {
  alert(`Светлая`);
    // document.body.classList.add('light-theme');
} else {
  alert(`темная`);
    // document.body.classList.add('dark-theme');
}


tg.setHeaderColor("#1468B1");

if ((platform == "ios" || platform == "android") && version > 6) {
  tg.requestFullscreen();
  document.documentElement.style.setProperty("--InsetTop", `${60}px`);
  document.documentElement.style.setProperty("--tabBarHeight", `${70}px`);
  document.documentElement.style.setProperty("--tabBarPadding", `${12}px`);
  document.documentElement.style.setProperty("--InsetTopNavigation", `${90}px`);
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
