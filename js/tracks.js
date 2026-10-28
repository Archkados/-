/*
 * Треки пробных уроков.
 *
 * Чтобы добавить новый трек, скопируй один из объектов ниже и поменяй:
 *   starter   стартовый код (html, css, js)
 *   steps     шаги. У каждого шага:
 *     title       заголовок
 *     tab         какая вкладка редактора откроется: 'html' | 'css' | 'js'
 *     find        (необязательно) текст, который выделится в редакторе
 *     cursorAfter (необязательно) курсор встанет на строку после строки с этим текстом
 *     text        задание (HTML). <span class="chip">...</span> копируется по клику
 *     hint        { text, code } подсказка, или { text, parts: [{ label, code }] },
 *                 если код нужно вставить в разные места (у каждой части своя кнопка Скопировать)
 *     check(ctx)  возвращает true, если всё верно, или строку с понятным сообщением
 *     free        true для свободного шага без проверки
 *
 * ctx в проверках:
 *   ctx.$(sel), ctx.$$(sel)   элементы на странице ученика
 *   ctx.text(sel)             текст элемента без пробелов по краям (или null)
 *   ctx.style(sel, prop)      вычисленный CSS-стиль
 *   ctx.click(sel)            нажать на элемент (вернёт false, если его нет)
 *   ctx.val('выражение')      выполнить выражение в коде ученика (undefined при ошибке)
 *   ctx.code                  { html, css, js } исходники ученика
 */
