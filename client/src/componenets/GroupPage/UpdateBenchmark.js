import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Button, Form, FormGroup, Label, Input, } from 'reactstrap';

const labelStyle = {
    marginBottom: '0px'
};

const initialState = {
    nextBenchmark: '',
    totalBenchmark: '',
    error: null
};

const formStyle = {
    fontSize: '25px',
    textAlign: 'center'
};

const formInputSize = {
    fontSize: '20px',
    width: '75%',
    margin: '0 auto'
};


class UpdateBenchmark extends Component {
    constructor(props) {
        super(props)
        this.state = { ...initialState };
    };

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleCurrentSubmit = async event => {
        event.preventDefault();

        const nextBenchmark = +this.state.nextBenchmark;
        const { groupID, isAdmin } = this.props;

        try {
            const dbResponse = await axios.put(`/api/updatebenchmark`, { nextBenchmark, groupID, isAdmin });

            if (dbResponse.status === 200) {
                this.props.updatePage('main');
            }
        } catch (error) {
            this.setState({ error: { message: `Moderator needed to update benchmark` } })
        };
    };

    handleTotalSubmit = async event => {
        event.preventDefault();

        const totalCount = +this.state.totalBenchmark;
        const { groupID, isAdmin } = this.props;

        try {
            const dbResponse = await axios.put(`/api/updatepagesetup`, { totalCount, groupID, isAdmin });

            if (dbResponse.status === 200) {
                this.props.updatePage('main');
            }
        } catch (error) {
            this.setState({ error: { message: `Moderator needed to update benchmark` } });
        };
    };

    render() {
        const { nextBenchmark, totalBenchmark, error } = this.state;

        const currentIsInvalid = nextBenchmark === '' || nextBenchmark < 0;
        const totalIsInvalid = totalBenchmark === '' || totalBenchmark < 0;

        return (
            <div>

                <div>
                    <br />
                    {/* If there's an error with sign in then display the error */}
                    {error && <p>{error.message}</p>}
                    <Form style={formStyle} onSubmit={this.handleCurrentSubmit}>
                        <FormGroup>
                            <Label style={labelStyle}
                                htmlFor='nextBenchmark'
                                for='text'>
                                Next Chapter Goal for Group:
                            </Label>
                            <Input style={formInputSize}
                                type='number'
                                name='nextBenchmark'
                                id="exampleEmail"
                                placeholder='What is the next goal for the group?'
                                value={this.state.nextBenchmark}
                                onChange={this.handleChange} />
                        </FormGroup>
                        <Button color='primary'
                            size='lg'
                            disabled={currentIsInvalid}
                            type='submit'>
                            Next Chapter
                        </Button>
                    </Form>
                </div>


                <div>
                    <br />
                    {/* If there's an error with sign in then display the error */}
                    {error && <p>{error.message}</p>}

                    <Form style={formStyle} onSubmit={this.handleTotalSubmit}>
                        <FormGroup>
                            <Label style={labelStyle}
                                htmlFor='totalBenchmark'
                                for="text">
                                Update Total Benchmarks / Chapters:
                             </Label>
                            <Input style={formInputSize}
                                type='number'
                                name='totalBenchmark'
                                id='exampleEmail'
                                placeholder='What is the total benchmarks or chapters of this book?'
                                value={this.state.totalBenchmark}
                                onChange={this.handleChange} />
                        </FormGroup>
                        <Button color='primary'
                            size='lg'
                            disabled={totalIsInvalid}
                            type='submit'>
                            Update Total Chapters
                            </Button>
                    </Form>
                    <br />
                </div>
            </div>

        );
    };
};


const condition = authUser => !!authUser;

export default withAuthorization(condition)(UpdateBenchmark);