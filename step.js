const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const syllabusId = urlParams.get("syllabusId");
const moduleId = urlParams.get("moduleId");
const submoduleId = urlParams.get("submoduleId");
const stepId = urlParams.get("stepId");
const urlContent = "/test.txt";
localStorage.removeItem("3-course");
var modulesData = JSON.parse(localStorage.getItem("modulesData"));
var submoduleInfo = modulesData[moduleId-1].submoduleList[submoduleId-1];
var stepInfo = submoduleInfo.stepList;

var title = document.getElementById("title");
var arrow = document.getElementById("ref");
title.innerText = modulesData[moduleId - 1].submoduleList[submoduleId - 1].name;
arrow.href = `syllabus.html?id=${syllabusId}`;

var steps = document.getElementById("steps-number");
steps.innerHTML = `${stepId} из ${Object.keys(stepInfo).length}`;

var mediaContent = document.getElementById("content");
async function addContent() {
  try {
    const response = await fetch(urlContent);
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    content = await response.text(); // Сохраняем данные в переменной
    mediaContent.innerHTML = content;
  } catch (error) {
    console.error("Ошибка при получении курсов:", error);
  }
}
addContent();

function getLocalStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += (localStorage[key].length + key.length) * 2; // Учитываем размер в UTF-16
    }
  }
  return (total / 1024).toFixed(2); // Возвращаем размер в КБ
}

console.log(
  "Используемая память localStorage: " + getLocalStorageSize() + " KB"
);

function getItemSize(key) {
  const value = localStorage.getItem(key);
  if (value) {
    // Учитываем размер ключа и значения в байтах (UTF-16)
    const size = (key.length + value.length) * 2;
    return (size / 1024).toFixed(2); // Возвращаем размер в КБ
  }
  return 0; // Если элемент не найден
}

const key = "coursesData"; // Замените на ваш ключ
console.log(`Размер элемента '${key}': ${getItemSize(key)} KB`);

var buttonBack = document.getElementById("button-back");
if (stepId == 1) {
  buttonBack.removeAttribute("href");
} else {
  buttonBack.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
    Number(stepId) - 1
  }`;
}

var buttonForward = document.getElementById("button-forward");
if (stepId == Object.keys(stepInfo).length) {
  buttonForward.removeAttribute("href");
} else {
  buttonForward.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
    Number(stepId) + 1
  }`;
}

var button = document.getElementById("button");

if (
  (stepId == Object.keys(stepInfo).length) &
  (submoduleId != Object.keys(submoduleInfo).length)
) {
  button.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${
    Number(submoduleId) + 1
  }&stepId=${1}`;
} else if (
  (submoduleId == Object.keys(submoduleInfo).length) &
  (moduleId != Object.keys(modulesData).length)
) {
  button.href = `step.html?syllabusId=${syllabusId}&moduleId=${
    Number(moduleId) + 1
  }&submoduleId=${1}&stepId=${1}`;
} else if (
  (moduleId == Object.keys(modulesData).length) &
  (submoduleId == Object.keys(submoduleInfo).length) &
  (stepId == Object.keys(stepInfo).length)
) {
  button.removeAttribute("href");
  button.addEventListener("click", function () {
    alert("HUY");
  });
} else {
  button.href = `step.html?syllabusId=${syllabusId}&moduleId=${moduleId}&submoduleId=${submoduleId}&stepId=${
    Number(stepId) + 1
  }`;
}

var refer = localStorage.getItem("refer");
var favorTab = document.getElementById("favor");
var catalogTab = document.getElementById("catalog");
var link = document.referrer.split("/").pop();
link = link.split("&").pop();
var switc = document.getElementById("switc");

if (refer == "index.html" || refer == "favorite.html") {
  favorTab.style.animation = "none";
  favorTab.style.color = "#ffffff";
} else if (refer == "catalog.html") {
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
}

if (stepId != 1 || link == "stepId=2") {
  title.style.animation = "none";
  switc.style.animation = "none";
}
