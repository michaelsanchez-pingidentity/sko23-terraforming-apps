// Packages
import React from 'react';
import PropTypes from 'prop-types';
import { Collapse, Container, Navbar, NavbarToggler, Nav, NavItem, NavLink, Input } from 'reactstrap';
import { Link, NavLink as RRNavLink, withRouter } from 'react-router-dom';

// Components
import Session from '../Utils/Session';
import AuthZ from '../Controller/AuthZ';
import Tokens from '../Utils/Tokens';

// Styles
import './NavbarMain.scss';

// Data
import data from './data.json';
// import { faRegistered } from '@fortawesome/free-regular-svg-icons';

class NavbarMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isLoggedOut: true,
        };

        this.session = new Session();
        this.envVars = window._env_;
        this.authz = new AuthZ();
        this.tokens = new Tokens();
    }
    
    triggerModalLoginPassword() {
        if (this.session.getAuthenticatedUserItem('triggerLogin', 'session')) {
            this.session.removeAuthenticatedUserItem('triggerLogin', 'session');
        }
        this.session.setAuthenticatedUserItem('authMode', 'login', 'session');
        const redirectURI = this.envVars.REACT_APP_HOST + '/';
        this.authz.initAuthNFlow({
            grantType: 'authCode',
            clientId: this.envVars.REACT_APP_CLIENT,
            redirectURI: redirectURI,
            scopes: this.envVars.REACT_APP_USER_SCOPES,
        });
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    logout() {
        const signOffEndpoint = this.envVars.REACT_APP_P1HOST + '/' + this.envVars.REACT_APP_ENVID + '/as/signoff?id_token_hint=' + this.session.getAuthenticatedUserItem('IdT', 'session'); 
        this.session.clearUserAppSession('session');
        window.location.assign(signOffEndpoint);
    }

    componentDidMount() {
        // For validation/troubleshooting only.
        console.info('DOCKER IMAGE', this.envVars.REACT_APP_IMAGE_NAME);
        
        const IdT = this.session.getAuthenticatedUserItem('IdT', 'session');
        const isLoggedOut = IdT === null || IdT === 'undefined' ? true : false;
        this.setState({ isLoggedOut: isLoggedOut });
        this.session.protectPage(
            isLoggedOut,
            window.location.pathname,
            this.session.getAuthenticatedUserItem('bxRetailUserType', 'session'),
            this.props
        );

        if (isLoggedOut && this.session.getAuthenticatedUserItem('triggerLogin', 'session')) {
            this.session.setAuthenticatedUserItem('targetReferrer', true, 'session');
            this.triggerModalLoginPassword();
        }

        if (this.session.getAuthenticatedUserItem('email', 'session')) {
            this.setState({ email: this.session.getAuthenticatedUserItem('email', 'session') });
        }

        if (window.location.search) {
            const redirectURI = this.envVars.REACT_APP_HOST + '/';
            const queryParams = new URLSearchParams(window.location.search);
            const authCode = queryParams.get('code');

            // Need to exit this logic early when redirecting from BXFinance with a completed or failed
            // open banking transaction so the UX continues accordingly at checkout.
            if (this.props.location.pathname.includes('/shop/checkout')) {
                console.info('Returning from BXFinance from purchase authorization.');
                return;
            }

            if (queryParams.get('error') && queryParams.get('error') === 'access_denied') {
                console.info('Returning from BXFinance from purchase authorization error.');
                return;
            }

            const authNParam = authCode ? 'authCode' : 'WTF?';
            const authMode = this.session.getAuthenticatedUserItem('authMode', 'session');
            switch (authNParam) {
                case 'authCode':
                    // Returned state should match what was passed in
                    if (queryParams.get('state') !== this.session.getAuthenticatedUserItem('state', 'session')) {
                        throw new Error('oAuth state parameters do not match.');
                    }

                    this.authz
                        .swapCodeForToken({
                            code: authCode,
                            redirectURI: redirectURI,
                            authMode: this.session.getAuthenticatedUserItem('authMode', 'session'),
                            clientId: this.envVars.REACT_APP_CLIENT,
                        })
                        .then((response) => {
                            // Clean up pkce and state storage
                            this.session.removeAuthenticatedUserItem('state', 'session');
                            this.session.removeAuthenticatedUserItem('code_verifier', 'session');

                            this.session.setAuthenticatedUserItem('AT', response.access_token, 'session');
                            this.session.setAuthenticatedUserItem('IdT', response.id_token, 'session');
                            const firstName = this.tokens.getTokenValue({
                                token: response.id_token,
                                key: 'given_name',
                            });
                            if (firstName) {
                                this.session.setAuthenticatedUserItem('firstName', firstName, 'session');
                            }
                            const email = this.tokens.getTokenValue({ token: response.id_token, key: 'email' });
                            const groups = this.tokens.getTokenValue({
                                token: response.id_token,
                                key: 'bxRetailUserType',
                            });
                            const userType = groups ? groups[0] : 'Customer';
                            this.session.setAuthenticatedUserItem('email', email, 'session');
                            this.session.setAuthenticatedUserItem('bxRetailUserType', userType, 'session');

                            //Set temp reg thank you message.
                            if (authMode === 'registration') {
                                this.session.setAuthenticatedUserItem(
                                    'regMessage',
                                    data.menus.utility.register_done,
                                    'session'
                                );
                            }
                            // It's a customer.
                            if (authMode === 'login' || authMode === 'registration') {
                                this.props.history.push('/dashboard/settings/profile');
                            } // No other authModes for the SKO version of BXR.
                        });
                    break;
                default:
                    console.error('AuthN param exception.', 'Received an unknown value of ' + authMode);
            }
        }
    }
    render() {
        return (
            <section className='navbar-main'>
                {/* DESKTOP NAV */}
                <Navbar color='dark' dark expand='md' className='navbar-desktop'>
                    <Container>
                        <Link to='/' className='navbar-brand'>
                            <img src={window._env_.PUBLIC_URL + '/images/logo-white.svg'} alt={data.brand} />
                        </Link>
                        <NavbarToggler onClick={this.toggle.bind(this)} />
                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav className='justify-content-end ml-auto navbar-nav-utility' navbar>
                                <NavItem className='customer-collection'>
                                    <span>{this.props.location.state?.action}</span>
                                    <form>
                                        <Input
                                            className='prospect'
                                            autoComplete='off'
                                            type='text'
                                            name='prospect'
                                            id='prospect'
                                            placeholder={data.menus.utility.gaCustomer}
                                            value={this.state.prospect}
                                        />
                                    </form>
                                </NavItem>
                                <NavItem>
                                    <NavLink>
                                        <img
                                            src={window._env_.PUBLIC_URL + '/images/icons/map-marker.svg'}
                                            alt={data.menus.utility.locations}
                                        />
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        style={{ cursor: 'pointer' }}>
                                        <img
                                            src={window._env_.PUBLIC_URL + '/images/icons/cart.svg'}
                                            alt={data.menus.utility.cart}
                                        />
                                    </NavLink>
                                </NavItem>
                                {this.state.isLoggedOut && (
                                    <NavItem className=''>
                                        <NavLink
                                            data-selenium='nav_signin'
                                            href='#'
                                            onClick={this.triggerModalLoginPassword.bind(this)}>
                                            <img
                                                src={window._env_.PUBLIC_URL + '/images/icons/user.svg'}
                                                alt={data.menus.utility.login}
                                                className='mr-1'
                                            />{' '}
                                            {data.menus.utility.login}
                                        </NavLink>
                                    </NavItem>
                                )}
                                {!this.state.isLoggedOut && (
                                    <NavItem className=''>
                                        <NavLink href='#' onClick={this.logout.bind(this)}>
                                            <img
                                                src={window._env_.PUBLIC_URL + '/images/icons/user.svg'}
                                                alt={data.menus.utility.logout}
                                                className='mr-1'
                                            />{' '}
                                            {data.menus.utility.logout}
                                        </NavLink>
                                    </NavItem>
                                )}
                            </Nav>
                        </Collapse>
                    </Container>
                </Navbar>
                <Navbar color='dark' dark expand='md' className='navbar-desktop'>
                    <Container>
                        <Nav className='mr-auto navbar-nav-main' navbar>
                            {this.props && this.props.data && this.props.data.menus && this.props.data.menus.primary
                                ? this.props.data.menus.primary.map((item, i) => {
                                      return (
                                          <NavItem key={i}>
                                              <NavLink to={item.url} activeClassName='active' exact tag={RRNavLink}>
                                                  {item.title}
                                              </NavLink>
                                          </NavItem>
                                      );
                                  })
                                : data.menus.primary.map((item, i) => {
                                      return (
                                          <NavItem key={i}>
                                              <NavLink to={item.url} activeClassName='active' tag={RRNavLink}>
                                                  {item.title}
                                              </NavLink>
                                          </NavItem>
                                      );
                                  })}
                        </Nav>
                    </Container>
                </Navbar>
                {/* MOBILE NAV */}
                <Navbar color='dark' dark expand='md' className='navbar-mobile'>
                    <div className='mobilenav-menu'>
                        <NavbarToggler onClick={this.toggle.bind(this)} />
                    </div>
                    <div className='mobilenav-brand'>
                        <Link to='/' className='navbar-brand'>
                            <img src={window._env_.PUBLIC_URL + '/images/logo-white.svg'} alt={data.brand} />
                        </Link>
                    </div>

                    <div className='mobilenav-login'>
                        {this.state.isLoggedOut ? (
                            <NavLink href='#' className='login' onClick={this.triggerModalLoginPassword.bind(this)}>
                                Sign In
                            </NavLink>
                        ) : (
                            <NavLink href='#' className='logout' onClick={this.logout.bind(this)}>
                                {' '}
                                {data.menus.utility.logout}
                            </NavLink>
                        )}
                    </div>
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className='navbar-nav-main navbar-light bg-light' navbar>
                            {this.props && this.props.data && this.props.data.menus && this.props.data.menus.primary
                                ? this.props.data.menus.primary.map((item, i) => {
                                      return (
                                          <NavItem key={i}>
                                              <NavLink to={item.url} activeClassName='active' exact tag={RRNavLink}>
                                                  {item.title}
                                              </NavLink>
                                          </NavItem>
                                      );
                                  })
                                : data.menus.primary.map((item, i) => {
                                      return (
                                          <NavItem key={i}>
                                              <NavLink to={item.url} activeClassName='active' exact tag={RRNavLink}>
                                                  {item.title}
                                              </NavLink>
                                          </NavItem>
                                      );
                                  })}
                        </Nav>
                        <Nav className='navbar-nav-utility' navbar>
                            <NavItem className='customer-collection'>
                                <span>{this.props.location.state?.action}</span>
                                <form>
                                    <Input
                                        className='prospect'
                                        autoComplete='off'
                                        type='text'
                                        name='prospect'
                                        id='prospect'
                                        placeholder={data.menus.utility.gaCustomer}
                                        value={this.state.prospect}
                                    />
                                </form>
                            </NavItem>
                            <br />
                            <NavItem>
                                <NavLink>
                                    <img
                                        src={window._env_.PUBLIC_URL + '/images/icons/map-marker.svg'}
                                        alt={data.menus.utility.locations}
                                        className='mr-1'
                                    />{' '}
                                    {data.menus.utility.locations}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink>
                                    <img
                                        src={window._env_.PUBLIC_URL + '/images/icons/cart.svg'}
                                        alt={data.menus.utility.cart}
                                        className='mr-1'
                                    />{' '}
                                    {data.menus.utility.support}
                                </NavLink>
                            </NavItem>
                            {this.state.isLoggedOut && (
                                <NavItem className='login'>
                                    <NavLink href='#' onClick={this.triggerModalLoginPassword.bind(this)}>
                                        <img
                                            src={window._env_.PUBLIC_URL + '/images/icons/user.svg'}
                                            alt={data.menus.utility.login}
                                            className='mr-1'
                                        />{' '}
                                        {data.menus.utility.login}
                                    </NavLink>
                                </NavItem>
                            )}
                            {!this.state.isLoggedOut && (
                                <NavItem className='logout d-none'>
                                    <NavLink href='#' onClick={this.logout.bind(this)}>
                                        <img
                                            src={window._env_.PUBLIC_URL + '/images/icons/user.svg'}
                                            alt={data.menus.utility.logout}
                                            className='mr-1'
                                        />{' '}
                                        {data.menus.utility.logout}
                                    </NavLink>
                                </NavItem>
                            )}
                        </Nav>
                    </Collapse>
                </Navbar>
            </section>
        );
    }
}

NavbarMain.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
    history: PropTypes.shape({
        push: PropTypes.func.isRequired,
    }).isRequired,
};

export default withRouter(NavbarMain);
