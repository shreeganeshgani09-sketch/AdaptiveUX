/* 
    Smart Adaptive Assistant
    HTML, CSS, JavaScript logic
*/

document.addEventListener("DOMContentLoaded", () => {
    
    // UI Elements
    const greetingEl = document.getElementById("greeting");
    const lastActivityEl = document.getElementById("last-activity");
    const userInput = document.getElementById("user-input");
    const analyzeBtn = document.getElementById("analyze-btn");
    const statusMessage = document.getElementById("status-message");
    const outputCont = document.getElementById("output");
    const explanationEl = document.getElementById("explanation");
    const ambientBg = document.getElementById("ambient-background");
    const voiceBtn = document.getElementById("voice-btn");
    
    // UI Elements - Phase 2 & 3 Additions
    const statsBtn = document.getElementById("stats-btn");
    const settingsBtn = document.getElementById("settings-btn");
    const statsModal = document.getElementById("stats-modal");
    const settingsModal = document.getElementById("settings-modal");
    
    // Load persisted configurations
    let defaultStats = { bored: 0, tired: 0, hungry: 0, study: 0, ride: 0, shops: 0 };
    let savedStats = JSON.parse(localStorage.getItem('sai_stats')) || {};
    let usageStats = Object.assign(defaultStats, savedStats);
    
    // Ensure newly added props aren't undefined if old stats existed without them
    if (usageStats.ride === undefined) usageStats.ride = 0;
    if (usageStats.shops === undefined) usageStats.shops = 0;
    let customSettings = JSON.parse(localStorage.getItem('sai_settings')) || {
        bored: "", tired: "", hungry: "", study: "", ride: "", shops: ""
    };

    // 0. Assistant Voice (Text-to-Speech)
    function speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop playing anything else
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    }

    // 1. Context Awareness (Time-Based)
    function setGreeting() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            greetingEl.textContent = "Morning → Stay productive ☀️";
        } else if (hour >= 12 && hour < 18) {
            greetingEl.textContent = "Afternoon → Keep going 💪";
        } else {
            greetingEl.textContent = "Night → Relax and unwind 🌙";
        }
    }
    
    // 2. Personalization (Adaptive Behavior)
    function loadLastActivity() {
        const lastInput = localStorage.getItem("lastActivity");
        if (lastInput) {
            lastActivityEl.textContent = `🔁 Last activity: ${lastInput}`;
        } else {
            lastActivityEl.textContent = `🔁 Last activity: None`;
        }
    }
    
    // Initialization
    setGreeting();
    loadLastActivity();
    
    // 2.5 Voice Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && voiceBtn) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        let isListening = false;

        voiceBtn.addEventListener("click", () => {
            if (isListening) {
                recognition.stop();
                return;
            }
            try {
                recognition.start();
                isListening = true;
                voiceBtn.classList.add("listening");
                userInput.placeholder = "Listening...";
            } catch (e) {
                console.log("Recognition already started or failed:", e);
                recognition.stop();
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            
            // Auto-analyze immediately after speaking!
            speak("Okay, let me check that.");
            analyzeBtn.click();
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error: ", event.error);
            userInput.placeholder = "Failed to hear... Try typing.";
            setTimeout(() => {
                if (!isListening) userInput.placeholder = "How are you feeling? (e.g. I'm hungry)";
            }, 3000);
        };

        // onend reliably fires after success, error, or speechend
        recognition.onend = () => {
            isListening = false;
            voiceBtn.classList.remove("listening");
            if (userInput.placeholder === "Listening...") {
                 userInput.placeholder = "How are you feeling? (e.g. I'm hungry)";
            }
        };
        
    } else if (voiceBtn) {
        voiceBtn.style.display = 'none'; // Hide if browser doesn't support it
        console.warn("SpeechRecognition API not supported in this browser.");
    }

    // 3. Main Action Logic
    analyzeBtn.addEventListener("click", () => {
        const text = userInput.value.trim().toLowerCase();
        
        if (!text) return;

        // Save last activity
        localStorage.setItem("lastActivity", text);
        loadLastActivity();

        // 4. Thinking Effect (AI Feel)
        speak("Analyzing your request.");
        statusMessage.textContent = "⏳ Analyzing your request...";
        outputCont.innerHTML = "";
        explanationEl.innerHTML = "";
        
        // Reset background
        ambientBg.style.background = "radial-gradient(circle at center, #1e293b 0%, #0f172a 50%, #020617 100%)";

        // Artificial delay of 1 second
        setTimeout(() => {
            statusMessage.textContent = "";
            processIntent(text);
        }, 1000);
    });

    // Handle Enter key for better UX
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            analyzeBtn.click();
        }
    });

    // 5. Mood Detection & Options
    function processIntent(text) {
        let matched = false;
        
        // Simple Intent Definitions
        const intents = {
            bored: {
                title: "Entertainment Suggestions 🎬",
                bg: "radial-gradient(circle at center, #7c2d12 0%, #431407 50%, #000000 100%)", // Orange/Red
                buttons: [
                    { label: "YouTube Trending", url: "https://www.youtube.com/feed/trending" },
                    { label: "Games", url: "https://poki.com" }
                ]
            },
            tired: {
                title: "Relaxation Suggestions 🧘",
                bg: "radial-gradient(circle at center, #3b0764 0%, #1e1b4b 50%, #000000 100%)", // Purple/Indigo
                buttons: [
                    { label: "Sleep Sounds", url: "https://rainymood.com" },
                    { label: "Calm", url: "https://www.calm.com" },
                    { label: "Meditation", url: "https://insighttimer.com" }
                ]
            },
            hungry: {
                title: "Food Suggestions 🍔",
                bg: "radial-gradient(circle at center, #065f46 0%, #022c22 50%, #000000 100%)", // Tasty Green/Brown
                buttons: [
                    { label: "Open Swiggy", url: "https://www.swiggy.com" },
                    { label: "Open Zomato", url: "https://www.zomato.com" },
                    { label: "Uber Eats", url: "https://www.ubereats.com" }
                ]
            },
            study: {
                title: "Study Suggestions 📚",
                bg: "radial-gradient(circle at center, #0c4a6e 0%, #082f49 50%, #000000 100%)", // Focusing Blue
                buttons: [
                    { label: "YouTube Tutorials", url: "https://www.youtube.com/results?search_query=programming+tutorial" },
                    { label: "Coursera", url: "https://www.coursera.org" }
                ]
            },
            ride: {
                title: "Ride & Travel 🚖",
                bg: "radial-gradient(circle at center, #854d0e 0%, #422006 50%, #000000 100%)", // Yellow/Brown
                buttons: [
                    { label: "Uber", url: "https://m.uber.com/" },
                    { label: "Ola", url: "https://book.olacabs.com/" },
                    { label: "Google Maps", url: "https://maps.google.com/" }
                ]
            },
            shops: {
                title: "Nearby Shopping 🛍️",
                bg: "radial-gradient(circle at center, #be185d 0%, #831843 50%, #000000 100%)", // Pink/Red
                buttons: [
                    { label: "Blinkit", url: "https://blinkit.com/" },
                    { label: "Zepto", url: "https://www.zeptonow.com/" },
                    { label: "Amazon", url: "https://www.amazon.in/" }
                ]
            }
        };

        // Inject Custom Settings
        if (customSettings.bored) intents.bored.buttons.unshift({ label: "My Custom Pick 🌟", url: customSettings.bored });
        if (customSettings.tired) intents.tired.buttons.unshift({ label: "My Custom Pick 🌟", url: customSettings.tired });
        if (customSettings.hungry) intents.hungry.buttons.unshift({ label: "My Custom Pick 🌟", url: customSettings.hungry });
        if (customSettings.study) intents.study.buttons.unshift({ label: "My Custom Pick 🌟", url: customSettings.study });
        if (customSettings.ride) intents.ride.buttons.unshift({ label: "My Custom Pick 🌟", url: customSettings.ride });
        if (customSettings.shops) intents.shops.buttons.unshift({ label: "My Custom Pick 🌟", url: customSettings.shops });

        // 6. Keyword Pattern Matching
        if (text.includes("bored") || text.includes("entertainment") || text.includes("fun")) {
            usageStats.bored++;
            localStorage.setItem("sai_stats", JSON.stringify(usageStats));
            renderCards(intents.bored);
            ambientBg.style.background = intents.bored.bg;
            speak("Here are some entertainment options for you.");
            matched = true;
        } else if (text.includes("tired") || text.includes("exhausted") || text.includes("sleep")) {
            usageStats.tired++;
            localStorage.setItem("sai_stats", JSON.stringify(usageStats));
            renderCards(intents.tired);
            ambientBg.style.background = intents.tired.bg;
            speak("I recommend these options to help you relax.");
            matched = true;
        } else if (text.includes("hungry") || text.includes("food") || text.includes("eat")) {
            usageStats.hungry++;
            localStorage.setItem("sai_stats", JSON.stringify(usageStats));
            renderCards(intents.hungry);
            ambientBg.style.background = intents.hungry.bg;
            speak("Let's get some food! Here are some choices.");
            matched = true;
        } else if (text.includes("study") || text.includes("learn") || text.includes("work")) {
            usageStats.study++;
            localStorage.setItem("sai_stats", JSON.stringify(usageStats));
            renderCards(intents.study);
            ambientBg.style.background = intents.study.bg;
            speak("Time to focus. Here are some study resources.");
            matched = true;
        } else if (text.includes("ride") || text.includes("cab") || text.includes("travel") || text.includes("go ")) {
            usageStats.ride++;
            localStorage.setItem("sai_stats", JSON.stringify(usageStats));
            renderCards(intents.ride);
            ambientBg.style.background = intents.ride.bg;
            speak("I can help you get a ride. Here are some options.");
            matched = true;
        } else if (text.includes("shop") || text.includes("buy") || text.includes("groceries") || text.includes("store")) {
            usageStats.shops++;
            localStorage.setItem("sai_stats", JSON.stringify(usageStats));
            renderCards(intents.shops);
            ambientBg.style.background = intents.shops.bg;
            speak("Here are some shopping and delivery services for you.");
            matched = true;
        }

        // 7. Empty State Handling
        if (!matched) {
            speak("I'm sorry, I couldn't understand your request. Try saying you are bored, or hungry.");
            outputCont.innerHTML = `
                <div class="empty-state">
                    <p>I couldn't understand your request.</p>
                    <p style="margin-bottom: 5px; color:#ef4444; font-size:0.9rem;">Try:</p>
                    <ul>
                        <li>I'm bored</li>
                        <li>I'm hungry</li>
                        <li>I want to study</li>
                        <li>I need a ride</li>
                        <li>Let's go shopping</li>
                    </ul>
                </div>
            `;
        } else {
            // 8. Explanation System
            explanationEl.innerHTML = "💡 These suggestions are based on your input and current time.";
        }
    }

    // Dynamic Suggestion Card Renderer
    function renderCards(data) {
        // Create container
        const card = document.createElement("div");
        card.className = "suggestion-card";
        
        // Add Title
        const title = document.createElement("h3");
        title.textContent = data.title;
        card.appendChild(title);
        
        // Add Buttons Wrapper
        const btnContainer = document.createElement("div");
        btnContainer.className = "action-buttons";
        
        // Action Buttons opening URLs in new tabs
        data.buttons.forEach(btnData => {
            const btn = document.createElement("button");
            btn.className = "action-btn";
            btn.textContent = btnData.label;
            // Native open url
            btn.onclick = () => window.open(btnData.url, "_blank");
            btnContainer.appendChild(btn);
        });
        
        card.appendChild(btnContainer);
        outputCont.appendChild(card);
    }

    // Modal & Settings Logic
    const closeBtns = document.querySelectorAll(".close-modal");
    closeBtns.forEach(btn => btn.addEventListener("click", () => {
        statsModal.classList.add("hidden");
        settingsModal.classList.add("hidden");
    }));

    statsBtn.addEventListener("click", () => {
        const statsBody = document.getElementById("stats-body");
        statsBody.innerHTML = `
            <div class="stat-item">Entertainment <span>${usageStats.bored}</span></div>
            <div class="stat-item">Relaxation <span>${usageStats.tired}</span></div>
            <div class="stat-item">Food <span>${usageStats.hungry}</span></div>
            <div class="stat-item">Focus <span>${usageStats.study}</span></div>
            <div class="stat-item">Travel <span>${usageStats.ride}</span></div>
            <div class="stat-item">Shopping <span>${usageStats.shops}</span></div>
        `;
        statsModal.classList.remove("hidden");
    });

    settingsBtn.addEventListener("click", () => {
        document.getElementById("setting-bored").value = customSettings.bored || "";
        document.getElementById("setting-tired").value = customSettings.tired || "";
        document.getElementById("setting-hungry").value = customSettings.hungry || "";
        document.getElementById("setting-study").value = customSettings.study || "";
        document.getElementById("setting-ride").value = customSettings.ride || "";
        document.getElementById("setting-shops").value = customSettings.shops || "";
        settingsModal.classList.remove("hidden");
    });

    document.getElementById("save-settings-btn").addEventListener("click", () => {
        customSettings.bored = document.getElementById("setting-bored").value.trim();
        customSettings.tired = document.getElementById("setting-tired").value.trim();
        customSettings.hungry = document.getElementById("setting-hungry").value.trim();
        customSettings.study = document.getElementById("setting-study").value.trim();
        customSettings.ride = document.getElementById("setting-ride").value.trim();
        customSettings.shops = document.getElementById("setting-shops").value.trim();
        
        localStorage.setItem("sai_settings", JSON.stringify(customSettings));
        settingsModal.classList.add("hidden");
        speak("Settings saved successfully.");
        lastActivityEl.textContent = `🔁 Last activity: Updated Settings`;
    });
});
