import React from 'react';
import './AirQuality.css';

const AirQuality = ({ aqiForecast, loading }) => {
  const getAQIInfo = (aqi) => {
    const levels = {
      1: { level: 'Good', color: '#00E400', emoji: '😊' },
      2: { level: 'Fair', color: '#FFFF00', emoji: '😐' },
      3: { level: 'Moderate', color: '#FF7E00', emoji: '😷' },
      4: { level: 'Poor', color: '#FF0000', emoji: '🤢' },
      5: { level: 'Very Poor', color: '#8F3F97', emoji: '☠️' }
    };
    return levels[aqi] || levels[1];
  };

  const defaultForecast = [
    { day: 'Today', aqi: 2, pm25: 25, pm10: 40 },
    { day: 'Tue', aqi: 3, pm25: 35, pm10: 55 },
    { day: 'Wed', aqi: 2, pm25: 28, pm10: 45 },
    { day: 'Thu', aqi: 4, pm25: 55, pm10: 80 },
    { day: 'Fri', aqi: 3, pm25: 38, pm10: 60 }
  ];

  const forecastData = aqiForecast && aqiForecast.length > 0 ? aqiForecast : defaultForecast;

  if (loading) {
    return (
      <div className="air-quality">
        <h3>Air Quality Forecast</h3>
        <div className="aqi-forecast-grid">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="aqi-card loading">
              <div className="aqi-day">--</div>
              <div className="aqi-emoji">⏳</div>
              <div className="aqi-value">--</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="air-quality">
      <h3>Air Quality Forecast</h3>
      <div className="aqi-forecast-grid">
        {forecastData.slice(0, 5).map((day, index) => {
          const aqiInfo = getAQIInfo(day.aqi);
          
          return (
            <div 
              key={index} 
              className="aqi-card"
              style={{ borderColor: aqiInfo.color }}
            >
              <div className="aqi-day">{day.day}</div>
              <div className="aqi-emoji" style={{ color: aqiInfo.color }}>
                {aqiInfo.emoji}
              </div>
              <div className="aqi-value" style={{ color: aqiInfo.color }}>
                AQI {day.aqi}
              </div>
              <div className="aqi-level">{aqiInfo.level}</div>
              <div className="pollutant-info">
                <div className="pollutant">
                  <span>PM2.5</span>
                  <span>{day.pm25}μg</span>
                </div>
                <div className="pollutant">
                  <span>PM10</span>
                  <span>{day.pm10}μg</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AirQuality;