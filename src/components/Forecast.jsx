import React from 'react';
import './Forecast.css';

const Forecast = ({ forecastData, loading }) => {
  console.log('Forecast component received:', forecastData);

  if (loading) {
    return (
      <div className="forecast">
        <h3>Weekly Forecast</h3>
        <div className="forecast-grid">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="forecast-day loading">
              <div className="forecast-day-name">--</div>
              <div className="forecast-date">--/--</div>
              <div className="weather-icon">⏳</div>
              <div className="forecast-temp">--°</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Проверяем данные
  if (!forecastData || !Array.isArray(forecastData) || forecastData.length === 0) {
    return (
      <div className="forecast">
        <h3>Weekly Forecast</h3>
        <div className="no-data">
          <p>Loading forecast data...</p>
          <div className="fallback-forecast">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="forecast-day">
                <div className="forecast-day-name">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}</div>
                <div className="forecast-date">--/--</div>
                <div className="weather-icon">☀️</div>
                <div className="forecast-temp">--°</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Получаем эмодзи для иконки
  const getWeatherIcon = (iconCode) => {
    if (!iconCode) return '☀️';
    
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️',
    };
    
    // Если код содержит 'd' или 'n', используем карту, иначе возвращаем солнце
    if (iconCode.includes('d') || iconCode.includes('n')) {
      return iconMap[iconCode] || '☀️';
    }
    
    // Простая логика для числовых кодов
    const codeNum = parseInt(iconCode);
    if (codeNum >= 200 && codeNum < 300) return '⛈️';
    if (codeNum >= 300 && codeNum < 600) return '🌧️';
    if (codeNum >= 600 && codeNum < 700) return '❄️';
    if (codeNum >= 700 && codeNum < 800) return '🌫️';
    if (codeNum === 800) return '☀️';
    if (codeNum > 800) return '☁️';
    
    return '☀️';
  };

  // Используем первые 7 дней из данных
  const displayData = forecastData.slice(0, 7);

  return (
    <div className="forecast">
      <h3>Weekly Forecast</h3>
      <div className="forecast-grid">
        {displayData.map((day, index) => (
          <div key={day.id || index} className="forecast-day">
            <div className="forecast-day-name">{day.day || '--'}</div>
            <div className="forecast-date">{day.date || '--/--'}</div>
            <div className="weather-icon">
              {getWeatherIcon(day.icon)}
            </div>
            <div className="temperature-container">
              <span className="forecast-temp-max">
                {day.maxTemp ? `${Math.round(day.maxTemp)}°` : '--°'}
              </span>
              {day.minTemp && (
                <span className="forecast-temp-min">
                  {Math.round(day.minTemp)}°
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forecast;