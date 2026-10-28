(function () {
  'use strict';

  var KEY = 'mfs-state-v1';
  var DEV = /[?&]dev=1\b/.test(location.search);

  var state = null;      // { v, name, track, step, done[], code{html,css,js}, snaps{}, finished }
  var track = null;      // объект из TRACKS
  var editor = null;
  var docs = {};
  var activeTab = 'html';
  var renderTimer = null;
  var previewOffset = 0;
  var checking = false;
  var toastTimer = null;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* хранилище недоступно, работаем без него */ }
  }

  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }

  function projectData() {
    return {
      track: state.track,
      name: state.name,
      title: track.projectName + ': ' + state.name,
      html: state.code.html,
      css: state.code.css,
      js: state.code.js
    };
  }

  /* =============== Стартовый экран =============== */

  function initLanding() {
    var saved = load();
    var input = $('#name');
    if (saved && saved.name) input.value = saved.name;
    updateDemo();
    input.addEventListener('input', function () {
      $('#nameError').hidden = true;
      updateDemo();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') $('[data-start="front"]').focus();
    });

    $$('[data-start]').forEach(function (btn) {
      btn.addEventListener('click', function () { startNew(btn.getAttribute('data-start')); });
    });

    if (saved && window.TRACKS[saved.track] && saved.code) {
      var t = window.TRACKS[saved.track];
      var doneCount = (saved.done || []).filter(Boolean).length;
      $('#resumeText').textContent = saved.finished
        ? 'У тебя есть готовый проект: ' + t.projectName + '.'
        : 'У тебя есть начатый проект: ' + t.projectName + ', пройдено шагов ' + doneCount + ' из ' + t.steps.length + '.';
      $('#resume').hidden = false;
      $('#resumeBtn').addEventListener('click', function () {
        state = saved;
        openWorkspace();
      });
    }
  }

  function updateDemo() {
    var v = $('#name').value.trim() || 'ТВОЁ ИМЯ';
    $$('.demo-name').forEach(function (el) { el.textContent = v; });
  }

  function startNew(trackId) {
    var name = $('#name').value.trim();
    if (!name) {
      $('#nameError').hidden = false;
      $('#name').focus();
      return;
    }
    var saved = load();
    if (saved && saved.code && (saved.done || []).some(Boolean)) {
      if (!confirm('Начать новый проект? Начатый проект в этом браузере будет заменён.')) return;
    }
    var t = window.TRACKS[trackId];
    state = {
      v: 1,
      name: name,
      track: trackId,
      step: 0,
      done: [],
      code: { html: t.starter.html, css: t.starter.css, js: t.starter.js },
      snaps: {},
      finished: false
    };
    save();
    openWorkspace();
  }

  /* =============== Рабочее место =============== */

  function openWorkspace() {
    track = window.TRACKS[state.track];
    $('#landing').hidden = true;
    $('#workspace').hidden = false;
    document.body.classList.add('in-workspace');
    $('#wsProject').textContent = track.projectName;
    $('#wsAuthor').textContent = state.name + ', курс ' + track.course;
    $('#skipBtn').hidden = !DEV;

    initEditor();
    docs.html.setValue(state.code.html);
    docs.css.setValue(state.code.css);
    docs.js.setValue(state.code.js);
    docs.html.clearHistory();
    docs.css.clearHistory();
    docs.js.clearHistory();

    $('#myProjectBtn').hidden = !state.finished;
    openStep(state.step, true);
    renderPreview();
  }

  function initEditor() {
    if (editor) return;
    editor = CodeMirror($('#editor'), {
      lineNumbers: true,
      theme: 'mfs',
      tabSize: 2,
      indentUnit: 2,
      lineWrapping: true,
      autoCloseBrackets: true,
      autoCloseTags: true,
      extraKeys: {
        Tab: function (cm) {
          if (cm.somethingSelected()) cm.indentSelection('add');
          else cm.replaceSelection('  ', 'end');
        }
      }
    });
    docs = {
      html: CodeMirror.Doc('', 'htmlmixed'),
      css: CodeMirror.Doc('', 'css'),
      js: CodeMirror.Doc('', 'javascript')
    };
    Object.keys(docs).forEach(function (k) {
      docs[k].on('change', function () {
        state.code[k] = docs[k].getValue();
        save();
        scheduleRender();
      });
    });
    editor.swapDoc(docs.html);

    $$('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () { switchTab(tab.getAttribute('data-tab')); });
    });
    $('#checkBtn').addEventListener('click', runCheck);
    $('#nextBtn').addEventListener('click', goNext);
    $('#skipBtn').addEventListener('click', function () { markDone(); goNext(); });
    $('#revertBtn').addEventListener('click', revertStep);
    $('#refreshBtn').addEventListener('click', renderPreview);
    $('#clearConsole').addEventListener('click', clearConsole);
    $('#exitBtn').addEventListener('click', exitWorkspace);
    $('#myProjectBtn').addEventListener('click', openFinish);
    $('#stepText').addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      copyText(chip.textContent).then(function () {
        toast('Скопировано: ' + chip.textContent + '. Вставь в код через Ctrl+V');
      });
    });
    window.addEventListener('message', onPreviewMessage);
  }

  function switchTab(k) {
    activeTab = k;
    editor.swapDoc(docs[k]);
    $$('.tab').forEach(function (t) {
      var on = t.getAttribute('data-tab') === k;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    setTimeout(function () { editor.refresh(); }, 0);
  }

  function firstUndone() {
    for (var i = 0; i < track.steps.length; i++) if (!state.done[i]) return i;
    return track.steps.length - 1;
  }

  function renderProgress() {
    var nav = $('#progress');
    nav.innerHTML = '';
    var reach = firstUndone();
    track.steps.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'seg' + (state.done[i] ? ' done' : '') + (i === state.step ? ' current' : '');
      b.textContent = i + 1;
      b.title = 'Шаг ' + (i + 1) + ': ' + s.title;
      b.disabled = i > reach && !state.done[i];
      b.addEventListener('click', function () { openStep(i, true); });
      nav.appendChild(b);
    });
  }

  function openStep(i, focus) {
    state.step = i;
    if (!state.snaps[i]) state.snaps[i] = { html: state.code.html, css: state.code.css, js: state.code.js };
    save();
    var s = track.steps[i];

    $('#stepCount').textContent = 'Шаг ' + (i + 1) + ' из ' + track.steps.length;
    $('#stepTitle').textContent = s.title;
    $('#stepText').innerHTML = s.text;

    var hint = $('#hint');
    hint.open = false;
    renderHint(s.hint);

    $('#checkBtn').textContent = s.free ? 'Готово' : 'Проверить';
    $('#checkBtn').hidden = false;
    $('#nextBtn').hidden = true;
    hideStatus();
    if (state.done[i] && !s.free) {
      showStatus('ok', 'Этот шаг уже пройден.');
      showNext();
    }

    $$('.tab').forEach(function (t) {
      t.classList.toggle('target', t.getAttribute('data-tab') === s.tab);
    });
    switchTab(s.tab);
    renderProgress();
    $('.steps-panel').scrollTop = 0;
    if (isStacked()) window.scrollTo(0, 0);
    if (focus) setTimeout(function () { focusTarget(s); }, 30);
  }

  /* Узкий экран: колонки стоят друг под другом и прокручивается вся страница */
  function isStacked() {
    return window.matchMedia('(max-width: 760px)').matches;
  }

  /*
   * Подсказка может состоять из нескольких частей для разных вкладок:
   * hint: { text, code } или hint: { text, parts: [{ label, code }] }
   */
  function renderHint(h) {
    var hint = $('#hint');
    var body = $('#hintBody');
    body.innerHTML = '';
    if (!h) { hint.hidden = true; return; }
    hint.hidden = false;
    if (h.text) {
      var p = document.createElement('p');
      p.textContent = h.text;
      body.appendChild(p);
    }
    var parts = h.parts || [{ code: h.code }];
    parts.forEach(function (part) {
      var wrap = document.createElement('div');
      wrap.className = 'hint-part';
      if (part.label) {
        var lab = document.createElement('p');
        lab.className = 'hint-label';
        lab.textContent = part.label;
        wrap.appendChild(lab);
      }
      var pre = document.createElement('pre');
      pre.textContent = part.code;
      wrap.appendChild(pre);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-small btn-quiet';
      btn.textContent = 'Скопировать';
      btn.addEventListener('click', function () {
        copyText(part.code).then(function () { toast('Код скопирован. Вставь его через Ctrl+V'); });
      });
      wrap.appendChild(btn);
      body.appendChild(wrap);
    });
  }

  function focusTarget(s) {
    // CodeMirror при прокрутке к нужной строке может сдвинуть всю страницу.
    // Запоминаем положение и возвращаем его, чтобы задание оставалось на экране.
    var x = window.scrollX, y = window.scrollY;
    placeCursor(s);
    if (window.scrollX !== x || window.scrollY !== y) window.scrollTo(x, y);
  }

  function placeCursor(s) {
    var doc = docs[s.tab];
    var value = doc.getValue();
    if (s.find) {
      var idx = value.indexOf(s.find);
      if (idx !== -1) {
        var from = doc.posFromIndex(idx);
        var to = doc.posFromIndex(idx + s.find.length);
        doc.setSelection(from, to);
        editor.scrollIntoView({ from: from, to: to }, 80);
        flashMark(doc, from, to);
      }
    } else if (s.cursorAfter) {
      var j = value.indexOf(s.cursorAfter);
      if (j !== -1) {
        var line = doc.posFromIndex(j).line + 1;
        if (line > doc.lastLine()) line = doc.lastLine();
        if (!doc.getLine(line).trim()) editor.indentLine(line, 'smart');
        var pos = { line: line, ch: doc.getLine(line).length };
        doc.setCursor(pos);
        editor.scrollIntoView(pos, 80);
      }
    }
    // На узком экране не ставим фокус в редактор: ученик сначала читает задание
    if (!isStacked()) editor.focus();
  }

  function flashMark(doc, from, to) {
    var mark = doc.markText(from, to, { className: 'cm-target' });
    setTimeout(function () { mark.clear(); }, 1600);
  }

  function showNext() {
    var last = state.step === track.steps.length - 1;
    var nb = $('#nextBtn');
    nb.textContent = last ? 'Забрать проект' : 'Следующий шаг';
    nb.hidden = false;
    $('#checkBtn').hidden = true;
  }

  function goNext() {
    if (state.step < track.steps.length - 1) openStep(state.step + 1, true);
    else finishProject();
  }

  function markDone() {
    state.done[state.step] = true;
    save();
    renderProgress();
  }

  function revertStep() {
    var snap = state.snaps[state.step];
    if (!snap) return;
    if (!confirm('Вернуть весь код к тому, каким он был в начале этого шага?')) return;
    docs.html.setValue(snap.html);
    docs.css.setValue(snap.css);
    docs.js.setValue(snap.js);
    hideStatus();
    focusTarget(track.steps[state.step]);
  }

  function exitWorkspace() {
    save();
    location.reload();
  }

  /* =============== Превью и консоль =============== */

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderPreview, 450);
  }

  function renderPreview() {
    var b = MFS.buildDocument(projectData(), { mode: 'preview' });
    previewOffset = b.offset;
    clearConsole();
    setJsError(false);
    $('#preview').srcdoc = b.doc;
  }

  function onPreviewMessage(e) {
    var frame = $('#preview');
    if (!frame || e.source !== frame.contentWindow) return;
    var d = e.data || {};
    if (d.mfs === 'error') {
      var line = d.line > previewOffset ? d.line - previewOffset : 0;
      var friendly = MFS.friendlyError(d.text);
      addConsole('error', (line ? 'JavaScript, строка ' + line + ': ' : 'JavaScript: ') + friendly, friendly !== d.text ? d.text : '');
      setJsError(true);
    } else if (d.mfs === 'log') {
      addConsole('log', d.text);
    }
  }

  function addConsole(type, text, raw) {
    $('#console').hidden = false;
    var row = document.createElement('div');
    row.className = 'console-row ' + type;
    row.textContent = text;
    if (raw) {
      var small = document.createElement('small');
      small.textContent = raw;
      row.appendChild(small);
    }
    var body = $('#consoleBody');
    body.appendChild(row);
    while (body.children.length > 60) body.removeChild(body.firstChild);
    body.scrollTop = body.scrollHeight;
  }

  /* Красная метка на вкладке JS и над превью, пока в коде есть ошибка */
  function setJsError(on) {
    $('#errorBadge').hidden = !on;
    $('.tab[data-tab="js"]').classList.toggle('has-error', on);
  }

  function clearConsole() {
    $('#consoleBody').innerHTML = '';
    $('#console').hidden = true;
  }

  /* =============== Проверка шага =============== */

  function runCheck() {
    var s = track.steps[state.step];
    if (s.free) {
      markDone();
      finishProject();
      return;
    }
    if (checking) return;
    checking = true;
    $('#checkBtn').disabled = true;
    showStatus('pending', 'Проверяю...');

    var frame = $('#checkFrame');
    var b = MFS.buildDocument(projectData(), { mode: 'check' });
    var handled = false;
    var guard = setTimeout(function () { complete('Сайт слишком долго загружается. Проверь, нет ли в коде бесконечного цикла.'); }, 4000);

    function complete(result) {
      if (handled) return;
      handled = true;
      clearTimeout(guard);
      checking = false;
      $('#checkBtn').disabled = false;
      if (result === true) {
        markDone();
        var praise = ['Отлично, всё работает!', 'Есть! Шаг пройден.', 'Именно так. Супер!', 'Работает. Так держать!'];
        showStatus('ok', praise[Math.floor(Math.random() * praise.length)]);
        showNext();
      } else {
        showStatus('fail', result);
      }
    }

    frame.onload = function () {
      setTimeout(function () {
        var result;
        try {
          result = evaluate(frame, s);
        } catch (err) {
          result = 'Не получилось проверить шаг: ' + err.message;
        }
        complete(result);
      }, 80);
    };
    frame.srcdoc = b.doc;
  }

  function evaluate(frame, s) {
    var win = frame.contentWindow;
    var doc = frame.contentDocument;
    function el(sel) { try { return doc.querySelector(sel); } catch (e) { return null; } }
    var ctx = {
      win: win,
      doc: doc,
      code: { html: state.code.html, css: state.code.css, js: state.code.js },
      $: el,
      $$: function (sel) { try { return Array.prototype.slice.call(doc.querySelectorAll(sel)); } catch (e) { return []; } },
      text: function (sel) { var n = el(sel); return n ? n.textContent.trim() : null; },
      style: function (sel, prop) { var n = el(sel); return n ? win.getComputedStyle(n)[prop] : null; },
      click: function (sel) { var n = el(sel); if (!n) return false; n.click(); return true; },
      val: function (expr) { try { return win.eval(expr); } catch (e) { return undefined; } }
    };
    var result = s.check(ctx);
    if (result !== true) {
      var errs = (win.__mfsErrors || []);
      if (errs.length) result = result + ' Ещё в JavaScript есть ошибка: ' + MFS.friendlyError(errs[0]);
    }
    return result;
  }

  function showStatus(kind, text) {
    var st = $('#status');
    st.className = 'status ' + kind;
    st.textContent = text;
    st.hidden = false;
  }
  function hideStatus() { $('#status').hidden = true; }

  /* =============== Финал =============== */

  function finishProject() {
    var first = !state.finished;
    state.finished = true;
    save();
    $('#myProjectBtn').hidden = false;
    renderProgress();
    openFinish();
    if (first) {
      MFS.helpers();
      window.confetti();
    }
  }

  var finishBound = false;
  function openFinish() {
    $('#finishTitle').textContent = 'Готово, ' + state.name + '! Твой первый проект собран.';
    var list = $('#nextList');
    list.innerHTML = '';
    track.next.forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });
    $('#finish').hidden = false;
    $('#zipBtn').focus();

    if (finishBound) return;
    finishBound = true;
    $('#closeFinish').addEventListener('click', function () { $('#finish').hidden = true; });
    $('#finish').addEventListener('click', function (e) { if (e.target.id === 'finish') $('#finish').hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $('#finish').hidden = true; });

    $('#zipBtn').addEventListener('click', function () {
      MFS.makeZip(projectData()).then(function (r) {
        MFS.downloadBlob(r.blob, r.filename);
        toast('Архив скачивается');
      });
    });
    $('#linkBtn').addEventListener('click', function () {
      copyText(MFS.shareUrl(projectData())).then(function () { toast('Ссылка скопирована. Отправь её кому хочешь'); });
    });
    $('#openBtn').addEventListener('click', function () {
      window.open(MFS.shareUrl(projectData()), '_blank', 'noopener');
    });
  }

  /* =============== Старт =============== */
  initLanding();
})();
