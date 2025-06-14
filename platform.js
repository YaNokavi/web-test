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

function applyTheme(theme) {
  if (theme === "light") {
    tg.setHeaderColor("#1468B1");
    document.documentElement.style.setProperty("--theme-bg-color", `#efeff4`);
    document.documentElement.style.setProperty(
      "--theme-bg-modals-color",
      `rgba(0, 0, 0, 0.4)`
    );
    document.documentElement.style.setProperty(
      "--theme-bg-hint-color",
      `rgba(20, 104, 177, 0.15)`
    );
    document.documentElement.style.setProperty(
      "--theme-header-tab-color",
      `#1468b1`
    );
    document.documentElement.style.setProperty(
      "--theme-header-text-color",
      `#ffffff`
    );
    document.documentElement.style.setProperty(
      "--theme-tab-icon-text-color",
      `#9bb1c5`
    );
    document.documentElement.style.setProperty(
      "--theme-block-color",
      `#ffffff`
    );
    document.documentElement.style.setProperty(
      "--theme-block-border-color",
      `rgba(0, 0, 0, 0.1)`
    );
    document.documentElement.style.setProperty("--theme-text-color", `#000000`);
    document.documentElement.style.setProperty(
      "--theme-text-hint-color",
      `#a6a6a6`
    );
    document.documentElement.style.setProperty("--theme-icon-color", `#ffffff`);
    document.documentElement.style.setProperty(
      "--theme-button-color",
      `#1468b1`
    );
    document.documentElement.style.setProperty(
      "--theme-button-icon-text-color",
      `#ffffff`
    );
    document.documentElement.style.setProperty(
      "--theme-button-hint-color",
      `rgba(20, 104, 177, 0.15)`
    );
    document.documentElement.style.setProperty(
      "--theme-button-hint-icon-text-color",
      `#1468b1`
    );
    document.documentElement.style.setProperty(
      "--theme-progress-bg-color",
      `#efeff4`
    );
    document.documentElement.style.setProperty(
      "--theme-progress-color",
      `#1468b1`
    );
    document.documentElement.style.setProperty(
      "--theme-bg-notification-color",
      `#dce8f3`
    );
    document.documentElement.style.setProperty(
      "--theme-bg-step-color",
      `rgba(211, 211, 211, 0.7)`
    );
    document.documentElement.style.setProperty(
      "--theme-step-text-color",
      `#4f4e4e`
    );
  } else {
    tg.setHeaderColor("#191919");
    document.documentElement.style.setProperty("--theme-bg-color", `#131313`);
    document.documentElement.style.setProperty(
      "--theme-bg-modals-color",
      `rgba(255, 255, 255, 0.4)`
    );
    document.documentElement.style.setProperty(
      "--theme-bg-hint-color",
      `rgba(203, 202, 198, 0.1)`
    );
    document.documentElement.style.setProperty(
      "--theme-header-tab-color",
      `#191919`
    );
    document.documentElement.style.setProperty(
      "--theme-header-text-color",
      `#CBCAC6`
    );
    document.documentElement.style.setProperty(
      "--theme-tab-icon-text-color",
      `#707070`
    );
    document.documentElement.style.setProperty(
      "--theme-block-color",
      `#1A1A1A`
    );
    document.documentElement.style.setProperty(
      "--theme-block-border-color",
      `rgba(255, 255, 255, 0.1)`
    );
    document.documentElement.style.setProperty("--theme-text-color", `#CBCAC6`);
    document.documentElement.style.setProperty(
      "--theme-text-hint-color",
      `#9E9E9E`
    );
    document.documentElement.style.setProperty("--theme-icon-color", `#CBCAC6`);
    document.documentElement.style.setProperty(
      "--theme-button-color",
      `#CBCAC6`
    );
    document.documentElement.style.setProperty(
      "--theme-button-icon-text-color",
      `#000000`
    );
    document.documentElement.style.setProperty(
      "--theme-button-hint-color",
      `rgba(203, 202, 198, 0.1)`
    );
    document.documentElement.style.setProperty(
      "--theme-button-hint-icon-text-color",
      `#CBCAC6`
    );
    document.documentElement.style.setProperty(
      "--theme-progress-bg-color",
      `rgba(255, 255, 255, 0.15)`
    );
    document.documentElement.style.setProperty(
      "--theme-progress-color",
      `#CBCAC6`
    );
    document.documentElement.style.setProperty(
      "--theme-bg-notification-color",
      `#2C2C2B`
    );
    document.documentElement.style.setProperty(
      "--theme-bg-step-color",
      `rgba(114, 114, 114, 0.7)`
    );
    document.documentElement.style.setProperty(
      "--theme-step-text-color",
      `#b0b0b0`
    );
  }
}

const themePrevious = tg.colorScheme;

if (!localStorage.getItem("theme")) {
  localStorage.setItem("theme", themePrevious);
}
const savedTheme = localStorage.getItem("theme");
applyTheme(savedTheme);

tg.onEvent("themeChanged", function () {
  const theme = tg.colorScheme;
  const savedTheme = localStorage.getItem("theme");

  if (theme !== savedTheme) {
    applyTheme(theme);

    localStorage.setItem("theme", theme);
  }
});

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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("tab").addEventListener("click", function () {
    tg.HapticFeedback.impactOccurred("medium");
  });
});

let currentUrl = window.location.pathname;
const BackButton = tg.BackButton;
if (
  currentUrl.endsWith("courses.html") ||
  currentUrl.endsWith("syllabus.html") ||
  currentUrl.endsWith("step.html") ||
  currentUrl.endsWith("rating.html")
) {
  BackButton.show();
  swipeAllow();
} else {
  BackButton.hide();
}

let link = document.referrer.split("/").pop();
link = link.split("?")[0];
if (!link) link = "favorite.html";
let idCourse;
const queryString = window.location.search;
const params = new URLSearchParams(queryString);

if (currentUrl.endsWith("syllabus.html")) {
  idCourse = params.get("id");
} else if (currentUrl.endsWith("step.html")) {
  idCourse = params.get("syllabusId");
} else if (currentUrl.endsWith("rating.html")) {
  idCourse = params.get("idCourse");
}

if (
  currentUrl.endsWith("courses.html") &&
  (link === "favorite.html" || link === "catalog.html")
) {
  localStorage.setItem("link", link);
} else if (
  currentUrl.endsWith("courses.html") &&
  link.endsWith("syllabus.html")
) {
  link = localStorage.getItem("link");
} else if (currentUrl.endsWith("syllabus.html") && link.endsWith("step.html")) {
  link = `courses.html?v=103&id=${idCourse}`;
} else if (currentUrl.endsWith("step.html")) {
  link = `syllabus.html?v=103&id=${idCourse}`;
} else if (currentUrl.endsWith("rating.html")) {
  link = `courses.html?v=103&id=${idCourse}`;
}

tg.onEvent("backButtonClicked", function () {
  tg.HapticFeedback.impactOccurred("medium");
  if (link) {
    window.location.href = link;
  }
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
