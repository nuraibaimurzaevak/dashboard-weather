import axios from 'axios';

const API_KEY = 'be9bfc4fe025bca11decbacdba1dcd84';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherAPI {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });
  }

  // Получить текущую погоду по городу
  async getCurrentWeather(city) {
    try {
      const response = await this.client.get('/weather', {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
          lang: 'en'
        }
      });
      
      return this.formatCurrentWeatherData(response.data);
    } catch (error) {
      console.error('Weather API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        throw new Error(`City "${city}" not found. Please check the spelling.`);
      } else if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
      } else if (error.response?.status === 429) {
        throw new Error('API limit exceeded. Please try again later.');
      } else {
        throw new Error('Failed to fetch weather data. Please try again.');
      }
    }
  }

  // Получить прогноз на 5 дней
  async get5DayForecast(city) {
    try {
      const response = await this.client.get('/forecast', {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
          cnt: 40
        }
      });
      
      return this.formatForecastData(response.data);
    } catch (error) {
      console.error('Forecast API Error:', error);
      throw error;
    }
  }

  // Получить все данные
  async getAllWeatherData(city) {
    try {
      const currentResponse = await this.getCurrentWeather(city);
      const forecastResponse = await this.get5DayForecast(city);
      
      return {
        current: currentResponse,
        forecast: forecastResponse
      };
    } catch (error) {
      console.error('Get all data error:', error);
      throw error;
    }
  }

  // Форматирование текущей погоды
  formatCurrentWeatherData(data) {
    return {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: this.capitalizeFirstLetter(data.weather[0].description),
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      pressure: data.main.pressure,
      visibility: data.visibility ? (data.visibility / 1000).toFixed(1) + ' km' : 'N/A',
      sunrise: this.formatTime(data.sys.sunrise, data.timezone),
      sunset: this.formatTime(data.sys.sunset, data.timezone),
      timezone: data.timezone,
      coord: data.coord,
      date: new Date(data.dt * 1000).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: new Date(data.dt * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  }

  // Форматирование прогноза
  formatForecastData(data) {
    const dailyForecasts = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: date,
          dayName: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temps: [],
          icons: [],
          descriptions: []
        };
      }
      
      dailyForecasts[date].temps.push(Math.round(item.main.temp));
      dailyForecasts[date].icons.push(item.weather[0].icon);
      dailyForecasts[date].descriptions.push(item.weather[0].description);
    });
    
    return Object.values(dailyForecasts).slice(0, 5).map(day => ({
      day: day.dayName,
      date: day.date,
      maxTemp: Math.max(...day.temps),
      minTemp: Math.min(...day.temps),
      icon: this.getMostFrequentIcon(day.icons),
      description: this.getMostFrequentDescription(day.descriptions)
    }));
  }

  // Вспомогательные функции
  getMostFrequentIcon(icons) {
    const counts = {};
    icons.forEach(icon => {
      counts[icon] = (counts[icon] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  getMostFrequentDescription(descriptions) {
    const counts = {};
    descriptions.forEach(desc => {
      counts[desc] = (counts[desc] || 0) + 1;
    });
    
    return this.capitalizeFirstLetter(
      Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
    );
  }

  formatTime(timestamp, timezoneOffset) {
    const date = new Date((timestamp + timezoneOffset) * 1000);
    const timeString = date.toUTCString().split(' ')[4];
    const [hours, minutes] = timeString.split(':');
    
    // Конвертируем в 12-часовой формат
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minutes} ${ampm}`;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Получить URL иконки погоды
  getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }
}

export default new WeatherAPI();