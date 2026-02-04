# 🌦️ Weather Intelligence System

An **AI-powered, client-side web application** that predicts the **probability of rainfall** for a user-specified location using **real-time weather data** and **machine learning in the browser**.

Built with modern web technologies and a strong focus on **explainability**, **usability**, and **clean architecture**.

---

## ✨ Features

- 🌧️ **AI Rainfall Probability Prediction**
  - Outputs a percentage-based probability instead of a binary forecast
  - Confidence labels: *Low*, *Moderate*, *High*

- 🌍 **Real-Time Weather Data**
  - Live data fetched from the OpenWeatherMap API
  - Includes temperature, humidity, pressure, wind speed, and cloud cover

- 📊 **Interactive Visualisations**
  - Rain probability gauge
  - Radar chart of normalised weather features
  - Smooth animations and transitions

- 🤔 **Explainable AI**
  - Plain-language explanations describing *why* a prediction was made
  - Avoids black-box behaviour

- 🗺️ **Interactive Weather Map**
  - Location-based map using Leaflet
  - Toggleable precipitation and cloud cover layers

- 📜 **Prediction History**
  - Recent predictions stored locally in the browser
  - Click to restore previous locations
  - Clear history option

- 📱 **Responsive Design**
  - Optimised for desktop and mobile
  - Collapsible sidebar and loading indicators

---

## 🧠 How It Works

1. The user enters a location (e.g. *Liverpool, UK*)
2. Real-time weather data is retrieved from an external API
3. Weather features are passed into a **TensorFlow.js neural network**
4. The model outputs a **rainfall probability**
5. Results are visualised and explained to the user

All processing runs **entirely in the browser** — no server-side setup required.

---

## 🛠️ Technologies Used

- **HTML5** – Application structure  
- **CSS3 + Tailwind CSS** – Responsive styling and UI design  
- **JavaScript (ES6+)** – Application logic  
- **TensorFlow.js** – Client-side machine learning  
- **Chart.js** – Data visualisation  
- **Leaflet.js** – Interactive mapping  
- **Papa Parse** – CSV dataset parsing  
- **OpenWeatherMap API** – Live weather data  

---

## 📂 Project Structure

📁 WeatherIntelligenceSystem
├── index.html # Main UI structure
├── styles.css # Custom animations & styling
├── app.js # Core application logic
├── model.js # TensorFlow.js ML model
├── weather-api.js # Weather API integration
├── ui.js # UI helpers, charts & map logic
├── user_guide.pdf # User guide documentation
└── weather_intelligence_demo.mp4 # Video demo


---

## ⚠️ Disclaimer

This system provides **probability-based predictions**, not guaranteed outcomes.  
It is intended for **educational and exploratory purposes** and should not be used for safety-critical decision making.

---

## 👨‍💻 Author

**Harley Jackson**  
📍 United Kingdom

---

## ⭐ Acknowledgements

- OpenWeatherMap for weather data
- TensorFlow.js for enabling client-side ML
- Chart.js & Leaflet for visualisation tools

---

Feel free to ⭐ the repo or explore the code!
