let favoriteCoursesData = [];

async function fetchCourses() {
  const cachedCourses = localStorage.getItem("favoriteCoursesData");

  if (cachedCourses) {
    // Если данные есть, парсим их и сохраняем в переменной
    favoriteCoursesData = JSON.parse(cachedCourses);
    displayCourses(); // Отображаем курсы
  } else {
    try {
      const response = await fetch(
        "https://"
      );
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }
      favoriteCoursesData = await response.json(); // Сохраняем данные в переменной
      if (favoriteCoursesData != null) {
        localStorage.setItem(
          "favoriteCoursesData",
          JSON.stringify(favoriteCoursesData)
        );
        displayCourses(); // Вызываем функцию для отображения курсов
      } else {
        displayButton();
      }
    } catch (error) {
      console.error("Ошибка при получении курсов:", error);
    }
  }
}

function displayCourses() {
  const coursesDiv = document.getElementById("favorite-courses");
  coursesDiv.innerHTML = "";
  coursesData.forEach((course) => {
    const courseElement = document.createElement("a");
    courseElement.href = `courses/${course.id}.html`;
    courseElement.classList.add("courses-block");
    courseElement.innerHTML = `
            <div class="courses-logo"
          style="background-image: url(icons/logo_cuna.jpg)"></div>
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

    localStorage.setItem(`${course.id}-course`, JSON.stringify(course));
  });
}

function displayButton() {
  const coursesDiv = document.getElementById("favorite-courses");
  coursesDiv.innerHTML = "";
  const courseElement = "";
  courseElement.innerHTML = `
            <div class="favorite-courses-enable">
        <div class="favorite-courses-enable-title">У вас еще нет курсов</div>
        <a href="catalog.html" class="favorite-courses-enable-button">
          <div class="favorite-courses-enable-button-text">Добавить курс</div>
          <svg
            class="favorite-courses-enable-button-icon"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.9998 7V15M6.99959 11H15M21.0003 11C21.0003 16.5228 16.523 21 10.9998 21C5.47666 21 0.999268 16.5228 0.999268 11C0.999268 5.47715 5.47666 1 10.9998 1C16.523 1 21.0003 5.47715 21.0003 11Z"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
      </div>
        `;
  coursesDiv.append(courseElement);
}

fetchCourses();
