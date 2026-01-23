// Weather API Key for OpenWeatherMap
const API_KEY = "65500660fdcd531f7bad607ca1aef150";

// Fetch weather data from OpenWeatherMap API
async function fetchWeatherData(location) {
    document.getElementById("loading").classList.remove("hidden");

    try {
        // API request URL
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Location not found or API error.");
        }

        const data = await response.json();
        console.log("🌍 Weather Data:", data);

        // Extract values from the response data
        const temperature = data.main.temp;
        const humidity = data.main.humidity;
        const pressure = data.main.pressure;
        const windSpeed = data.wind.speed;
        const windDirection = data.wind.deg;
        const visibility = data.visibility || "N/A";
        const cloudCover = data.clouds.all;
        const weatherDescription = data.weather[0].description;
        const lat = data.coord.lat;
        const lon = data.coord.lon;

        // Show percipitation map
        if (typeof showWeatherMap === "function") {
            showWeatherMap(lat, lon, location);
        }

        // Update Weather Display with fetched data
        updateWeatherDisplay({
            temperature,
            humidity,
            pressure,
            windSpeed,
            windDirection,
            visibility,
            cloudCover,
            weatherDescription
        });

        // Return relevant features for prediction
        return {
            temperature,
            humidity,
            pressure,
            windSpeed,
            cloudCover,
            description: weatherDescription,
            lat,
            lon
        };
    
    // Handle errors in fetching data
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Error fetching weather data: " + error.message);
        return null;
    } finally {
        document.getElementById("loading").classList.add("hidden");
    }
}
