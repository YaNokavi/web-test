import fetchData from "./fetch.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const paramId = urlParams.get("id");

const userId = localStorage.getItem("userIdData");
const username = localStorage.getItem("username");

let dataAdd = {
  userId,
  username,
  courseId: paramId,
};

let dataDel = {
  userId,
  courseId: paramId,
};

const info = localStorage.getItem("infoCourse");
const courseElement = document.getElementById("info");

function renderCourse(course) {
  courseElement.innerHTML = `
    <a href="https://t.me/${course.author}" class="course-block-author">Автор: @${course.author}</a>
    <div class="course-block-description">
      <img src="icons/logo_cuna2.jpg" class="course-logo" />
      <div class="course-block-name">${course.name}</div>
      ${course.description}
    </div>
  `;
}

function getCourseInfo() {
  const courses = JSON.parse(info) || [];
  return courses.find((course) => course.id == paramId) || null;
}

var courseInfo = getCourseInfo();
if (courseInfo) {
  renderCourse(courseInfo);
} else {
  const catalogData = JSON.parse(localStorage.getItem("catalogData"));
  var courseInfo = catalogData[paramId - 1];
  if (courseInfo) {
    renderCourse(courseInfo);
  }
}

function displayLearning(courseData) {
  const elementLearning = document.getElementById("points");
  elementLearning.innerHTML = "";
  courseData.learningOutcomeList.forEach((elem) => {
    const pointElement = document.createElement("div");
    pointElement.style.marginBottom = "15px";
    pointElement.innerHTML = `•&nbsp; ${elem.content}`;
    elementLearning.append(pointElement);
  });
}

function displayModules(courseData) {
  const elementModules = document.getElementById("modules");
  elementModules.innerHTML = "";
  courseData.courseModuleList.forEach((elem) => {
    const moduleMain = document.createElement("div");
    moduleMain.classList.add("syllabus-text-course-main");
    moduleMain.innerHTML = `${elem.number}. ${elem.name}`;
    const moduleId = elem.number;
    elementModules.append(moduleMain);
    elem.submoduleList.forEach((elem) => {
      const moduleAditional = document.createElement("div");
      moduleAditional.classList.add("syllabus-text-course-additional");
      moduleAditional.innerHTML = `${moduleId}.${elem.number} ${elem.name}`;
      elementModules.append(moduleAditional);
    });
  });
  // document.getElementById("preloader").style.display = "none";
}

async function fetchContent() {
  const courseData = await fetchData(
    `https://cryptuna-anderm.amvera.io/v1/course/${paramId}/content?userId=${userId}`
  );

  localStorage.setItem(`courseData`, JSON.stringify(courseData));
  displayLearning(courseData);
  displayModules(courseData);
  document.getElementById("preloader").style.display = "none";
}

fetchContent();

const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const button3 = document.getElementById("button3");
const text = document.querySelector(".course-block-button-text");
const star1 = document.getElementById("star1");
const star2 = document.getElementById("star2");

const modal = document.getElementById("modal");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

function setupButtons() {
  let buttonsConfig = [
    { button: button1, show: true },
    { button: star1, show: true },
    { button: button2, show: false },
    { button: button3, show: false },
    { button: star2, show: false },
  ];

  const idCourse = JSON.parse(localStorage.getItem("infoCourse"))?.map(
    (course) => course.id
  );

  if (idCourse && idCourse.includes(Number(paramId))) {
    buttonsConfig[0].show = false; // Hide button1
    buttonsConfig[1].show = false;
    buttonsConfig[2].show = true; // Show button2
    buttonsConfig[3].show = true; // Show button3
    buttonsConfig[4].show = true;
  }

  buttonsConfig.forEach(({ button, show }) => {
    button.style.display = show ? "flex" : "none";
  });
}

setupButtons();

button1.addEventListener("click", function () {
  text.style.animation = "fadeOut 10ms ease";
  star1.style.animation = "fadeOut 50ms ease";
  setTimeout(() => {
    button1.style.animation = "button-course 0.4s ease";
    text.innerText = "";
    star1.style.display = "none";
    setTimeout(() => {
      star2.style.animation = "fadeIn 100ms ease";
      star2.style.display = "block";
      star1.style.animation = "none";
      button1.style.display = "none";
      button1.style.animation = "none";
      button2.style.display = "flex";
      text.style.animation = "none";
      button3.style.animation = "fadeIn 100ms ease";
      button3.style.display = "flex";
    }, 400);
  }, 10);
  let addData = JSON.parse(localStorage.getItem("infoCourse"));

  addData.push(courseInfo);
  localStorage.setItem("infoCourse", JSON.stringify(addData));

  postDataAdd();
});

async function postDataAdd() {
  const response = await fetchData(
    `https://cryptuna-anderm.amvera.io/v1/user/favorite-course`,
    //userId,
    "POST",
    dataAdd,
    false
  );
  console.log(response);
}

button2.addEventListener("click", function () {
  modal.style.display = "block";
  noButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  document.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  yesButton.addEventListener("click", function () {
    modal.style.display = "none";
    button3.style.animation = "fadeOut 150ms ease";
    setTimeout(() => {
      button3.style.display = "none";
      setTimeout(() => {
        star2.style.animation = "fadeOut 100ms ease";
        setTimeout(() => {
          button2.style.animation =
            "button-favorite 0.5s cubic-bezier(0.385, -0.220, 0.520, 0.840)";
          star2.style.display = "none";
          setTimeout(() => {
            text.style.animation = "fadeIn 50ms ease";
            star1.style.animation = "fadeIn 50ms ease";
            text.innerText = "Поступить на курс";
            star1.style.display = "block";
            button2.style.display = "none";
            button1.style.display = "flex";
            button2.style.animation = "none";
            button3.style.animation = "none";
            setTimeout(() => {
              star1.style.animation = "none";
              star2.style.animation = "none";
              text.style.animation = "none";
            }, 10);
          }, 450);
        }, 50);
      }, 10);
    }, 150);
    let remData = JSON.parse(localStorage.getItem("infoCourse"));
    remData = remData.filter((item) => item.id !== Number(paramId));
    localStorage.setItem("infoCourse", JSON.stringify(remData));

    postDataRemove();
  });
});

async function postDataRemove() {
  const response = await fetchData(
    `https://cryptuna-anderm.amvera.io/v1/user/favorite-course`,
    "DELETE",
    dataDel,
    false
  );
  console.log(response);
}

button3.addEventListener("click", function () {
  window.location.href = `syllabus.html?id=${paramId}`;
});

var refer = document.referrer.split("/").pop();
if (!refer || refer === "index.html") refer = "favorite.html";
// const title = document.getElementById("title");
const favorTab = document.getElementById("favor");
const catalogTab = document.getElementById("catalog");
// const link = document.getElementById("ref");

function setupCatalog() {
  // link.href = "catalog.html";
  // title.innerText = "Каталог";
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
}

function setupFavorite() {
  // link.href = "favorite.html";
  // title.innerText = "Мои курсы";
  favorTab.style.animation = "none";
  favorTab.style.color = "#ffffff";
}

if (refer == "favorite.html") {
  console.log(refer);
  localStorage.setItem("refer", refer);
  setupFavorite();
} else if (refer == "catalog.html") {
  localStorage.setItem("refer", refer);
  setupCatalog();
} else if (refer.startsWith("syllabus.html")) {
  let referSyl = localStorage.getItem("refer");
  // link.style.animation = "none";
  if (referSyl == "favorite.html") {
    setupFavorite();
  } else if (referSyl == "catalog.html") {
    setupCatalog();
  }
}

// const currentTab = sessionStorage.getItem("currentTab");
// const currentLink = sessionStorage.getItem("currentLink");
// if (currentTab == null && currentLink == null) {
//   sessionStorage.setItem("currentTab", refer);
//   sessionStorage.setItem("currentLink", window.location.href);
// }

// link.addEventListener("click", function () {
//   sessionStorage.removeItem("currentTab");
//   sessionStorage.removeItem("currentLink");
// });
// if (refer == "catalog.html") {
//   catalogTab.addEventListener("click", function () {
//     sessionStorage.removeItem("currentTab");
//     sessionStorage.removeItem("currentLink");
//   });
// } else if (refer == "index.html" || refer == "favorite.html") {
//   favorTab.addEventListener("click", function () {
//     sessionStorage.removeItem("currentTab");
//     sessionStorage.removeItem("currentLink");
//   });
// }


