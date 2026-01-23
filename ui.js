// --------------------------------------------------
// UI helpers for weather-api.js
// --------------------------------------------------

// Safely set text content & remove skeleton
function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    // Remove skeleton loading state
    el.classList.remove("skeleton");

    // Set actual value
    el.textContent = value;
}

// Update the weather display with fetched data
function updateWeatherDisplay(weatherData) {

    setText(
        "temperaturePrediction",
        weatherData.temperature + " °C"
    );

    setText(
        "humidityPrediction",
        weatherData.humidity + " %"
    );

    setText(
        "pressurePrediction",
        weatherData.pressure + " hPa"
    );

    setText(
        "windSpeedPrediction",
        weatherData.windSpeed + " m/s"
    );

    // Optional fields (only update if present in HTML)
    setText(
        "windDirectionPrediction",
        weatherData.windDirection + " °"
    );

    setText(
        "visibilityPrediction",
        weatherData.visibility + " m"
    );

    setText(
        "cloudCoverPrediction",
        weatherData.cloudCover + " %"
    );

    setText(
        "weatherConditionPrediction",
        weatherData.weatherDescription
    );
}

// --------------------------------------------------
// Initialise Rain Probability Chart
// --------------------------------------------------
function initRainChart() {
    const ctx = document.getElementById("rainGauge");
    if (!ctx) {
        console.error("❌ Rain gauge canvas not found");
        return;
    }

    rainChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Rain Probability"],
            datasets: [{
                data: [0],
                backgroundColor: "#38bdf8"
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: value => value + "%",
                        color: "#94a3b8"
                    },
                    grid: {
                        color: "rgba(255,255,255,0.08)"
                    }
                },
                y: {
                    ticks: {
                        color: "#94a3b8"
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// --------------------------------------------------
// Update Rain Probability Chart
// --------------------------------------------------
function updateRainChart(probability) {
    if (!rainChart) {
        console.error("❌ Rain chart not initialized");
        return;
    }

    const percent = Math.round(probability * 100);

    rainChart.data.datasets[0].data[0] = percent;

    rainChart.data.datasets[0].backgroundColor =
        percent < 30 ? "#22c55e" :
        percent < 60 ? "#facc15" :
                       "#ef4444";

    rainChart.update();
}

// --------------------------------------------------
// Initialise Feature Radar Chart
// --------------------------------------------------
function initFeatureChart() {
    const ctx = document.getElementById("featureChart");
    if (!ctx) {
        console.error("❌ Feature chart canvas not found");
        return;
    }

    featureChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: [
                "Temperature",
                "Humidity",
                "Pressure",
                "Wind Speed",
                "Cloud Cover"
            ],
            datasets: [{
                label: "Current Conditions",
                data: [0, 0, 0, 0, 0],
                backgroundColor: "rgba(56,189,248,0.15)",
                borderColor: "#38bdf8",
                borderWidth: 2,
                pointBackgroundColor: "#38bdf8",
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                r: {
                    min: 0,
                    max: 1,
                    ticks: { 
                        display: false 
                    },
                    grid: { 
                        color: "rgba(255,255,255,0.08)" 
                    },
                    angleLines: { 
                        color: "rgba(255,255,255,0.12)" 
                    },
                    pointLabels: {
                        color: "#cbd5e1",
                        font: { 
                            size: 12, 
                            weight: "500" 
                        }
                    }
                }
            }
        }
    });
}

// --------------------------------------------------
// Update Feature Radar Chart
// --------------------------------------------------
function updateFeatureChart(radarFeatures) {
    if (!featureChart) {
        console.error("❌ Feature chart not initialized");
        return;
    }
    featureChart.data.datasets[0].data = radarFeatures;
    featureChart.update();
}

// --------------------------------------------------
// Normalize features for radar chart
// --------------------------------------------------
function normalizeForRadar(features) {
    return [
        features[0] / 40,               // Temperature
        features[1] / 100,              // Humidity
        (features[2] - 950) / 100,      // Pressure (950–1050)
        features[3] / 50,               // Wind speed
        features[4] / 100               // Cloud cover (0-100)
    ].map(v => Math.max(0, Math.min(1, v)));
}

// --------------------------------------------------
// Explain prediction (interpretability layer)
// --------------------------------------------------
function explainPrediction(features) {
    const [temp, humidity, pressure, windSpeed, cloudCover] = features;
    const reasons = [];

    if (humidity >= 75)
        reasons.push("High humidity increases the likelihood of rain.");

    if (pressure <= 1010)
        reasons.push("Low atmospheric pressure often precedes rainfall.");

    if (pressure >= 1020)
        reasons.push("High atmospheric pressure generally reduces rain risk.");

    if (cloudCover >= 60)
        reasons.push("Significant cloud cover suggests unstable conditions.");

    if (windSpeed >= 15)
        reasons.push("Stronger winds may indicate approaching weather systems.");

    if (temp < 5)
        reasons.push("Cold temperatures may result in snow instead of rain.");

    if (reasons.length === 0)
        reasons.push("Weather conditions appear stable with no strong rain indicators.");

    return reasons;
}

// --------------------------------------------------
// Render prediction explanation
// --------------------------------------------------
function updatePredictionReasons(reasons) {
    const list = document.getElementById("predictionReasons");
    if (!list) {
        console.error("❌ Prediction reasons element not found");
        return;
    }

    list.innerHTML = "";

    reasons.forEach(reason => {
        const li = document.createElement("li");
        li.textContent = reason;
        li.className = "text-slate-300";
        list.appendChild(li);
    });
}

// --------------------------------------------------
// History of predictions
// --------------------------------------------------
function riskLabel(probability) {
    if (probability < 0.3) return "Low Risk";
    if (probability < 0.6) return "Moderate Risk";
    return "High Risk";
}

function updatePredictionHistory(location, probability) {
    const historyList = document.getElementById("predictionHistory");
    if (!historyList) {
        console.error("❌ History list element not found");
        return;
    }

    // Add new entry to the start
    predictionHistory.unshift({
        location,
        probability,
        timestamp: new Date().toLocaleTimeString()
    });

    // Limit history size
    if (predictionHistory.length > MAX_HISTORY) {
        predictionHistory.pop();
    }

    // Persist history to localStorage
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(predictionHistory)
    )

    // Clear list
    historyList.innerHTML = "";

    // Render history
    predictionHistory.forEach(entry => {
        const li = document.createElement("li");
        li.className = "cursor-pointer hover:bg-slate-800/50 p-2 rounded transition";

        const percent = (entry.probability * 100).toFixed(1);
        const label = riskLabel(entry.probability);

        li.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="font-medium">${entry.location}</span>
                <span class="text-slate-400">${percent}%</span>
            </div>
            <div class="flex items-center justify-between mt-1">
                <span class="text-xs text-slate-500">${entry.timestamp}</span>
                <span class="text-xs px-2 py-0.5 rounded-full
                    ${
                        label === "Low Risk"
                            ? "bg-green-500/20 text-green-400"
                            : label === "Moderate Risk"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                    }">
                    ${label}
                </span>
            </div>
        `;

        // Click to Restore
        li.addEventListener("click", () => {
            restoreLocation(entry.location);
        });

        historyList.appendChild(li);
    });
}

// Restore location in input field
async function restoreLocation(location) {
    const input = document.getElementById("locationInput");
    if (!input) return;

    input.value = location;

    // Trigger prediction flow again
    const button = document.getElementById("getWeatherBtn");
    if (button) button.click();
}

// --------------------------------------------------
// Update weather stats display
// --------------------------------------------------
function updateWeatherStats(weather) {
    const elements = {
        temperaturePrediction: `${weather.temperature.toFixed(1)}°C`,
        humidityPrediction: `${weather.humidity}%`,
        pressurePrediction: `${weather.pressure} hPa`,
        windSpeedPrediction: `${weather.windSpeed.toFixed(1)} m/s`,
        cloudCoverPrediction: `${weather.cloudCover}%`,
        weatherConditionPrediction: weather.description || "Unknown"
    };

    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove("skeleton");
            el.textContent = value;
        }
    });
}


// --------------------------------------------------
// Mobile sidebar toggle logic
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("mobileMenuBtn");
  const overlay = document.getElementById("sidebarOverlay");
  const closeBtn = sidebar.querySelector(".close-btn");

  if (!sidebar || !menuBtn || !overlay) return;

  function isOpen() {
    return !sidebar.classList.contains("-translate-x-full");
  }

  function openSidebar() {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
    menuBtn.textContent = "✕";
  }

  function closeSidebar() {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
    menuBtn.textContent = "☰";
  }

  function toggleSidebar() {
    isOpen() ? closeSidebar() : openSidebar();
  }

  // ☰ Toggle menu
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSidebar();
  });

  // Overlay click closes
  overlay.addEventListener("click", closeSidebar);

  // Optional close button inside sidebar
  if (closeBtn) {
    closeBtn.addEventListener("click", toggleSidebar);
  }

  // ESC key support
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      closeSidebar();
    }
  });

// Close sidebar when a section/link is clicked (mobile only)
const sidebarLinks = sidebar.querySelectorAll("a");

sidebarLinks.forEach(link => {
  link.addEventListener("click", () => {

    // Only close on mobile
    if (window.innerWidth < 768) {
      closeSidebar();

    }
  });
});

});

// --------------------------------------------------
// Weather map (Leaflet + OpenWeatherMap)
// --------------------------------------------------
let baseLayer;
let precipitationLayer;
let cloudLayer;
let weatherMap;
let locationMarker;


// --------------------------------------------------
// Weather map legend
// --------------------------------------------------
let mapLegend;

function addMapLegend() {
    if (mapLegend) return; // Prevent duplicates

    mapLegend = L.control({ position: "bottomright" });

    mapLegend.onAdd = function () {
        const div = L.DomUtil.create("div", "map-legend");

        div.className = 
            "bg-slate-900/80 backdrop-blur " +
            "border border-white/10 " +
            "rounded-lg p-3 text-xs text-slate-200 space-y-1";

        div.innerHTML = `
            <div class="font-semibold mb-1">Map Layers</div>
            <div class="flex items-center gap-2">
                <span>🗺️</span> Base Map
            </div>

            <div class="flex items-center gap-2">
                <span>🌧️</span> Precipitation
            </div>

            <div class="flex items-center gap-2">
                <span>☁️</span> Cloud Cover
            </div>
        `;

        return div;
    };

    mapLegend.addTo(weatherMap);
                
}



// Show map with current location
function showWeatherMap(lat, lon, locationName = "Selected Location") {
    const container = document.getElementById("weatherMap");
    if (!container) return;

    if (!weatherMap) {
        weatherMap = L.map("weatherMap", {
            zoomControl: true,
            attributionControl: false,
            fadeAnimation: true,
            zoomAnimation: true
        }).setView([lat, lon], 7);

        // Base map
        baseLayer = L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            { maxZoom: 18 }
        ).addTo(weatherMap);

        // Cloud layer
        cloudLayer = L.tileLayer(
            `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
            { opacity: 0.5 }
        );

        // Precipitation layer
        precipitationLayer = L.tileLayer(
            `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
            { opacity: 0.7 }
        ).addTo(weatherMap);

        // Layer controls
        L.control.layers(
            {"Base Map": baseLayer},
            {
                "🌧️ Precipitation": precipitationLayer,
                "☁️ Cloud Cover": cloudLayer
            },
            { collapsed: false }
        ).addTo(weatherMap);
    
    } else {
        weatherMap.setView([lat, lon], 7);
    }

    // Add map legend
    addMapLegend();

    // 📍 Enhanced marker with custom icon and animation
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="font-size: 24px;">📍</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    if (locationMarker) {
        locationMarker
            .setLatLng([lat, lon])
            .setPopupContent(`<div style="text-align: center; font-weight: 600;">📍 ${locationName}</div>`)
            .openPopup();
    } else {
        locationMarker = L.marker([lat, lon], { 
            icon: customIcon,
            draggable: false 
        })
        .addTo(weatherMap)
        .bindPopup(`<div style="text-align: center; font-weight: 600;">📍 ${locationName}</div>`)
        .openPopup();
    }
    
    // Add smooth pan animation
    weatherMap.flyTo([lat, lon], 7, {
        animate: true,
        duration: 1.5
    });
}
