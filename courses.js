const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const paramId = urlParams.get("id");

const userId = localStorage.getItem("userIdData");
const username = localStorage.getItem("username");

dataAdd = {
  userId,
  username,
  courseId: paramId,
};

dataDel = {
  userId,
  courseId: paramId,
};

const info = localStorage.getItem("infoCourse");
const courseElement = document.getElementById("info");

function renderCourse(course) {
  courseElement.innerHTML = `
    <div class="course-block-author">Автор: @${course.author}</div>
    <div class="course-block-description">
      <img src="icons/logo_cuna2.jpg" class="course-logo" />
      <div class="course-block-name">${course.name}</div>
      ${course.description}
    </div>
  `;
}

function getCourseInfo() {
  const courses = JSON.parse(info) || [];
  return courses.find((course) => course.id == paramId) || null;
}

function loadCourse() {
  const courseInfo = getCourseInfo();

  if (courseInfo) {
    renderCourse(courseInfo);
  } else {
    const catalogData = JSON.parse(localStorage.getItem("catalogData"));
    const courseInfoFromCatalog = catalogData[paramId - 1];
    if (courseInfoFromCatalog) {
      renderCourse(courseInfoFromCatalog);
    }
  }
}

loadCourse();

// if (JSON.parse(info).length != 0 || JSON.parse(info)[0] != null) {
//   try {
//     const parsedInfo = JSON.parse(info);
//     const courses = parsedInfo || []; // Возвращает пустой массив, если favoriteCourses не существует
//     var idCourse = courses.map((course) => course.id);

//     for (let key in idCourse) {
//       if (idCourse[key] == paramId) {
//         courseElement.innerHTML = `
//             <div class="course-block-author">Автор: @${parsedInfo[key].author}</div>
//           <div class="course-block-description">
//             <img src="icons/logo_cuna2.jpg" class="course-logo" />
//             <div class="course-block-name">${parsedInfo[key].name}</div>
//             ${parsedInfo[key].description}
//           </div>
//         `;
//         break;
//       } else {
//         var courseInfo = JSON.parse(localStorage.getItem(`catalogData`))[
//           paramId - 1
//         ];
//         courseElement.innerHTML = `
//           <div class="course-block-author">Автор: @${courseInfo.author}</div>
//         <div class="course-block-description">
//           <img src="icons/logo_cuna2.jpg" class="course-logo" />
//           <div class="course-block-name">${courseInfo.name}</div>
//           ${courseInfo.description}
//         </div>
//       `;
//         break;
//       }
//     }
//   } catch (error) {
//     console.error("Ошибка при парсинге JSON:", error);
//   }
// } else {
//   var courseInfo = JSON.parse(localStorage.getItem(`catalogData`))[paramId - 1];
//   courseElement.innerHTML = `
//           <div class="course-block-author">Автор: @${courseInfo.author}</div>
//         <div class="course-block-description">
//           <img src="icons/logo_cuna2.jpg" class="course-logo" />
//           <div class="course-block-name">${courseInfo.name}</div>
//           ${courseInfo.description}
//         </div>
//       `;
// }

function displayLearning() {
  const elementLearning = document.getElementById("points");
  elementLearning.innerHTML = "";
  courseData.learningOutcomeList.forEach((elem) => {
    const pointElement = document.createElement("div");
    pointElement.style.marginBottom = "15px";
    pointElement.innerHTML = `•&nbsp; ${elem.content}`;
    elementLearning.append(pointElement);
  });
}

function displayModules() {
  const elementModules = document.getElementById("modules");
  elementModules.innerHTML = "";
  courseData.courseModuleList.forEach((elem) => {
    const moduleMain = document.createElement("div");
    moduleMain.classList.add("syllabus-text-course-main");
    moduleMain.innerHTML = `${elem.number}. ${elem.name}`;
    const moduleId = elem.number;
    elementModules.append(moduleMain);
    elem.submoduleList.forEach((elem) => {
      const moduleAditional = document.createElement("div");
      moduleAditional.classList.add("syllabus-text-course-additional");
      moduleAditional.innerHTML = `${moduleId}.${elem.number} ${elem.name}`;
      elementModules.append(moduleAditional);
    });
  });
  document.getElementById("preloader").style.display = "none";
}

async function fetchContent() {
  const cachedCourse = localStorage.getItem(`courseData`);
  if (cachedCourse) {
    courseData = JSON.parse(cachedCourse);
    displayLearning();
    displayModules();
  } else {
    try {
      const response = await fetch(
        `https://cryptuna-anderm.amvera.io/v1/course/${paramId}/info`
      );
      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
      courseData = await response.json();
      localStorage.setItem(`courseData`, JSON.stringify(courseData));
      displayLearning();
      displayModules();
    } catch (error) {
      console.error("Ошибка при получении данных о курсе", error);
    }
  }
}

