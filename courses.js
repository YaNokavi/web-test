import fetchData from "./fetch.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const courseId = Number(urlParams.get("id"));

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id ?? 1;

const courseElement = document.getElementById("info");
const ratingCourse = document.getElementById("rating");
const amountComments = document.getElementById("amount-comments");

function displayCourseInfo(course) {
  let author = course.author;

  if (author.length >= 15) {
    author = author.slice(0, 15) + "...";
  }

  courseElement.innerHTML = `
  <div class="course-media">
    
    <img src="${course.iconUrl}" class="course-logo" />
    <a href="https://t.me/${course.author}" class="course-block-author">Автор: @${author}</a>
    </div>
    <div class="course-block-description">
      <div class="course-block-name">${course.name}</div>
      ${course.description}
    </div>
  `;
}

const lastStepBlock = document.getElementById("last-step-block");
const lastStepHref = document.getElementById("last-step");

async function displayLastStep(lastStepArray) {
  lastStepBlock.style.display = "flex";
  lastStepHref.innerHTML = `${lastStepArray.submoduleName} - ${lastStepArray.number} шаг`;
  lastStepHref.href = `step.html?courseId=${courseId}&submoduleId=${lastStepArray.submoduleId}&stepNumber=${lastStepArray.number}`;
}

function displayLearning(learningOutcomes) {
  document.getElementById("learnings-block").style.display = "flex";
  const elementLearning = document.getElementById("points");
  elementLearning.innerHTML = "";
  learningOutcomes.forEach((elem) => {
    const pointElement = document.createElement("div");
    pointElement.style.display = "flex";
    pointElement.style.marginBottom = "10px";
    pointElement.innerHTML = `•&nbsp&nbsp`;
    const pointElementText = document.createElement("div");
    pointElementText.style.display = "flex";
    pointElementText.innerHTML = `${elem}`;
    pointElement.append(pointElementText);
    elementLearning.append(pointElement);
  });
}

function displayModules(courseModulesInfo) {
  const elementModules = document.getElementById("modules");
  elementModules.innerHTML = "";
  courseModulesInfo.forEach((elem) => {
    const moduleMain = document.createElement("div");
    moduleMain.className = "syllabus-text-course-main toggle";
    moduleMain.innerHTML = `${elem.name}`;

    const svgIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svgIcon.setAttribute("width", "17");
    svgIcon.setAttribute("height", "11");
    svgIcon.setAttribute("viewBox", "0 0 17 11");
    svgIcon.setAttribute("fill", "none");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    path.setAttribute(
      "d",
      "M9.35907 1.30377L16.1946 8.37502L14.486 10.1425L8.50477 3.95502L2.52352 10.1425L0.814941 8.37502L7.65048 1.30377C7.87708 1.06943 8.18437 0.937784 8.50477 0.937784C8.82518 0.937784 9.13247 1.06943 9.35907 1.30377Z"
    );
    path.setAttribute("fill", "#A6A6A6");

    svgIcon.appendChild(path);
    svgIcon.classList.add("toggle-icon");

    moduleMain.appendChild(svgIcon);
    elementModules.append(moduleMain);

    const moduleAditional = document.createElement("ol");
    moduleAditional.style.margin = 0;
    moduleAditional.style.paddingLeft = "20px";

    elem.submoduleNames.forEach((subElem) => {
      const subText = document.createElement("li");
      subText.classList.add("syllabus-text-course-additional");
      subText.innerText = subElem;
      moduleAditional.append(subText);
    });
    elementModules.append(moduleAditional);

    moduleMain.addEventListener("click", () => {
      const computedStyle = window.getComputedStyle(moduleAditional);
      if (computedStyle.display === "none") {
        moduleAditional.style.display = "block";
      } else {
        moduleAditional.style.display = "none";
      }

      svgIcon.classList.toggle("rotated");
    });
  });
}

function getReviewWord(count) {
  count = Math.abs(count) % 100;
  const lastDigit = count % 10;

  if (count > 10 && count < 20) {
    return "отзывов";
  }
  if (lastDigit > 1 && lastDigit < 5) {
    return "отзыва";
  }
  if (lastDigit === 1) {
    return "отзыв";
  }
  return "отзывов";
}

function displayRating(ratingInfo) {
  const rating = ratingInfo.rating;

  const formattedRating = Number.isInteger(rating)
    ? rating.toString()
    : rating.toFixed(1);
  ratingCourse.innerText = `${formattedRating}/5`;

  const count = ratingInfo.reviewsTotalNumber;
  amountComments.innerText = `${count} ${getReviewWord(count)}`;

  const detailed = ratingInfo.detailedRatingTotalNumber;
  const total = Object.values(detailed).reduce((sum, v) => sum + v, 0);

  const progressBlocks = document.querySelectorAll(".progress-block-elem");

  const values = [
    detailed[5],
    detailed[4],
    detailed[3],
    detailed[2],
    detailed[1],
  ];

  progressBlocks.forEach((block, idx) => {
    const progress = block.querySelector("progress");
    const value = values[idx] || 0;
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    progress.value = percent;
  });
}

let lastStepArray = null;
async function fetchContent() {
  const courseData = await fetchData(`course/${courseId}/info`, "GET", {
    "X-User-Id": userId,
  });
  localStorage.setItem("courseData", JSON.stringify(courseData));

  if (courseData.lastCompletedStep) {
    lastStepArray = courseData.lastCompletedStep;
    if (courseData.favorite) {
      displayLastStep(lastStepArray);
    }
  }
  setupButtons(courseData.favorite);
  displayCourseInfo(courseData);
  if (courseData.learningOutcomes.length !== 0) {
    displayLearning(courseData.learningOutcomes);
  }

  displayModules(courseData.courseModulesInfo);
  displayRating(courseData.ratingInfo);
}

