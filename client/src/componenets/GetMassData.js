import React, { Component } from 'react';
import axios from 'axios';
import { Button, Container, Row, Col } from 'reactstrap';
import { PropagateLoader } from "react-spinners";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

//Using Swal to display messages when add book button is hit
const Alert = withReactContent(Swal);

const loaderStyle = {
    display: 'block',
    margin: '0 auto'
};

class GetWeeklyData extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false, //Used for react-spinners
        };
    };

    getMassData = () => {
        //Send alert to user that they should add the chapters
        Alert.fire({
            type: `warning`,
            title: `Are you sure?`,
            text: `It will take a LONG time`,
            showCancelButton: true,
        }).then(result => {
            if (result.value) {
                Alert.fire(`Success`, `This will be a while. Go play some games?`, `success`);
                axios.get(`/api/massplayerupdate`)
                    .then(response => {
                        console.log(response.data)
                    })
                    .catch(err => {
                        console.log(err)
                    });
            };
        });
    };

    componentDidMount() {

    };

    render() {
        return (
            <Container>
                <Row>
                    <Col xs={{ size: 6, offset: 3 }}>
                        <div>
                            {this.state.loading ? (
                                <PropagateLoader
                                    css={loaderStyle}
                                    sizeUnit={'px'}
                                    height={4}
                                    width={200}
                                    color={"#36D7B7"}
                                    loading={this.state.loading}
                                />
                            ) : (
                                    <Button
                                        color='primary'
                                        size='lg'
                                        onClick={() => this.getMassData()}>
                                        Mass Update ALL Players
                                    </Button>
                                )}
                        </div>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default GetWeeklyData;