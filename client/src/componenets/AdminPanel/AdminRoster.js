const AdminRosterRow = (key, position, player) => (
  <tr className='align-middle' key={key}>
    {/* <th scope='row' className='rosterPosition'>
      {position && position}
    </th> */}
    {player && player.name && console.log(player)}
    <td>{player && player.name && player.name}</td>
    <td>{player && player.team}</td>
    <td>{player && player.score && player.score.toFixed(2)}</td>
  </tr>
);

const AdminRosterDisplay = ({ headerText, roster }) => (
  <table className='table table-striped'>
    <thead>
      <tr className='fs-3 text-center'>
        <th scope='col' colSpan={12}>
          {headerText}
        </th>
      </tr>
    </thead>
    <tbody>
      {roster.map((position, i) => (
        <AdminRosterRow key={i} position={position.name} player={roster[i]} />
      ))}
    </tbody>
  </table>
);

export { AdminRosterDisplay };
