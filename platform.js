let tg = window.Telegram.WebApp;

tg.setHeaderColor("#1468B1");

let platform = localStorage.getItem("platform");

if (platform === "ios" || platform === "android") {
  document.documentElement.style.setProperty("--InsetTop", `${60}px`);
}

document.getElementById("tab").addEventListener("click", function () {
  tg.HapticFeedback.impactOccurred("light");
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
const params = new URLSearchParams(link);
if (link.startsWith("syllabus.html")) {
  idCourse = params.get("id");
} else if (link.startsWith("step.html")) {
  idCourse = params.get("syllabusId");
}

if (
  currentUrl.endsWith("courses.html") &&
  (link == "favorite.html" || link == "catalog.html")
) {
  localStorage.setItem("link", link);
  console.log("Из курса идем в каталог или в мои курсы");
} else if (currentUrl.endsWith("courses.html") && link.startsWith("syllabus.html")
) {
  link = localStorage.getItem("link");
  console.log("Из курса идем в каталог или в мои курсы");
} else if (currentUrl.endsWith("syllabus.html") && link.endsWith("step.html")) {
  link = `course.html?id=${idCourse}`;
} else if (currentUrl.endsWith("step.html")) {
  link = `syllabus.html?id=${idCourse}`;
}

// alert(link);

tg.onEvent("backButtonClicked", function () {
  if (link) {
    window.location.href = link;
  } else {
    console.log("Нет предыдущей страницы для перехода.");
  }
});
