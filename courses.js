import fetchData from "./fetch.js";


class Course {
  constructor(data) {
    this.data = data;
  }

  get authorShort() {
    let author = this.data.author || "";
    return author.length > 15 ? author.slice(0, 15) + "..." : author;
  }

  get lastCompletedStep() {
    return this.data.lastCompletedStep || null;
  }

  get favorite() {
    return this.data.favorite || false;
  }

  get learningOutcomes() {
    return this.data.learningOutcomes || [];
  }

  get courseModulesInfo() {
    return this.data.courseModulesInfo || [];
  }

  get ratingInfo() {
    return (
      this.data.ratingInfo || {
        rating: 0,
        reviewsTotalNumber: 0,
        detailedRatingTotalNumber: {},
      }
    );
  }
}

class CourseUI {
  constructor(course, courseId) {
    this.course = course;
    this.courseId = courseId;

    this.courseElement = document.getElementById("info");
    this.ratingCourse = document.getElementById("rating");
    this.amountComments = document.getElementById("amount-comments");

    this.lastStepBlock = document.getElementById("last-step-block");
    this.lastStepHref = document.getElementById("last-step");
  }

  displayCourseInfo() {
    const author = this.course.authorShort;
    const data = this.course.data;

    this.courseElement.innerHTML = `
      <div class="course-media">
        <img src="${data.iconUrl}" class="course-logo" />
        <a href="https://t.me/${data.author}" class="course-block-author">Автор: @${author}</a>
      </div>
      <div class="course-block-description">
        <div class="course-block-name">${data.name}</div>
        ${data.description}
      </div>
    `;
  }

  displayLastStep() {
    const step = this.course.lastCompletedStep;
    if (!step) {
      this.lastStepBlock.style.display = "none";
      return;
    }
    this.lastStepBlock.style.display = "flex";
    this.lastStepHref.innerHTML = `${step.submoduleName} - ${step.number} шаг`;
    this.lastStepHref.href = `step.html?v=1.0.7&courseId=${this.courseId}&submoduleId=${step.submoduleId}&stepNumber=${step.number}`;
  }

  displayLearning() {
    const learningOutcomes = this.course.learningOutcomes;
    if (learningOutcomes.length === 0) return;

    const learnBlock = document.getElementById("learnings-block");
    learnBlock.style.display = "flex";
    const points = document.getElementById("points");
    points.innerHTML = "";

    learningOutcomes.forEach((point) => {
      const pointElem = document.createElement("div");
      pointElem.style.display = "flex";
      pointElem.innerHTML = `•&nbsp&nbsp`;
      const textElem = document.createElement("div");
      textElem.style.display = "flex";
      textElem.innerHTML = point;
      pointElem.append(textElem);
      points.append(pointElem);
    });
  }

  displayModules() {
    const modules = this.course.courseModulesInfo;
    const elementModules = document.getElementById("modules");
    elementModules.innerHTML = "";

    modules.forEach((mod) => {
      const moduleMain = document.createElement("div");
      moduleMain.className = "syllabus-text-course-main toggle";
      moduleMain.innerHTML = mod.name;

      const svgIcon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svgIcon.setAttribute("width", "17");
      svgIcon.setAttribute("height", "11");
      svgIcon.setAttribute("viewBox", "0 0 17 11");
      svgIcon.setAttribute("fill", "none");

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
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

      const moduleAdditional = document.createElement("ol");
      moduleAdditional.style.margin = 0;

      mod.submoduleNames.forEach((subName) => {
        const subText = document.createElement("li");
        subText.classList.add("syllabus-text-course-additional");
        subText.innerText = subName;
        moduleAdditional.append(subText);
      });

      elementModules.append(moduleAdditional);

      moduleMain.addEventListener("click", () => {
        const computedStyle = window.getComputedStyle(moduleAdditional);
        if (computedStyle.display === "none") {
          moduleAdditional.style.display = "flex";
        } else {
          moduleAdditional.style.display = "none";
        }
        svgIcon.classList.toggle("rotated");
      });
    });
  }

  getReviewWord(count) {
    count = Math.abs(count) % 100;
    const lastDigit = count % 10;

    if (count > 10 && count < 20) return "отзывов";
    if (lastDigit > 1 && lastDigit < 5) return "отзыва";
    if (lastDigit === 1) return "отзыв";
    return "отзывов";
  }

