import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Alert = withReactContent(Swal);

class GroupEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            groupList: [],
            selectedGroup: ''
        };
    };

    loading() {
        Alert.fire({
            title: 'Loading',
            text: 'Working your request',
            imageUrl: 'https://media.giphy.com/media/3o7aDczpCChShEG27S/giphy.gif',
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: 'Loading Football',
            showConfirmButton: false,
            showCancelButton: false
        });
    };
    doneLoading() {
        Alert.close()
    };

    componentDidMount() {
        this.pullGroupList();
    };

    pullGroupList = async () => {
        try {
            const dbResponse = await axios.get(`/api/getGroupList/`);
            this.setState({ groupList: dbResponse.data });
        } catch (err) {
            console.log(err);
        };
    };

    selectGroup = async (groupId) => {
        this.setState({ selectedGroup: groupId })
    };

    getScoresForGroup = async () => {
        if (this.state.selectedGroup === '') {
            return;
        };
        const dbResponse = await axios.put(`/api/calculateScore/${this.state.selectedGroup}/${this.props.season}/${this.props.week}`);
        console.log(dbResponse.data);
    };

    render() {
        return (
            <div>
                {this.state.selectedGroup}
                <br />
                <br />
                <button class='btn btn-success' onClick={() => this.getScoresForGroup()}>Pull Scores</button>
                {this.state.groupList.map(group => {
                    return <div>
                        {group.N}  <button class='btn btn-info' onClick={() => this.selectGroup(group.id)}>Select</button>
                    </div>
                })}
            </div>
        );
    };


};

const condition = authUser => !!authUser;

export default withAuthorization(condition)(GroupEditor);