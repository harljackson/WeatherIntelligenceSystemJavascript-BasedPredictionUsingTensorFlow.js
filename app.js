// --------------------------------------------------
// Main application logic + charts
// --------------------------------------------------

let rainChart;
let featureChart;

const STORAGE_KEY = "rainPredictionHistory";
const MAX_HISTORY = 5;

// Load history from localStorage
let predictionHistory = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
)

// --------------------------------------------------
// Show loading state
// --------------------------------------------------
function setLoadingState(isLoading) {
    const loadingEl = document.getElementById("loading");
    const button = document.getElementById("getWeatherBtn");
    
    if (loadingEl) {
        loadingEl.classList.toggle("hidden", !isLoading);
    }
    
    if (button) {
        button.disabled = isLoading;
        button.textContent = isLoading ? "Processing..." : "Get Weather & Predict Rain";
    }
}

// --------------------------------------------------
// Render prediction history from storage
// --------------------------------------------------
function renderPredictionHistory() {
    const historyList = document.getElementById("predictionHistory");
    if (!historyList) return;

    historyList.innerHTML = "";

    if (predictionHistory.length === 0) {
        historyList.innerHTML =
            `<li class="text-slate-500 italic">No predictions yet</li>`;
        return;
    }

    predictionHistory.forEach(entry => {
        const li = document.createElement("li");

        const percent = (entry.probability * 100).toFixed(1);
        const label = riskLabel(entry.probability);

        li.className =
            "flex items-center gap-2 cursor-pointer select-none " +
            "hover:bg-slate-800/60 rounded-lg px-3 py-2 transition";

        li.innerHTML = `
            <span class="font-medium underline decoration-dotted">
                ${entry.location}
            </span>
            <span class="text-slate-400">– ${percent}%</span>
            <span class="ml-auto text-xs px-2 py-0.5 rounded-full
                ${
                    label === "Low Risk"
                        ? "bg-green-500/20 text-green-400"
                        : label === "Moderate Risk"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                }">
                ${label}
            </span>
        `;

        li.addEventListener("click", () => {
            restoreLocation(entry.location);
        });

        historyList.appendChild(li);
    });
}

// --------------------------------------------------
// Restore location in input field
// --------------------------------------------------
function restoreLocation(location) {
    const input = document.getElementById("locationInput");
    if (!input) return;

    input.value = location;

    // Trigger prediction
    document.getElementById("getWeatherBtn")?.click();
}

// --------------------------------------------------
// Clear prediction history from storage
// --------------------------------------------------
function clearPredictionHistory() {
    predictionHistory = [];
    localStorage.removeItem(STORAGE_KEY);
    renderPredictionHistory();
}

// --------------------------------------------------
// Animate percentage with easing
// --------------------------------------------------
function animatePercentage(element, targetValue, duration = 800) {
    if (!element) return;

    const startValue = parseFloat(element.dataset.value || "0"); // Default to 0 if no data-value attribute
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration , 1);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        const value = startValue + (targetValue - startValue) * eased;

        element.textContent = `${value.toFixed(1)}%`;
        element.dataset.value = value;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// --------------------------------------------------
// Get rain risk label and color (0–1 probability)
// --------------------------------------------------
function getRainRiskLabel(probability) {
    if (probability < 0.3) {
        return {
            text: "Low Risk",
            color: "text-emerald-400 bg-emerald-500/20"
        };
    }

    if (probability < 0.6) {
        return {
            text: "Moderate Risk",
            color: "text-yellow-400 bg-yellow-500/20"
        };
    }

    return {
        text: "High Risk",
        color: "text-red-400 bg-red-500/20"
    };
}

// --------------------------------------------------
// Update rain risk badge UI
// --------------------------------------------------
function updateRainRiskBadge(probability) {
    const badge = document.getElementById("confidenceLabel");
    if (!badge) return;

    const { text, color } = getRainRiskLabel(probability);

    badge.textContent = text;
    // Extract just the text color from the color string
    const textColor = color.split(' ')[0]; // Gets "text-emerald-400", "text-yellow-400", etc.
    badge.className =
        `text-sm font-semibold tracking-wide uppercase transition-all duration-300 ${textColor}`;
}




// --------------------------------------------------
// App boot logic
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Weather Intelligence System initializing...");

    const button = document.getElementById("getWeatherBtn");
    const locationInput = document.getElementById("locationInput");
    const rainOutput = document.getElementById("rainPrediction");
    
    renderPredictionHistory();

    if (!button || !locationInput || !rainOutput) {
        console.error("❌ Required DOM elements not found");
        return;
    }

    // Clear prediction history
    const clearBtn = document.getElementById("clearHistoryBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", clearPredictionHistory);
    }

    // Initialize charts
    initRainChart();
    initFeatureChart();

    console.log("✅ Charts initialized");

    // Handle Enter key in location input
    locationInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            button.click();
        }
    });

    button.addEventListener("click", async () => {
        const location = locationInput.value.trim();
        
        if (!location) {
            alert("Please enter a location.");
            return;
        }

        console.log(`🔍 Fetching weather for: ${location}`);
        setLoadingState(true);

        try {
            // Check if fetchWeatherData exists
            if (typeof fetchWeatherData !== "function") {
                throw new Error("fetchWeatherData function not found. Make sure weather-api.js is loaded.");
            }

            const weather = await fetchWeatherData(location);
            
            if (!weather) {
                throw new Error("No weather data returned");
            }

            console.log("✅ Weather data received:", weather);

            const features = [
                weather.temperature,
                weather.humidity,
                weather.pressure,
                weather.windSpeed,
                weather.cloudCover
            ];

            // Check if predictRain exists
            if (typeof predictRain !== "function") {
                throw new Error("predictRain function not found. Make sure model.js is loaded.");
            }

            const probability = predictRain(features);
            
            if (probability === null || probability === undefined) {
                rainOutput.textContent = "Model loading...";
                setLoadingState(false);
                return;
            }

            console.log("✅ Prediction:", probability);

            const percentage = (probability * 100).toFixed(1);

            
            // Update rain risk badge
            updateRainRiskBadge(probability);

            // Update main prediction
            rainOutput.classList.remove("skeleton");
            animatePercentage(rainOutput, parseFloat(percentage));

            


            // Update weather stats
            updateWeatherStats(weather);

            // Update visuals
            updateRainChart(probability);
            updateFeatureChart(normalizeForRadar(features));

            // Update explanation
            updatePredictionReasons(explainPrediction(features));

            // Update history
            updatePredictionHistory(location, probability);

            console.log("✅ All updates complete");

        } catch (err) {
            console.error("❌ Prediction error:", err);
            alert(`Error: ${err.message}`);
            rainOutput.textContent = "Error";
        } finally {
            setLoadingState(false);
        }
    });

    console.log("✅ Weather Intelligence System ready");
});