import React, { useState } from "react";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    try {
      if (!city) {
        setError("Please enter a city name.");
        setWeather(null);
        return;
      }

      const geocodeResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=en&format=json`
      );

      if (!geocodeResponse.ok) {
        throw new Error("Failed to fetch geocoding data.");
      }

      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.results || geocodeData.results.length === 0) {
        setError("City not found. Please try another city.");
        setWeather(null);
        return;
      }

      const { latitude, longitude, timezone, name, country } = geocodeData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m&daily=weather_code,rain_sum&timezone=${encodeURIComponent(
          timezone
        )}`
      );

      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data.");
      }

      const weatherData = await weatherResponse.json();

      setWeather({
        city: `${name}, ${country}`,
        current: weatherData.current_weather,
        hourly: weatherData.hourly,
        daily: weatherData.daily,
      });
      setError("");
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Error fetching weather data. Please try again later.");
      setWeather(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather();
  };

  return (
    <div className="weather-container" style={styles.container}>
      <h1 style={styles.title}>Weather Now</h1>
      <form onSubmit={handleSearch} style={styles.form}>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Search
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      {weather && (
        <div className="weather-info-cards" style={styles.cardsContainer}>
          <div className="weather-card" style={styles.card}>
            <h3>Current Weather</h3>
            <p>Temperature: {weather.current.temperature}°C</p>
            <p>Wind Speed: {weather.current.windspeed} m/s</p>
          </div>

          <div className="weather-card" style={styles.card}>
            <h3>Hourly Forecast</h3>
            <p>Next Hour Temp: {weather.hourly.temperature_2m[0]}°C</p>
            <p>Tomorrow Temp: {weather.hourly.temperature_2m[24]}°C</p>
          </div>

          <div className="weather-card" style={styles.card}>
            <h3>Daily Summary</h3>
            <p>Weather Code: {weather.daily.weather_code[0]}</p>
            <p>Rain Sum: {weather.daily.rain_sum[0]} mm</p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    maxWidth: "800px",
    margin: "auto",
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    marginBottom: "1rem",
    color: "#ff7f50",
  },
  form: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
  },
  input: {
    padding: "0.5rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "200px",
  },
  button: {
    padding: "0.5rem 1rem",
    border: "none",
    color: "#fff",
    backgroundColor: "#ff7f50",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  error: {
    color: "red",
    fontSize: "0.9rem",
    margin: "1rem 0",
  },
  cardsContainer: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    marginTop: "2rem",
    gap: "1rem",
  },
  card: {
    backgroundColor: "#f7f7f7",
    borderRadius: "12px",
    padding: "1.5rem",
    width: "250px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.3s, background-color 0.3s",
    color: "#333",
    textAlign: "center",
  },
};

// Add hover and media query styles
document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style");
  style.innerHTML = `
    .weather-card:hover {
      transform: scale(1.05);
      background-color: #dcdcdc;
      color: #ff7f50;
    }

    button:hover {
      background-color: #e76f51;
    }

    @media (max-width: 768px) {
      .weather-container {
        padding: 1rem;
      }

      .weather-info-cards {
        flex-direction: column;
        align-items: center;
      }

      .weather-card {
        width: 90%;
        margin-bottom: 1rem;
      }

      input, button {
        width: 100%;
        margin: 0.5rem 0;
      }
    }
  `;
  document.head.appendChild(style);
});

export default WeatherApp;
