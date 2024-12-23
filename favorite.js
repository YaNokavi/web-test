// const currentTab = sessionStorage.getItem("currentTab");
// const currentLink = sessionStorage.getItem("currentLink");

// if ((currentTab === "favorite.html" || currentTab === "index.html") && currentLink != null) {
//   window.location.href = currentLink;
// } else if (currentTab == null && currentLink == null) {
// }

import fetchData from "./fetch.js";

localStorage.removeItem("courseData");

const tg = window.Telegram.WebApp;
let logoname;
let username;

const userIdData = `${tg.initDataUnsafe.user.id}`;
if (tg.initDataUnsafe.user.username) {
  logoname = `${tg.initDataUnsafe.user.username}`[0].toUpperCase();
  username = `${tg.initDataUnsafe.user.username}`;
} else {
  logoname = "U";
  username = "User";
}
// let userIdData = 6;
// logoname = "ret";
// username = "rete";
let referallId = localStorage.getItem("referallId");

localStorage.setItem("userIdData", userIdData);
localStorage.setItem("logoname", logoname);
localStorage.setItem("username", username);

let data;
if (!referallId || referallId === userIdData) {
  data = {
    userId: userIdData,
    username: username,
  };
} else {
  data = {
    userId: userIdData,
    username: username,
    referrerId: referallId,
  };
}

async function sendUserInfo() {
  const userInfo = await fetchData(
    "https://cryptuna-anderm.amvera.io/v1/user/info",
    //userId
    "POST",
    data
  );
}

sendUserInfo();

async function getFavoriteCourses() {
  const courseInfo = await fetchData(
    `https://cryptuna-anderm.amvera.io/v1/user/${userIdData}/favorite-courses`,
    "GET"
  );
  localStorage.setItem("infoCourse", JSON.stringify(courseInfo));

  courseInfo.length ? displayCourses(courseInfo) : displayButton();
}

getFavoriteCourses();

function displayCourses(courseInfo) {
  document.getElementById("preloader").style.display = "none";

  const coursesDiv = document.getElementById("favorite-courses");
  coursesDiv.innerHTML = "";

  const fragment = document.createDocumentFragment();

  courseInfo.forEach((course, index) => {
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
      if (index === courseInfo.length - 1) {
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
