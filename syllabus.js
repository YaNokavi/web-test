import fetchData from "./fetch.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const paramId = urlParams.get("id");
const userId = tg.initDataUnsafe.user.id;


const courseData = JSON.parse(localStorage.getItem(`courseData`));
var modulesData = courseData.courseModuleList;

async function getContent() {
  const contentGet = await fetchData(
    `https://cryptuna-anderm.amvera.io/v1/course/${paramId}/content?userId=${userId}`
  );
  displayModules();
  localStorage.setItem("courseData", JSON.stringify(courseData));
}

getContent();

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

// function setupTab(tab) {
//   tab.style.animation = "none";
//   tab.style.color = "#ffffff";
// tab.addEventListener("click", function () {
//   sessionStorage.removeItem("currentTab");
//   sessionStorage.removeItem("currentLink");
// });
// }

function setupCatalog() {
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
}

function setupFavorite() {
  favorTab.style.animation = "none";
  favorTab.style.color = "#ffffff";
}

if (refer == "favorite.html") {
  setupFavorite();
} else if (refer == "catalog.html") {
  setupCatalog();
}
