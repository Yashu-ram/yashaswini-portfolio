const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&0123456789";
const preloader = document.querySelector(".preloader");
const scramble = document.querySelector(".scramble-text");
const revealItems = document.querySelectorAll(".reveal");
const serviceRows = document.querySelectorAll(".service-row");
const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const contactForm = document.querySelector(".contact-form");
const heroStage = document.querySelector(".hero-stage");
const heroImage = document.querySelector("[data-hero-image]");

function runScramble(element, finalText, duration = 1700) {
  const start = performance.now();
  const finalChars = finalText.split("");

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const locked = Math.floor(progress * finalChars.length);
    element.textContent = finalChars
      .map((char, index) => {
        if (index < locked || progress === 1) return char;
        return letters[Math.floor(Math.random() * letters.length)];
      })
      .join("");

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    window.setTimeout(() => {
      preloader.classList.add("is-hidden");
      document.querySelector(".hero-stage")?.classList.add("is-visible");
    }, 240);
  }

  requestAnimationFrame(tick);
}

runScramble(scramble, scramble.dataset.text);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => observer.observe(item));

serviceRows.forEach((row) => {
  const button = row.querySelector("button");
  button.addEventListener("click", () => {
    const shouldOpen = !row.classList.contains("is-open");
    serviceRows.forEach((item) => {
      item.classList.remove("is-open");
      item.querySelector("button").setAttribute("aria-expanded", "false");
    });
    if (shouldOpen) {
      row.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

menuButton.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = contactForm.querySelector("button");
  const original = button.textContent;
  button.textContent = "Message ready";
  window.setTimeout(() => {
    button.textContent = original;
    contactForm.reset();
  }, 1400);
});

function setupHeroParallax() {
  if (!heroStage || !heroImage) return;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canHover || prefersReducedMotion) return;

  const state = { rx: 0, ry: 0, gx: 0, gy: 0 };
  const target = { rx: 0, ry: 0, gx: 0, gy: 0 };
  let running = false;

  function animate() {
    state.rx += (target.rx - state.rx) * 0.12;
    state.ry += (target.ry - state.ry) * 0.12;
    state.gx += (target.gx - state.gx) * 0.1;
    state.gy += (target.gy - state.gy) * 0.1;

    heroImage.style.setProperty("--tilt-x", `${state.rx.toFixed(3)}deg`);
    heroImage.style.setProperty("--tilt-y", `${state.ry.toFixed(3)}deg`);
    heroImage.style.setProperty("--glow-x", `${state.gx.toFixed(2)}px`);
    heroImage.style.setProperty("--glow-y", `${state.gy.toFixed(2)}px`);

    if (
      Math.abs(target.rx - state.rx) > 0.01 ||
      Math.abs(target.ry - state.ry) > 0.01 ||
      Math.abs(target.gx - state.gx) > 0.05 ||
      Math.abs(target.gy - state.gy) > 0.05
    ) {
      requestAnimationFrame(animate);
      return;
    }

    running = false;
  }

  function startLoop() {
    if (running) return;
    running = true;
    requestAnimationFrame(animate);
  }

  heroStage.addEventListener("mousemove", (event) => {
    const rect = heroStage.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    target.ry = Math.max(-1, Math.min(1, x)) * 8;
    target.rx = Math.max(-1, Math.min(1, -y)) * 6;
    target.gx = Math.max(-1, Math.min(1, x)) * 14;
    target.gy = Math.max(-1, Math.min(1, y)) * 10;
    startLoop();
  });

  heroStage.addEventListener("mouseleave", () => {
    target.rx = 0;
    target.ry = 0;
    target.gx = 0;
    target.gy = 0;
    startLoop();
  });
}

setupHeroParallax();
