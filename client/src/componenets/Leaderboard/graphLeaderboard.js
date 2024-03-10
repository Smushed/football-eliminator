import PropTypes from 'prop-types';
import { memo } from 'react';

const GraphLeaderboard = memo(function GraphLeaderboard({
  groupName,
  week,
  leaderboard,
}) {
  return <div>Something {console.log({ groupName, week, leaderboard })}</div>;
});

GraphLeaderboard.propTypes = {
  groupName: PropTypes.string,
  leaderboard: PropTypes.array,
  week: PropTypes.number,
};

export default GraphLeaderboard;
