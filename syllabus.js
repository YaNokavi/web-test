import fetchData from "./fetch.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const paramId = urlParams.get("id");
const userId = localStorage.getItem("userIdData");
// const title = document.getElementById("title");
// const arrow = document.getElementById("ref");
// arrow.href = `courses.html?id=${paramId}`;

// function renderCourse(course) {
//   title.innerText = course.name;
// }

// function getCourseInfo() {
//   const courses = JSON.parse(localStorage.getItem(`infoCourse`)) || [];
//   return courses.find((course) => course.id == paramId) || null;
// }

// var courseInfo = getCourseInfo();
// if (courseInfo) {
//   renderCourse(courseInfo);
// } else {
//   const catalogData = JSON.parse(localStorage.getItem("catalogData"));
//   var courseInfo = catalogData[paramId - 1];
//   if (courseInfo) {
//     renderCourse(courseInfo);
//   }
// }

// localStorage.setItem("completedSteps", JSON.stringify(progress));

const courseData = JSON.parse(localStorage.getItem(`courseData`));
var modulesData = courseData.courseModuleList;

async function getContent() {
  const contentGet = await fetchData(
    `https://cryptuna-anderm.amvera.io/v1/course/${paramId}/content?userId=${userId}`
  );
  console.log(contentGet);
  displayModules();
  localStorage.setItem("courseData", JSON.stringify(courseData));
  // modulesWithSteps(contentGet);
}

// function modulesWithSteps(contentGet) {
//   courseData.courseModuleList.forEach((submodule) => {
//     submodule.submoduleList.forEach((elem) => {
//       const stepListObj = contentGet.find(
//         (step) => step.submoduleId === elem.id
//       );
//       elem.stepList = stepListObj ? stepListObj.stepList : [];
//     });
//   });

  
//   displayModules();
// }

function createElement(tag, className, innerHTML) {
  const element = document.createElement(tag);
  if (className) element.classList.add(className);
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

function displayModules() {
  const elementModules = document.getElementById("modules");
  elementModules.innerHTML = "";

  modulesData.forEach((module) => {
    const moduleMain = createElement("div", "syllabus-modules-main");
    const moduleMainText = createElement(
      "div",
      "syllabus-name-main",
      `${module.number}. ${module.name}`
    );
    moduleMain.append(moduleMainText);
    elementModules.append(moduleMain);

    const moduleAditional = createElement("div", "syllabus-modules-aditional");
    elementModules.append(moduleAditional);

    module.submoduleList.forEach((submodule) => {
      const submoduleLink = createElement(
        "a",
        "syllabus-name-aditional",
        `${module.number}.${submodule.number} ${submodule.name}`
      );
      submoduleLink.href = `step.html?syllabusId=${paramId}&moduleId=${module.number}&submoduleId=${submodule.number}&stepId=1`;

      let steps = [];
      submodule.stepList.forEach((step) => {
        if (step.completed) {
          steps.push("1");
        }
      });

      const stepProgress = createElement(
        "div",
        "syllabus-step-pogress",
        `${steps.length}/${Object.keys(submodule.stepList).length}`
      );
      submoduleLink.append(stepProgress);
      moduleAditional.append(submoduleLink);
    });
    document.getElementById("preloader").style.display = "none";
  });
}

const refer = localStorage.getItem("refer");
const favorTab = document.getElementById("favor");
const catalogTab = document.getElementById("catalog");

// sessionStorage.setItem("currentTab", refer);
// sessionStorage.setItem("currentLink", window.location.href);

// function setupTab(tab) {
//   tab.style.animation = "none";
//   tab.style.color = "#ffffff";
// tab.addEventListener("click", function () {
//   sessionStorage.removeItem("currentTab");
//   sessionStorage.removeItem("currentLink");
// });
// }

function setupCatalog() {
  // title.innerText = "Каталог";
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
}

function setupFavorite() {
  // title.innerText = "Мои курсы";
  favorTab.style.animation = "none";
  favorTab.style.color = "#ffffff";
}

if (refer == "favorite.html") {
  setupFavorite();
} else if (refer == "catalog.html") {
  setupCatalog();
}

let startX;
const swipeDistance = 100; // Минимальное расстояние для свайпа

document.addEventListener("touchstart", function (e) {
  // Сохраняем начальную позицию касания
  startX = e.touches[0].clientX;
});

document.addEventListener("touchmove", function (e) {
  const moveX = e.touches[0].clientX;

  // Проверяем, что свайп начался с левой части экрана и расстояние превышает заданное
  if (startX <= 15 && moveX - startX > swipeDistance) {
    // sessionStorage.removeItem("currentTab");
    // sessionStorage.removeItem("currentLink");
    window.location.href = `courses.html?id=${paramId}`; // Переход по ссылке
  }
});

getContent();
