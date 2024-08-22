
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns'; 
import '../style.css';
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale);

const RepeatCustomerAreaChart = () => {
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [chartType, setChartType] = useState('daily'); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlMap = {
          daily: 'http://localhost:5000/api/repeat-customers/daily',
          monthly: 'http://localhost:5000/api/repeat-customers/monthly',
          quarterly: 'http://localhost:5000/api/repeat-customers/quarterly',
          yearly: 'http://localhost:5000/api/repeat-customers/yearly',
        };

        const response = await axios.get(urlMap[chartType]);
        const result = response.data;

        let labels, counts;

        if (chartType === 'quarterly') {
      
          labels = result.data.map(item => {
            const [year, quarter] = item.date.split('-Q');
            const month = (parseInt(quarter) - 1) * 3; 
            return new Date(`${year}-${month + 1}-01T00:00:00Z`); 
          });
        } else {
          labels = result.data.map(item => item.date);
        }

        counts = result.data.map(item => item.repeatCustomerCount);

        setData({
          labels,
          datasets: [
            {
              label: 'Repeat Customer Count',
              data: counts,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              pointRadius: 5,
              pointBackgroundColor: 'rgba(75, 192, 192, 1)',
              showLine: false, 
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [chartType]);

  return (
    <div>
      <h2>Repeat Customer Count</h2>
      <div>
        <button onClick={() => setChartType('daily')}>Daily</button>
        <button onClick={() => setChartType('monthly')}>Monthly</button>
        <button onClick={() => setChartType('quarterly')}>Quarterly</button>
        <button onClick={() => setChartType('yearly')}>Yearly</button>
      </div>
      <Line
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `Count: ${context.raw}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: chartType.charAt(0).toUpperCase() + chartType.slice(1),
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
                text: 'Count',
              },
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default RepeatCustomerAreaChart;