  displayRating() {
    const ratingInfo = this.course.ratingInfo;
    const rating = ratingInfo.rating;
    const formattedRating = Number.isInteger(rating)
      ? rating.toString()
      : rating.toFixed(1);
    this.ratingCourse.innerText = `${formattedRating}/5`;

    const count = ratingInfo.reviewsTotalNumber;
    this.amountComments.innerText = `${count} ${this.getReviewWord(count)}`;

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

  hidePreloader() {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.style.display = "none";
    }
  }
}

class CourseController {
  constructor(courseId, userId) {
    this.courseId = courseId;
    this.userId = userId;
    this.course = null;
    this.ui = null;
    this.buttons = new CourseButtons();

    this.buttons.onAddCourse = this.addCourse.bind(this);
    this.buttons.onLeaveCourse = this.leaveCourse.bind(this);
    this.buttons.onGoCourse = this.goCourse.bind(this);
  }

  async loadCourse() {
    try {
      const courseData = await fetchData(
        `course/${this.courseId}/info`,
        "GET",
        {
          "X-User-Id": this.userId,
        }
      );
      this.course = new Course(courseData);
      this.ui = new CourseUI(this.course, this.courseId);
    } catch (error) {
      alert("Ошибка при загрузке данных курса");
      return;
    }
  }

  displayAll() {
    if (!this.course || !this.ui) return;

    if (this.course.favorite && this.course.lastCompletedStep) {
      this.ui.displayLastStep();
    }
    this.ui.displayCourseInfo();
    this.ui.displayLearning();
    this.ui.displayModules();
    this.ui.displayRating();
    this.buttons.setupButtons(this.course.favorite);

    this.ui.hidePreloader();
  }

  async fetchAndDisplay() {
    await this.loadCourse();
    this.displayAll();
  }

  async addCourse() {
    // Логика добавления в избранное с запросом и обновлением UI
    try {
      const body = { courseId: this.courseId };
      const responce = await fetchData(
        `user/favorite-course`,
        "POST",
        { "X-User-Id": this.userId },
        body,
        false
      );
      // Обновляем состояние курса и интерфейс

      if (responce === 200) {
        this.course.data.favorite = true;
        if (this.course.lastCompletedStep) {
          this.ui.displayLastStep();
        }

        return responce;
      }
    } catch {
      alert("Не удалось установить соединение с сервером");
    }
  }

  async leaveCourse() {
    // Логика удаления из избранного с запросом и обновлением UI
    try {
      const body = { courseId: this.courseId };
      const responce = await fetchData(
        `user/favorite-course`,
        "DELETE",
        { "X-User-Id": this.userId },
        body,
        false
      );

      // Обновляем состояние курса и интерфейс
      if (responce === 200) {
        this.course.data.favorite = false;
        this.ui.lastStepBlock.style.display = "none";
        return responce;
      }
    } catch {
      alert("Не удалось установить соединение с сервером");
      return 0;
    }
  }

  goCourse() {
    // Переход к курсу
    window.location.href = `syllabus.html?v=1.0.7&courseId=${this.courseId}`;
  }
}

class CourseButtons {
  constructor() {
    this.addCourseButton = document.getElementById("add-course-button");
    this.leaveCourseButton = document.getElementById("leave-course-button");
    this.goCourseButton = document.getElementById("go-course-button");
    this.buttonHrefComments = document.getElementById("button-href-comments");
    this.buttonsBlock = document.getElementById("buttons-block");

    this.text = document.querySelector(".course-block-button span");
    this.star1 = document.getElementById("star1");
    this.star2 = document.getElementById("star2");

    this.modal = document.getElementById("modal");
    this.yesButton = document.getElementById("yesButton");
    this.noButton = document.getElementById("noButton");

    this._bindEvents();
  }

  _bindEvents() {
    this.buttonHrefComments.addEventListener("click", () => {
      window.location.href = `rating.html?v=1.0.7&courseId=${courseId}`;
    });

    this.addCourseButton.addEventListener("click", async () => {
      this.animateCourseButton("ADD");
      const responce = await this.onAddCourse();
      if (responce === 200) {
        this.enableButtons();
      } else {
        this.animateCourseButton("LEAVE");
        this.enableButtons();
      }
    });

    this.leaveCourseButton.addEventListener("click", () => {
      this.showModal(true);
    });

    this.noButton.addEventListener("click", () => {
      this.showModal(false);
    });

    this.yesButton.addEventListener("click", async () => {
      this.showModal(false);
      this.animateCourseButton("LEAVE");
      const response = await this.onLeaveCourse();
      if (response === 200) {
        this.enableButtons();
      } else {
        this.animateCourseButton("ADD");
        this.enableButtons();
      }
    });

    document.addEventListener("click", (event) => {
      if (event.target === this.modal) {
        this.showModal(false);
      }
    });

    this.goCourseButton.addEventListener("click", () => {
      this.onGoCourse && this.onGoCourse();
    });
  }

