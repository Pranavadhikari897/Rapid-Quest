
import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
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
  Legend,
  BarElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

const SalesOverTimeChart = () => {
  const [salesData, setSalesData] = useState({
    daily: [],
    monthly: [],
    quarterly: [],
    yearly: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('daily');

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sales-over-time');
        const data = response.data[0];
        setSalesData(data);
        setLoading(false);
      } catch (error) {
        setError(`Failed to load data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const createChartData = (data, label) => ({
    labels: data.map(item => item.date),
    datasets: [
      {
        label,
        data: data.map(item => item.totalSales),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  });

  const chartData = createChartData(salesData[chartType], `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Sales`);
  const isLineChart = chartType === 'daily' || chartType === 'monthly'; 

  return (
    <div>
      <h2>Sales Over Time</h2>

      <div>
        <button onClick={() => setChartType('daily')}>Daily</button>
        <button onClick={() => setChartType('monthly')}>Monthly</button>
        <button onClick={() => setChartType('quarterly')}>Quarterly</button>
        <button onClick={() => setChartType('yearly')}>Yearly</button>
      </div>

      {isLineChart ? (
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
                    return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: chartType.charAt(0).toUpperCase() + chartType.slice(1)
                },
                type: 'time',
                time: {
                  unit: chartType === 'daily' ? 'day' :
                        chartType === 'monthly' ? 'month' :
                        chartType === 'quarterly' ? 'quarter' : 'year',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Sales'
                },
                beginAtZero: true
              }
            }
          }}
        />
      ) : (
        <Bar
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
                    return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: chartType.charAt(0).toUpperCase() + chartType.slice(1)
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Sales'
                },
                beginAtZero: true
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default SalesOverTimeChart;

