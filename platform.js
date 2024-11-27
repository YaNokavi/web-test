let platform = localStorage.getItem("platform");

if (platform === "ios" || platform === "android") {
  document.documentElement.style.setProperty("--InsetTop", `${60}px`);
}

document.getElementById("tab").addEventListener("click", function () {
  tg.HapticFeedback.impactOccurred("light");
});
