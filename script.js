// 모바일 메뉴: 버튼의 접근성 상태도 함께 변경합니다.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');

function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});

// 넓은 화면으로 전환하면 이전 모바일 메뉴 상태를 초기화합니다.
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

// 과정 데이터는 한곳에서 관리하므로 내용을 쉽게 수정할 수 있습니다.
const courses = {
  frontend: {
    title: '프론트엔드 웹 개발',
    description: '웹의 구조와 스타일, 사용자와의 상호작용을 배우며 반응형 웹사이트를 만들어보는 과정입니다.',
    steps: ['HTML로 의미 있는 페이지 구조 만들기', 'CSS로 레이아웃과 반응형 디자인 구현하기', 'JavaScript로 메뉴와 사용자 인터랙션 추가하기', '나만의 웹사이트를 완성하고 개선하기']
  },
  python: {
    title: 'AI·Python 개발',
    description: 'Python 문법부터 데이터 처리와 AI의 기초 개념까지, 직접 실행하고 결과를 확인하며 배우는 과정입니다.',
    steps: ['Python 기본 문법과 문제 해결 연습하기', '데이터를 정리하고 분석하기', '시각화와 기초 AI 개념 익히기', '관심 있는 데이터로 분석 프로젝트 완성하기']
  },
  fullstack: {
    title: '풀스택 웹 개발',
    description: '프론트엔드와 서버, 데이터베이스가 연결되는 원리를 이해하고 웹 서비스를 구현하는 과정입니다.',
    steps: ['HTML, CSS, JavaScript로 화면 구성하기', '서버와 API의 동작 원리 배우기', '데이터베이스에 데이터를 저장하고 조회하기', '화면과 서버를 연결해 웹 서비스 완성하기']
  }
};

