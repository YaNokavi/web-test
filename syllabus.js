const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const paramId = urlParams.get("id");
var courseInfo = JSON.parse(localStorage.getItem(`catalogData`))[paramId - 1];

var title = document.getElementById("title");
var arrow = document.getElementById("ref");
title.innerText = courseInfo.name;
arrow.href = `courses.html?id=${paramId}`;

var modulesData = JSON.parse(
  localStorage.getItem(`courseData`)
).courseModuleList;

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
      `${module.id}. ${module.name}`
    );
    moduleMain.append(moduleMainText);
    elementModules.append(moduleMain);

    const moduleAditional = createElement("div", "syllabus-modules-aditional");
    elementModules.append(moduleAditional);

    module.submoduleList.forEach((submodule) => {
      const submoduleLink = createElement(
        "a",
        "syllabus-name-aditional",
        `${module.id}.${submodule.id} ${submodule.name}`
      );
      submoduleLink.href = `step.html?syllabusId=${paramId}&moduleId=${module.id}&submoduleId=${submodule.id}&stepId=1`;
      moduleAditional.append(submoduleLink);
    });
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
