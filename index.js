localStorage.clear();

let tg = window.Telegram.WebApp;
let platform = tg.platform;

tg.setHeaderColor("#1468B1");
if (platform == "mobile") {
  tg.requestFullscreen();
  // const topInset = tg.SafeAreaInset.top;
  document.body.style.marginTop = `${32}px`;
}
tg.lockOrientation();
tg.expand();

// let BackButton = tg.BackButton;
// localStorage.setItem("Back", JSON.stringify(BackButton));
// BackButton.show();

let userIdData = `${tg.initDataUnsafe.user.id}`;
let logoname = `${tg.initDataUnsafe.user.username}`[0].toUpperCase();
let username = `${tg.initDataUnsafe.user.username}`;
// let userIdData = 2;
// let logoname = "ret";
// let username = "rete";

localStorage.setItem("userIdData", userIdData);
localStorage.setItem("logoname", logoname);
localStorage.setItem("username", username);

//https://t.me/cunaedu_bot?startapp=2
// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);
// const referallId = urlParams.get("startapp");

tg.enableClosingConfirmation();

import fetchData from "./fetch.js";

let data = {
  userId: userIdData,
  username: username,
};

async function fetchCourses() {
  const userInfo = await fetchData(
    "https://cryptuna-anderm.amvera.io/v1/user/info",
    //userId
    "POST",
    data
  );
  console.log(userInfo.courses);
  localStorage.setItem("balance", userInfo.balance);
  localStorage.setItem("infoCourse", JSON.stringify(userInfo.courses));
  // localStorage.setItem("referall")

  userInfo.courses.length ? displayCourses(userInfo) : displayButton();
}

function displayCourses(userInfo) {
  document.getElementById("preloader").style.display = "none";

  const coursesDiv = document.getElementById("favorite-courses");
  coursesDiv.innerHTML = "";

  const fragment = document.createDocumentFragment();

  userInfo.courses.forEach((course, index) => {
    setTimeout(() => {
      const courseElement = document.createElement("a");
      courseElement.href = `courses.html?id=${course.id}`;
      courseElement.classList.add("courses-block");
      courseElement.innerHTML = `
            <div class="courses-logo"
          style="background-image: url(icons/logo_cuna2.jpg)"></div>
            <div class="courses-block-text">
          <div class="courses-block-name">${course.name}</div>
          <div class="courses-block-description">
            ${course.description}
          </div>
          <div class="courses-block-author-rating">
            <div class="courses-block-author">Автор: @${course.author}</div>
            <div class="courses-block-rating">${course.rating}/5</div>
            <svg
              class="courses-block-rating-star"
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 0L4.69667 4.01794L0.318132 4.49139L3.58216 7.44806L2.6794 11.7586L6.5 9.568L10.3206 11.7586L9.41784 7.44806L12.6819 4.49139L8.30333 4.01794L6.5 0Z"
                fill="#F1D904"
              />
            </svg>
          </div>
        </div>
        `;
      fragment.append(courseElement);
      if (index === userInfo.courses.length - 1) {
        coursesDiv.append(fragment);
      }
    }, (index + 1) * 100);
  });
}

function displayButton() {
  const coursesDiv = document.getElementById("favorite-courses");
  coursesDiv.innerHTML = "";
  const courseButton = document.createElement("div");
  courseButton.classList.add("favorite-courses-enable");
  courseButton.innerHTML = `
        <div class="favorite-courses-enable-title">У вас еще нет курсов</div>
        <a href="catalog.html" class="favorite-courses-enable-button">
          <div class="favorite-courses-enable-button-text">Добавить курс</div>
          <svg
            class="favorite-courses-enable-button-icon"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.9998 7V15M6.99959 11H15M21.0003 11C21.0003 16.5228 16.523 21 10.9998 21C5.47666 21 0.999268 16.5228 0.999268 11C0.999268 5.47715 5.47666 1 10.9998 1C16.523 1 21.0003 5.47715 21.0003 11Z"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>

        `;
  coursesDiv.append(courseButton);
  document.getElementById("preloader").style.display = "none";
}

let refer = document.referrer.split("/").pop();

try {
  if (
    userInfo.courses.some((course) => refer == `courses.html?id=${course.id}`)
  ) {
    const title = document.getElementById("title");
    const catalogTab = document.getElementById("active");

    title.style.animation = "none";
    catalogTab.style.animation = "none";
    catalogTab.style.color = "#ffffff";
  }
} catch {
  console.log("No favorite courses");
}

window.onload = function () {
  fetchCourses();
};
