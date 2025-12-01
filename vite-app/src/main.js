// const loadBtn = document.getElementById('load-tasks');
// const list = document.getElementById('task-list');


// // BŁĄD 1: Zły URL (literówka w domenie)
// const API_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=5';


// async function fetchTasks() {
//    try {
//        // BŁĄD 2:
//        const response = fetch(API_URL);


//        // BŁĄD 3: response.ok nie zadziała poprawnie, bo response to Promise
//        if (!response.ok) {
//            throw new Error(`Status: ${response.status}`);
//        }


//        const data = await response.json();
//        renderTasks(data);
// } catch (error) {
//        console.error("Błąd pobierania:", error);
//        alert("Nie udało się pobrać zadań! Sprawdź konsolę.");
//    }
// }


// function renderTasks(tasks) {
//    // BŁĄD 4: Wyczyszczenie listy
//    list.innerHTM = '';


//    tasks.forEach(task => {
//        const li = document.createElement('li');
//        // BŁĄD 5:
//        li.textContent = task.name;


//        // Logika: przekreślenie zakończonych
//        if (task.completed) {
//            li.style.textDecoration = 'line-through';
//        }


//        list.appendChild(li);
//    });
// }


// loadBtn.addEventListener('click', fetchTasks);

const loadBtn = document.getElementById('load-tasks');
const list = document.getElementById('task-list');

// Ошибка 1: Ты сказал не трогать (ссылка правильная)
const API_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=5';

async function fetchTasks() {
   try {
       // BŁĄD 2: Забыто ключевое слово await
       // fetch - это асинхронная операция. Без await мы получаем Promise (обещание), а не ответ.
       const response = await fetch(API_URL);

       // BŁĄD 3: Эта проверка теперь сработает, потому что мы добавили await выше.
       if (!response.ok) {
           throw new Error(`Status: ${response.status}`);
       }

       const data = await response.json();
       renderTasks(data);
   } catch (error) {
       console.error("Błąd pobierania:", error);
       alert("Nie udało się pobrać zadań! Sprawdź konsolę.");
   }
}

function renderTasks(tasks) {
   // BŁĄD 4: Опечатка в свойстве (innerHTM -> innerHTML)
   list.innerHTML = '';

   tasks.forEach(task => {
       const li = document.createElement('li');
       
       // BŁĄD 5: Неверное имя свойства (в API нет 'name', есть 'title')
       li.textContent = task.title;

       // Логика: перечеркивание выполненных
       if (task.completed) {
           li.style.textDecoration = 'line-through';
       }

       list.appendChild(li);
   });
}

loadBtn.addEventListener('click', fetchTasks);
