import { Link } from 'react-router-dom';

const Leaderboard = ({ groupName, week, leaderboard }) => (
  <table className='leaderboardContainter table table-striped table-hover'>
    <thead>
      <tr className='fs-3 text-center'>
        <th>
          <Link to={`/profile/group/${groupName}`}>{groupName}</Link>
        </th>
        <th>Leaderboard</th>
        <th className='d-none d-md-block'>Week {week}</th>
      </tr>
      <tr>
        <th scope='col'>Name</th>
        <th scope='col'>Last Week</th>
        <th scope='col' className='d-none d-md-block'>
          Curr Week
        </th>
        <th scope='col'>Total</th>
      </tr>
    </thead>
    <tbody>
      {leaderboard &&
        leaderboard.map((user) => (
          <tr key={user.username}>
            <td>{user.username}</td>
            <td>
              {user.lastWeek.toLocaleString('en-US', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </td>
            <td className='d-none d-md-block'>
              {user.currentWeek.toLocaleString('en-US', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </td>
            <td>
              {user.totalScore.toLocaleString('en-US', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </td>
          </tr>
        ))}
    </tbody>
  </table>
);

export default Leaderboard;
