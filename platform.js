let platform = localStorage.getItem("platform");
alert(platform);
if (platform === "ios" || platform === "android") {
  document.documentElement.style.setProperty("--InsetTop", `${60}px`);
}
