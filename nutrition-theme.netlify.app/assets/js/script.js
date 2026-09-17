const HB = (() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initBase() {
    const hidePreloader = () => $("#preloader")?.classList.add("fade-out");
    setTimeout(hidePreloader, 700);
    window.addEventListener("load", () => setTimeout(hidePreloader, 250));

    const nav = $("#mainNav");
    const onScroll = () => {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 50);
      $("#scrollTop")?.classList.toggle("visible", window.scrollY > 420);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);

    $$("a[href^='#']").forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = $(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        window.scrollTo({ top: target.offsetTop - 78, behavior: "smooth" });
        const menu = $("#navMenu");
        if (menu?.classList.contains("show") && window.bootstrap) {
          bootstrap.Collapse.getOrCreateInstance(menu).hide();
        }
      });
    });

    $$(".image-slot img").forEach((img) => {
      const markEmpty = () => img.closest(".image-slot")?.classList.add("is-empty");
      if (img.complete && img.naturalWidth === 0) markEmpty();
      img.addEventListener("error", markEmpty);
    });

    if (window.AOS) AOS.init({ duration: 650, easing: "ease-out-cubic", once: true, offset: 60 });
  }

  function initLogin() {
    const form = $("#loginForm");
    if (!form) return;
    const error = $("#loginError");
    const email = $("#loginEmail");
    const password = $("#loginPassword");
    const next = new URLSearchParams(window.location.search).get("next") || "cuestionario.html";

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailValue = email.value.trim();
      const passwordValue = password.value.trim();
      if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
        error.textContent = "Please enter a valid email address.";
        return;
      }
      if (passwordValue.length < 6) {
        error.textContent = "Password must have at least 6 characters.";
        return;
      }
      localStorage.setItem("hb_user", JSON.stringify({ email: emailValue, loggedInAt: new Date().toISOString() }));
      window.location.href = next;
    });
  }

  function initGoal() {
    const form = $("#goalForm");
    if (!form) return;
    const input = $("#goalInput");
    const progress = $("#goalProgress");
    const quote = $("#goalQuote");
    const label = $("#goalProgressLabel");
    const saved = JSON.parse(localStorage.getItem("hb_goal") || "null") || { text: "Reduce my stress", progress: 3 };

    function render() {
      input.value = saved.text;
      progress.value = saved.progress;
      quote.textContent = `"${saved.text}"`;
      label.textContent = `Progress: ${saved.progress}/7 days`;
      $(".goal-card .progress-fill")?.style.setProperty("--progress", `${(saved.progress / 7) * 100}%`);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      saved.text = input.value.trim() || "Reduce my stress";
      saved.progress = Number(progress.value);
      localStorage.setItem("hb_goal", JSON.stringify(saved));
      render();
    });
    render();
  }

  function initResources() {
    $$(".resource-toggle").forEach((button) => {
      button.addEventListener("click", () => button.closest(".resource-card")?.classList.toggle("open"));
    });

    $$(".mark-complete").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".resource-card");
        card?.classList.add("completed");
        button.textContent = "Completed";
      });
    });
  }

  function initBooking() {
    const root = $("#bookingApp");
    if (!root) return;

    const state = JSON.parse(localStorage.getItem("hb_session") || "null") || {
      type: "",
      specialist: "",
      date: "",
      time: "",
      duration: "45 minutes"
    };

    const specialists = {
      psychology: [
        { name: "Specialist Name", specialty: "Psychologist", desc: "Emotional well-being, stress management and personal concerns." },
        { name: "Specialist Name", specialty: "Mental Wellness Guide", desc: "Small habit changes, motivation and daily balance." }
      ],
      nutrition: [
        { name: "Specialist Name", specialty: "Nutritionist", desc: "Healthy eating, nutrition goals and meal organization." },
        { name: "Specialist Name", specialty: "Nutrition Coach", desc: "Hydration, nutrients and practical eating habits." }
      ]
    };
    const availableDates = ["June 24", "June 26", "June 28", "July 2"];
    const availableTimes = ["9:00 AM", "11:30 AM", "4:00 PM", "6:00 PM"];

    function setStep(step) {
      $$(".booking-step", root).forEach((item, index) => item.classList.toggle("active", index === step));
    }

    function saveAndSummary() {
      localStorage.setItem("hb_session", JSON.stringify(state));
      const upcoming = $("#upcomingSession");
      if (!upcoming || !state.type || !state.specialist || !state.date || !state.time) return;
      upcoming.style.display = "block";
      upcoming.innerHTML = `
        <div class="card-kicker">Your upcoming session</div>
        <h3 class="card-title" style="color:white">${state.type === "psychology" ? "Psychology Session" : "Nutrition Session"}</h3>
        <p>${state.date} at ${state.time}</p>
        <p>With ${state.specialist}</p>
        <div class="hero-actions">
          <button class="btn-main" type="button" data-reschedule>Reschedule</button>
          <button class="btn-ghost" type="button" data-cancel>Cancel</button>
        </div>`;
      $("[data-cancel]", upcoming).onclick = () => {
        localStorage.removeItem("hb_session");
        upcoming.style.display = "none";
      };
      $("[data-reschedule]", upcoming).onclick = () => window.scrollTo({ top: root.offsetTop - 80, behavior: "smooth" });
    }

    function renderSpecialists(type) {
      const holder = $("#specialistChoices");
      holder.innerHTML = specialists[type].map((person) => `
        <button class="choice-card specialist-choice" type="button" data-name="${person.name}" data-specialty="${person.specialty}">
          <div class="photo-slot">Photo placeholder<br>${person.specialty.toLowerCase()}-photo.jpg</div>
          <strong>${person.name}</strong>
          <p class="mb-1">${person.specialty}</p>
          <small>${person.desc}</small>
        </button>`).join("");
      $$(".specialist-choice", holder).forEach((button) => {
        button.onclick = () => {
          state.specialist = `${button.dataset.name} - ${button.dataset.specialty}`;
          $$(".specialist-choice", holder).forEach((item) => item.classList.remove("selected"));
          button.classList.add("selected");
          $("#dateStep").hidden = false;
          setStep(2);
        };
      });
    }

    $$(".session-type", root).forEach((button) => {
      button.onclick = () => {
        state.type = button.dataset.type;
        $$(".session-type", root).forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        $("#specialistStep").hidden = false;
        renderSpecialists(state.type);
        setStep(1);
      };
    });

    $("#dateChoices").innerHTML = availableDates.map((date) => `<button class="date-option" type="button">${date}</button>`).join("");
    $$(".date-option", root).forEach((button) => {
      button.onclick = () => {
        state.date = button.textContent;
        $$(".date-option", root).forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        $("#timeStep").hidden = false;
        setStep(3);
      };
    });

    $("#timeChoices").innerHTML = availableTimes.map((time) => `<button class="time-option" type="button">${time}</button>`).join("");
    $$(".time-option", root).forEach((button) => {
      button.onclick = () => {
        state.time = button.textContent;
        $$(".time-option", root).forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        $("#confirmStep").hidden = false;
        $("#sessionDetails").innerHTML = `
          <li>Type: ${state.type === "psychology" ? "Psychology Session" : "Nutrition Session"}</li>
          <li>Professional: ${state.specialist}</li>
          <li>Date: ${state.date}</li>
          <li>Time: ${state.time}</li>
          <li>Duration: ${state.duration}</li>`;
      };
    });

    $("#confirmSession")?.addEventListener("click", saveAndSummary);
    saveAndSummary();
  }

  const quizQuestions = [
    {
      area: "Nutrition",
      text: "How organized does your eating feel during a normal week?",
      options: [
        { label: "Very disorganized. I often skip meals or improvise.", scores: { nutrition: 4 }, reason: "your meals need more structure" },
        { label: "Somewhat inconsistent, but I try to choose balanced meals.", scores: { nutrition: 2 }, reason: "your nutrition habits are close but inconsistent" },
        { label: "Mostly organized and balanced.", scores: { nutrition: 0 }, reason: "nutrition seems like a current strength" }
      ]
    },
    {
      area: "Nutrition",
      text: "What habit would help your energy most right now?",
      options: [
        { label: "Planning meals and snacks.", scores: { nutrition: 3 }, reason: "meal planning could stabilize your energy" },
        { label: "Drinking more water.", scores: { nutrition: 2 }, reason: "hydration is an easy nutrition win" },
        { label: "Reducing stress around food.", scores: { mentalWellness: 2, nutrition: 1 }, reason: "food choices are linked with stress for you" }
      ]
    },
    {
      area: "Physical Activity",
      text: "How often do you move intentionally each week?",
      options: [
        { label: "Rarely or almost never.", scores: { physicalActivity: 4 }, reason: "your body would benefit from more consistent movement" },
        { label: "One or two times.", scores: { physicalActivity: 2 }, reason: "your movement routine needs more frequency" },
        { label: "Three or more times.", scores: { physicalActivity: 0 }, reason: "movement is already present in your routine" }
      ]
    },
    {
      area: "Physical Activity",
      text: "Which physical goal feels most useful?",
      options: [
        { label: "Build a simple beginner routine.", scores: { physicalActivity: 3 }, reason: "starting small will make exercise easier to maintain" },
        { label: "Improve mobility and recovery.", scores: { physicalActivity: 2 }, reason: "recovery and mobility need attention" },
        { label: "Keep progressing in training.", scores: { physicalActivity: 1 }, reason: "you are ready for more intentional training structure" }
      ]
    },
    {
      area: "Mental Wellness",
      text: "How has your stress felt lately?",
      options: [
        { label: "High and frequent.", scores: { mentalWellness: 4 }, reason: "stress is a major signal in your answers" },
        { label: "Moderate, but manageable.", scores: { mentalWellness: 2 }, reason: "stress support could help you stay balanced" },
        { label: "Low most days.", scores: { mentalWellness: 0 }, reason: "your stress appears well managed" }
      ]
    },
    {
      area: "Mental Wellness",
      text: "What usually blocks your wellness habits?",
      options: [
        { label: "Losing motivation.", scores: { mentalWellness: 3 }, reason: "motivation and emotional consistency are key for you" },
        { label: "Not enough time.", scores: { mentalWellness: 2, physicalActivity: 1 }, reason: "time organization is affecting your routine" },
        { label: "Not knowing what to eat.", scores: { nutrition: 3 }, reason: "nutrition guidance would remove uncertainty" }
      ]
    },
    {
      area: "Daily Habits",
      text: "How is your sleep and recovery?",
      options: [
        { label: "Poor. I wake up tired often.", scores: { mentalWellness: 3, physicalActivity: 1 }, reason: "recovery is limiting your overall wellness" },
        { label: "Average. It changes by week.", scores: { mentalWellness: 2 }, reason: "sleep consistency could support your goals" },
        { label: "Good most nights.", scores: { mentalWellness: 0 }, reason: "sleep is helping your progress" }
      ]
    },
    {
      area: "Personal Goal",
      text: "What outcome matters most to you right now?",
      options: [
        { label: "Eat better and feel lighter.", scores: { nutrition: 3 }, reason: "your goal points toward nutrition support" },
        { label: "Feel calmer and more focused.", scores: { mentalWellness: 3 }, reason: "your goal points toward mental balance" },
        { label: "Move more and feel stronger.", scores: { physicalActivity: 3 }, reason: "your goal points toward movement support" }
      ]
    }
  ];

  function initQuiz() {
    const root = $("#quizApp");
    if (!root) return;

    let index = 0;
    const answers = [];
    const progress = $("#quizProgressFill");
    const step = $("#quizStep");
    const resultCard = $("#quizResult");
    const questionCard = $("#questionCard");

    function render() {
      const q = quizQuestions[index];
      progress.style.setProperty("--progress", `${(index / quizQuestions.length) * 100}%`);
      step.textContent = `Question ${index + 1} of ${quizQuestions.length}`;
      questionCard.innerHTML = `
        <div class="card-kicker">${q.area}</div>
        <h1 class="question-title">${q.text}</h1>
        <div class="option-grid">
          ${q.options.map((option, optionIndex) => `
            <button class="option-card ${answers[index] === optionIndex ? "selected" : ""}" type="button" data-index="${optionIndex}">
              ${option.label}
            </button>`).join("")}
        </div>
        <div class="quiz-actions">
          <button class="btn-soft" type="button" id="quizBack" ${index === 0 ? "disabled" : ""}>Back</button>
          <button class="btn-main" type="button" id="quizNext">${index === quizQuestions.length - 1 ? "See my result" : "Continue"}</button>
        </div>
        <p class="form-error" id="quizError"></p>`;

      $$(".option-card", questionCard).forEach((button) => {
        button.onclick = () => {
          answers[index] = Number(button.dataset.index);
          $$(".option-card", questionCard).forEach((item) => item.classList.remove("selected"));
          button.classList.add("selected");
          $("#quizError").textContent = "";
        };
      });

      $("#quizBack").onclick = () => {
        if (index > 0) {
          index -= 1;
          render();
        }
      };

      $("#quizNext").onclick = () => {
        if (answers[index] === undefined) {
          $("#quizError").textContent = "Please select one answer to continue.";
          return;
        }
        if (index === quizQuestions.length - 1) renderResult();
        else {
          index += 1;
          render();
        }
      };
    }

    function calculateResult() {
      const scores = { nutrition: 0, mentalWellness: 0, physicalActivity: 0 };
      const reasons = [];
      answers.forEach((answerIndex, questionIndex) => {
        const option = quizQuestions[questionIndex].options[answerIndex];
        Object.entries(option.scores).forEach(([key, value]) => {
          scores[key] += value;
        });
        reasons.push(option.reason);
      });
      const ordered = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const balanced = ordered[0][1] - ordered[2][1] <= 2;
      return { scores, ordered, balanced, reasons };
    }

    function renderResult() {
      const { scores, ordered, balanced, reasons } = calculateResult();
      const labels = { nutrition: "Nutrition", mentalWellness: "Mental Wellness", physicalActivity: "Physical Activity" };
      const links = { nutrition: "weight-loss-program.html", mentalWellness: "mental-wellness.html", physicalActivity: "physical-activity.html" };
      const recommendations = {
        nutrition: ["Plan two easy meals for the next three days.", "Add water before coffee or sweet drinks.", "Build plates around protein, fiber and color."],
        mentalWellness: ["Use a two minute breathing pause when stress rises.", "Choose one realistic goal for the week.", "Protect a short wind-down routine before sleep."],
        physicalActivity: ["Start with 20 minutes of walking or mobility.", "Schedule movement like an appointment.", "Alternate effort days with recovery days."]
      };
      const main = balanced ? "combined" : ordered[0][0];
      const title = balanced ? "Combined Wellness" : labels[main];
      const cta = balanced ? "index.html#areas" : links[main];
      const why = balanced
        ? "Your answers show that nutrition, mental wellness and physical activity are closely connected right now."
        : `This result came from patterns like ${reasons.slice(0, 3).join(", ")}.`;

      progress.style.setProperty("--progress", "100%");
      questionCard.style.display = "none";
      resultCard.style.display = "block";
      resultCard.innerHTML = `
        <div class="question-card">
          <div class="card-kicker">Your main focus</div>
          <h1 class="question-title">${title}</h1>
          <p class="card-text">${why}</p>
          <div class="score-bars">
            ${Object.entries(scores).map(([key, value]) => `
              <div>
                <div class="score-label"><span>${labels[key]}</span><span>${value}</span></div>
                <div class="progress-track"><div class="progress-fill" style="--progress:${Math.min(value * 10, 100)}%"></div></div>
              </div>`).join("")}
          </div>
          <h3 class="card-title">Practical recommendations</h3>
          <ul class="clean-list">
            ${(balanced ? Object.values(recommendations).flat().slice(0, 5) : recommendations[main]).map((item) => `<li>${item}</li>`).join("")}
          </ul>
          <h3 class="card-title mt-4">You may also benefit from</h3>
          <p class="card-text">${ordered.slice(1).map(([key]) => labels[key]).join(" and ")}</p>
          <div class="result-actions mt-4">
            <a class="btn-main" href="${cta}">Explore your recommended plan</a>
            <button class="btn-soft" type="button" id="retakeQuiz">Retake questionnaire</button>
          </div>
        </div>`;
      localStorage.setItem("hb_quiz_result", JSON.stringify({ scores, main: title, createdAt: new Date().toISOString() }));
      $("#retakeQuiz").onclick = () => {
        index = 0;
        answers.length = 0;
        resultCard.style.display = "none";
        questionCard.style.display = "block";
        render();
      };
    }

    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initBase();
    initLogin();
    initGoal();
    initResources();
    initBooking();
    initQuiz();
  });

  return { initBase };
})();