const courseDialog = document.querySelector('#course-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogDescription = document.querySelector('#dialog-description');
const dialogSteps = document.querySelector('#dialog-steps');

document.querySelectorAll('[data-course]').forEach((button) => {
  button.addEventListener('click', () => {
    const course = courses[button.dataset.course];
    dialogTitle.textContent = course.title;
    dialogDescription.textContent = course.description;
    dialogSteps.replaceChildren();

    course.steps.forEach((step) => {
      const item = document.createElement('li');
      item.textContent = step;
      dialogSteps.append(item);
    });

    courseDialog.showModal();
  });
});

document.querySelector('#close-dialog').addEventListener('click', () => {
  courseDialog.close();
});

// 저작권 연도는 브라우저의 현재 연도를 사용합니다.
document.querySelector('#year').textContent = new Date().getFullYear();

// 미니 코드 에디터. 코드는 문자열로만 취급하며 실행하지 않습니다.
const editorInput = document.querySelector('#editor-input');
const editorHighlight = document.querySelector('#editor-highlight');
const editorLines = document.querySelector('#editor-lines');
const editorPanel = document.querySelector('#mini-editor');
const editorVisual = document.querySelector('.hero-visual');
const reopenEditor = document.querySelector('#editor-reopen');
const saveStatus = document.querySelector('#editor-save-status');
const defaultCode = editorInput.value;
const storageKey = 'next-it-academy:mini-editor:code:v1';

// HTML 특수 문자를 먼저 이스케이프해 입력한 HTML도 코드로만 표시합니다.
function escapeCode(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function syncEditorScroll() {
  editorHighlight.scrollTop = editorInput.scrollTop;
  editorHighlight.scrollLeft = editorInput.scrollLeft;
  editorLines.scrollTop = editorInput.scrollTop;
}

function renderEditor() {
  const code = editorInput.value;
  const tokens = /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|function|return|if|else|for|while|class|new|async|await|import|export|throw)\b|\b(?:Infinity|true|false|null|undefined|\d+(?:\.\d+)?)\b|\b[A-Za-z_$][\w$]*(?=\s*\()/g;
  let highlighted = '';
  let position = 0;

  for (const match of code.matchAll(tokens)) {
    const token = match[0];
    let color = 'blue';
    if (token.startsWith('//') || token.startsWith('/*')) color = 'comment';
    else if (/^["'`]/.test(token)) color = 'green';
    else if (/^(const|let|var|function|return|if|else|for|while|class|new|async|await|import|export|throw)$/.test(token)) color = 'purple';
    highlighted += escapeCode(code.slice(position, match.index));
    highlighted += `<span class="${color}">${escapeCode(token)}</span>`;
    position = match.index + token.length;
  }

  // 마지막 줄이 비어 있어도 표시 레이어의 높이를 유지합니다.
  editorHighlight.innerHTML = highlighted + escapeCode(code.slice(position)) + '\n ';
  editorLines.textContent = code.split('\n').map((line, index) => String(index + 1).padStart(2, '0')).join('\n') + '\n ';
  syncEditorScroll();
}

function saveEditor() {
  try {
    localStorage.setItem(storageKey, editorInput.value);
    saveStatus.textContent = '이 브라우저에 저장됨';
  } catch (error) {
    saveStatus.textContent = '자동 저장 불가 · 현재 페이지에서만 유지됩니다';
  }
}

// null과 빈 문자열을 구분하므로 빈 코드도 그대로 복원합니다.
try {
  const savedCode = localStorage.getItem(storageKey);
  if (savedCode !== null) editorInput.value = savedCode;
  saveStatus.textContent = savedCode === null ? '편집하면 자동 저장됩니다' : '저장된 코드를 불러왔습니다';
} catch (error) {
  saveStatus.textContent = '자동 저장을 사용할 수 없습니다 · 편집은 가능합니다';
}
renderEditor();

editorInput.addEventListener('input', () => {
  renderEditor();
  saveEditor();
});
editorInput.addEventListener('scroll', syncEditorScroll);

// Escape 다음 Tab으로 에디터 밖으로 이동해 키보드 포커스가 갇히지 않게 합니다.
let allowTabExit = false;
editorInput.addEventListener('keydown', (event) => {
  if (event.isComposing) return;
  if (event.key === 'Escape') {
    allowTabExit = true;
    return;
  }
  if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey && !allowTabExit) {
    event.preventDefault();
    editorInput.setRangeText('  ', editorInput.selectionStart, editorInput.selectionEnd, 'end');
    renderEditor();
    saveEditor();
  }
  allowTabExit = false;
});
editorInput.addEventListener('blur', () => { allowTabExit = false; });

document.querySelector('#editor-close').addEventListener('click', () => {
  // DOM을 삭제하지 않아 자리와 입력 내용, 스크롤 위치를 유지합니다.
  reopenEditor.hidden = false;
  reopenEditor.focus({ preventScroll: true });
  editorPanel.inert = true;
  editorPanel.setAttribute('aria-hidden', 'true');
  editorVisual.classList.add('is-editor-closed');
});

reopenEditor.addEventListener('click', () => {
  editorPanel.inert = false;
  editorPanel.removeAttribute('aria-hidden');
  editorVisual.classList.remove('is-editor-closed');
  reopenEditor.hidden = true;
  editorInput.focus({ preventScroll: true });
  syncEditorScroll();
});

document.querySelector('#editor-reset').addEventListener('click', () => {
  if (!window.confirm('작성한 코드를 지우고 처음의 예시 코드로 초기화할까요?')) return;
  editorInput.value = defaultCode;
  editorInput.scrollTop = 0;
  editorInput.scrollLeft = 0;
  renderEditor();
  saveEditor();
  editorInput.focus({ preventScroll: true });
});

// 타이틀 바에서만 드래그합니다. 편집/저장 코드는 그대로 사용합니다.
const dragWrapper = document.querySelector('#editor-drag-wrapper');
const dragHandle = editorPanel.querySelector('.editor-bar');
const heroSection = document.querySelector('#home');
const desktopPointer = window.matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
let dragX = 0;
let dragY = 0;
let dragState = null;

function placeEditor(x, y) {
  // 래퍼는 회전하지 않으므로 기존 회전 transform과 충돌하지 않습니다.
  const rect = dragWrapper.getBoundingClientRect();
  const hero = heroSection.getBoundingClientRect();
  const baseLeft = rect.left - dragX;
  const baseTop = rect.top - dragY;
  const margin = 16; // 회전된 모서리도 잘리지 않게 여백을 둡니다.
  const left = Math.max(margin, hero.left + margin);
  const right = Math.min(document.documentElement.clientWidth, hero.right) - margin;
  const headerBottom = document.querySelector('.header').getBoundingClientRect().bottom;
  const top = Math.max(hero.top + margin, headerBottom + margin);
  const bottom = Math.min(window.innerHeight, hero.bottom) - margin;
  const minX = left - baseLeft;
  const maxX = Math.max(minX, right - rect.width - baseLeft);
  const minY = top - baseTop;
  // 화면 높이가 낮아도 타이틀 바는 화면 안에 남깁니다.
  const maxY = Math.max(minY, bottom - rect.height - baseTop);
  dragX = Math.min(maxX, Math.max(minX, x));
  dragY = Math.min(maxY, Math.max(minY, y));
  dragWrapper.style.setProperty('--drag-x', `${dragX}px`);
  dragWrapper.style.setProperty('--drag-y', `${dragY}px`);
}

function finishEditorDrag(event) {
  if (!dragState || (event && event.pointerId !== dragState.id)) return;
  const pointerId = dragState.id;
  dragState = null;
  dragWrapper.classList.remove('is-dragging');
  document.body.classList.remove('is-editor-dragging');
  if (dragHandle.hasPointerCapture(pointerId)) dragHandle.releasePointerCapture(pointerId);
}

dragHandle.addEventListener('pointerdown', (event) => {
  if (!desktopPointer.matches || event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary || dragState) return;
  if (event.target.closest('button, a, input, textarea, select')) return;
  event.preventDefault();
  dragState = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: dragX, y: dragY };
  dragHandle.setPointerCapture(event.pointerId);
  dragWrapper.classList.add('is-dragging');
  document.body.classList.add('is-editor-dragging');
});
dragHandle.addEventListener('pointermove', (event) => {
  if (!dragState || event.pointerId !== dragState.id) return;
  placeEditor(dragState.x + event.clientX - dragState.startX, dragState.y + event.clientY - dragState.startY);
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach((name) => {
  dragHandle.addEventListener(name, finishEditorDrag);
});
window.addEventListener('blur', () => finishEditorDrag());
document.querySelector('#editor-close').addEventListener('click', () => finishEditorDrag());

function adjustEditorPosition() {
  finishEditorDrag();
  if (!desktopPointer.matches) {
    dragX = 0;
    dragY = 0;
    dragWrapper.style.removeProperty('--drag-x');
    dragWrapper.style.removeProperty('--drag-y');
  } else if (dragX !== 0 || dragY !== 0) {
    placeEditor(dragX, dragY);
  }
}
window.addEventListener('resize', adjustEditorPosition);
desktopPointer.addEventListener('change', adjustEditorPosition);
reopenEditor.addEventListener('click', adjustEditorPosition);

// About의 두 문장만 분리합니다. 원문은 스크린리더용으로 한 번만 읽힙니다.
const gravityRegion = document.querySelector('.about-intro');
const gravityLetters = [];
document.querySelectorAll('[data-gravity]').forEach((element) => {
  const original = document.createElement('span');
  original.className = 'sr-only';
  original.append(...Array.from(element.childNodes, (node) => node.cloneNode(true)));
  const visual = document.createElement('span');
  visual.className = 'gravity-visual';
  visual.setAttribute('aria-hidden', 'true');
  visual.append(...Array.from(element.childNodes));
  element.append(original, visual);

  const walker = document.createTreeWalker(visual, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((word) => {
      if (!word) return;
      if (/^\s+$/.test(word)) { fragment.append(document.createTextNode(word)); return; }
      const group = document.createElement('span');
      group.className = 'gravity-word';
      Array.from(word).forEach((letter) => {
        const span = document.createElement('span');
        span.className = 'gravity-letter';
        span.textContent = letter;
        group.append(span);
        gravityLetters.push({ element: span, x: 0, y: 0, vx: 0, vy: 0, cx: 0, cy: 0 });
      });
      fragment.append(group);
    });
    node.replaceWith(fragment);
  });
});

const gravityPreference = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
let gravityPointer = null;
let gravityFrame = 0;
let gravityTime = 0;
let gravityNeedsMeasure = true;

function animateGravity(time) {
  gravityFrame = 0;
  if (!gravityPreference.matches || document.hidden) return;
  // 120Hz 화면에서도 같은 속도로 감속하도록 시간 차를 반영합니다.
  const step = gravityTime ? Math.min((time - gravityTime) / 16.67, 2) : 1;
  gravityTime = time;
  if (gravityNeedsMeasure) {
    gravityLetters.forEach((letter) => {
      const rect = letter.element.getBoundingClientRect();
      letter.cx = rect.left + rect.width / 2 - letter.x;
      letter.cy = rect.top + rect.height / 2 - letter.y;
    });
    gravityNeedsMeasure = false;
  }
  let moving = false;
  gravityLetters.forEach((letter) => {
    let targetX = 0;
    let targetY = 0;
    if (gravityPointer) {
      const dx = letter.cx - gravityPointer.x;
      const dy = letter.cy - gravityPointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 120 && distance > 0) {
        const force = 8 * (1 - distance / 120) ** 2;
        targetX = dx / distance * force;
        targetY = dy / distance * force;
      }
    }
    letter.vx = (letter.vx + (targetX - letter.x) * .1 * step) * Math.pow(.65, step);
    letter.vy = (letter.vy + (targetY - letter.y) * .1 * step) * Math.pow(.65, step);
    letter.x += letter.vx * step;
    letter.y += letter.vy * step;
    const magnitude = Math.hypot(letter.x, letter.y);
    if (magnitude > 8) { letter.x *= 8 / magnitude; letter.y *= 8 / magnitude; }
    if (Math.abs(targetX - letter.x) + Math.abs(targetY - letter.y) + Math.abs(letter.vx) + Math.abs(letter.vy) > .015) moving = true;
    else { letter.x = targetX; letter.y = targetY; letter.vx = 0; letter.vy = 0; }
    letter.element.style.transform = `translate(${letter.x}px, ${letter.y}px)`;
  });
  if (moving) gravityFrame = requestAnimationFrame(animateGravity);
  else gravityTime = 0;
}

function requestGravityFrame() {
  if (!gravityFrame && gravityPreference.matches && !document.hidden) gravityFrame = requestAnimationFrame(animateGravity);
}
function releaseGravity() { gravityPointer = null; requestGravityFrame(); }
gravityRegion.addEventListener('pointermove', (event) => {
  if (!gravityPreference.matches || event.pointerType !== 'mouse') return;
  gravityPointer = { x: event.clientX, y: event.clientY };
  requestGravityFrame();
});
gravityRegion.addEventListener('pointerleave', releaseGravity);
gravityRegion.addEventListener('pointercancel', releaseGravity);
window.addEventListener('blur', releaseGravity);
['scroll', 'resize'].forEach((name) => window.addEventListener(name, () => {
  gravityNeedsMeasure = true;
  releaseGravity();
}, { passive: true }));
function resetGravity() {
  cancelAnimationFrame(gravityFrame);
  gravityFrame = 0;
  gravityTime = 0;
  gravityPointer = null;
  gravityNeedsMeasure = true;
  gravityLetters.forEach((letter) => {
    letter.x = letter.y = letter.vx = letter.vy = 0;
    letter.element.style.transform = '';
  });
}
gravityPreference.addEventListener('change', resetGravity);
document.addEventListener('visibilitychange', resetGravity);
if (document.fonts) document.fonts.ready.then(() => { gravityNeedsMeasure = true; });
