import React from 'react';
import { Button } from 'reactstrap';

const ButtonStyle = {
    fontSize: '17px',
};

const adminPanel = {
    textAlign: 'center',
    fontSize: '25px',
    border: '1px solid grey',
    padding: '10px',
    marginBottom: '25px',
    marginTop: '25px',
    borderRadius: '5px'
};

const GroupNav = (props) => {
    return (
        <div style={adminPanel} align='center' >
            Admin Panel
                <hr></hr>
            <Button outline color='primary' style={ButtonStyle} onClick={() => props.updatePage('main')}>Show Club Page</Button>
            <Button outline color='primary' style={ButtonStyle} onClick={() => props.updatePage('updateBook')}>Update Book</Button>
            <Button outline color='primary' style={ButtonStyle} onClick={() => props.updatePage('addUser')}>Add User</Button>
        </div>
    )
}

export default GroupNav;