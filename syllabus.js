import fetchData from "./fetch.js";

class SyllabusController {
  constructor(userId, courseId) {
    this.userId = userId;
    this.courseId = courseId;

    this.syllabusUI = new SyllabusUI(this.courseId, "modules");
  }

  async getSyllabus() {
    try {
      const modulesData = await fetchData(
        `course/${this.courseId}/content`,
        "GET",
        {
          "X-User-Id": this.userId,
        }
      );
      this.syllabusUI.displayModules(modulesData.modules);
    } catch (error) {
      console.error("Ошибка при загрузке содержания:", error);
      alert("Не удалось получить содержание, попробуйте позже");
    }
  }
}

class SyllabusUI {
  constructor(courseId, blockId) {
    this.courseId = courseId;
    this.block = document.getElementById(blockId);
  }

  createElement(tag, className, innerHTML) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  displayModules(modulesData) {
    this.block.innerHTML = "";
    if (!modulesData || !modulesData.length) {
      this.block.innerHTML = "<p>Содержание недоступно</p>";
      document.getElementById("preloader").style.display = "none";
      return;
    }
    modulesData.forEach((module) => {
      const moduleMain = this.createElement("div", "syllabus-modules-main");
      const moduleMainText = this.createElement(
        "div",
        "syllabus-name-main",
        `${module.number}. ${module.name}`
      );
      moduleMain.append(moduleMainText);
      this.block.append(moduleMain);

      const moduleAditional = this.createElement(
        "div",
        "syllabus-modules-aditional"
      );
      this.block.append(moduleAditional);

      module.submodules.forEach((submodule) => {
        const submoduleLink = this.createElement(
          "a",
          "syllabus-name-aditional",
          `${module.number}.${submodule.number} ${submodule.name}`
        );

        submoduleLink.href = `step.html?v=1.0.7&courseId=${this.courseId}&submoduleId=${submodule.id}&stepNumber=1`;

        const stepProgress = this.createElement(
          "div",
          "syllabus-step-pogress",
          `${submodule.completedStepsCount}/${submodule.totalStepsCount}`
        );
        submoduleLink.append(stepProgress);
        moduleAditional.append(submoduleLink);
      });
    });
    document.getElementById("preloader").style.display = "none";
  }
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const courseId = Number(urlParams.get("courseId"));

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id ?? 1;

const syllabus = new SyllabusController(userId, courseId);
syllabus.getSyllabus();

const refer = localStorage.getItem("refer");
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
  setupFavorite();
} else if (refer.endsWith("catalog.html")) {
  setupCatalog();
}
