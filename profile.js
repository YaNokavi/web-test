const popup = document.querySelector(".popup");
const popupBtn = document.getElementById("pop");
const popupBtnSvg = document.getElementById("popu");
const balanceText = document.getElementById("balance");
const userIdProfile = document.querySelector(".profile-userid");
const logoNameProfile = document.querySelector(
  ".profile-logo.profile-logo-name"
);
const userNameProfile = document.querySelector(".profile-nickname");
const course = document.getElementById("course-info");

if (
  !sessionStorage.getItem("currentTab") &&
  !sessionStorage.getItem("currentLink")
) {
  localStorage.removeItem("courseData");
}

const showPopup = () => {
  popup.style.display = "flex";
};

const hidePopup = () => {
  popup.classList.add("hide-popup");
  setTimeout(() => {
    popup.style.display = "none";
    popup.classList.remove("hide-popup");
  }, 300);
};

popupBtn.addEventListener("click", showPopup);

popupBtnSvg.addEventListener("click", (e) => {
  e.stopPropagation();
  showPopup();
});

document.addEventListener("click", (e) => {
  if (
    e.target !== popup &&
    !popup.contains(e.target) &&
    e.target !== popupBtn
  ) {
    hidePopup();
  }
});

const userIdData = localStorage.getItem("userIdData");
const logoName = localStorage.getItem("logoname");
const userName = localStorage.getItem("username") || "";
let balanceUser = localStorage.getItem("balance");

balanceText.innerText = balanceUser;
userIdProfile.innerText += userIdData;
logoNameProfile.innerText = logoName;

const setUserNameProfile = (name) => {
  let fontSize;

  if (name.length <= 15) {
    fontSize = "30px";
  } else if (name.length < 19) {
    fontSize = "24px";
  } else {
    name = name.slice(0, -2) + "..."; // Обрезаем, чтобы уместить
    fontSize = "23px";
  }

  userNameProfile.style.fontSize = fontSize;
  userNameProfile.innerText = name;
};

setUserNameProfile(userName);

let courseInfo = JSON.parse(localStorage.getItem("infoCourse"));
document.addEventListener("DOMContentLoaded", () => {
  courseInfo.length ? displayProgress() : displayButton();
});

course.innerHTML = "";

function displayProgress() {
  const courseBarPercentProgressWidth = "50%"; // Пример процента
  courseInfo.forEach((elem) => {
    const courseHtml = `
    <div class="course-info-name">${elem.name}</div>
    <div class="course-info-frame-bar">
      <div class="course-info-bar">
        <div class="course-info-bar-progress" style="width: 0;"></div>
      </div>
      <div class="course-info-percent">${courseBarPercentProgressWidth}</div>
    </div>
  `;

    course.innerHTML += courseHtml; // Добавление новой информации о курсе
  });
  let progressBarElements = course.querySelectorAll(
    ".course-info-bar-progress"
  );

  progressBarElements.forEach((currentProgressBar, index) => {
    // Задержка для начала анимации
    setTimeout(() => {
      currentProgressBar.style.transition = "width 1s ease"; // Устанавливаем плавный переход
      currentProgressBar.style.width = courseBarPercentProgressWidth; // Устанавливаем конечное значение ширины
    }, index * 200); // Задержка для последовательной анимации
  });
}

function displayButton() {
  course.style.marginLeft = "0";
  const buttonHtml = `<div class="progress-title-enable-courses">Вы еще не изучаете ни один курс</div>`;
  course.innerHTML = buttonHtml;
}
