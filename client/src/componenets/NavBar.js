import React from 'react';
import '../App.css';

import * as Routes from '../constants/routes';
import SignOutButton from './SignInOut/SignOutButton';
import { HomeLink } from './Home';

import { Nav, Navbar, NavItem, NavLink } from 'reactstrap';
import { Row, Col } from 'reactstrap';


const background = {
    backgroundColor: '#003366',
    width: 'auto',
    height: '100%',
    overflow: 'hidden',
};

const padding2 = {
    textAlign: 'left',
};

const navLinkStyle = {
    fontSize: '25px',
    color: 'white',
    textDecoration: 'none',
};

const textStyle = {
    fontSize: '25px',
    color: 'white',
    textDecoration: 'none',
};

const NavBar = (props) => {
    return (
        <div>
            <header style={background}>
                <div>
                    <Row>
                        <Col>
                            <Navbar expand="md">
                                {props.authUser ? (<section>
                                    <Nav navbar>
                                        <NavItem >
                                            <HomeLink testStyle={textStyle} />
                                        </NavItem>
                                        <NavItem >
                                        </NavItem>
                                        <NavItem>
                                            <SignOutButton />
                                        </NavItem>
                                    </Nav>
                                </section>
                                ) : (
                                        <section>
                                            <Nav >
                                                <NavItem >
                                                    <HomeLink />
                                                </NavItem>
                                                <div style={padding2}>
                                                    <NavItem>
                                                        <NavLink style={navLinkStyle} href={Routes.signin}>Sign In </NavLink>
                                                    </NavItem>
                                                </div>
                                                <NavItem>
                                                    <NavLink style={navLinkStyle} href={Routes.signup}>Sign Up</NavLink>
                                                </NavItem>
                                            </Nav>
                                        </section>
                                    )
                                }
                            </Navbar>
                        </Col>
                    </Row>
                </div>
            </header>
        </div >

    )
}


export default NavBar;