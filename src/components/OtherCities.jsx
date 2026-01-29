import React, { useState, useEffect } from 'react';
import './OtherCities.css';

const OtherCities = ({ onCitySelect }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Координаты 6 популярных городов
  const cityCoordinates = [
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP' },
    { name: 'Seattle', lat: 47.6062, lon: -122.3321, country: 'US' },
    { name: 'Kabul', lat: 34.5553, lon: 69.2075, country: 'AF' },
    { name: 'Tirana', lat: 41.3275, lon: 19.8187, country: 'AL' },
    { name: 'Algiers', lat: 36.7538, lon: 3.0588, country: 'DZ' },
    { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US' }
  ];

  // API ключ (должен быть в .env)
  const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || 'be9bfc4fe025bca11decbacdba1dcd84';

  useEffect(() => {
    const fetchRealWeatherData = async () => {
      try {
        setLoading(true);
        
        const promises = cityCoordinates.map(async (city) => {
          try {
            // Прямой запрос к OpenWeatherMap API
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric&lang=en`
            );
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
              name: city.name,
              country: city.country,
              temp: `${Math.round(data.main.temp)}°`,
              feels_like: `${Math.round(data.main.feels_like)}°`,
              wind: `${Math.round(data.wind.speed * 3.6)} km/h`, // конвертируем m/s в km/h
              humidity: `${data.main.humidity}%`,
              pressure: `${data.main.pressure} hPa`,
              condition: data.weather[0].main,
              description: data.weather[0].description,
              icon: data.weather[0].icon,
              last_updated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          } catch (error) {
            console.error(`Error fetching ${city.name}:`, error);
            // Fallback данные для этого города
            return {
              name: city.name,
              country: city.country,
              temp: `${Math.floor(Math.random() * 10) + 20}°`,
              wind: `${Math.floor(Math.random() * 10) + 5} km/h`,
              humidity: `${Math.floor(Math.random() * 30) + 40}%`,
              condition: ['Sunny', 'Cloudy', 'Clear'][Math.floor(Math.random() * 3)],
              description: 'API Error - Using demo data'
            };
          }
        });

        const results = await Promise.all(promises);
        setCities(results);
        
      } catch (error) {
        console.error('Error fetching weather data:', error);
        // Полный fallback если все сломалось
        setCities(cityCoordinates.map(city => ({
          name: city.name,
          country: city.country,
          temp: `${Math.floor(Math.random() * 10) + 20}°`,
          wind: `${Math.floor(Math.random() * 10) + 5} km/h`,
          humidity: `${Math.floor(Math.random() * 30) + 40}%`,
          condition: ['Sunny', 'Cloudy', 'Clear'][Math.floor(Math.random() * 3)],
          description: 'API Error - Using demo data'
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchRealWeatherData();

    // Обновляем данные каждые 10 минут
    const interval = setInterval(fetchRealWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (iconCode) => {
    if (iconCode) {
      return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="other-cities">
        <h3>Other Cities</h3>
        <div className="cities-container">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="city-weather-card loading">
              <div className="city-header">
                <div className="city-name">Loading...</div>
                <div className="city-temp">--°</div>
              </div>
              <div className="city-details">
                <div className="detail">
                  <div className="detail-label">Wind</div>
                  <div className="detail-value">-- km/h</div>
                </div>
                <div className="detail">
                  <div className="detail-label">Humidity</div>
                  <div className="detail-value">--%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="other-cities">
      <div className="cities-header">
        <h3>Other Cities 🌍</h3>
        <div className="api-status">
          {cities[0]?.description?.includes('API Error') ? 'DEMO DATA' : 'LIVE DATA'}
        </div>
      </div>
      
      <div className="cities-container">
        {cities.map((city, index) => (
          <div 
            key={index} 
            className="city-weather-card"
            onClick={() => onCitySelect && onCitySelect(city.name)}
            title={`Click to view ${city.name} details`}
          >
            <div className="city-header">
              <div className="city-info">
                <div className="city-name">{city.name}</div>
                <div className="city-country">{city.country}</div>
              </div>
              
              <div className="temp-section">
                <div className="city-temp">{city.temp}</div>
                <div className="weather-icon-small">
                  {city.icon ? (
                    <img 
                      src={getWeatherIcon(city.icon)} 
                      alt={city.condition}
                      className="weather-icon-img"
                    />
                  ) : (
                    <span className="weather-emoji">
                      {city.condition === 'Clear' ? '☀️' : 
                       city.condition === 'Clouds' ? '☁️' : 
                       city.condition === 'Rain' ? '🌧️' : '🌤️'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="city-condition">{city.description}</div>
            
            <div className="city-details">
              <div className="detail">
                <div className="detail-label">💨 Wind</div>
                <div className="detail-value">{city.wind}</div>
              </div>
              <div className="detail">
                <div className="detail-label">💧 Humidity</div>
                <div className="detail-value">{city.humidity}</div>
              </div>
              <div className="detail">
                <div className="detail-label">🌡️ Feels Like</div>
                <div className="detail-value">{city.feels_like || '--°'}</div>
              </div>
              <div className="detail">
                <div className="detail-label">📊 Pressure</div>
                <div className="detail-value">{city.pressure || '-- hPa'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherCities;