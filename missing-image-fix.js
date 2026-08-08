(() => {
  const stepTitle = "Text the screenshot first, then send the actual link during meeting!";
  const summaryTitle = "Guide customer after they signed up";
  const uploadedImage = "free cover approach .png";
 const summaryImage = "free cover approach -summary.png";

  function currentSlideParts() {
    const title = document.querySelector(".process-copy h2");
    const media = document.querySelector(".process-media");
    const image = media ? media.querySelector("img") : null;
    return { title, media, image };
  }

  function fixFreeCoverSlides() {
    const { title, media, image } = currentSlideParts();
    if (!title || !media) return;

    const text = title.textContent.trim();

    if (text === stepTitle) {
      if (image) {
        image.src = uploadedImage;
        image.style.display = "";
      } else {
        const img = document.createElement("img");
        img.src = uploadedImage;
        img.alt = stepTitle;
        media.innerHTML = "";
        media.appendChild(img);
      }
    }

    if (text === summaryTitle) {
      if (image) {
        image.src = summaryImage;
        image.style.display = "";
      } else {
        const img = document.createElement("img");
        img.src = summaryImage;
        img.alt = summaryTitle;
        media.innerHTML = "";
        media.appendChild(img);
      }
    }
  }

  const start = () => {
    fixFreeCoverSlides();
    new MutationObserver(fixFreeCoverSlides).observe(document.body, {
      childList: true,
      subtree: true
    });
    window.addEventListener("hashchange", () => setTimeout(fixFreeCoverSlides, 0));
    document.addEventListener("click", () => setTimeout(fixFreeCoverSlides, 0));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
