const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const paramId = urlParams.get("id");
var courseInfo = JSON.parse(localStorage.getItem(`${paramId}-course`));

var info = localStorage.getItem("infoCourse");
if (info) {
  try {
    var parsedInfo = JSON.parse(info);
    var courses = parsedInfo || []; // Возвращает пустой массив, если favoriteCourses не существует
    var idCourse = courses.map((course) => course.id);
  } catch (error) {
    console.error("Ошибка при парсинге JSON:", error);
  }
} else {
  console.log("Данные не найдены в localStorage.");
}

var title = document.getElementById("title");
var arrow = document.getElementById("ref");
title.innerText = courseInfo.name;
arrow.href = `courses.html?id=${paramId}`;

var modulesData = JSON.parse(localStorage.getItem("modulesData"));

function displayModules() {
  const elementModules = document.getElementById("modules");
  elementModules.innerHTML = "";
  modulesData.forEach((elem) => {
    const moduleMain = document.createElement("div");
    moduleMain.classList.add("syllabus-modules-main");
    const moduleMainText = document.createElement("div");
    moduleMainText.classList.add("syllabus-name-main");
    moduleMainText.innerHTML = `${elem.id}. ${elem.name}`;
    const moduleId = elem.id;
    
    moduleMain.append(moduleMainText);
    elementModules.append(moduleMain);

    const moduleAditional = document.createElement("div");
    moduleAditional.classList.add("syllabus-modules-aditional");
    elementModules.append(moduleAditional);
    elem.submoduleList.forEach((elem) => {
      const moduleAditionalText = document.createElement("a");
      //присваивание айдишникой шагов к ссылке
      moduleAditionalText.href = "step.html";
      moduleAditionalText.classList.add("syllabus-name-aditional");
      moduleAditionalText.innerHTML = `${moduleId}.${elem.id} ${elem.name}`;
      moduleAditional.append(moduleAditionalText);
      
    });
  });
}

displayModules()

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