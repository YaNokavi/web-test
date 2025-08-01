import fetchData from "./fetch.js";

localStorage.removeItem("courseData");

const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id ?? 1;

async function fetchCourses() {
  const coursesData = await fetchData("course/all", "GET", {
    "X-User-Id": userId,
  });
  displayCourses(coursesData);
}

fetchCourses();

function setupFavoriteCourse(courseData) {
  const addMark = document.getElementById(`favoriteMark${courseData.id}`);

  if (courseData.favorite === true && addMark) {
    const favoriteDiv = document.createElement("div");
    favoriteDiv.className = "courses-block-favorite";
    favoriteDiv.style.display = "flex";

    favoriteDiv.innerHTML = `
      <svg
        class="courses-block-favorite-icon"
        width="17"
        height="17"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.5 3H6.5C5.96957 3 5.46086 3.21071 5.08579 3.58579C4.71071 3.96086 4.5 4.46957 4.5 5V19C4.5 19.5304 4.71071 20.0391 5.08579 20.4142C5.46086 20.7893 5.96957 21 6.5 21H12.5M8.5 3V12L11.5 9L14.5 12V3M8.5 3H14.5M14.5 3H18.5C19.0304 3 19.5391 3.21071 19.9142 3.58579C20.2893 3.96086 20.5 4.46957 20.5 5V12M17 19L19 21L22 16"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;
    addMark.appendChild(favoriteDiv);
  }
}

function displayCourses(coursesData) {
  document.getElementById("preloader").style.display = "none";
  const coursesDiv = document.getElementById("courses");
  let rating = null;
  coursesData.forEach((course, index) => {
    rating = course.rating;

    const formattedRating = Number.isInteger(rating)
      ? rating.toString()
      : rating.toFixed(1);

    setTimeout(() => {
      const courseElement = document.createElement("a");
      courseElement.href = `courses.html?id=${course.id}`;
      courseElement.classList.add("courses-block");
      courseElement.innerHTML = `
          <img src="${course.iconUrl}" class="courses-logo" />
            <div class="courses-block-text">
          <div class="courses-block-name" id="favoriteMark${course.id}" style="flex-direction: row;">${course.name}  
          </div>
          <div class="courses-block-description">
            ${course.description}
          </div>
          <div class="courses-block-author-rating">
            <div class="courses-block-author">Автор: @${course.author}</div>
            <div class="courses-block-rating">${formattedRating}/5</div>
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
      setupFavoriteCourse(course);
    }, (index + 1) * 100);
  });
}

// function displayNotification() {
//   const notification = document.getElementById("notification");
//   const notificationBalance = document.getElementById("notification-balance");
//   notificationBalance.innerText = "Курс в разработке";

//   notification.classList.add("show");
//   setTimeout(() => {
//     tg.HapticFeedback.notificationOccurred("warning");
//   }, 350);

//   setTimeout(() => {
//     notification.classList.remove("show");
//   }, 2000);
// }

let refer = document.referrer.split("/").pop();
refer = refer.split("?")[0];
const title = document.getElementById("title");
const catalogTab = document.getElementById("active");

if (
  refer.endsWith("courses.html") ||
  refer.endsWith("syllabus.html") ||
  refer.endsWith("step.html")
) {
  title.style.animation = "none";
  catalogTab.style.animation = "none";
  catalogTab.style.color = "#ffffff";
}
