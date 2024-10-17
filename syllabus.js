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
    // console.log(idCourse);
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