import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import * as Routes from "../../constants/routes";
import ElimLogo from "../../constants/elimLogos/ElimLogoText.png";
import SmallElimLogo from "../../constants/elimLogos/SmallElimLogoText.png";

const NavBar = ({ showHideSideBar }) => (
  <nav className="navbar navbar-light border-bottom border-2">
    <div className="container-fluid">
      <div className="row w-100">
        <div className="d-flex">
          <div
            className="ms-3 mt-3"
            role="button"
            onClick={() => showHideSideBar()}
          >
            <svg viewBox="0 0 100 80" width="40" height="40">
              <rect width="100" height="20" rx="6"></rect>
              <rect y="30" width="100" height="20" rx="6"></rect>
              <rect y="60" width="100" height="20" rx="6"></rect>
            </svg>
          </div>
          <div className="d-none d-md-block flex-grow-1 text-center">
            <Link to={Routes.home}>
              <img src={ElimLogo} />
            </Link>
          </div>
          <div className="d-block d-md-none flex-grow-1 text-center">
            <Link to={Routes.home}>
              <img src={SmallElimLogo} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

NavBar.propTypes = {
  showHideSideBar: PropTypes.func,
};

export default NavBar;
