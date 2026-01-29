import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import SunTimes from './components/SunTimes';
import OtherCities from './components/OtherCities';
import AirQuality from './components/AirQuality';
import weatherService from './services/weatherService';
import './App.css';

function App() {
  const [city, setCity] = useState('Dhaka');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (cityName) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await weatherService.getDashboardData(cityName);
      setWeatherData(data);
      setCity(cityName);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData('Dhaka');
  }, []);

  const handleCityChange = (newCity) => {
    fetchWeatherData(newCity);
    setIsMenuOpen(false);
  };

  if (loading && !weatherData) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading weather data for {city}...</p>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className="App">
        <Header 
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onCityChange={handleCityChange}
          currentCity={city}
        />
        <div className="error-container">
          <div className="error-message">
            <h3>⚠️ {error}</h3>
            <button 
              className="retry-btn"
              onClick={() => fetchWeatherData('Dhaka')}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onCityChange={handleCityChange}
        currentCity={city}
      />
      
      <main className={`dashboard ${isMenuOpen ? 'menu-open' : ''}`}>
        {weatherData && (
          <div className="dashboard-grid">
            {/* Левая колонка - Other Cities */}
            <OtherCities 
              onCitySelect={handleCityChange} 
              cities={weatherData.otherCities}
              loading={loading}
            />
            
            {/* Прогноз на неделю */}
            <Forecast 
              forecastData={weatherData.forecast}
              loading={loading}
            />
            
            {/* Текущая погода */}
            <CurrentWeather 
              city={city}
              currentWeather={weatherData.currentWeather}
              loading={loading}
            />
            
            {/* Air Quality Forecast НА МЕСТЕ MonthlyRainfall */}
            <AirQuality 
              aqiForecast={weatherData.airQuality}
              loading={loading}
            />
            
            {/* Время восхода/заката */}
            <SunTimes 
              sunData={weatherData.sunTimes}
              loading={loading}
            />
          </div>
        )}
        
        {loading && weatherData && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;