(() => {
  "use strict";

  const course = window.COURSE_DATA;
  const stateKey = "aia-digital-tools-independent-progress-v1";
  const main = document.querySelector("#main");
  const nav = document.querySelector("#lessonNav");
  const sidebar = document.querySelector("#sidebar");
  const scrim = document.querySelector("#scrim");
  const searchDialog = document.querySelector("#searchDialog");
  const searchInput = document.querySelector("#searchInput");
  const searchResults = document.querySelector("#searchResults");
  const imageDialog = document.querySelector("#imageDialog");
  let state = loadState();

  document.querySelector("#brandTitle").textContent = course.title;
  document.querySelector("#brandLogo").src = course.logo || "";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(stateKey)) || { lessons: {}, processes: {} };
    } catch {
      return { lessons: {}, processes: {} };
    }
  }

  function saveState() {
    localStorage.setItem(stateKey, JSON.stringify(state));
    renderNav();
    renderProgress();
  }

  function stripHtml(value) {
    const element = document.createElement("div");
    element.innerHTML = value || "";
    return element.textContent.trim();
  }

  function lessonText(lesson) {
    return lesson.blocks.map((block) => {
      if (block.type === "process") {
        return block.slides.map((slide) => `${slide.title} ${stripHtml(slide.description)}`).join(" ");
      }
      return `${stripHtml(block.html)} ${block.name || ""}`;
    }).join(" ");
  }

  function renderNav(activeId = routeLessonId()) {
    nav.innerHTML = course.lessons.map((lesson, index) => {
      const complete = Boolean(state.lessons[lesson.id]);
      return `
        <a class="lesson-link ${lesson.id === activeId ? "active" : ""} ${complete ? "complete" : ""}"
           href="#/lesson/${lesson.id}">
          <span class="lesson-status" aria-hidden="true">${complete ? "✓" : index + 1}</span>
          <span>${lesson.title}</span>
        </a>`;
    }).join("");
  }

  function renderProgress() {
    const complete = course.lessons.filter((lesson) => state.lessons[lesson.id]).length;
    const percent = Math.round((complete / course.lessons.length) * 100);
    document.querySelector("#progressText").textContent = `${percent}%`;
    document.querySelector("#progressBar").style.width = `${percent}%`;
  }

  function routeLessonId() {
    const match = location.hash.match(/^#\/lesson\/([^/]+)/);
    return match ? match[1] : null;
  }

  function textBlock(block) {
    const levelClass = block.variant === "heading" ? "heading" : block.variant === "subheading" ? "subheading" : "paragraph";
    return `<section class="block text-block ${levelClass}">${block.html}</section>`;
  }

  function imageTextBlock(block) {
    return `
      <section class="block image-text">
        <button class="zoom-trigger" type="button" data-image="${encodeURI(block.image)}" data-caption="${escapeAttribute(block.caption)}" aria-label="Enlarge image">
          <img src="${encodeURI(block.image)}" alt="${escapeAttribute(stripHtml(block.caption))}" loading="lazy">
        </button>
        <div class="image-copy">${block.html}</div>
      </section>`;
  }

  function processBlock(block) {
    const current = Math.min(state.processes[block.id] || 0, block.slides.length - 1);
    return `
      <section class="block process" data-process="${block.id}">
        <div class="process-top">
          <span class="process-count">Screen <b>${current + 1}</b> of ${block.slides.length}</span>
          <div class="process-dots" aria-label="Process screens">
            ${block.slides.map((slide, index) => `
              <button class="process-dot ${index === current ? "active" : ""}" type="button"
                data-process-index="${index}" aria-label="Go to screen ${index + 1}" aria-current="${index === current ? "step" : "false"}"></button>
            `).join("")}
          </div>
        </div>
        <div class="process-body"></div>
        <div class="process-actions">
          <button type="button" data-process-action="previous" ${current === 0 ? "disabled" : ""}>← Previous</button>
          <button type="button" data-process-action="next">${current === block.slides.length - 1 ? "Start again" : "Next →"}</button>
        </div>
      </section>`;
  }

  function attachmentBlock(block) {
    return `
      <section class="block attachment">
        <div><strong>${block.name}</strong><small>${(block.size / 1048576).toFixed(1)} MB PDF</small></div>
        <a class="primary-button" href="${encodeURI(block.file)}" target="_blank" rel="noopener">Open PDF</a>
      </section>`;
  }

  function renderProcess(processElement, block) {
    const index = Math.min(state.processes[block.id] || 0, block.slides.length - 1);
    const slide = block.slides[index];
    const label = slide.type === "intro" ? "Introduction" : slide.type === "summary" ? "Summary" : `Step ${index}`;
    processElement.querySelector(".process-body").innerHTML = `
      <div class="process-slide">
        <div class="process-copy">
          <div class="step-label">${label}</div>
          <h2>${slide.title}</h2>
          <div>${slide.description}</div>
        </div>
        ${slide.image ? `
          <button class="process-media" type="button" data-image="${encodeURI(slide.image)}" data-caption="${escapeAttribute(slide.title)}" aria-label="Enlarge image">
            <img src="${encodeURI(slide.image)}" alt="" loading="lazy">
          </button>` : "<div class=\"process-media\" aria-hidden=\"true\"></div>"}
      </div>`;
    processElement.querySelector(".process-count b").textContent = index + 1;
    processElement.querySelectorAll(".process-dot").forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
      dot.setAttribute("aria-current", dotIndex === index ? "step" : "false");
    });
    const previous = processElement.querySelector('[data-process-action="previous"]');
    const next = processElement.querySelector('[data-process-action="next"]');
    previous.disabled = index === 0;
    next.textContent = index === block.slides.length - 1 ? "Start again" : "Next →";
  }

  function renderHome() {
    main.innerHTML = `
      <div class="content course-intro">
        <h1>${course.title}</h1>
        <p>${course.description}</p>
        <a class="primary-button" href="#/lesson/${course.lessons[0].id}">Start course →</a>
        <div class="lesson-grid">
          ${course.lessons.map((lesson, index) => `
            <a class="lesson-card" href="#/lesson/${lesson.id}">
              <small>Lesson ${index + 1}${state.lessons[lesson.id] ? " · Complete" : ""}</small>
              <h2>${lesson.title}</h2>
            </a>`).join("")}
        </div>
      </div>`;
    document.title = course.title;
  }

  function renderLesson(lesson) {
    const index = course.lessons.indexOf(lesson);
    state.lessons[lesson.id] = true;
    saveState();
    main.innerHTML = `
      <article class="content">
        <header class="lesson-head">
          <p class="lesson-kicker">Lesson ${index + 1} of ${course.lessons.length}</p>
          <h1>${lesson.title}</h1>
        </header>
        ${lesson.blocks.map((block) => {
          if (block.type === "text") return textBlock(block);
          if (block.type === "imageText") return imageTextBlock(block);
          if (block.type === "process") return processBlock(block);
          if (block.type === "attachment") return attachmentBlock(block);
          return "";
        }).join("")}
        <nav class="lesson-footer" aria-label="Lesson navigation">
          ${index > 0 ? `<a href="#/lesson/${course.lessons[index - 1].id}">← ${course.lessons[index - 1].title}</a>` : "<span></span>"}
          ${index < course.lessons.length - 1 ? `<a href="#/lesson/${course.lessons[index + 1].id}">${course.lessons[index + 1].title} →</a>` : `<a href="#/">Course home →</a>`}
        </nav>
      </article>`;

    lesson.blocks.filter((block) => block.type === "process").forEach((block) => {
      const processElement = main.querySelector(`[data-process="${block.id}"]`);
      renderProcess(processElement, block);
    });
    document.title = `${lesson.title} | ${course.title}`;
  }

  function renderRoute() {
    const lessonId = routeLessonId();
    const lesson = course.lessons.find((item) => item.id === lessonId);
    if (lesson) renderLesson(lesson);
    else renderHome();
    renderNav(lessonId);
    renderProgress();
    closeMenu();
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  function escapeAttribute(value = "") {
    return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  function showImage(source, caption) {
    document.querySelector("#dialogImage").src = decodeURI(source);
    document.querySelector("#dialogCaption").textContent = caption || "";
    imageDialog.showModal();
  }

  function openMenu() {
    sidebar.classList.add("open");
    scrim.classList.add("open");
  }

  function closeMenu() {
    sidebar.classList.remove("open");
    scrim.classList.remove("open");
  }

  main.addEventListener("click", (event) => {
    const image = event.target.closest("[data-image]");
    if (image) {
      showImage(image.dataset.image, image.dataset.caption);
      return;
    }

    const process = event.target.closest("[data-process]");
    if (!process) return;
    const block = course.lessons.flatMap((lesson) => lesson.blocks).find((item) => item.id === process.dataset.process);
    let index = state.processes[block.id] || 0;
    const dot = event.target.closest("[data-process-index]");
    const action = event.target.closest("[data-process-action]");
    if (dot) index = Number(dot.dataset.processIndex);
    if (action?.dataset.processAction === "previous") index = Math.max(0, index - 1);
    if (action?.dataset.processAction === "next") index = index === block.slides.length - 1 ? 0 : index + 1;
    state.processes[block.id] = index;
    saveState();
    renderProcess(process, block);
  });

  document.querySelector("#menuButton").addEventListener("click", openMenu);
  document.querySelector("#closeMenu").addEventListener("click", closeMenu);
  scrim.addEventListener("click", closeMenu);
  document.querySelector("#imageClose").addEventListener("click", () => imageDialog.close());
  imageDialog.addEventListener("click", (event) => {
    if (event.target === imageDialog) imageDialog.close();
  });

  document.querySelector("#searchButton").addEventListener("click", () => {
    searchDialog.showModal();
    searchInput.value = "";
    searchResults.innerHTML = "<p>Type to search all lessons.</p>";
    searchInput.focus();
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      searchResults.innerHTML = "<p>Type to search all lessons.</p>";
      return;
    }
    const matches = course.lessons.filter((lesson) =>
      `${lesson.title} ${lessonText(lesson)}`.toLowerCase().includes(query)
    );
    searchResults.innerHTML = matches.length
      ? matches.map((lesson) => `<a class="search-result" href="#/lesson/${lesson.id}"><strong>${lesson.title}</strong><span>Open lesson</span></a>`).join("")
      : "<p>No matching lessons found.</p>";
  });

  searchResults.addEventListener("click", () => searchDialog.close());
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
})();