const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const button3 = document.getElementById("button3");
const text = document.querySelector(".course-block-button-text");
const star1 = document.getElementById("star1");
const star2 = document.getElementById("star2");

const modal = document.getElementById("modal");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

// if (idCourse == null) {
//   button1.style.display = "flex";
//   button2.style.display = "none";
//   button3.style.display = "none";
// } else if (Object.keys(idCourse).length !== 0) {
//   button1.style.display = "flex";
//   star1.style.display = "block";
//   button2.style.display = "none";
//   star2.style.display = "none";
//   button3.style.display = "none";

//   for (let key in idCourse) {
//     if (idCourse[key] == paramId) {
//       button1.style.display = "none";
//       star1.style.display = "none";
//       button2.style.display = "flex";
//       star2.style.display = "block";
//       button3.style.display = "flex";
//       break;
//     }
//   }
// }

function setupButtons() {
  let buttonsConfig = [
    { button: button1, show: true },
    { button: star1, show: true },
    { button: button2, show: false },
    { button: button3, show: false },
    { button: star2, show: false },
  ];

  const idCourse = JSON.parse(localStorage.getItem("infoCourse"))?.map(
    (course) => course.id
  );

  if (idCourse && idCourse.includes(Number(paramId))) {
    buttonsConfig[0].show = false; // Hide button1
    buttonsConfig[1].show = false;
    buttonsConfig[2].show = true; // Show button2
    buttonsConfig[3].show = true; // Show button3
    buttonsConfig[4].show = true;
  }

  buttonsConfig.forEach(({ button, show }) => {
    button.style.display = show ? "flex" : "none";
  });
}

setupButtons();

button1.addEventListener("click", function () {
  text.style.animation = "fadeOut 10ms ease";
  star1.style.animation = "fadeOut 50ms ease";
  setTimeout(() => {
    button1.style.animation = "button-course 0.4s ease";
    text.innerText = "";
    star1.style.display = "none";
    setTimeout(() => {
      star2.style.animation = "fadeIn 100ms ease";
      star2.style.display = "block";
      star1.style.animation = "none";
      button1.style.display = "none";
      button1.style.animation = "none";
      button2.style.display = "flex";
      text.style.animation = "none";
      button3.style.animation = "fadeIn 100ms ease";
      button3.style.display = "flex";
      // setTimeout(() => {
      // }, 100);
    }, 400);
  }, 10);
  let addData = JSON.parse(localStorage.getItem("infoCourse"));

  addData.push(courseInfo);
  localStorage.setItem("infoCourse", JSON.stringify(addData));

  postDataAdd();
});

