import React from 'react';
import './MonthlyRainfall.css';

const MonthlyRainfall = ({ rainfallData }) => {
  // Если данных нет, используем статические
  const months = [
    { name: 'Jan', rain: 20, sun: 80 },
    { name: 'Feb', rain: 25, sun: 75 },
    { name: 'Mar', rain: 35, sun: 65 },
    { name: 'Apr', rain: 45, sun: 55 },
    { name: 'May', rain: 55, sun: 45 },
    { name: 'Jun', rain: 65, sun: 35 },
    { name: 'Jul', rain: 70, sun: 30 },
    { name: 'Aug', rain: 60, sun: 40 },
    { name: 'Sep', rain: 50, sun: 50 },
    { name: 'Oct', rain: 40, sun: 60 },
    { name: 'Nov', rain: 30, sun: 70 },
    { name: 'Dec', rain: 25, sun: 75 }
  ];

  return (
    <div className="monthly-rainfall">
      <div className="rainfall-header">
        <h3>Monthly Rainfall</h3>
        <div className="rainfall-legend">
          <div className="legend-item">
            <div className="legend-color rain"></div>
            <span>Rain</span>
          </div>
          <div className="legend-item">
            <div className="legend-color sun"></div>
            <span>Sun</span>
          </div>
        </div>
      </div>
      
      <div className="rainfall-chart">
        {months.map((month, index) => (
          <div key={index} className="month-bar">
            <div className="bar-labels">
              <span className="month-name">{month.name}</span>
              <span className="rain-value">{month.rain}mm</span>
            </div>
            <div className="bar-container">
              <div 
                className="rain-bar" 
                style={{ height: `${month.rain}%` }}
                title={`Rain: ${month.rain}mm`}
              ></div>
              <div 
                className="sun-bar" 
                style={{ height: `${month.sun}%` }}
                title={`Sun: ${month.sun}%`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyRainfall;