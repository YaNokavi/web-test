const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const paramId = urlParams.get("id");
var courseInfo = JSON.parse(localStorage.getItem(`catalogData`))[paramId-1];

var title = document.getElementById("title");
var arrow = document.getElementById("ref");
title.innerText = courseInfo.name;
arrow.href = `courses.html?id=${paramId}`;

var modulesData = JSON.parse(localStorage.getItem("courseData")).courseModuleList;
console.log(modulesData)

function displayModules() {
  const elementModules = document.getElementById("modules");
  elementModules.innerHTML = "";
  modulesData.forEach((module) => {
    const moduleMain = document.createElement("div");
    moduleMain.classList.add("syllabus-modules-main");
    const moduleMainText = document.createElement("div");
    moduleMainText.classList.add("syllabus-name-main");
    moduleMainText.innerHTML = `${module.id}. ${module.name}`;
    const moduleId = module.id;

    moduleMain.append(moduleMainText);
    elementModules.append(moduleMain);

    const moduleAditional = document.createElement("div");
    moduleAditional.classList.add("syllabus-modules-aditional");
    elementModules.append(moduleAditional);
    module.submoduleList.forEach((submodule, index) => {
      const moduleAditionalText = document.createElement("a");
      const submoduleId = submodule.id;
      //присваивание айдишникой шагов к ссылке
      // submodule.stepList.forEach((step) => {
      // console.log(submodule.stepList[index].id);
      moduleAditionalText.href = `step.html?syllabusId=${paramId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${1}`;

      moduleAditionalText.classList.add("syllabus-name-aditional");
      moduleAditionalText.innerHTML = `${moduleId}.${submoduleId} ${submodule.name}`;
      moduleAditional.append(moduleAditionalText);
      // });
    });
  });
}

displayModules();

var refer = localStorage.getItem("refer");
var favorTab = document.getElementById("favor");
var catalogTab = document.getElementById("catalog");

if (refer == "index.html" || refer == "favorite.html") {
  favorTab.style.animation = "none";
  favorTab.style.color = "#ffffff";
} else if (refer == "catalog.html") {
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
}
