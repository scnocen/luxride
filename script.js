// Loader
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");

  if (loader) {
    setTimeout(() => {
      loader.style.display = "none";
    }, 800);
  }
});

// Mobile Navbar
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

// Close menu when clicking link
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    if (navLinks) {
      navLinks.classList.remove("active");
    }
  });
});

// Scroll Reveal Animation
function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");

  reveals.forEach((el) => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;
    const visiblePoint = 120;

    if (elementTop < windowHeight - visiblePoint) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

// Testimonials Slider
const testimonialCards = document.querySelectorAll(".testimonial-card");
const dots = document.querySelectorAll(".dot");

let currentIndex = 0;

function showTestimonial(index) {
  if (!testimonialCards.length || !dots.length) return;

  testimonialCards.forEach((card) => card.classList.remove("active"));
  dots.forEach((dot) => dot.classList.remove("active"));

  if (testimonialCards[index]) testimonialCards[index].classList.add("active");
  if (dots[index]) dots[index].classList.add("active");
}

if (testimonialCards.length && dots.length) {
  setInterval(() => {
    currentIndex++;
    if (currentIndex >= testimonialCards.length) {
      currentIndex = 0;
    }
    showTestimonial(currentIndex);
  }, 4000);
}

// FAQ Accordion
document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const faqItem = btn.parentElement;
    const answer = faqItem.querySelector(".faq-answer");
    const icon = btn.querySelector("span");

    if (answer.style.maxHeight) {
      answer.style.maxHeight = null;
      if (icon) icon.textContent = "+";
    } else {
      document.querySelectorAll(".faq-answer").forEach((a) => {
        a.style.maxHeight = null;
      });

      document.querySelectorAll(".faq-question span").forEach((i) => {
        i.textContent = "+";
      });

      answer.style.maxHeight = answer.scrollHeight + "px";
      if (icon) icon.textContent = "−";
    }
  });
});

// Cars Page: Load from API + Filter
document.addEventListener("DOMContentLoaded", () => {
  const carsContainer = document.getElementById("carsContainer");
  const searchForm = document.getElementById("carSearchForm");
  const searchName = document.getElementById("searchName");
  const categoryFilter = document.getElementById("categoryFilter");
  const transmissionFilter = document.getElementById("transmissionFilter");
  const fuelFilter = document.getElementById("fuelFilter");
  const resetFilters = document.getElementById("resetFilters");
  const noResultsMessage = document.getElementById("noResultsMessage");
  const resultsInfo = document.getElementById("resultsInfo");

  if (!carsContainer) return;

  let allCars = [];

  function slugifyCarName(name) {
    return name.toLowerCase().replace(/\s+/g, "-");
  }

  function normalizeCategory(category) {
    if (!category) return "";

    const value = category.toLowerCase();

    if (value.includes("luxury")) return "luxury";
    if (value.includes("suv")) return "suv";
    if (value.includes("sport")) return "sport";
    if (value.includes("electric")) return "electric";
    if (value.includes("vip")) return "vip";

    return value;
  }

  function createCarCard(car) {
    const slug = slugifyCarName(car.name || "");
    const category = normalizeCategory(car.category || "");
    const transmission = (car.transmission || "").toLowerCase();
    const fuel = (car.fuel || "").toLowerCase();

    return `
      <div class="car-card reveal"
           data-name="${(car.name || "").toLowerCase()}"
           data-category="${category}"
           data-transmission="${transmission}"
           data-fuel="${fuel}">
        <img src="${car.image || ""}" alt="${car.name || "Car"}">
        <div class="car-info">
          <h3>${car.name || "Unknown Car"}</h3>
          <p class="muted">${car.transmission || "Automatic"} • ${car.seats || 4} Seats • ${car.fuel || "Petrol"}</p>
          <div class="car-bottom">
            <span class="price">$${Number(car.price_per_day || 0)}/day</span>
            <a class="mini-btn" href="car-details.html?car=${slug}">View</a>
          </div>
        </div>
      </div>
    `;
  }

  function renderCars(cars) {
    carsContainer.innerHTML = "";

    if (!cars.length) {
      if (noResultsMessage) noResultsMessage.style.display = "block";
      if (resultsInfo) resultsInfo.textContent = "";
      return;
    }

    if (noResultsMessage) noResultsMessage.style.display = "none";
    if (resultsInfo) resultsInfo.textContent = `${cars.length} car(s) found.`;

    cars.forEach((car) => {
      carsContainer.innerHTML += createCarCard(car);
    });

    revealOnScroll();
  }

  function filterCars() {
    const nameValue = searchName ? searchName.value.trim().toLowerCase() : "";
    const categoryValue = categoryFilter ? categoryFilter.value.toLowerCase() : "";
    const transmissionValue = transmissionFilter ? transmissionFilter.value.toLowerCase() : "";
    const fuelValue = fuelFilter ? fuelFilter.value.toLowerCase() : "";

    const filteredCars = allCars.filter((car) => {
      const carName = (car.name || "").toLowerCase();
      const carCategory = normalizeCategory(car.category || "");
      const carTransmission = (car.transmission || "").toLowerCase();
      const carFuel = (car.fuel || "").toLowerCase();

      const matchesName = !nameValue || carName.includes(nameValue);
      const matchesCategory = !categoryValue || carCategory === categoryValue;
      const matchesTransmission = !transmissionValue || carTransmission === transmissionValue;
      const matchesFuel = !fuelValue || carFuel === fuelValue;

      return matchesName && matchesCategory && matchesTransmission && matchesFuel;
    });

    renderCars(filteredCars);
  }

  async function loadCars() {
    try {
      const response = await fetch("/api/cars");

      if (!response.ok) {
        throw new Error("Failed to fetch cars");
      }

      const data = await response.json();
      allCars = Array.isArray(data) ? data : [];
      renderCars(allCars);
    } catch (error) {
      console.error("Error loading cars:", error);
      carsContainer.innerHTML = `
        <p style="color:#fff; text-align:center; width:100%;">
          Failed to load cars from the server.
        </p>
      `;
    }
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      filterCars();
    });
  }

  if (resetFilters) {
    resetFilters.addEventListener("click", () => {
      if (searchName) searchName.value = "";
      if (categoryFilter) categoryFilter.value = "";
      if (transmissionFilter) transmissionFilter.value = "";
      if (fuelFilter) fuelFilter.value = "";

      renderCars(allCars);
    });
  }

  loadCars();
});