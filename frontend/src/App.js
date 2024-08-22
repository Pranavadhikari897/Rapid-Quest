
import React from 'react';
import SalesOverTimeChart from './components/SalesOverTimeChart';
import SalesGrowthRateChart from './components/SalesGrowthRateChart';
import NewCustomersOverTimeChart from './components/NewCustomerOverTime';
import GeographicalDistribution from './components/GeographicalDistribution'
import TotalLifetime from './components/TotalLifetime';
import RepeatCustomerBarChart from './components/RepeatCustomersOverTimeChart';
const App = () => {
  return (
    <div>
      <h1>E-commerce Data Visualization</h1>
      <SalesOverTimeChart />
      <SalesGrowthRateChart/>
      <NewCustomersOverTimeChart/>
      <RepeatCustomerBarChart/>
      <GeographicalDistribution/>
      <TotalLifetime/>
    </div>
  );
};

export default App;
