// ---- PRELOADER ----
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('fade-out');
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => { document.body.style.opacity = '1'; }, 100);
  }, 1800);
});

// ---- AOS INIT ----
AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });

// ---- NAVBAR SCROLL ----
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
  
  // Scroll-to-top
  const btn = document.getElementById('scrollTop');
  if (window.scrollY > 400) btn.classList.add('visible');
  else btn.classList.remove('visible');
});

// ---- ACTIVE NAV LINK ----
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.getAttribute('id');
  });
  navLinks.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + current) a.classList.add('active');
  });
});

// ---- SMOOTH SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      // Close mobile menu
      const collapse = document.getElementById('navMenu');
      if (collapse.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(collapse).hide();
      }
    }
  });
});

// ---- COUNTERS ----
function animateCount(el) {
  const target = +el.getAttribute('data-count');
  const suffix = el.parentElement.querySelector('.counter-label')?.textContent.includes('%') ? '+' : '+';
  let count = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    count = Math.min(count + step, target);
    el.textContent = Math.floor(count) + (el.closest('#stats') ? '' : '+');
    if (count >= target) clearInterval(timer);
  }, 25);
}

const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      animateCount(entry.target);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// ---- PROGRESS BARS ----
const bars = document.querySelectorAll('.progress-bar-fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.getAttribute('data-width') + '%';
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
bars.forEach(b => barObserver.observe(b));

// ---- SWIPER ----
new Swiper('.swiper-testimonials', {
  slidesPerView: 1,
  spaceBetween: 24,
  loop: true,
  autoplay: { delay: 4000, disableOnInteraction: false },
  pagination: { el: '.swiper-pagination', clickable: true },
  breakpoints: {
    640: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 2 }
  }
});

// ---- FORM ----
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const fields = this.querySelectorAll('input[required], textarea[required]');
  let valid = true;
  fields.forEach(f => {
    if (!f.value.trim()) {
      valid = false;
      f.style.borderColor = '#e74c3c';
      setTimeout(() => { f.style.borderColor = ''; }, 2000);
    }
  });
  if (valid) {
    this.style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
  }
});

// ---- PARALLAX HERO ----
window.addEventListener('scroll', () => {
  const hero = document.getElementById('hero');
  if (hero) hero.style.backgroundPositionY = (window.scrollY * 0.4) + 'px';
});