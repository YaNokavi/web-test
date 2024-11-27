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

let link = document.referrer.split("/").pop()
if (link == "") link = "favorite.html";

// if (link == "favorite.html" || link == "catalog.html") {
//   localStorage.setItem("refer", refer);
// } else if (refer.endsWith("syllabus.html")) {
//   let referSyl = localStorage.getItem("refer");
// }

// alert(link);

tg.onEvent('backButtonClicked', function() {
  if (link) {
    window.location.href = link;
  } else {
    console.log("Нет предыдущей страницы для перехода.");
  }
})
