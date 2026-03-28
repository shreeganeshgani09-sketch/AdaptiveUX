// Intent definitions and keywords
const intents = {
    food: {
        label: "Food",
        keywords: ["hungry", "food", "eat", "lunch", "dinner", "breakfast", "snack"]
    },
    study: {
        label: "Study",
        keywords: ["study", "learn", "course", "tutorial", "read", "homework", "assignment", "focus"]
    },
    travel: {
        label: "Travel",
        keywords: ["travel", "go somewhere", "ride", "cab", "trip", "commute", "flight"]
    },
    relax: {
        label: "Relax",
        keywords: ["relax", "chill", "bored", "entertainment", "movie", "music", "game", "unwind"]
    }
};

// Available suggestions per intent
const defaultSuggestions = {
    food: [
        { id: "f1", name: "Swiggy", icon: "fa-solid fa-motorcycle", url: "https://www.swiggy.com" },
        { id: "f2", name: "Zomato", icon: "fa-solid fa-utensils", url: "https://www.zomato.com" },
        { id: "f3", name: "Nearby Food", icon: "fa-solid fa-map-location-dot", url: "https://www.google.com/maps/search/restaurants+near+me" },
        { id: "f4", name: "Uber Eats", icon: "fa-solid fa-burger", url: "https://www.ubereats.com" }
    ],
    study: [
        { id: "s1", name: "YouTube Tutorials", icon: "fa-brands fa-youtube", url: "https://www.youtube.com/results?search_query=programming+tutorial" },
        { id: "s2", name: "Coursera", icon: "fa-solid fa-graduation-cap", url: "https://www.coursera.org" },
        { id: "s3", name: "Udemy", icon: "fa-solid fa-chalkboard-user", url: "https://www.udemy.com" },
        { id: "s4", name: "Focus Timer", icon: "fa-solid fa-stopwatch", url: "https://pomofocus.io" }
    ],
    travel: [
        { id: "t1", name: "Google Maps", icon: "fa-solid fa-map", url: "https://maps.google.com" },
        { id: "t2", name: "Uber", icon: "fa-brands fa-uber", url: "https://m.uber.com" },
        { id: "t3", name: "Ola Cabs", icon: "fa-solid fa-car", url: "https://book.olacabs.com" },
        { id: "t4", name: "Transit Search", icon: "fa-solid fa-train-subway", url: "https://maps.google.com/landing/transit" }
    ],
    relax: [
        { id: "r1", name: "YouTube", icon: "fa-brands fa-youtube", url: "https://www.youtube.com" },
        { id: "r2", name: "Spotify", icon: "fa-brands fa-spotify", url: "https://open.spotify.com" },
        { id: "r3", name: "Netflix", icon: "fa-solid fa-tv", url: "https://www.netflix.com" },
        { id: "r4", name: "Meditation", icon: "fa-solid fa-spa", url: "https://insighttimer.com" }
    ]
};

// DOM Elements
const userInput = document.getElementById("user-input");
const analyzeBtn = document.getElementById("analyze-btn");
const voiceBtn = document.getElementById("voice-btn");
const themeToggle = document.getElementById("theme-toggle");
const resultsPanel = document.getElementById("results-panel");
const intentDisplay = document.getElementById("intent-display");
const timeContext = document.getElementById("time-context");
const suggestionsGrid = document.getElementById("suggestions-grid");
const quickBtns = document.querySelectorAll(".quick-btn");
const greetingHeader = document.getElementById("dynamic-greeting");
const subtitle = document.getElementById("dynamic-subtitle");

// --- Advanced Dynamic Typing Placeholder Setup ---
let typingTimer;
let placeholderIndex = 0;
let charIndex = 0;
let isDeleting = false;

