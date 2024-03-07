import PropTypes from 'prop-types';

const GraphLeaderboard = ({ groupName, week, leaderboard }) => (
  <div>Something {console.log({ groupName, week, leaderboard })}</div>
);

GraphLeaderboard.propTypes = {
  groupName: PropTypes.string,
  leaderboard: PropTypes.array,
  week: PropTypes.number,
};

export default GraphLeaderboard;
