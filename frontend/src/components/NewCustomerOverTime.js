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

const NewCustomersOverTimeChart = () => {
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/new-customers');
        const data = response.data.data;
        console.log('Data received:', data);

        if (!Array.isArray(data)) {
          throw new Error('Expected data to be an array');
        }
        const processedData = data.map(item => ({
          date: item.date,
          count: item.count
        }));

        setCustomerData(processedData);
        setLoading(false);
      } catch (error) {
        setError(`Failed to load data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>
  const chartData = {
    labels: customerData.map(item => item.date),
    datasets: [
      {
        label: 'New Customers Added',
        data: customerData.map(item => item.count),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div>
      <h2>New Customers Added Over Time</h2>
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
                  return `${context.dataset.label}: ${context.raw}`;
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
                text: 'Number of Customers'
              }
            }
          }
        }}
      />
    </div>
  );
};

export default NewCustomersOverTimeChart;
