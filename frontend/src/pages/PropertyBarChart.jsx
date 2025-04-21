// // import {
// //   Chart as ChartJS,
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// //   Title,
// //   Tooltip,
// //   Legend,
// // } from 'chart.js';
// // import { Bar } from 'react-chartjs-2';
// // import { faker } from '@faker-js/faker';

// // ChartJS.register(
// //     CategoryScale,
// //     LinearScale,
// //     BarElement,
// //     Title,
// //     Tooltip,
// //     Legend
// //   )
// //     export const options = {
// //         responsive: true,
// //         plugins: {
// //           legend: {
// //             position: 'top' 
// //           },
// //           title: {
// //             display: true,
// //             text: 'Chart.js Bar Chart',
// //           },
// //         },
// //       };

// //       const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
      
// //       export const data = {
// //         labels,
// //         datasets: [
// //           {
// //             label: 'Dataset 1',
// //             data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
// //             backgroundColor: 'rgba(255, 99, 132, 0.5)',
// //           },
// //           {
// //             label: 'Dataset 2',
// //             data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
// //             backgroundColor: 'rgba(53, 162, 235, 0.5)',
// //           },
// //         ],
// //       };
      
// //       export function PropertyBarChart() {
// //         return <Bar options={options} data={data} />;
// //       }
      


// //       import { PropertyBarChart } from './PropertyBarChart';
// // import { faker } from '@faker-js/faker';

// // const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

// // const data = {
// //   labels,
// //   datasets: [
// //     {
// //       label: 'Dataset 1',
// //       data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
// //       backgroundColor: 'rgba(255, 99, 132, 0.5)',
// //     },
// //     {
// //       label: 'Dataset 2',
// //       data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
// //       backgroundColor: 'rgba(53, 162, 235, 0.5)',
// //     },
// //   ],
// // };

// // const options = {
// //   responsive: true,
// //   plugins: {
// //     legend: {
// //       position: 'top',
// //     },
// //     title: {
// //       display: true,
// //       text: 'Custom Chart Title',
// //     },
// //   },
// // };

// // function ParentComponent() {
// //   return <PropertyBarChart chartData={data} chartOptions={options} />;
// // }




// // import {
// //     Chart as ChartJS,
// //     CategoryScale,
// //     LinearScale,
// //     BarElement,
// //     Title,
// //     Tooltip,
// //     Legend,
// //   } from 'chart.js';
// //   import { Bar } from 'react-chartjs-2';
  
// //   ChartJS.register(
// //     CategoryScale,
// //     LinearScale,
// //     BarElement,
// //     Title,
// //     Tooltip,
// //     Legend
// //   );
  
// //   // Accept props from parent
// //   export function PropertyBarChart({ chartData, chartOptions }) {
// //     return <Bar options={chartOptions} data={chartData} />;
// //   }
  

// // import {
// //     Chart as ChartJS,
// //     CategoryScale,
// //     LinearScale,
// //     BarElement,
// //     Title,
// //     Tooltip,
// //     Legend,
// //   } from 'chart.js';
// //   import { Bar } from 'react-chartjs-2';
  
// //   ChartJS.register(
// //     CategoryScale,
// //     LinearScale,
// //     BarElement,
// //     Title,
// //     Tooltip,
// //     Legend
// //   );
  
// //   export function PropertyBarChart({ labels, dataset }) {
    
  
  
// //   }
  


// import {
//     Chart as ChartJS,
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     Title,
//     Tooltip,
//     Legend,
//   } from 'chart.js';
//   import { Bar } from 'react-chartjs-2';
  
//   ChartJS.register(
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     Title,
//     Tooltip,
//     Legend
//   );
  
//   export function PropertyBarChart({ labels, dataset }) {
//     if (!labels || !dataset) {
//       return <p>No chart data available</p>; // Optional fallback
//     }
  
//     const data = { 
//       labels: labels,
//       datasets: dataset, // expects an array of datasets
//     };
  
//     const options = {
//       responsive: true,
//       plugins: {
//         legend: {
//           position: 'top',
//         },
//         title: {
//           display: true,
//           text: 'Custom Chart Title',
//         },
//       },
//     };
  
//     return <Bar options={options} data={data} />
//   }
  

// PropertyBarChart.jsx

import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register required components with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const PropertyBarChart = ({ labels, dataset }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Property Data",
        data: dataset,
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Anomalies Bar Chart",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Value: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Properties",
        },
      },
      y: {
        title: {
          display: true,
          text: "Anomalies Counts",
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};
