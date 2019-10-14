import React, {Component} from 'react';
import { Row,Col, Button } from 'reactstrap';
import { withRouter } from 'react-router-dom';


class UsedPlayerButton extends Component{
    redirect = () => {
        const redirectValue = '/usedPlayers/' + this.props.userId;
    
        this.props.history.push(redirectValue);
    };
    render () {
        return (
            <Row className='topRow'>
                <Col xs='0' md='4' />
                <Col xs='12' md='4'>
                    <div className='centerText'>
                        <Button color='info' onClick={this.redirect}>
                            View {this.props.username}'s Used Players
                        </Button>
                    </div>
                </Col>
                <Col xs='0' md='4' />
            </Row>
        );
    };
};

export default withRouter(UsedPlayerButton);