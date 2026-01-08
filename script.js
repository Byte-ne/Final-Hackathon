// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Parallax Car Animation =====
const car = document.getElementById('car');
const roadLine = document.getElementById('roadLine');
const roadContainer = document.getElementById('roadContainer');

const SVG_HEIGHT = 5000;
const SVG_WIDTH = 100;

function updateCarPosition() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Get road container position relative to viewport
  const roadRect = roadContainer.getBoundingClientRect();
  
  // Calculate where on the page the center of the screen is
  const viewportCenter = window.innerHeight / 2;
  const absoluteCenterY = scrollTop + viewportCenter;
  
  // Calculate what percentage of the road height this represents
  const roadHeight = roadContainer.offsetHeight;
  const roadScrollPercent = Math.min(Math.max(absoluteCenterY / roadHeight, 0), 1);
  
  // Get the SVG y-coordinate at this percentage
  const svgY = roadScrollPercent * SVG_HEIGHT;
  
  // The road is straight, so x is always 50 (center)
  const svgX = 50;
  
  // Convert SVG x coordinate to actual pixels
  const scaleX = roadRect.width / SVG_WIDTH;
  const actualX = svgX * scaleX;
  
  // Position car: fixed to viewport center vertically, following road horizontally
  car.style.left = (roadRect.left + actualX) + 'px';
  car.style.transform = 'translate(-50%, -50%) scaleY(-1)';
}

// Throttle scroll events for better performance
let ticking = false;
window.addEventListener('scroll', function() {
  if (!ticking) {
    window.requestAnimationFrame(function() {
      updateCarPosition();
      ticking = false;
    });
    ticking = true;
  }
});

window.addEventListener('resize', updateCarPosition);
setTimeout(updateCarPosition, 100);

// ===== Scroll Reveal Animation =====
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

// ===== Animated Counter for Stats =====
function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-count'));
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;
  
  const updateCounter = () => {
    current += increment;
    if (current < target) {
      element.textContent = Math.floor(current).toLocaleString();
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target.toLocaleString() + (element.parentElement.querySelector('.stat-label').textContent.includes('%') ? '' : '+');
    }
  };
  
  updateCounter();
}

// Observe stats section for counter animation
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNumbers = entry.target.querySelectorAll('.stat-number');
      statNumbers.forEach((num, index) => {
        setTimeout(() => animateCounter(num), index * 100);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
  statsObserver.observe(statsSection);
}

// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});