async function postDataAdd() {
  try {
    const response = await fetch(
      `https://cryptuna-anderm.amvera.io/v1/user/favorite-course`,
      {
        method: "POST",
        headers: {
          // 'RqUid': crypto.randomUUID
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataAdd),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

button2.addEventListener("click", function () {
  modal.style.display = "block";
  noButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  document.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  yesButton.addEventListener("click", function () {
    modal.style.display = "none";
    button3.style.animation = "fadeOut 150ms ease";
    setTimeout(() => {
      button3.style.display = "none";
      setTimeout(() => {
        star2.style.animation = "fadeOut 100ms ease";
        setTimeout(() => {
          button2.style.animation =
            "button-favorite 0.5s cubic-bezier(0.385, -0.220, 0.520, 0.840)";
          star2.style.display = "none";
          setTimeout(() => {
            text.style.animation = "fadeIn 50ms ease";
            star1.style.animation = "fadeIn 50ms ease";
            text.innerText = "Поступить на курс";
            star1.style.display = "block";
            button2.style.display = "none";
            button1.style.display = "flex";
            button2.style.animation = "none";
            button3.style.animation = "none";
            setTimeout(() => {
              star1.style.animation = "none";
              star2.style.animation = "none";
              text.style.animation = "none";
            }, 10);
          }, 450);
        }, 50);
      }, 10);
    }, 150);
    let remData = JSON.parse(localStorage.getItem("infoCourse"));
    remData = remData.filter((item) => item.id !== Number(paramId));
    localStorage.setItem("infoCourse", JSON.stringify(remData));

    postDataRemove();
  });
});

async function postDataRemove() {
  try {
    const response = await fetch(
      `https://cryptuna-anderm.amvera.io/v1/user/favorite-course`,
      {
        method: "DELETE",
        headers: {
          // 'RqUid': crypto.randomUUID
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataDel),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

button3.addEventListener("click", function () {
  window.location.href = `syllabus.html?id=${paramId}`;
});

const refer = document.referrer.split("/").pop();
const title = document.getElementById("title");
const favorTab = document.getElementById("favor");
const catalogTab = document.getElementById("catalog");
const link = document.getElementById("ref");

// function setupPage(refer) {
//   const pagesConfig = {
//     "index.html": {
//       linkHref: "favorite.html",
//       titleText: "Мои курсы",
//       tab: favorTab,
//     },
//     "favorite.html": {
//       linkHref: "favorite.html",
//       titleText: "Мои курсы",
//       tab: favorTab,
//     },
//     "catalog.html": {
//       linkHref: "catalog.html",
//       titleText: "Каталог",
//       tab: catalogTab,
//     },
//     "syllabus.html": { // Добавляем обработку syllabus.html
//       linkHref: localStorage.getItem("refer") || "index.html", // Возвращаемся на предыдущую страницу
//       titleText: localStorage.getItem("refer") === "catalog.html" ? "Каталог" : "Мои курсы",
//       tab: localStorage.getItem("refer") === "catalog.html" ? catalogTab : favorTab,
//     },
//   };
//   if (refer.startsWith("syllabus.html")) {
//     const previousRefer = localStorage.getItem("refer");
//     if (previousRefer) {
//       link.href = previousRefer; // Ссылка на предыдущую страницу
//       title.innerText = previousRefer === "catalog.html" ? "Каталог" : "Мои курсы";
//       // tab.style.color = previousRefer === "catalog.html" ? catalogTab : favorTab;
//     }
//     if (previousRefer === "catalog.html") {
//       catalogTab.style.animation = "none";
//       catalogTab.style.color = "#ffffff";
//       favorTab.style.color = ""; // Сбрасываем цвет для вкладки "Мои курсы"
//     } else {
//       favorTab.style.animation = "none";
//       favorTab.style.color = "#ffffff";
//       catalogTab.style.color = ""; // Сбрасываем цвет для вкладки "Каталог"
//     }
//   } else {
//     const config = pagesConfig[refer] || pagesConfig["index.html"];
//     localStorage.setItem("refer", refer);
//     link.href = config.linkHref;
//     title.innerText = config.titleText;
//     config.tab.style.animation = "none";
//     config.tab.style.color = "#ffffff";
//   }
// }

// setupPage(refer);

function setupCatalog() {
  const swipeLink = "catalog.html";
  link.href = "catalog.html";
  title.innerText = "Каталог";
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
}

function setupFavorite() {
  const swipeLink = "favorite.html";
  link.href = "favorite.html";
  title.innerText = "Мои курсы";
  favorTab.style.animation = "none";
  favorTab.style.color = "#ffffff";
}

if (refer == "index.html" || refer == "favorite.html") {
  localStorage.setItem("refer", refer);
  setupFavorite()
} else if (refer == "catalog.html") {
  localStorage.setItem("refer", refer);
  setupCatalog()
} else if (refer.startsWith("syllabus.html")) {
  referSyl = localStorage.getItem("refer");
  link.style.animation = "none";
  if (referSyl == "index.html" || referSyl == "favorite.html") {
    setupFavorite()
  } else if (referSyl == "catalog.html") {
    setupCatalog()
  }
}

const currentTab = sessionStorage.getItem("currentTab");
const currentLink = sessionStorage.getItem("currentLink");
if (currentTab == null && currentLink == null) {
  sessionStorage.setItem("currentTab", refer);
  sessionStorage.setItem("currentLink", window.location.href);
}

link.addEventListener("click", function () {
  sessionStorage.removeItem("currentTab");
  sessionStorage.removeItem("currentLink");
});
if (refer == "catalog.html") {
  catalogTab.addEventListener("click", function () {
    sessionStorage.removeItem("currentTab");
    sessionStorage.removeItem("currentLink");
  });
} else if (refer == "index.html" || refer == "favorite.html") {
  favorTab.addEventListener("click", function () {
    sessionStorage.removeItem("currentTab");
    sessionStorage.removeItem("currentLink");
  });
}


let startX;

document.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
});

document.addEventListener('touchmove', function(e) {
    const moveX = e.touches[0].clientX;
    if (moveX - startX > 100) { // условие для определения свайпа
        window.location.href = swipeLink; // возврат на предыдущую страницу
    }
});