function getContextualPlaceholders() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return ["Try: 'I need coffee'", "Try: 'Time to study'", "Try: 'Order breakfast'"];
    if (hour >= 12 && hour < 17) return ["Try: 'I am hungry'", "Try: 'Find me a ride'", "Try: 'Take a break'"];
    if (hour >= 17 && hour < 21) return ["Try: 'Order dinner'", "Try: 'I want to relax'", "Try: 'Head home'"];
    return ["Try: 'Late night snack'", "Try: 'Watch a movie'", "Try: 'Chill music'"];
}

function typePlaceholder() {
    const strings = getContextualPlaceholders();
    const currentString = strings[placeholderIndex];
    
    if (isDeleting) {
        userInput.placeholder = currentString.substring(0, charIndex - 1) + "|";
        charIndex--;
    } else {
        userInput.placeholder = currentString.substring(0, charIndex + 1) + "|";
        charIndex++;
    }
    
    let typeSpeed = isDeleting ? 40 : 100;

    // Randomize typing speed slightly for realism
    if (!isDeleting) typeSpeed += Math.random() * 50;

    if (!isDeleting && charIndex === currentString.length) {
        // Pause at the end
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        placeholderIndex = (placeholderIndex + 1) % strings.length;
        typeSpeed = 500;
    }
    
    typingTimer = setTimeout(typePlaceholder, typeSpeed);
}

// Stop typing when user focuses
userInput.addEventListener("focus", () => {
    clearTimeout(typingTimer);
    userInput.placeholder = "";
});
// Resume if empty on blur
userInput.addEventListener("blur", () => {
    if (!userInput.value) {
        isDeleting = false;
        charIndex = 0;
        typePlaceholder();
    }
});


// --- Smart Personalized Greeting ---
function updateGreeting() {
    const hour = new Date().getHours();
    let timeLabel = "";
    
    if (hour >= 5 && hour < 12) {
        greetingHeader.textContent = "Good Morning!";
        timeLabel = "Morning";
    } else if (hour >= 12 && hour < 17) {
        greetingHeader.textContent = "Good Afternoon!";
        timeLabel = "Afternoon";
    } else if (hour >= 17 && hour < 21) {
        greetingHeader.textContent = "Good Evening!";
        timeLabel = "Evening";
    } else {
        greetingHeader.textContent = "Unwinding Tonight?";
        timeLabel = "Night";
    }
    timeContext.textContent = timeLabel;
    
    // Check if they have a dominant intent to personalize subtitle
    const topIntent = getDominantIntent();
    if (topIntent) {
        subtitle.textContent = `Ready for more ${intents[topIntent].label}? Let me help you jump right in.`;
    }
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    loadUserPreferences();
    updateGreeting();
    typePlaceholder();
    
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        voiceBtn.style.display = 'none';
    }
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        document.body.classList.add("dark-mode");
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Intent Analysis and Processing
analyzeBtn.addEventListener("click", processInput);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") processInput();
});

quickBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        processIntent(btn.getAttribute("data-intent"));
    });
});

function processInput() {
    const text = userInput.value.trim().toLowerCase();
    if (!text) return;
    
    updateGreeting();
    clearTimeout(typingTimer);
    
    let detectedIntent = null;
    for (const [key, category] of Object.entries(intents)) {
        if (category.keywords.some(k => text.includes(k))) {
            detectedIntent = key;
            break;
        }
    }
    
    if (detectedIntent) {
        processIntent(detectedIntent);
    } else {
        intentDisplay.textContent = "Unknown";
        suggestionsGrid.innerHTML = `
            <div class="suggestion-card" style="grid-column: 1 / -1">
                <i class="fas fa-question-circle card-icon"></i>
                <div class="card-title">I couldn't detect your intent.</div>
                <p style="color: var(--glass-muted); font-size: 0.95rem;">Try asking about food, studying, traveling, or relaxing!</p>
            </div>
        `;
        resultsPanel.classList.remove("hidden");
        // Reset background
        document.body.className = document.body.classList.contains("dark-mode") ? "dark-mode intent-default" : "intent-default";
    }
}

