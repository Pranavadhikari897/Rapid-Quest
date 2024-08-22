import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import '../style.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SalesGrowthRateChart = () => {
  const [growthData, setGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sales-over-time'); 
        const data = response.data[0];
        const calculateGrowthRates = (data) => {
          const dailyData = data.daily || [];
          const rates = [];

          for (let i = 1; i < dailyData.length; i++) {
            const prev = dailyData[i - 1].totalSales;
            const current = dailyData[i].totalSales;
            const growthRate = ((current - prev) / prev) * 100;
            rates.push({
              date: dailyData[i].date,
              growthRate
            });
          }

          return rates;
        };

        const growthRates = calculateGrowthRates(data);
        setGrowthData(growthRates);
        setLoading(false);
      } catch (error) {
        setError(`Failed to load data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const chartData = {
    labels: growthData.map(item => item.date),
    datasets: [
      {
        label: 'Sales Growth Rate (%)',
        data: growthData.map(item => item.growthRate),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div>
      <h2>Sales Growth Rate Over Time</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Growth Rate (%)'
              },
              ticks: {
                callback: (value) => `${value.toFixed(2)}%`
              }
            }
          }
        }}
      />
    </div>
  );
};

export default SalesGrowthRateChart;
