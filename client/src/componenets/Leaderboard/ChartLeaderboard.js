import { memo, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartLeaderboard = memo(function ChartLeaderboard({ leaderboard }) {
  const [userNameList, updateUserNameList] = useState([]);
  const [chartData, updateChartData] = useState([]);

  useEffect(() => {
    if (leaderboard && leaderboard.length > 0) {
      updateUserNameList(leaderboard.map((user) => user.username));
      updateChartData(leaderboard.map((user) => user.totalScore));
    }
  }, [leaderboard]);

  const chartOptions = {
    indexAxis: 'y',
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Leaderboard',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const user = leaderboard.find(
              (user) => user.username === context.label
            );
            return [
              `Last Week ${user.lastWeek}`,
              `Total Score ${user.totalScore}`,
            ];
          },
        },
      },
    },
  };

  return (
    <Bar
      data={{
        labels: userNameList,
        datasets: [
          {
            label: 'Leaderboard',
            data: chartData,
            borderColor: '#65a865',
            backgroundColor: '#90EE90',
          },
        ],
      }}
      options={chartOptions}
    />
  );
});

export default ChartLeaderboard;
