import axios from 'axios';
import weatherAPI from './weatherAPI';

const API_KEY = 'be9bfc4fe025bca11decbacdba1dcd84';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherService {
  // Получить все данные для дашборда
  async getDashboardData(city = 'Dhaka') {
    try {
      // Получаем все данные параллельно
      const [currentWeather, forecast, aqiForecast] = await Promise.all([
        weatherAPI.getCurrentWeather(city),
        this.get7DayForecast(city),
        this.getAirQualityForecast(city)
      ]);
      
      return {
        currentWeather: {
          city: currentWeather.city,
          country: currentWeather.country,
          temperature: currentWeather.temperature,
          feelsLike: currentWeather.feelsLike,
          description: currentWeather.description,
          icon: currentWeather.icon,
          humidity: currentWeather.humidity,
          windSpeed: currentWeather.windSpeed,
          sunrise: currentWeather.sunrise,
          sunset: currentWeather.sunset,
          date: currentWeather.date,
          time: currentWeather.time
        },
        
        forecast: forecast,
        
        monthlyRainfall: this.generateMonthlyRainfallData(),
        
        airQuality: aqiForecast,
        
        sunTimes: {
          sunrise: currentWeather.sunrise,
          sunset: currentWeather.sunset,
          dayLength: this.calculateDayLength(currentWeather.sunrise, currentWeather.sunset)
        },
        
        otherCities: await this.getOtherCitiesWeather()
      };
    } catch (error) {
      console.error('Dashboard data error:', error);
      // Возвращаем fallback данные
      return this.getFallbackData(city);
    }
  }

  // Получить прогноз на 7 дней (ИСПРАВЛЕННЫЙ)
  async get7DayForecast(city) {
    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
          cnt: 40
        }
      });
      
      return this.format7DayForecast(response.data);
    } catch (error) {
      console.error('7 Day Forecast error:', error);
      return this.generateFallbackForecast();
    }
  }

  // Форматируем 7-дневный прогноз (ИСПРАВЛЕНО)
  format7DayForecast(data) {
    const dailyForecasts = new Map();
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const temp = Math.round(item.main.temp);
      
      if (!dailyForecasts.has(dateKey)) {
        dailyForecasts.set(dateKey, {
          date: displayDate,
          dayName: dayName,
          temps: [temp],
          maxTemp: temp,
          minTemp: temp,
          icons: [item.weather[0].icon],
          descriptions: [item.weather[0].description],
          timestamp: item.dt
        });
      } else {
        const dayData = dailyForecasts.get(dateKey);
        dayData.temps.push(temp);
        dayData.icons.push(item.weather[0].icon);
        dayData.descriptions.push(item.weather[0].description);
        
        if (temp > dayData.maxTemp) dayData.maxTemp = temp;
        if (temp < dayData.minTemp) dayData.minTemp = temp;
      }
    });
    
    const sortedDates = Array.from(dailyForecasts.keys()).sort();
    
    const apiDays = sortedDates.map(dateKey => {
      const dayData = dailyForecasts.get(dateKey);
      return {
        day: dayData.dayName,
        date: dayData.date,
        maxTemp: dayData.maxTemp,
        minTemp: dayData.minTemp,
        icon: this.getMostFrequentIcon(dayData.icons),
        description: this.getMostFrequentDescription(dayData.descriptions)
      };
    });
    
    if (apiDays.length < 7) {
      return this.extendForecastTo7Days(apiDays);
    }
    
    return apiDays.slice(0, 7);
  }

  // Получить прогноз качества воздуха на 5 дней
  async getAirQualityForecast(city) {
    try {
      // Получаем координаты города
      const geoResponse = await axios.get(`http://api.openweathermap.org/geo/1.0/direct`, {
        params: { q: city, appid: API_KEY, limit: 1 }
      });
      
      if (geoResponse.data.length === 0) {
        return this.generateAQIForecast();
      }
      
      const { lat, lon } = geoResponse.data[0];
      
      // Получаем прогноз качества воздуха
      const aqiResponse = await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution/forecast`, {
        params: { lat, lon, appid: API_KEY }
      });
      
      return this.formatAQIForecast(aqiResponse.data);
      
    } catch (error) {
      console.error('Air quality forecast error:', error);
      return this.generateAQIForecast();
    }
  }

  // Форматируем данные AQI
  formatAQIForecast(aqiData) {
    // Группируем по дням
    const dailyAQI = new Map();
    const now = new Date();
    
    aqiData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
      const isToday = date.getDate() === now.getDate();
      const dayName = isToday ? 'Today' : dayKey;
      
      if (!dailyAQI.has(dayName)) {
        dailyAQI.set(dayName, {
          day: dayName,
          aqi: item.main.aqi,
          pm25: Math.round(item.components.pm2_5),
          pm10: Math.round(item.components.pm10),
          co: Math.round(item.components.co),
          no2: Math.round(item.components.no2),
          o3: Math.round(item.components.o3),
          so2: Math.round(item.components.so2)
        });
      }
    });
    
    // Преобразуем в массив
    const aqiArray = Array.from(dailyAQI.values());
    
    // Если меньше 5 дней, добавляем
    if (aqiArray.length < 5) {
      return this.extendAQIForecast(aqiArray);
    }
    
    return aqiArray.slice(0, 5);
  }

  // Расширяем AQI прогноз до 5 дней
  extendAQIForecast(apiDays) {
    const fullForecast = [...apiDays];
    const daysNeeded = 5 - apiDays.length;
    const dayNames = ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < daysNeeded; i++) {
      const dayIndex = apiDays.length + i;
      const baseDay = apiDays.length > 0 ? apiDays[apiDays.length - 1] : null;
      
      const extendedDay = {
        day: dayNames[dayIndex] || `Day ${dayIndex + 1}`,
        aqi: baseDay ? baseDay.aqi : Math.floor(Math.random() * 3) + 2,
        pm25: baseDay ? baseDay.pm25 : Math.floor(Math.random() * 40) + 10,
        pm10: baseDay ? baseDay.pm10 : Math.floor(Math.random() * 60) + 20,
        co: baseDay ? baseDay.co : Math.floor(Math.random() * 200) + 100,
        no2: baseDay ? baseDay.no2 : Math.floor(Math.random() * 20) + 5,
        o3: baseDay ? baseDay.o3 : Math.floor(Math.random() * 40) + 20,
        so2: baseDay ? baseDay.so2 : Math.floor(Math.random() * 5) + 1
      };
      
      fullForecast.push(extendedDay);
    }
    
    return fullForecast;
  }

  // Генерация тестовых данных AQI
  generateAQIForecast() {
    const days = ['Today', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days.map((day, index) => ({
      day: day,
      aqi: Math.floor(Math.random() * 3) + 2, // 2-4
      pm25: Math.floor(Math.random() * 40) + 10, // 10-50
      pm10: Math.floor(Math.random() * 60) + 20, // 20-80
      co: Math.floor(Math.random() * 200) + 100,
      no2: Math.floor(Math.random() * 20) + 5,
      o3: Math.floor(Math.random() * 40) + 20,
      so2: Math.floor(Math.random() * 5) + 1
    }));
  }

  // Запасные данные при ошибке API
  getFallbackData(city) {
    const today = new Date();
    
    return {
      currentWeather: {
        city: city,
        country: 'BD',
        temperature: 25,
        feelsLike: 27,
        description: 'Partly cloudy',
        icon: '02d',
        humidity: 65,
        windSpeed: 5.2,
        sunrise: '06:15 AM',
        sunset: '06:45 PM',
        date: today.toLocaleDateString('en-GB'),
        time: today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      },
      forecast: this.generateFallbackForecast(),
      monthlyRainfall: this.generateMonthlyRainfallData(),
      airQuality: this.generateAQIForecast(),
      sunTimes: {
        sunrise: '06:15 AM',
        sunset: '06:45 PM',
        dayLength: '12h 30m'
      },
      otherCities: [
        { city: 'Tokyo', country: 'JP', temperature: 22, description: 'Sunny', icon: '01d' },
        { city: 'London', country: 'UK', temperature: 15, description: 'Cloudy', icon: '03d' },
        { city: 'New York', country: 'US', temperature: 18, description: 'Clear', icon: '01d' },
        { city: 'Paris', country: 'FR', temperature: 17, description: 'Rainy', icon: '10d' }
      ]
    };
  }

  // Существующие методы (без изменений)
  extendForecastTo7Days(apiDays) {
    const fullForecast = [...apiDays];
    
    if (apiDays.length === 0) {
      return this.generateFallbackForecast();
    }
    
    const daysNeeded = 7 - apiDays.length;
    
    for (let i = 0; i < daysNeeded; i++) {
      const dayIndex = apiDays.length + i;
      
      const extendedDay = {
        day: this.getDayNameByOffset(dayIndex),
        date: this.getDateByOffset(dayIndex),
        maxTemp: this.calculateExtendedTemp(apiDays, 'maxTemp'),
        minTemp: this.calculateExtendedTemp(apiDays, 'minTemp'),
        icon: apiDays[apiDays.length - 1].icon,
        description: apiDays[apiDays.length - 1].description
      };
      
      fullForecast.push(extendedDay);
    }
    
    return fullForecast;
  }

  calculateExtendedTemp(sourceDays, tempType) {
    if (sourceDays.length === 0) return 20;
    
    const temps = sourceDays.map(day => {
      const temp = day[tempType];
      return typeof temp === 'number' ? temp : parseInt(temp) || 20;
    });
    
    const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    const variation = (Math.random() - 0.5) * 3;
    
    return Math.round(avgTemp + variation);
  }

  getDayNameByOffset(offset) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offset);
    return days[targetDate.getDay()];
  }

  getDateByOffset(offset) {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offset);
    return targetDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
  }

  getMostFrequentIcon(icons) {
    if (!icons || icons.length === 0) return '01d';
    
    const counts = {};
    icons.forEach(icon => {
      counts[icon] = (counts[icon] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  getMostFrequentDescription(descriptions) {
    if (!descriptions || descriptions.length === 0) return 'Clear sky';
    
    const counts = {};
    descriptions.forEach(desc => {
      counts[desc] = (counts[desc] || 0) + 1;
    });
    
    const mostFrequent = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    return this.capitalizeFirstLetter(mostFrequent);
  }

  capitalizeFirstLetter(string) {
    if (!string) return 'Clear sky';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  generateFallbackForecast() {
    const forecast = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const baseTemp = 20 + (Math.random() * 10 - 5);
      const maxTemp = Math.round(baseTemp + 3 + Math.random() * 4);
      const minTemp = Math.round(baseTemp - 3 - Math.random() * 4);
      
      forecast.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
        maxTemp: maxTemp,
        minTemp: minTemp,
        icon: ['01d', '02d', '03d', '04d', '10d'][Math.floor(Math.random() * 5)],
        description: ['Sunny', 'Partly cloudy', 'Cloudy', 'Overcast', 'Light rain'][Math.floor(Math.random() * 5)]
      });
    }
    
    return forecast;
  }

  generateMonthlyRainfallData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      rainfall: Math.floor(Math.random() * 300),
      sunnyDays: Math.floor(Math.random() * 20) + 10
    }));
  }

  calculateDayLength(sunrise, sunset) {
    if (!sunrise || !sunset) return 'N/A';
    
    try {
      const sunriseMatch = sunrise.match(/(\d+):(\d+)\s*(AM|PM)/i);
      const sunsetMatch = sunset.match(/(\d+):(\d+)\s*(AM|PM)/i);
      
      if (!sunriseMatch || !sunsetMatch) return 'N/A';
      
      let sunriseHours = parseInt(sunriseMatch[1]);
      const sunriseMinutes = parseInt(sunriseMatch[2]);
      const sunrisePeriod = sunriseMatch[3].toUpperCase();
      
      let sunsetHours = parseInt(sunsetMatch[1]);
      const sunsetMinutes = parseInt(sunsetMatch[2]);
      const sunsetPeriod = sunsetMatch[3].toUpperCase();
      
      if (sunrisePeriod === 'PM' && sunriseHours !== 12) sunriseHours += 12;
      if (sunrisePeriod === 'AM' && sunriseHours === 12) sunriseHours = 0;
      
      if (sunsetPeriod === 'PM' && sunsetHours !== 12) sunsetHours += 12;
      if (sunsetPeriod === 'AM' && sunsetHours === 12) sunsetHours = 0;
      
      const totalSunriseMinutes = sunriseHours * 60 + sunriseMinutes;
      const totalSunsetMinutes = sunsetHours * 60 + sunsetMinutes;
      
      let totalMinutes = totalSunsetMinutes - totalSunriseMinutes;
      if (totalMinutes < 0) totalMinutes += 24 * 60;
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Error calculating day length:', error);
      return 'N/A';
    }
  }

  async getOtherCitiesWeather() {
    const cities = ['Tokyo', 'London', 'New York', 'Paris'];
    
    try {
      const promises = cities.map(city => 
        weatherAPI.getCurrentWeather(city).catch(() => null)
      );
      
      const results = await Promise.all(promises);
      
      return results
        .filter(data => data !== null)
        .map(data => ({
          city: data.city,
          country: data.country,
          temperature: data.temperature,
          description: data.description,
          icon: data.icon
        }));
    } catch (error) {
      console.error('Other cities error:', error);
      return [
        { city: 'Tokyo', country: 'JP', temperature: 22, description: 'Sunny', icon: '01d' },
        { city: 'London', country: 'UK', temperature: 15, description: 'Cloudy', icon: '03d' },
        { city: 'New York', country: 'US', temperature: 18, description: 'Clear', icon: '01d' },
        { city: 'Paris', country: 'FR', temperature: 17, description: 'Rainy', icon: '10d' }
      ];
    }
  }
}

export default new WeatherService();