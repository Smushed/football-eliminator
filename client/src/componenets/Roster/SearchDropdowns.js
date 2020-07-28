import React from 'react';
import { Label, Input, Button } from 'reactstrap';


const WeekSearch = (props) => (
    <div className='selectContainer'>
        <div className='inputLength'>
            <Input value={props.weekSelect} type='select' name='weekSelect' id='weekSelect' className='searchDropdown' onChange={props.handleChange}>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
            </Input>
        </div>
        <Button color='primary' onClick={props.customSeasonWeekSearch} className='submitButton'>
            Search
    </Button>
    </div>
);

const TeamSearch = (props) => (
    <div className='selectContainer'>
        <div className='inputContainer inputLength'>
            <Input value={props.teamSelect} type='select' name='teamSelect' id='teamSelect' className='searchDropdown' onChange={props.handleChange}>
                <option>ARI</option>
                <option>ATL</option>
                <option>BAL</option>
                <option>BUF</option>
                <option>CAR</option>
                <option>CHI</option>
                <option>CIN</option>
                <option>CLE</option>
                <option>DAL</option>
                <option>DEN</option>
                <option>DET</option>
                <option>GB</option>
                <option>HOU</option>
                <option>IND</option>
                <option>JAX</option>
                <option>KC</option>
                <option>LAC</option>
                <option>LA</option>
                <option>MIA</option>
                <option>MIN</option>
                <option>NE</option>
                <option>NO</option>
                <option>NYG</option>
                <option>NYJ</option>
                <option>OAK</option>
                <option>PHI</option>
                <option>PIT</option>
                <option>SEA</option>
                <option>SF</option>
                <option>TB</option>
                <option>TEN</option>
                <option>WAS</option>
            </Input>
        </div>
        <Button color="primary" onClick={props.searchByTeam} className='submitButton'>
            Search
        </Button>
    </div>
);

const PositionSearch = (props) => (
    <div className='selectContainer'>
        <div className='inputLength'>
            <Input value={props.positionSelect} type='select' name='positionSelect' id='positionSelect' className='searchDropdown' onChange={props.handleChange}>
                <option>QB</option>
                <option>RB</option>
                <option>WR</option>
                <option>TE</option>
                <option>K</option>
            </Input>
        </div>
        <Button color='primary' onClick={props.positionSearch} className='submitButton'>
            Search
    </Button>
    </div>
);

const PlayerSearch = (props) => (
    <div className='selectContainer'>
        <div className='inputLength'>
            <Input value={'COMING SOON'} type='text' name='playerSearch' id='playerSearch' className='searchDropdown' />
        </div>
        <Button color='primary' onClick={''} className='submitButton'>
            Search
        </Button>
    </div>
)


export { PositionSearch, TeamSearch, WeekSearch, PlayerSearch };