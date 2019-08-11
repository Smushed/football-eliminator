import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import axios from 'axios';
import { Label, Input, Container, Form, FormGroup, Button, Row, Col } from 'reactstrap';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Alert = withReactContent(Swal);

function AdminPanel(props) {
    return <div>Yo wassup</div>
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(AdminPanel);