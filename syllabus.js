import fetchData from "./fetch.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const paramId = urlParams.get("id");

const tg = window.Telegram.WebApp;
// const userId = tg.initDataUnsafe.user.id;
const userId = 1;
// const courseData = JSON.parse(localStorage.getItem(`courseData`));
// var modulesData = courseData.courseModuleList;

async function getContent() {
  const modulesData = await fetchData(
    `course/${paramId}/content?userId=${userId}`
  );

  displayModules(modulesData.courseModuleList);
  // localStorage.setItem("courseData", JSON.stringify(courseData));
}

getContent();

function createElement(tag, className, innerHTML) {
  const element = document.createElement(tag);
  if (className) element.classList.add(className);
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

function displayModules(modulesData) {
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

catalogTab.style.animation = "none";
favorTab.style.animation = "none";
function setupCatalog() {
  catalogTab.style.color = "#ffffff";
}

function setupFavorite() {
  favorTab.style.color = "#ffffff";
}

if (refer.endsWith("favorite.html")) {
  setupFavorite();
} else if (refer.endsWith("catalog.html")) {
  setupCatalog();
}
