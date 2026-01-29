import React, { useState, useEffect, useRef } from 'react';
import './Header.css';

const Header = ({ onCityChange, currentCity, currentWeather }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  
  // API ключ
  const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || 'be9bfc4fe025bca11decbacdba1dcd84';

  // Закрытие подсказок при клике вне поля поиска
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Поиск городов при вводе
  useEffect(() => {
    const searchCities = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=8&appid=${API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const citySuggestions = data.map(city => ({
            name: city.name,
            country: city.country,
            state: city.state,
            lat: city.lat,
            lon: city.lon
          }));
          setSuggestions(citySuggestions);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchCities();
      }
    }, 300); // Задержка для избежания множественных запросов

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, API_KEY]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onCityChange(searchQuery);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city) => {
    onCityChange(city.name);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim().length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Форматируем дату и время
  const formatDateTime = () => {
    if (currentWeather && currentWeather.date && currentWeather.time) {
      return {
        date: currentWeather.date,
        time: currentWeather.time
      };
    }
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const date = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return { date, time };
  };

  const { date, time } = formatDateTime();

  return (
    <header className="header">
      <div className="header-content">
        {/* Левая часть - время и дата */}
        <div className="header-left">
          <div className="time-display">
            <span className="time">{time}</span>
            <span className="date">{date}</span>
          </div>
          <div className="welcome">
            Welcome to {currentCity || 'Weather App'}
          </div>
        </div>

        {/* Правая часть - поиск */}
        <div className="header-right" ref={searchRef}>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search city..."
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                className="search-input"
                autoComplete="off"
              />
              
              {/* Выпадающие подсказки */}
              {showSuggestions && (
                <div className="suggestions-dropdown">
                  {isLoading ? (
                    <div className="suggestion-item loading">
                      <div className="suggestion-loading">Searching cities...</div>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((city, index) => (
                      <div
                        key={`${city.name}-${city.country}-${index}`}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(city)}
                      >
                        <div className="suggestion-name">
                          {city.name}
                          {city.state && `, ${city.state}`}
                        </div>
                        <div className="suggestion-country">
                          {city.country}
                          <span className="suggestion-coords">
                            ({city.lat.toFixed(2)}, {city.lon.toFixed(2)})
                          </span>
                        </div>
                      </div>
                    ))
                  ) : searchQuery.length >= 2 ? (
                    <div className="suggestion-item no-results">
                      No cities found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;