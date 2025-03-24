import fetchData from "./fetch.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const courseId = Number(urlParams.get("id"));

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe.user.id;
// const userId = 1;

const info = localStorage.getItem("infoCourse");
const courseElement = document.getElementById("info");

const lastStepArray = JSON.parse(localStorage.getItem("lastStepArray"));

function renderCourse(course) {
  let author = course.author;

  if (author.length >= 15) {
    author = author.slice(0, 15) + "...";
  }

  courseElement.innerHTML = `
  <div class="course-media">
    
    <img src="icons/logo_cuna2.jpg" class="course-logo" />
    <a href="https://t.me/${course.author}" class="course-block-author">Автор: @${author}</a>
    </div>
    <div class="course-block-description">
      <div class="course-block-name">${course.name}</div>
      ${course.description}
    </div>
  `;
}

function getCourseInfo() {
  const courses = JSON.parse(info) || [];
  return courses.find((course) => course.id == courseId) || null;
}

var courseInfo = getCourseInfo();
if (courseInfo) {
  renderCourse(courseInfo);
} else {
  const catalogData = JSON.parse(localStorage.getItem("catalogData"));
  var courseInfo = catalogData.find((course) => course.id == courseId) || null;
  if (courseInfo) {
    renderCourse(courseInfo);
  }
}

function displayLastStep(lastStepArray, courseData) {
  const lastStepBlock = document.getElementById("last-step-block");
  lastStepBlock.style.display = "flex";
  const lastStepHref = document.getElementById("last-step");
  const lastStep = lastStepArray[courseId];
  const modules = courseData.courseModuleList.find(
    (module) => module.number == lastStep.moduleId
  );
  const sub =
    modules.submoduleList.find((sub) => sub.number == lastStep.submoduleId) ||
    null;
  const step =
    sub.stepList.find((step) => step.number == lastStep.stepId) || null;
  lastStepHref.innerHTML = `${sub.name} - ${step.number} шаг`;
  lastStepHref.href = `step.html?syllabusId=${courseId}&moduleId=${lastStep.moduleId}&submoduleId=${lastStep.submoduleId}&stepId=${lastStep.stepId}`;
}

function displayLearning(courseData) {
  const elementLearning = document.getElementById("points");
  elementLearning.innerHTML = "";
  courseData.learningOutcomeList.forEach((elem) => {
    const pointElement = document.createElement("div");
    pointElement.style.display = "flex";
    pointElement.style.marginBottom = "10px";
    pointElement.innerHTML = `•&nbsp&nbsp`;
    const pointElementText = document.createElement("div");
    pointElementText.style.display = "flex";
    pointElementText.innerHTML = `${elem.content}`;
    pointElement.append(pointElementText);
    elementLearning.append(pointElement);
  });
}

function displayModules(courseData) {
  const elementModules = document.getElementById("modules");
  elementModules.innerHTML = "";
  courseData.courseModuleList.forEach((elem) => {
    const moduleMain = document.createElement("div");
    moduleMain.className = "syllabus-text-course-main toggle";
    moduleMain.innerHTML = `${elem.name}`;

    const svgIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svgIcon.setAttribute("width", "17");
    svgIcon.setAttribute("height", "11");
    svgIcon.setAttribute("viewBox", "0 0 17 11");
    svgIcon.setAttribute("fill", "none");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    path.setAttribute(
      "d",
      "M9.35907 1.30377L16.1946 8.37502L14.486 10.1425L8.50477 3.95502L2.52352 10.1425L0.814941 8.37502L7.65048 1.30377C7.87708 1.06943 8.18437 0.937784 8.50477 0.937784C8.82518 0.937784 9.13247 1.06943 9.35907 1.30377Z"
    );
    path.setAttribute("fill", "#A6A6A6");

    svgIcon.appendChild(path);
    svgIcon.classList.add("toggle-icon");

    moduleMain.appendChild(svgIcon);
    elementModules.append(moduleMain);

    const moduleAditional = document.createElement("ol");
    moduleAditional.style.margin = 0;
    moduleAditional.style.paddingLeft = "20px";

    elem.submoduleList.forEach((subElem) => {
      const subText = document.createElement("li");
      subText.classList.add("syllabus-text-course-additional");
      subText.innerText = subElem.name;
      moduleAditional.append(subText);
    });
    elementModules.append(moduleAditional);

    moduleMain.addEventListener("click", () => {
      const computedStyle = window.getComputedStyle(moduleAditional);
      if (computedStyle.display === "none") {
        moduleAditional.style.display = "block";
      } else {
        moduleAditional.style.display = "none";
      }

      svgIcon.classList.toggle("rotated");
    });
  });
}

async function fetchContent() {
  const courseData = await fetchData(
    `course/${courseId}/content?userId=${userId}`
  );

  localStorage.setItem(`courseData`, JSON.stringify(courseData));

  if (lastStepArray !== null && lastStepArray[courseId]) {
    displayLastStep(lastStepArray, courseData);
  }
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

  if (idCourse && idCourse.includes(Number(courseId))) {
    buttonsConfig[0].show = false;
    buttonsConfig[1].show = false;
    buttonsConfig[2].show = true;
    buttonsConfig[3].show = true;
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
    `user/${userId}/favorite-course?courseId=${courseId}`,
    "POST",
    null,
    false
  );
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
    remData = remData.filter((item) => item.id !== Number(courseId));
    localStorage.setItem("infoCourse", JSON.stringify(remData));

    postDataRemove();
  });
});

async function postDataRemove() {
  const response = await fetchData(
    `user/${userId}/favorite-course?courseId=${courseId}`,
    "DELETE",
    null,
    false
  );
}

button3.addEventListener("click", function () {
  window.location.href = `syllabus.html?id=${courseId}`;
});

var refer = document.referrer.split("/").pop();
if (!refer || refer === "index.html") refer = "favorite.html";
const favorTab = document.getElementById("favor");
const catalogTab = document.getElementById("catalog");

function setupCatalog() {
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
}

function setupFavorite() {
  favorTab.style.animation = "none";
  favorTab.style.color = "#ffffff";
}

if (refer == "favorite.html") {
  localStorage.setItem("refer", refer);
  setupFavorite();
} else if (refer == "catalog.html") {
  localStorage.setItem("refer", refer);
  setupCatalog();
} else if (refer.startsWith("syllabus.html")) {
  let referSyl = localStorage.getItem("refer");
  if (referSyl == "favorite.html") {
    setupFavorite();
  } else if (referSyl == "catalog.html") {
    setupCatalog();
  }
}
