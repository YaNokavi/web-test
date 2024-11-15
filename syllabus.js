const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const paramId = urlParams.get("id");
const userId = localStorage.getItem("userIdData");
try {
  var courseInfo = JSON.parse(localStorage.getItem(`catalogData`))[paramId - 1];
  console.log(courseInfo)
} catch {
  console.log("Нет данных из каталога, берем из любимых");
  courseInfo = JSON.parse(localStorage.getItem(`infoCourse`))[paramId - 1];
}

var progress = {
  userId: userId,
  completedStepList: [],
};

// try {
//   var parseProgress = JSON.parse(
//     localStorage.getItem("completedSteps")
//   ).completedStepList;
// } catch {
//   console.log("Нет прогресса");
//   if (!parseProgress) {
    localStorage.setItem("completedSteps", JSON.stringify(progress));
//   }
// }

const courseData = JSON.parse(localStorage.getItem(`courseData`));
var modulesData = courseData.courseModuleList;

async function getContent() {
  // if (!modulesData[paramId - 1].submoduleList[paramId - 1].stepList) {
    try {
      const response = await fetch(
        `https://cryptuna-anderm.amvera.io/v1/course/${paramId}/content?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }
      contentGet = await response.json();
      console.log(contentGet)
      modulesWithSteps();
    } catch (error) {
      console.error("Ошибка при получении курсов:", error);
    }
  // } else {
  //   console.log("Есть шаги");
  // }
}

function modulesWithSteps() {
  courseData.courseModuleList.forEach((submodule) => {
     
    submodule.submoduleList.forEach((elem) => {
      const stepListObj = contentGet.find(step => step.submoduleId === elem.id);
      elem.stepList = stepListObj ? stepListObj.stepList : [];
    });
  });

  localStorage.setItem("courseData", JSON.stringify(courseData));
}

var title = document.getElementById("title");
var arrow = document.getElementById("ref");
title.innerText = courseInfo.name;
arrow.href = `courses.html?id=${paramId}`;

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
      moduleAditional.append(submoduleLink);
    });
    document.getElementById("preloader").style.display = "none";
  });
  // const elementModules = document.getElementById("modules");
  // elementModules.innerHTML = "";
  // modulesData.forEach((module) => {
  //   const moduleMain = document.createElement("div");
  //   moduleMain.classList.add("syllabus-modules-main");
  //   const moduleMainText = document.createElement("div");
  //   moduleMainText.classList.add("syllabus-name-main");
  //   moduleMainText.innerHTML = `${module.id}. ${module.name}`;
  //   const moduleId = module.id;

  //   moduleMain.append(moduleMainText);
  //   elementModules.append(moduleMain);

  //   const moduleAditional = document.createElement("div");
  //   moduleAditional.classList.add("syllabus-modules-aditional");
  //   elementModules.append(moduleAditional);
  //   module.submoduleList.forEach((submodule) => {
  //     const moduleAditionalText = document.createElement("a");
  //     const submoduleId = submodule.id;
  //     moduleAditionalText.href = `step.html?syllabusId=${paramId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${1}`;

  //     moduleAditionalText.classList.add("syllabus-name-aditional");
  //     moduleAditionalText.innerHTML = `${moduleId}.${submoduleId} ${submodule.name}`;
  //     moduleAditional.append(moduleAditionalText);
  //   });
  // });
}

displayModules();

const refer = localStorage.getItem("refer");
const favorTab = document.getElementById("favor");
const catalogTab = document.getElementById("catalog");

sessionStorage.setItem("currentTab", refer);
sessionStorage.setItem("currentLink", window.location.href);

function setupTab(tab) {
  tab.style.animation = "none";
  tab.style.color = "#ffffff";
  tab.addEventListener("click", function () {
    sessionStorage.removeItem("currentTab");
    sessionStorage.removeItem("currentLink");
  });
}

if (refer == "index.html" || refer == "favorite.html") {
  setupTab(favorTab);
} else if (refer == "catalog.html") {
  setupTab(catalogTab);
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
    sessionStorage.removeItem("currentTab");
    sessionStorage.removeItem("currentLink");
    window.location.href = `courses.html?id=${paramId}`; // Переход по ссылке
  }
});