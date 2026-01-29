import React from 'react';
import './CurrentWeather.css';

const CurrentWeather = ({ city, currentWeather, loading }) => {
  if (loading && !currentWeather) {
    return (
      <div className="current-weather loading">
        <div className="skeleton-header"></div>
        <div className="skeleton-temperature"></div>
        <div className="skeleton-details">
          <div className="skeleton-detail"></div>
          <div className="skeleton-detail"></div>
        </div>
      </div>
    );
  }

  if (!currentWeather) {
    return (
      <div className="current-weather">
        <div className="weather-header">
          <h2>{city || 'Loading...'}</h2>
          <div className="city-time">Data not available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="current-weather">
      <div className="weather-header">
        <h2>{currentWeather.city || city}</h2>
        <div className="city-time">{currentWeather.date}</div>
        <div className="city-time">{currentWeather.time}</div>
      </div>
      
      <div className="weather-info">
        <div className="temperature">{currentWeather.temperature}°C</div>
        <div className="condition">
          {currentWeather.icon && (
            <img 
              src={`https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`}
              alt={currentWeather.description}
              className="weather-icon"
            />
          )}
          <span>{currentWeather.description}</span>
        </div>
      </div>
      
      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-label">Feels Like</span>
          <span className="detail-value">{currentWeather.feelsLike}°C</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Wind</span>
          <span className="detail-value">{currentWeather.windSpeed} km/h</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Humidity</span>
          <span className="detail-value">{currentWeather.humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Pressure</span>
          <span className="detail-value">{currentWeather.pressure} hPa</span>
        </div>
      </div>
      
      <div className="weather-extra">
        <div className="weather-summary">
          <div className="summary-item">
            <span className="summary-label">Visibility</span>
            <span className="summary-value">{currentWeather.visibility}</span>
          </div>
          <div className="summary-text">
            {currentWeather.description}. Feels like {currentWeather.feelsLike}°C. 
            {currentWeather.humidity < 50 ? ' Low humidity.' : ' High humidity.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;