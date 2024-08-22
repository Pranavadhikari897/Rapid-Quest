
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import '../style.css';
import {
  Chart as ChartJS,
  BarElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';
ChartJS.register(
  BarElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

const TotalLifetime = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/lifetime-value');
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: data.map(item => item.cohortMonth),
    datasets: [
      {
        label: 'Total Lifetime Value',
        data: data.map(item => item.totalLifetimeValue),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => `Total Value: $${context.raw}`
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Cohort Month' },
        ticks: { autoSkip: false }
      },
      y: {
        title: { display: true, text: 'Total Lifetime Value' },
        ticks: { beginAtZero: true }
      }
    }
  };

  return (
    <div>
      <h2>Total Lifetime Spend</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TotalLifetime;
