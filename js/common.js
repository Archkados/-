/*
 * Общий модуль: сборка страницы для превью, экспорт в ZIP, ссылка на проект.
 * Используется и редактором (index.html), и страницей просмотра (view.html).
 */
(function () {
  'use strict';

  /* Помощники, которые доступны в коде ученика. Сейчас это функция confetti(). */
  function mfsHelpers() {
    window.__confettiCount = 0;
    window.confetti = function (emoji) {
      window.__confettiCount++;
      if (!document.body) return;
      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647';
      document.body.appendChild(canvas);
      var ctx = canvas.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var W = (canvas.width = window.innerWidth * dpr);
      var H = (canvas.height = window.innerHeight * dpr);
      var colors = ['#FFC83D', '#22C38E', '#F2545B', '#3E6BFF', '#B57BFF'];
      var parts = [];
      for (var i = 0; i < 140; i++) {
        parts.push({
          x: W / 2 + (Math.random() - 0.5) * W * 0.25,
          y: H * 0.65,
          vx: (Math.random() - 0.5) * 20 * dpr,
          vy: -(Math.random() * 16 + 12) * dpr,
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          s: (Math.random() * 8 + 6) * dpr,
          c: colors[i % colors.length]
        });
      }
      var frame = 0;
      (function tick() {
        frame++;
        ctx.clearRect(0, 0, W, H);
        for (var j = 0; j < parts.length; j++) {
          var p = parts[j];
          p.vy += 0.5 * dpr;
          p.vx *= 0.99;
          p.x += p.vx;
          p.y += p.vy;
          p.r += p.vr;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.r);
          if (emoji) {
            ctx.font = p.s * 2.6 + 'px serif';
            ctx.fillText(String(emoji), 0, 0);
          } else {
            ctx.fillStyle = p.c;
            ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
          }
          ctx.restore();
        }
        if (frame < 200) requestAnimationFrame(tick);
        else canvas.remove();
      })();
    };
  }

  /* Отправляет ошибки и console.log из превью в редактор. */
  function mfsReporter() {
    function send(type, text, line) {
      try { parent.postMessage({ mfs: type, text: String(text), line: line || 0 }, '*'); } catch (e) {}
    }
    window.addEventListener('error', function (e) {
      send('error', e.message || String(e.error), e.lineno);
    });
    var origLog = console.log;
    console.log = function () {
      var parts = [].map.call(arguments, function (x) {
        if (typeof x === 'string') return x;
        try { return JSON.stringify(x); } catch (err) { return String(x); }
      });
      send('log', parts.join(' '));
      return origLog.apply(console, arguments);
    };
  }

  /* Собирает ошибки внутри скрытого окна проверки. */
  function mfsCollector() {
    window.__mfsErrors = [];
    window.addEventListener('error', function (e) {
      window.__mfsErrors.push(e.message || String(e.error));
    });
  }

  var HELPERS_SRC = '(' + mfsHelpers.toString() + ')();';
  var REPORTER_SRC = '(' + mfsReporter.toString() + ')();';
  var COLLECTOR_SRC = '(' + mfsCollector.toString() + ')();';
  var NO_MOTION_CSS = '*,*::before,*::after{transition:none!important;animation:none!important}';

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /*
   * Собирает HTML, CSS и JS ученика в один документ для iframe.
   * mode: 'preview' (видимое превью), 'check' (скрытая проверка), 'view' (страница просмотра)
   * offset: сколько строк стоит перед кодом JS, чтобы показывать ученику правильный номер строки.
   */
  function buildDocument(p, opts) {
    opts = opts || {};
    var mode = opts.mode || 'preview';
    var head = '<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<title>' + escapeHtml(p.title || 'Мой проект') + '</title>\n';
    if (mode === 'preview') head += '<script>' + REPORTER_SRC + '<\/script>\n';
    if (mode === 'check') head += '<script>' + COLLECTOR_SRC + '<\/script>\n';
    head += '<style>\n' + (p.css || '') + '\n</style>\n';
    if (mode === 'check') head += '<style>' + NO_MOTION_CSS + '</style>\n';
    head += '</head>\n<body>\n';
    var before = head + (p.html || '') + '\n<script>' + HELPERS_SRC + '<\/script>\n<script>\n';
    var offset = before.split('\n').length - 1;
    var doc = before + (p.js || '') + '\n<\/script>\n</body>\n</html>';
    return { doc: doc, offset: offset };
  }

  /* Переводит понятные ученику подсказки для частых ошибок JavaScript. */
  function friendlyError(msg) {
    msg = String(msg || '').replace(/^Uncaught\s+/, '');
    var m;
    if ((m = msg.match(/(\S+) is not defined/))) {
      return m[1] + ' не найдено. Проверь, как написано название: большие и маленькие буквы важны.';
    }
    if ((m = msg.match(/Identifier '(.+)' has already been declared/))) {
      return 'Переменная ' + m[1] + ' объявлена дважды. Убери лишнее const или let.';
    }
    if (/Cannot read propert(y|ies) of null|null is not an object|Cannot set propert(y|ies) of null/.test(msg)) {
      return 'Элемент не найден на странице. Проверь, что id в querySelector совпадает с id в HTML.';
    }
    if (/is not a function/.test(msg)) {
      return 'Это не функция. Проверь название и круглые скобки.';
    }
    if (/Assignment to constant variable/.test(msg)) {
      return 'Значение const нельзя менять. Если переменная будет меняться, объяви её через let.';
    }
    if (/Unexpected token|Unexpected end of input|missing \)|Unexpected identifier|Invalid or unexpected token|Unexpected string|Unexpected number/.test(msg)) {
      return 'Синтаксическая ошибка: где-то не хватает скобки, кавычки или запятой.';
    }
    return msg;
  }

  /* ---------- Ссылка на проект ---------- */

  function encodeProject(p) {
    var payload = { v: 1, t: p.track, n: p.name, ti: p.title, h: p.html, c: p.css, j: p.js };
    return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
  }

  function decodeProject(str) {
    var json = LZString.decompressFromEncodedURIComponent(str);
    if (!json) return null;
    var o = JSON.parse(json);
    if (!o || o.v !== 1) return null;
    return { track: o.t, name: o.n, title: o.ti, html: o.h || '', css: o.c || '', js: o.j || '' };
  }

  function shareUrl(p) {
    var base = new URL('view.html', location.href);
    base.hash = 'p=' + encodeProject(p);
    return base.href;
  }

  /* ---------- Экспорт в ZIP ---------- */

  var TRANSLIT = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
    'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
    'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
    'э': 'e', 'ю': 'yu', 'я': 'ya', 'ә': 'a', 'ғ': 'g', 'қ': 'k', 'ң': 'n', 'ө': 'o', 'ұ': 'u', 'ү': 'u',
    'һ': 'h', 'і': 'i'
  };

  function slugify(s) {
    var out = String(s || '').toLowerCase().split('').map(function (ch) {
      return TRANSLIT[ch] !== undefined ? TRANSLIT[ch] : ch;
    }).join('');
    out = out.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return out || 'project';
  }

  function indent(text, pad) {
    return String(text).split('\n').map(function (l) { return l ? pad + l : l; }).join('\n');
  }

  function exportHtml(p) {
    return '<!doctype html>\n<html lang="ru">\n<head>\n' +
      '  <meta charset="utf-8">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '  <title>' + escapeHtml(p.title || 'Мой проект') + '</title>\n' +
      '  <link rel="stylesheet" href="style.css">\n' +
      '</head>\n<body>\n' +
      indent(p.html.trim(), '  ') + '\n\n' +
      '  <script src="helpers.js"></script>\n' +
      '  <script src="script.js"></script>\n' +
      '</body>\n</html>\n';
  }

  function makeZip(p) {
    var zip = new JSZip();
    var folderName = 'proekt-' + slugify(p.name);
    var f = zip.folder(folderName);
    var date = new Date().toLocaleDateString('ru-RU');
    f.file('index.html', exportHtml(p));
    f.file('style.css', p.css.trim() + '\n');
    f.file('script.js', p.js.trim() + '\n');
    f.file('helpers.js', '// Помощник с урока: функция confetti(). Её можно вызывать в script.js\n' + HELPERS_SRC + '\n');
    f.file('README.txt',
      p.title + '\n' +
      'Автор: ' + p.name + '\n' +
      'Сделано на пробном уроке Morrison Academy, ' + date + '\n\n' +
      'Как открыть: дважды кликни по файлу index.html, он откроется в браузере.\n' +
      'Как менять: открой папку в редакторе кода, например в VS Code, или даже в Блокноте.\n\n' +
      'index.html  структура страницы (HTML)\n' +
      'style.css   внешний вид (CSS)\n' +
      'script.js   поведение (JavaScript)\n' +
      'helpers.js  функция confetti() с урока\n');
    return zip.generateAsync({ type: 'blob' }).then(function (blob) {
      return { blob: blob, filename: folderName + '.zip' };
    });
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  window.MFS = {
    helpers: mfsHelpers,
    buildDocument: buildDocument,
    friendlyError: friendlyError,
    encodeProject: encodeProject,
    decodeProject: decodeProject,
    shareUrl: shareUrl,
    makeZip: makeZip,
    slugify: slugify,
    escapeHtml: escapeHtml,
    downloadBlob: downloadBlob
  };
})();