fetchContent();

const addCourseButton = document.getElementById("add-cours-button");
const leaveCourseButton = document.getElementById("leave-course-button");
const goCourseButton = document.getElementById("go-course-button");
const buttonHrefComments = document.getElementById("button-href-comments");

const text = document.querySelector(".course-block-button-text");
const star1 = document.getElementById("star1");
const star2 = document.getElementById("star2");

const modal = document.getElementById("modal");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

buttonHrefComments.addEventListener("click", function () {
  window.location.href = `rating.html?v=103&idCourse=${courseId}`;
});

function setupButtons(isFavorite) {
  let buttonsConfig = [
    { button: addCourseButton, show: true },
    { button: star1, show: true },
    { button: leaveCourseButton, show: false },
    { button: goCourseButton, show: false },
    { button: star2, show: false },
  ];

  if (isFavorite === true) {
    buttonsConfig[0].show = false;
    buttonsConfig[1].show = false;
    buttonsConfig[2].show = true;
    buttonsConfig[3].show = true;
    buttonsConfig[4].show = true;
  }

  buttonsConfig.forEach(({ button, show }) => {
    button.style.display = show ? "flex" : "none";
  });

  setTimeout(() => {
    document.getElementById("preloader").style.display = "none";
  }, 100);
}

addCourseButton.addEventListener("click", async function () {
  animateCourseButton("ADD");
  const response = await postDataAdd();
  if (response !== 0) {
    if (lastStepArray) {
      displayLastStep(lastStepArray);
    }
  } else {
    lastStepBlock.style.display = "none";
    animateCourseButton("LEAVE");
  }
});

async function postDataAdd() {
  try {
    const body = {
      courseId: courseId,
    };
    const response = await fetchData(
      `user/favorite-course`,
      "POST",
      { "X-User-Id": userId },
      body,
      false
    );

    // if (response === 200) {
    //   if (lastStepArray !== null && lastStepArray[courseId]) {
    //     displayLastStep(lastStepArray, courseData);
    //   }
    // }
  } catch {
    alert("Не удалось установить соединение с сервером");
    return 0;
  }
}

leaveCourseButton.addEventListener("click", function () {
  modal.style.display = "block";
});

noButton.addEventListener("click", function () {
  modal.style.display = "none";
});

document.addEventListener("click", function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

function animateCourseButton(type) {
  if (type === "ADD") {
    text.style.animation = "fadeOut 10ms ease";
    star1.style.animation = "fadeOut 50ms ease";
    setTimeout(() => {
      addCourseButton.style.animation = "button-course 0.4s ease";
      text.innerText = "";
      star1.style.display = "none";
      setTimeout(() => {
        star2.style.animation = "fadeIn 100ms ease";
        star2.style.display = "block";
        star1.style.animation = "none";
        addCourseButton.style.display = "none";
        addCourseButton.style.animation = "none";
        leaveCourseButton.style.display = "flex";
        text.style.animation = "none";
        goCourseButton.style.animation = "fadeIn 100ms ease";
        goCourseButton.style.display = "flex";
      }, 400);
    }, 10);
  } else if (type === "LEAVE") {
    goCourseButton.style.animation = "fadeOut 150ms ease";
    setTimeout(() => {
      goCourseButton.style.display = "none";
      setTimeout(() => {
        star2.style.animation = "fadeOut 100ms ease";
        setTimeout(() => {
          leaveCourseButton.style.animation =
            "button-favorite 0.5s cubic-bezier(0.385, -0.220, 0.520, 0.840)";
          star2.style.display = "none";
          setTimeout(() => {
            text.style.animation = "fadeIn 50ms ease";
            star1.style.animation = "fadeIn 50ms ease";
            text.innerText = "Поступить на курс";
            star1.style.display = "block";
            leaveCourseButton.style.display = "none";
            addCourseButton.style.display = "flex";
            leaveCourseButton.style.animation = "none";
            goCourseButton.style.animation = "none";
            setTimeout(() => {
              star1.style.animation = "none";
              star2.style.animation = "none";
              text.style.animation = "none";
            }, 10);
          }, 450);
        }, 50);
      }, 10);
    }, 150);
  }
}

yesButton.addEventListener("click", async function () {
  modal.style.display = "none";
  animateCourseButton("LEAVE");
  const response = await postDataRemove();
  if (response !== 0) {
    lastStepBlock.style.display = "none";
  } else {
    animateCourseButton("ADD");
  }
});

async function postDataRemove() {
  try {
    const body = {
      courseId: courseId,
    };
    const response = await fetchData(
      `user/favorite-course`,
      "DELETE",
      { "X-User-Id": userId },
      body,
      false
    );

    // if (response === 200) {
    //   if (lastStepArray !== null && lastStepArray[courseId]) {
    //     lastStepBlock.style.display = "none";
    //   }
    // }
  } catch {
    alert("Не удалось установить соединение с сервером");
    return 0;
  }
}

goCourseButton.addEventListener("click", function () {
  window.location.href = `syllabus.html?v=103&id=${courseId}`;
});

var refer = document.referrer.split("/").pop();
refer = refer.split("?")[0];
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
  localStorage.setItem("refer", refer);
  setupFavorite();
} else if (refer.endsWith("catalog.html")) {
  localStorage.setItem("refer", refer);
  setupCatalog();
} else if (refer.endsWith("syllabus.html") || refer.endsWith("rating.html")) {
  let referSyl = localStorage.getItem("refer");
  if (referSyl.endsWith("favorite.html")) {
    setupFavorite();
  } else if (referSyl.endsWith("catalog.html")) {
    setupCatalog();
  }
}
