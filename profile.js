var popup = document.querySelector(".popup");
var popupBtn = document.getElementById("pop");
var popupBtnSvg = document.getElementById("popu");

popupBtn.addEventListener("click", () => {
  popup.style.display = "flex";
});

popupBtnSvg.addEventListener("click", (e) => {
  e.stopPropagation();
  popup.style.display = "flex";
});

document.addEventListener("click", function (e) {
  if (
    e.target !== popup &&
    !popup.contains(e.target) &&
    e.target !== popupBtn
  ) {
    popup.classList.add("hide-popup");
    setTimeout(() => {
      popup.style.display = "none"; // Скрываем попап
      popup.classList.remove("hide-popup"); // Удаляем класс для следующего открытия
    }, 300);
  }
});

var userIdData = localStorage.getItem("userIdData");
var logoName = localStorage.getItem("logoname");
var userName = localStorage.getItem("username");
var balanceUser = localStorage.getItem("balance");

var balanceText = document.getElementById("balance");
var userIdProfile = document.querySelector(".profile-userid");
var logoNameProfile = document.querySelector(".profile-logo.profile-logo-name");
var userNameProfile = document.querySelector(".profile-nickname");

balanceText.innerText = JSON.parse(balanceUser).balance;
userIdProfile.innerText += userIdData;
logoNameProfile.innerText = logoName;
if (userName.length <= 15) {
  userNameProfile.style.fontSize = "30px";
  userNameProfile.innerText = userName;
} else if (userName.length > 15 && userName.length < 19) {
  userNameProfile.style.fontSize = "24px";
  userNameProfile.innerText = userName;
} else if (userName.length >= 19) {
  userName = userName.slice(0, -(userName.length - 17)) + "...";
  userNameProfile.style.fontSize = "23px";
  userNameProfile.innerText = userName;
}

var courseInfo = JSON.parse(localStorage.getItem("infoCourse"));
var course = document.getElementById("course-info");
course.innerHTML = "";

courseInfo.forEach((elem) => {
  const courseName = document.createElement("div");
  courseName.classList.add("course-info-name");
  courseName.innerHTML = elem.name;
  const courseBarFrame = document.createElement("div");
  courseBarFrame.classList.add("course-info-frame-bar");
  course.append(courseName);
  course.append(courseBarFrame);
  const courseBarPercent = document.createElement("div");
  courseBarPercent.classList.add("course-info-bar");
  courseBarFrame.append(courseBarPercent);
  const courseBarPercentProgress = document.createElement("div");
  courseBarPercentProgress.classList.add("course-info-bar-progress");
  const percentage = 28;
  // const clampedPercentage = Math.max(0, Math.min(100, percentage));
  courseBarPercentProgress.style.width = percentage + "%";
  courseBarPercent.append(courseBarPercentProgress);
  const courseBarPercentText = document.createElement("div");
  courseBarPercentText.classList.add("course-info-percent");
  courseBarPercentText.innerHTML = `${percentage}%`;
  courseBarFrame.append(courseBarPercentText);
});
