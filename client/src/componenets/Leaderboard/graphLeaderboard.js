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

const GraphLeaderboard = memo(function GraphLeaderboard({ leaderboard }) {
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
            return leaderboard.find((user) => user.UN === context.label);
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

GraphLeaderboard.propTypes = {
  groupName: PropTypes.string,
  leaderboard: PropTypes.array,
  week: PropTypes.number,
};

export default GraphLeaderboard;
