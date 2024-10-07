var xhr = new XMLHttpRequest();
// request.open("POST", "http://blabl/hello?userId=1");
// request.send(`${tg.initDataUnsafe.user.id}`);

xhr.open("GET", "https://cryptuna-anderm.amvera.io/course/all");
xhr.responseType = "json";

xhr.onload = function () {
  if (xhr.status === 200) {
    const courses = JSON.parse(xhr.responseText);
    const coursesDiv = document.getElementById("courses");
    courses.forEach((course) => {
      const courseElement = document.createElement("a");
      courseElement.href = "course.html";
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
            <div class="courses-block-author">${course.author}</div>
            <div class="courses-block-rating">${rating}/5</div>
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
    });
  } else {
    console.error("Ошибка при получении курсов:", xhr.statusText);
  }
};

xhr.onerror = function () {
  console.error("Ошибка сети.");
};

xhr.send();

// function showCourses(jsonObj) {}
