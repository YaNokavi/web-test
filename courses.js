const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const paramId = urlParams.get("id");
var courseInfo = JSON.parse(localStorage.getItem(`${paramId}-course`));

var userid = localStorage.getItem("userIdData");

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

const courseElement = document.getElementById("info");
courseElement.innerHTML = `
            <div class="course-block-author">Автор: @${courseInfo.author}</div>
          <div class="course-block-description">
            <img src="icons/logo_cuna.jpg" class="course-logo" />
            <div class="course-block-name">${courseInfo.name}</div>
            ${courseInfo.description}
          </div>
        `;

const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const button3 = document.getElementById("button3");
const text = document.querySelector(".course-block-button-text");
const star1 = document.getElementById("star1");
const star2 = document.getElementById("star2");

const modal = document.getElementById("modal");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

if (Object.keys(idCourse).length === 0) {
  button1.style.display = "flex";
  button2.style.display = "none";
  button3.style.display = "none";
} else if (Object.keys(idCourse).length !== 0) {
  button1.style.display = "flex";
  star1.style.display = "block";
  button2.style.display = "none";
  star2.style.display = "none";
  button3.style.display = "none";

  for (let key in idCourse) {
    if (idCourse[key] == paramId) {
      button1.style.display = "none";
      star1.style.display = "none";
      button2.style.display = "flex";
      star2.style.display = "block";
      button3.style.display = "flex";
      break;
    }
  }
}

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
      `https://cryptuna-anderm.amvera.io/user/${userid}/favorite/add?courseId=${paramId}`,
      {
        method: "POST",
        // headers: {
        //   'RqUid': crypto.randomUUID
        // }
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
            button3.style.animation = "none"
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
      `https://cryptuna-anderm.amvera.io/user/${userid}/favorite/remove?courseId=${paramId}`,
      {
        method: "POST",
        // headers: {
        //   'RqUid': crypto.randomUUID
        // }
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

var refer = document.referrer.split("/").pop();

var title = document.getElementById("title");
var favorTab = document.getElementById("favor");
var catalogTab = document.getElementById("catalog");
var link = document.getElementById("ref");

if (refer == "index.html" || refer == "favorite.html") {
  localStorage.setItem("refer", refer);
  link.href = "favorite.html";
  title.innerText = "Мои курсы";
  favorTab.style.animation = "none";
  favorTab.style.color = "#ffffff";
} else if (refer == "catalog.html") {
  localStorage.setItem("refer", refer);
  link.href = "catalog.html";
  title.innerText = "Каталог";
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
} else if ((refer = `syllabus.html?id=${paramId}`)) {
  refer = localStorage.getItem("refer");
  link.style.animation = "none";
  if (refer == "index.html" || refer == "favorite.html") {
    link.href = "favorite.html";
    title.innerText = "Мои курсы";
    favorTab.style.animation = "none";
    favorTab.style.color = "#ffffff";
  } else if (refer == "catalog.html") {
    link.href = "catalog.html";
    title.innerText = "Каталог";
    catalogTab.style.animation = "none";
    catalogTab.style.color = "#ffffff";
  }
}