window.TRACKS = {
  front: {
    id: 'front',
    course: 'Frontend',
    projectName: 'Сайт про себя',
    age: '9-13 лет',
    next: [
      'Сайт из нескольких страниц с меню',
      'Анимации и эффекты при наведении',
      'Вёрстка, которая красиво смотрится на телефоне'
    ],
    starter: {
      html:
`<div class="card">
  <div class="avatar">❓</div>

  <h1>Привет! Меня зовут ТВОЁ ИМЯ</h1>
  <p class="about">Напиши здесь пару слов о себе</p>

  <h2>Что я люблю</h2>
  <ul class="hobbies">
    <li>🎮 Играть в игры</li>
  </ul>

  <button id="party">Нажми меня</button>
</div>
`,
      css:
`body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  background: white;
}

.card {
  width: 100%;
  max-width: 460px;
  padding: 32px;
  border-radius: 28px;
  background: white;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.avatar {
  font-size: 90px;
}

h1 {
  color: black;
  font-size: 28px;
}

.about {
  color: #555555;
  font-size: 18px;
}

.hobbies {
  list-style: none;
  padding: 0;
}

.hobbies li {
  margin: 8px 0;
  padding: 12px;
  border-radius: 14px;
  background: #f2f2f2;
  font-size: 18px;
}

button {
  margin-top: 16px;
  padding: 14px 28px;
  border: none;
  border-radius: 999px;
  background: #4d7cfe;
  color: white;
  font-size: 18px;
  cursor: pointer;
}
`,
      js:
`// Находим кнопку на странице
const button = document.querySelector('#party');

// Говорим, что делать, когда на неё нажмут
button.addEventListener('click', function () {
  // Шаг 6: напиши здесь команду confetti();

});
`
    },
    steps: [
      {
        title: 'Как тебя зовут',
        tab: 'html',
        find: 'ТВОЁ ИМЯ',
        text:
          '<p>Слева код твоего сайта на языке HTML, справа сам сайт.</p>' +
          '<p>Найди строчку с тегом <code>&lt;h1&gt;</code>, это главный заголовок. Замени слова <b>ТВОЁ ИМЯ</b> на своё имя и посмотри, как сайт поменяется.</p>' +
          '<p class="note">Кнопка Нажми меня пока не работает. Её ты оживишь в конце урока.</p>',
        hint: { text: 'Должно получиться примерно так:', code: '<h1>Привет! Меня зовут Алия</h1>' },
        check: function (ctx) {
          var h1 = ctx.text('h1');
          if (h1 === null) return 'Не нахожу заголовок h1. Если случайно удалил его, нажми Вернуть код к началу шага.';
          if (h1.indexOf('ТВОЁ ИМЯ') !== -1) return 'В заголовке всё ещё написано ТВОЁ ИМЯ. Замени эти слова на своё имя.';
          if (h1.length < 8) return 'Заголовок получился слишком коротким. Напиши в нём своё имя.';
          return true;
        }
      },
      {
        title: 'Расскажи о себе',
        tab: 'html',
        find: 'Напиши здесь пару слов о себе',
        text:
          '<p>Тег <code>&lt;p&gt;</code> означает абзац текста.</p>' +
          '<p>Напиши в нём одно или два предложения о себе: сколько тебе лет, откуда ты, о чём мечтаешь.</p>',
        hint: { text: 'Например:', code: '<p class="about">Мне 11 лет, я живу в Алматы и мечтаю сделать свою игру</p>' },
        check: function (ctx) {
          var t = ctx.text('.about');
          if (t === null) return 'Не нахожу абзац с class="about". Проверь, что не удалил его.';
          if (t.indexOf('Напиши здесь') !== -1) return 'Здесь всё ещё текст-заготовка. Замени его своими словами.';
          if (t.length < 15) return 'Напиши чуть подробнее, хотя бы одно целое предложение.';
          return true;
        }
      },
      {
        title: 'Выбери аватар',
        tab: 'html',
        find: '❓',
        text:
          '<p>Вместо фотографии у нас будет эмодзи. Замени знак вопроса ❓ на эмодзи, который тебе нравится.</p>' +
          '<p>Нажми на любой, он скопируется, а потом вставь его в код:</p>' +
          '<p class="chips"><span class="chip">🦊</span><span class="chip">🐱</span><span class="chip">🐼</span><span class="chip">🦄</span><span class="chip">🚀</span><span class="chip">⚽</span><span class="chip">🎨</span><span class="chip">🎧</span><span class="chip">🐉</span><span class="chip">🤖</span></p>',
        hint: { text: 'Строчка должна выглядеть так:', code: '<div class="avatar">🦊</div>' },
        check: function (ctx) {
          var t = ctx.text('.avatar');
          if (t === null) return 'Не нахожу блок с class="avatar". Проверь, что не удалил его.';
          if (t === '❓' || t === '') return 'Аватар всё ещё знак вопроса. Вставь вместо него свой эмодзи.';
          return true;
        }
      },
      {
        title: 'Раскрась сайт',
        tab: 'css',
        find: 'background: white;',
        text:
          '<p>Это CSS, он отвечает за внешний вид. Каждый блок начинается с названия элемента, а внутри фигурных скобок его свойства.</p>' +
          '<p>1. В блоке <code>body</code> замени <code>white</code> на другой цвет фона.</p>' +
          '<p>2. В блоке <code>h1</code> замени <code>black</code>, чтобы заголовок стал цветным.</p>' +
          '<p>Цвета можно писать словами:</p>' +
          '<p class="chips"><span class="chip">gold</span><span class="chip">tomato</span><span class="chip">skyblue</span><span class="chip">violet</span><span class="chip">mediumseagreen</span><span class="chip">hotpink</span><span class="chip">#ff9f1c</span></p>',
        hint: {
          text: 'Хочешь фон из двух цветов? Это градиент, впиши его в блок body:',
          code: 'background: linear-gradient(135deg, violet, skyblue);'
        },
        check: function (ctx) {
          var bg = ctx.style('body', 'backgroundColor');
          var bgImg = ctx.style('body', 'backgroundImage');
          if (bg === 'rgb(255, 255, 255)' && bgImg === 'none') return 'Фон страницы всё ещё белый. Поменяй white в блоке body.';
          var color = ctx.style('h1', 'color');
          if (color === null) return 'Не нахожу заголовок h1 на странице.';
          if (color === 'rgb(0, 0, 0)') return 'Фон есть! А заголовок всё ещё чёрный. Поменяй color в блоке h1.';
          return true;
        }
      },
      {
        title: 'Что ты любишь',
        tab: 'html',
        find: '<li>🎮 Играть в игры</li>',
        text:
          '<p>Список <code>&lt;ul&gt;</code> состоит из пунктов <code>&lt;li&gt;</code>.</p>' +
          '<p>Добавь ещё минимум два пункта о том, что ты любишь. Скопируй строчку с <code>&lt;li&gt;</code>, вставь ниже и поменяй текст. Первый пункт тоже можно переписать.</p>',
        hint: {
          text: 'Внутри ul должно получиться так:',
          code: '<li>🎮 Играть в игры</li>\n<li>🎨 Рисовать</li>\n<li>🍕 Есть пиццу</li>'
        },
        check: function (ctx) {
          var items = ctx.$$('.hobbies li').filter(function (li) { return li.textContent.trim().length > 0; });
          if (!ctx.$('.hobbies')) return 'Не нахожу список с class="hobbies".';
          if (items.length < 3) return 'Сейчас пунктов: ' + items.length + '. Нужно хотя бы 3.';
          return true;
        }
      },
      {
        title: 'Оживи кнопку',
        tab: 'js',
        cursorAfter: '// Шаг 6',
        text:
          '<p>Это JavaScript, язык, который делает сайт живым. Код уже нашёл кнопку и ждёт, когда на неё нажмут.</p>' +
          '<p>Внутри фигурных скобок, под серой строчкой, напиши команду:</p>' +
          '<p class="chips"><span class="chip">confetti();</span></p>' +
          '<p>Потом нажми свою кнопку на сайте справа.</p>',
        hint: {
          text: 'Хочешь конфетти из эмодзи? Напиши эмодзи в кавычках внутри скобок:',
          code: "confetti('🍕');"
        },
        check: function (ctx) {
          if (!ctx.$('#party')) return 'Не нахожу кнопку с id="party". Проверь HTML.';
          ctx.click('#party');
          if (ctx.val('window.__confettiCount') > 0) return true;
          return 'Нажал кнопку, но конфетти не появилось. Проверь, что confetti(); написано внутри фигурных скобок и не на той же строке, что и //.';
        }
      },
      {
        title: 'Сделай по-своему',
        tab: 'css',
        free: true,
        text:
          '<p>Сайт готов! Последний шаг свободный, улучши его как хочешь. Несколько идей:</p>' +
          '<ul>' +
          '<li>поменяй текст на кнопке</li>' +
          '<li>сделай пункты списка цветными: свойство <code>background</code> в блоке <code>.hobbies li</code></li>' +
          '<li>увеличь аватар: <code>font-size</code> в блоке <code>.avatar</code></li>' +
          '<li>добавь ещё раздел, например <code>&lt;h2&gt;Мои мечты&lt;/h2&gt;</code> и абзац под ним</li>' +
          '</ul>' +
          '<p>Когда сайт тебе понравится, жми Готово.</p>'
      }
    ]
  },

  pro: {
    id: 'pro',
    course: 'Front PRO',
    projectName: 'Генератор идей',
    age: '13-18 лет',
    next: [
      'Своя браузерная игра на JavaScript',
      'Данные из интернета через API: погода, курсы валют, фильмы',
      'Приложения на React, как в настоящих IT-компаниях'
    ],
    starter: {
      html:
`<main class="app">
  <h1>Генератор ТЕМА</h1>
  <p class="subtitle">Нажми на кнопку и получи случайный вариант</p>

  <div id="result" class="result">Здесь появится ответ</div>

  <button id="generate">Сгенерировать</button>
  <p class="stats">Нажатий: <span id="counter">0</span></p>

  <button id="theme" class="ghost">🌙 Тёмная тема</button>
</main>
`,
      css:
`* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  font-family: system-ui, Arial, sans-serif;
  background: #eef1f7;
  color: #1d2433;
  transition: background 0.3s, color 0.3s;
}

.app {
  width: 100%;
  max-width: 480px;
  padding: 32px;
  border-radius: 24px;
  background: white;
  text-align: center;
  box-shadow: 0 16px 48px rgba(29, 36, 51, 0.12);
}

.subtitle,
.stats {
  color: #6b7385;
}

.result {
  display: grid;
  place-items: center;
  min-height: 96px;
  margin: 24px 0;
  padding: 20px 16px;
  border-radius: 18px;
  background: #f4f6fb;
  font-size: 22px;
  font-weight: bold;
}

button {
  padding: 14px 28px;
  border: none;
  border-radius: 14px;
  background: #4d7cfe;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

button.ghost {
  padding: 10px 18px;
  border: 2px solid currentColor;
  background: transparent;
  color: inherit;
  font-size: 15px;
}

/* Шаг 6. Стили тёмной темы */
body.dark {

}
`,
      js:
`// Шаг 2. Массив с вариантами


// Шаг 3. Функция, которая выбирает случайный вариант


// Шаг 4. Что происходит при нажатии на кнопку
`
    },
    steps: [
      {
        title: 'Придумай тему',
        tab: 'html',
        find: 'ТЕМА',
        text:
          '<p>Сегодня ты сделаешь настоящее веб-приложение: генератор, который выдаёт случайный ответ.</p>' +
          '<p>Сначала выбери тему и впиши её в заголовок <code>&lt;h1&gt;</code> вместо слова ТЕМА. Например:</p>' +
          '<p class="chips"><span class="chip">никнеймов</span><span class="chip">суперсил</span><span class="chip">идей на выходные</span><span class="chip">отмазок для учителя</span><span class="chip">имён для питомца</span></p>' +
          '<p class="note">Кнопки на сайте пока ничего не делают, так и задумано. Ты оживишь их сам на шагах 4 и 6.</p>',
        hint: { text: 'Например:', code: '<h1>Генератор никнеймов</h1>' },
        check: function (ctx) {
          var h1 = ctx.text('h1');
          if (h1 === null) return 'Не нахожу заголовок h1.';
          if (h1.indexOf('ТЕМА') !== -1) return 'В заголовке всё ещё слово ТЕМА. Замени его своей темой.';
          if (h1.length < 12) return 'Допиши тему в заголовок, например Генератор суперсил.';
          return true;
        }
      },
      {
        title: 'Создай массив',
        tab: 'js',
        cursorAfter: '// Шаг 2',
        text:
          '<p>Массив это список значений в одной переменной. Значения пишутся в квадратных скобках через запятую, текст в кавычках.</p>' +
          '<p>Создай переменную <code>ideas</code> и положи в неё <b>минимум 5 вариантов</b> по своей теме.</p>',
        hint: {
          text: 'Для генератора никнеймов это выглядит так:',
          code: "const ideas = [\n  'Ночной Ниндзя',\n  'Кибер Лис',\n  'Капитан Печенька',\n  'Тихий Гром',\n  'Пиксельный Дракон'\n];"
        },
        check: function (ctx) {
          var ideas = ctx.val('typeof ideas === "undefined" ? undefined : ideas');
          if (ideas === undefined) return 'Не нахожу переменную ideas. Название пишется именно так, маленькими латинскими буквами.';
          if (!Array.isArray(ideas)) return 'ideas должна быть массивом: значения в квадратных скобках [ ].';
          if (ideas.length < 5) return 'Вариантов сейчас ' + ideas.length + ', нужно минимум 5.';
          for (var i = 0; i < ideas.length; i++) {
            if (typeof ideas[i] !== 'string' || !ideas[i].trim()) return 'Каждый вариант должен быть непустым текстом в кавычках. Проверь вариант номер ' + (i + 1) + '.';
          }
          return true;
        }
      },
      {
        title: 'Напиши функцию',
        tab: 'js',
        cursorAfter: '// Шаг 3',
        text:
          '<p>Функция это мини-программа, которую можно запускать сколько угодно раз.</p>' +
          '<p>Напиши функцию <code>getRandomIdea</code>, которая возвращает случайный элемент массива <code>ideas</code>.</p>' +
          '<p>Пригодится: <code>Math.random()</code> даёт случайное число от 0 до 1, а <code>Math.floor()</code> округляет вниз. Номер последнего элемента на 1 меньше, чем <code>ideas.length</code>.</p>',
        hint: {
          text: 'Одно из решений:',
          code: 'function getRandomIdea() {\n  const index = Math.floor(Math.random() * ideas.length);\n  return ideas[index];\n}'
        },
        check: function (ctx) {
          var fnType = ctx.val('typeof getRandomIdea');
          if (fnType !== 'function') return 'Не нахожу функцию getRandomIdea. Проверь название: большие и маленькие буквы важны.';
          var ideas = ctx.val('ideas') || [];
          var seen = {};
          for (var i = 0; i < 60; i++) {
            var v = ctx.val('getRandomIdea()');
            if (v === undefined) return 'Функция ничего не возвращает. Не забудь написать return.';
            if (ideas.indexOf(v) === -1) return 'Функция вернула ' + JSON.stringify(v) + ', но такого варианта нет в ideas.';
            seen[v] = true;
          }
          if (Object.keys(seen).length < 2) return 'Функция каждый раз возвращает одно и то же. Нужен случайный номер через Math.random().';
          return true;
        }
      },
      {
        title: 'Подключи кнопку',
        tab: 'js',
        cursorAfter: '// Шаг 4',
        text:
          '<p>Теперь свяжем кнопку и функцию.</p>' +
          '<p>Найди кнопку <code>#generate</code> и блок <code>#result</code> через <code>document.querySelector</code>. При клике на кнопку записывай в <code>result.textContent</code> случайный вариант.</p>' +
          '<p>Потом понажимай кнопку справа и проверь, что ответы меняются.</p>',
        hint: {
          text: 'Вставь под комментарием Шаг 4:',
          code: "const button = document.querySelector('#generate');\nconst result = document.querySelector('#result');\n\nbutton.addEventListener('click', function () {\n  result.textContent = getRandomIdea();\n});"
        },
        check: function (ctx) {
          if (!ctx.$('#generate') || !ctx.$('#result')) return 'Не нахожу кнопку #generate или блок #result в HTML.';
          var ideas = ctx.val('ideas') || [];
          ctx.click('#generate');
          var t = ctx.text('#result');
          if (t === 'Здесь появится ответ') return 'После нажатия в #result ничего не поменялось. Проверь addEventListener и textContent.';
          if (ideas.indexOf(t) === -1) return 'В #result появилось ' + JSON.stringify(t) + ', а должен быть вариант из ideas.';
          return true;
        }
      },
      {
        title: 'Посчитай нажатия',
        tab: 'js',
        text:
          '<p>Добавим счётчик нажатий.</p>' +
          '<p>1. Над обработчиком создай переменную <code>let count = 0;</code> Здесь нужен <code>let</code>, а не <code>const</code>, ведь значение будет меняться.</p>' +
          '<p>2. Внутри обработчика клика увеличивай <code>count</code> на 1 и записывай его в <code>#counter</code>.</p>',
        hint: {
          text: 'Код состоит из двух частей, вставь каждую в своё место.',
          parts: [
            { label: '1. Над строкой button.addEventListener:', code: "let count = 0;\nconst counter = document.querySelector('#counter');" },
            { label: '2. Внутри обработчика клика, под строкой с result.textContent:', code: 'count = count + 1;\ncounter.textContent = count;' }
          ]
        },
        check: function (ctx) {
          if (!ctx.$('#counter')) return 'Не нахожу #counter в HTML.';
          var before = parseInt(ctx.text('#counter'), 10) || 0;
          ctx.click('#generate');
          ctx.click('#generate');
          ctx.click('#generate');
          var after = ctx.text('#counter');
          if (String(before + 3) !== after) return 'После трёх нажатий счётчик показывает ' + after + ', а должен ' + (before + 3) + '.';
          return true;
        }
      },
      {
        title: 'Тёмная тема',
        tab: 'css',
        cursorAfter: 'body.dark {',
        text:
          '<p>У каждого серьёзного приложения есть тёмная тема. Сделаем и её.</p>' +
          '<p>1. В CSS допиши стили для <code>body.dark</code>: тёмный <code>background</code> и светлый <code>color</code>. Карточке <code>.app</code> тоже нужен тёмный фон: это блок <code>body.dark .app</code>.</p>' +
          '<p>2. В JavaScript по клику на кнопку <code>#theme</code> переключай класс:</p>' +
          '<p class="chips"><span class="chip">document.body.classList.toggle(\'dark\');</span></p>',
        hint: {
          text: 'Здесь два кусочка кода для разных вкладок. Не вставляй CSS во вкладку JS, иначе сломается весь скрипт.',
          parts: [
            { label: '1. Во вкладку CSS, вместо пустого блока body.dark:', code: 'body.dark {\n  background: #12141c;\n  color: #f1f3f9;\n}\n\nbody.dark .app {\n  background: #1e2230;\n}' },
            { label: '2. Во вкладку JS, в самый конец:', code: "const themeButton = document.querySelector('#theme');\n\nthemeButton.addEventListener('click', function () {\n  document.body.classList.toggle('dark');\n});" }
          ]
        },
        check: function (ctx) {
          if (!ctx.$('#theme')) return 'Не нахожу кнопку #theme в HTML.';
          var body = ctx.$('body');
          var bgBefore = ctx.style('body', 'backgroundColor');
          ctx.click('#theme');
          if (!body.classList.contains('dark')) return 'При нажатии на кнопку темы у body не появляется класс dark. Проверь JavaScript.';
          var bgAfter = ctx.style('body', 'backgroundColor');
          if (bgAfter === bgBefore) return 'Класс dark включается, но фон не меняется. Допиши background в блок body.dark в CSS.';
          ctx.click('#theme');
          if (body.classList.contains('dark')) return 'Повторное нажатие должно выключать тёмную тему. Используй toggle.';
          return true;
        }
      },
      {
        title: 'Сделай по-своему',
        tab: 'js',
        free: true,
        text:
          '<p>Приложение работает! Последний шаг свободный, добавь что-то своё. Идеи:</p>' +
          '<ul>' +
          '<li>вызывай <code>confetti();</code> при каждой генерации</li>' +
          '<li>меняй надпись кнопки темы на ☀️ Светлая тема, когда включена тёмная</li>' +
          '<li>выводи в консоль, сколько раз нажали: <code>console.log(count);</code></li>' +
          '<li>сохраняй счётчик в <code>localStorage</code>, чтобы он не сбрасывался</li>' +
          '<li>сделай так, чтобы один и тот же вариант не выпадал два раза подряд</li>' +
          '</ul>' +
          '<p>Когда закончишь, жми Готово.</p>'
      }
    ]
  }
};
