import fetchData from "./fetch.js";

// const currentTab = sessionStorage.getItem("currentTab");
// const currentLink = sessionStorage.getItem("currentLink");
// const userId = localStorage.getItem("userIdData");

// if (currentTab === "catalog.html" && currentLink != null) {
//   window.location.href = currentLink;
// } else if (currentTab == null && currentLink == null) {
   localStorage.removeItem("courseData");
// }

let coursesData = [];

async function fetchCourses() {
  const cachedCourses = localStorage.getItem("catalogData");
  if (cachedCourses) {
    // Если данные есть, парсим их и сохраняем в переменной
    coursesData = JSON.parse(cachedCourses);

    displayCourses(); // Отображаем курсы
  } else {
    coursesData = await fetchData(
      "https://cryptuna-anderm.amvera.io/v1/course/all"
      //userId
    );
    console.log(coursesData);
    localStorage.setItem("catalogData", JSON.stringify(coursesData));
    displayCourses();
  }
}

function displayCourses() {
  document.getElementById("preloader").style.display = "none";
  const coursesDiv = document.getElementById("courses");
  coursesDiv.innerHTML = "";
  coursesData.forEach((course, index) => {
    setTimeout(() => {
      const courseElement = document.createElement("a");
      courseElement.href = `courses.html?id=${course.id}`;
      courseElement.classList.add("courses-block");
      courseElement.innerHTML = `
          <img src="icons/logo_cuna2.jpg" class="courses-logo" />
            <div class="courses-block-text">
          <div class="courses-block-name">${course.name}</div>
          <div class="courses-block-description">
            ${course.description}
          </div>
          <div class="courses-block-author-rating">
            <div class="courses-block-author">Автор: @${course.author}</div>
            <div class="courses-block-rating">${course.rating}/5</div>
            <svg
              class="courses-block-rating-star"
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 0L4.69667 4.01794L0.318132 4.49139L3.58216 7.44806L2.6794 11.7586L6.5 9.568L10.3206 11.7586L9.41784 7.44806L12.6819 4.49139L8.30333 4.01794L6.5 0Z"
                fill="#F1D904"
              />
            </svg>
          </div>
        </div>
        `;
      coursesDiv.append(courseElement);
    }, (index + 1) * 100);
  });
}

let refer = document.referrer.split("/").pop();
const title = document.getElementById("title");
const catalogTab = document.getElementById("active");

if (
  refer.startsWith("courses.html") ||
  refer.startsWith("syllabus.html") ||
  refer.startsWith("step.html")
) {
  title.style.animation = "none";
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
}

window.onload = function () {
  fetchCourses();
};
