import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
      updateUserNameList(leaderboard.map((user) => user.UN));
      updateChartData(leaderboard.map((user) => user.TS));
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
            const user = leaderboard.find((user) => user.UN === context.label);
            return [`Last Week ${user.LW}`, `Total Score ${user.TS}`];
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

ChartLeaderboard.propTypes = {
  leaderboard: PropTypes.array,
};

export default ChartLeaderboard;
