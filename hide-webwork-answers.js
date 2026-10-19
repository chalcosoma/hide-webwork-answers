// ==UserScript==
// @name         Hide WeBWorK Answers
// @namespace    local
// @version      1.0
// @description  Clears saved answers and feedback
// @match        *://*/webwork2/*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  'use strict';

  const hide = GM_getValue('hide', true);

  const btn = document.createElement('button');
  btn.textContent = hide ? 'Show old answers' : 'Hide old answers';
  btn.style.cssText =
    'position:fixed;bottom:12px;right:12px;z-index:99999;padding:6px 10px;' +
    'font-size:12px;opacity:.7;cursor:pointer;';
  btn.onclick = () => { GM_setValue('hide', !hide); location.reload(); };
  document.body.appendChild(btn);

  if (!hide) return;

  GM_addStyle(`
    .attemptResults, .attemptResultsSummary, .ResultsWithoutError,
    .ResultsWithError, .ww-feedback-btn, .answer-preview,
    .problem-status, .past-answer-table { display: none !important; }

    input.correct, input.incorrect, input.partially-correct,
    input.is-valid, input.is-invalid, .mq-editable-field.correct,
    .mq-editable-field.incorrect, select.correct, select.incorrect {
      background-color: initial !important;
      border-color: initial !important;
      box-shadow: none !important;
    }
  `);

  const NAME = /^(AnSwEr|MaTrIx_AnSwEr|MuLtIaNsWeR)/;

  function wipe() {
    document.querySelectorAll('input, textarea, select').forEach(el => {
      if (!NAME.test(el.name || '') || el.type === 'hidden') return;
      if (el.type === 'radio' || el.type === 'checkbox') el.checked = false;
      else if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = '';
    });

    try {
      const MQ = unsafeWindow.MathQuill && unsafeWindow.MathQuill.getInterface(2);
      if (MQ) {
        document.querySelectorAll('.mq-editable-field').forEach(f => {
          const m = MQ.MathField(f);
          if (m) m.latex('');
        });
      }
    } catch (e) { /* ignore */ }
  }

  wipe();
  setTimeout(wipe, 500);
  setTimeout(wipe, 1500);
})();
