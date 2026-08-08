(() => {
  const stepTitle = "Text the screenshot first, then send the actual link during meeting!";
  const summaryTitle = "Guide customer after they signed up";
  const uploadedImage = "free cover approach .png";
  const summaryImage = "free cover approach -summary.png";

  function setSlideImage(media, titleText, imagePath) {
    const image = media.querySelector("img");

    if (image) {
      image.src = imagePath;
      image.alt = titleText;
      image.style.display = "";
    } else {
      const img = document.createElement("img");
      img.src = imagePath;
      img.alt = titleText;
      media.innerHTML = "";
      media.appendChild(img);
    }
  }

  function fixFreeCoverSlides() {
    document.querySelectorAll(".process").forEach((process) => {
      const title = process.querySelector(".process-copy h2");
      const media = process.querySelector(".process-media");
      if (!title || !media) return;

      const text = title.textContent.trim();

      if (text === stepTitle) {
        setSlideImage(media, stepTitle, uploadedImage);
      }

      if (text === summaryTitle) {
        setSlideImage(media, summaryTitle, summaryImage);
      }
    });
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
  }
})();
