let tg = window.Telegram.WebApp; //нужно получить объект window.Telegram.WebApp Телеграмма


// tg.setHeaderColor = '#1468B1';
// tg.setBackgroundColor = '#efeff4';
// tg.colorScheme = 'light';
tg.expand();

// tg.themeParams.bottom_bar_bg_color = "#1468B1";
//tg.backgroundColor = "#EFEFF4";
// tg.headerColor = "#1468B1";
// tg.bottomBarColor = "#1468B1";
// tg.backgroudColor = "#efeff4";
// tg.colorScheme = "light";

//разворачиваем на все окно

//tg.bottomBarColor = "#1468B1";

// .remove .add

//  tg.MainButton.text = "Кнопка ChatLabst"; //Задаем текст кнопки
//  tg.MainButton.setText("ChatLabs на кнопке"); //Меняем текст на кнопке веббота в Телеграмме
//  tg.MainButton.textColor = "#ff0000"; //Указываем цвет текста, а в данном случае выбран 100% красный
//  tg.MainButton.color = "#ffffff"; //Делаем бэкграунд кнопки 100% белым
//  tg.MainButton.setParams({"color": "#000000"}); // Изменяем все параметры
//  let button = document.getElementById("button"); //Используем getElementById, чтобы получить кнопку, которую сделали выше и которой присвоили id и class
//  button.addEventListener('click', function(){ //Используем addEventListener, чтобы слушать клик по кнопке
//   //потом здесь че то будет
//  });
//tg.MainButton.show()

//  let btnEdit = document.getElementById("btnEdit"); //Используем getElementById, чтобы получить кнопку и активировать/деактивировать
//  btnEdit.addEventListener('click', function(){ //Слушаем при помощи addEventListener клик на кнопку
//     if (tg.MainButton.isActive){ //Если наша кнопка активна
//        tg.MainButton.setParams({"color": "#ffffff"}); //Заменяем цвет на белый
//        tg.MainButton.disable() //Скрываем кнопку
//     }
//     else{ //В противном случае
//        tg.MainButton.setParams({"color": "#0000ff"}); //Заменяем цвет на синий
//        tg.MainButton.enable() //Отображаем в веб-боте TelegramWebApp
//     }
//  });

//  Telegram.WebApp.onEvent('mainButtonClicked', function(){
//     tg.sendData("Проверяем событие onEvent. Если был клик по кнопке, то отправляем данные при помощи sendData в виде данной строки");
//      });

//  let tabitems = document.querySelectorAll(".tab-item");
//  let tablabel = document.querySelectorAll(".tab-label");
//  tabitems.forEach(function (el) {
//    el.addEventListener("click", function () {
//     for (let i = 0; i < 4; i++) {
//       if (tablabel[i].innerText == "Друзья") {
//         alert("Друзья");

//       }
//       else if (tablabel[i].innerText == "Каталог"){
//         alert("Каталог");

//       }
//     }

//    });
//  });


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

//    let usercard = document.getElementById("usercard"); //Используем getElementById, чтобы получить карточку пользователя

//    let profileName = document.createElement("p"); //При помощи document.createElement делаем абзац – <p> </p>
//    profileName.innerText = `${tg.initDataUnsafe.user.first_name}
//   ${tg.initDataUnsafe.user.last_name}
//   ${tg.initDataUnsafe.user.username} (${tg.initDataUnsafe.user.language_code})`;
//    //В созданном параграфе будет Имя пользователя, его Фамилия, username, а также код языка
//    usercard.appendChild(profileName); //Используем appendChild, чтобы добавить узел в конец списка дочерних элементов
//    let userid1 = document.createElement("p"); // Используем document.createElement для создания еще одного абзаца
//    userid1.innerText = `${tg.initDataUnsafe.user.id}`; // Отображаем id пользователя
//    usercard.appendChild(userid1); // Добавляем id пользователя в конец списка дочерних элементов при помощи appendChild
//