  showModal(show) {
    this.modal.style.display = show ? "block" : "none";
  }

  setupButtons(isFavorite) {
    const buttonsConfig = [
      { button: this.addCourseButton, show: !isFavorite },
      { button: this.star1, show: !isFavorite },
      { button: this.buttonsBlock, show: isFavorite },
      { button: this.leaveCourseButton, show: isFavorite },
      { button: this.goCourseButton, show: isFavorite },
      { button: this.star2, show: isFavorite },
    ];

    buttonsConfig.forEach(({ button, show }) => {
      button.style.display = show ? "flex" : "none";
    });
  }

  disableButtons() {
    this.addCourseButton.style.pointerEvents = "none";
    this.goCourseButton.style.pointerEvents = "none";
    this.leaveCourseButton.style.pointerEvents = "none";
  }

  enableButtons() {
    this.addCourseButton.style.pointerEvents = "auto";
    this.goCourseButton.style.pointerEvents = "auto";
    this.leaveCourseButton.style.pointerEvents = "auto";
  }

  animateCourseButton(type) {
    if (type === "ADD") {
      this.disableButtons();
      this.text.style.animation = "fade-out 10ms ease";
      this.star1.style.animation = "fade-out 10ms ease";

      setTimeout(() => {
        this.addCourseButton.style.animation = "button-course 0.4s ease";
        this.text.innerText = "";
        this.star1.style.display = "none";
        setTimeout(() => {
          this.star2.style.animation = "fade-in 100ms ease";
          this.star2.style.display = "block";
          this.star1.style.animation = "none";
          this.addCourseButton.style.display = "none";
          this.addCourseButton.style.animation = "none";
          this.leaveCourseButton.style.display = "flex";
          this.text.style.animation = "none";
          this.goCourseButton.style.animation = "fade-in 200ms ease";
          this.goCourseButton.style.display = "flex";
          this.buttonsBlock.style.display = "flex";
        }, 400);
      }, 10);
    } else if (type === "LEAVE") {
      this.disableButtons();
      this.goCourseButton.style.animation = "fade-out 150ms ease";

      setTimeout(() => {
        this.leaveCourseButton.style.marginLeft = "auto";
        this.goCourseButton.style.display = "none";
        this.star2.style.animation = "fade-out 100ms ease";

        setTimeout(() => {
          this.leaveCourseButton.style.animation =
            "button-favorite .4s cubic-bezier(0.385, -0.220, 0.520, 0.840)";
          this.star2.style.display = "none";

          setTimeout(() => {
            this.text.style.animation = "fade-in 50ms ease";
            this.star1.style.animation = "fade-in 50ms ease";
            this.text.innerText = "Поступить на курс";
            this.star1.style.display = "block";
            this.leaveCourseButton.style.display = "none";
            this.addCourseButton.style.display = "flex";
            this.leaveCourseButton.style.animation = "none";
            this.goCourseButton.style.animation = "none";
            this.buttonsBlock.style.display = "none";

            setTimeout(() => {
              this.leaveCourseButton.style.marginLeft = "-30px";
              this.star1.style.animation = "none";
              this.star2.style.animation = "none";
              this.text.style.animation = "none";
            }, 10);
          }, 350);
        }, 100);
      }, 150);
    }
  }
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const courseId = Number(urlParams.get("courseId"));

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id ?? 1;

const controller = new CourseController(courseId, userId);
controller.fetchAndDisplay();

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
} else if (
  refer.endsWith("syllabus.html") ||
  refer.endsWith("rating.html") ||
  !refer
) {
  let referSyl = localStorage.getItem("refer");
  if (referSyl.endsWith("favorite.html")) {
    setupFavorite();
  } else if (referSyl.endsWith("catalog.html")) {
    setupCatalog();
  }
}