function processIntent(intentKey) {
    intentDisplay.textContent = intents[intentKey].label;
    
    // Ultra-Unique Background Change
    let isDark = document.body.classList.contains("dark-mode");
    document.body.className = isDark ? `dark-mode intent-${intentKey}` : `intent-${intentKey}`;
    
    renderSuggestions(intentKey);
    resultsPanel.classList.remove("hidden");
    
    // Re-trigger CSS animation
    resultsPanel.style.animation = 'none';
    resultsPanel.offsetHeight; // trigger reflow
    resultsPanel.style.animation = null;
    
    if (window.innerWidth <= 480) {
        resultsPanel.scrollIntoView({ behavior: 'smooth' });
    }
}

// Adaptive Learning
let clickCounts = {};

function loadUserPreferences() {
    const stored = localStorage.getItem("actionAssistantPreferences");
    if (stored) {
        try { clickCounts = JSON.parse(stored); } catch(e) { clickCounts = {}; }
    }
}

function saveUserPreference(intentKey, suggestionId) {
    if (!clickCounts[intentKey]) clickCounts[intentKey] = {};
    if (!clickCounts[intentKey][suggestionId]) clickCounts[intentKey][suggestionId] = 0;
    clickCounts[intentKey][suggestionId]++;
    localStorage.setItem("actionAssistantPreferences", JSON.stringify(clickCounts));
}

function getDominantIntent() {
    let bestIntent = null;
    let maxTotal = 0;
    for (let intent in clickCounts) {
        let total = Object.values(clickCounts[intent]).reduce((a, b) => a + b, 0);
        if (total > maxTotal) {
            maxTotal = total;
            bestIntent = intent;
        }
    }
    return bestIntent;
}

// Rendering & 3D Tilt Logic
function renderSuggestions(intentKey) {
    suggestionsGrid.innerHTML = "";
    
    let suggestions = [...defaultSuggestions[intentKey]];
    if (clickCounts[intentKey]) {
        suggestions.sort((a, b) => {
            const clicksA = clickCounts[intentKey][a.id] || 0;
            const clicksB = clickCounts[intentKey][b.id] || 0;
            return clicksB - clicksA;
        });
    }
    
    suggestions.forEach((item) => {
        const card = document.createElement("div");
        card.className = "suggestion-card";
        
        card.innerHTML = `
            <i class="${item.icon} card-icon"></i>
            <div class="card-title">${item.name}</div>
            <button class="card-btn" aria-label="Open ${item.name}">Open</button>
        `;
        
        // --- 3D Glassmorphic Tilt Effect Validation ---
        card.addEventListener("mousemove", (e) => {
            if (window.innerWidth > 768) { // Only enable on desktop
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // x position within the element
                const y = e.clientY - rect.top;  // y position within the element
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10; // Max tilt 10deg
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale3d(1.02, 1.02, 1.02)`;
            }
        });
        
        // Reset on leave
        card.addEventListener("mouseleave", () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)`;
        });

        card.addEventListener("click", () => {
            saveUserPreference(intentKey, item.id);
            window.open(item.url, "_blank");
            
            setTimeout(() => {
                if (intentDisplay.textContent === intents[intentKey].label) {
                    renderSuggestions(intentKey);
                }
            }, 1000);
        });
        
        suggestionsGrid.appendChild(card);
    });
}

// Voice Input
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    
    voiceBtn.addEventListener("click", () => {
        clearTimeout(typingTimer);
        voiceBtn.classList.add("listening");
        userInput.placeholder = "Listening...";
        recognition.start();
    });
    
    recognition.onresult = (event) => {
        userInput.value = event.results[0][0].transcript;
        processInput();
    };
    
    recognition.onend = () => {
        voiceBtn.classList.remove("listening");
        if(!userInput.value) typePlaceholder();
    };
}
