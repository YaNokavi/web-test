var request = new XMLHttpRequest();
request.open("POST", "http://blabl/hello?userId=1");
request.send(`${tg.initDataUnsafe.user.id}`);

request.open("GET", url);
request.responseType = "json";
request.send();

request.onload = function () {
  var coursesText = request.response;
  var courses = JSON.parse(coursesText);
  showCourses(courses);
};

function showCourses(jsonObj) {}