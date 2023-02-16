import React from 'react';
import { Container, FormGroup, Label, Input, Row, Col } from 'reactstrap';

// Components
import NavbarMain from '../../../components/NavbarMain';
import WelcomeBar from '../../../components/WelcomeBar';
import FooterMain from '../../../components/FooterMain';
import AccountsSubnav from '../../../components/AccountsSubnav';
import AccountsDropdown from '../../../components/AccountsDropdown';
import Users from '../../../components/Controller/Users';
import Session from '../../../components/Utils/Session';
import Tokens from '../../../components/Utils/Tokens.js';

// Data
import data from '../../../data/dashboard/settings/profile.json';

// Styles
import '../../../styles/pages/dashboard/settings/profile.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

class CommunicationPreferences extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            subject: '',
            preferredUsername: '',
            username: '',
            email: '',
            env: '',
            region: '',
            org: '',
            updatedAt: '',
            canAuthN: '',
            IdP: '',
            lastSSO: '',
            remoteIP: '',
            mfaOn: '',
            popId: '',
            verifyStatus: '',
            isOpen: false,
        };

        this.close = this.close.bind(this);
        this.users = new Users();
        this.session = new Session();
        this.tokens = new Tokens();
        this.toggle = this.toggle.bind(this);
        this.profileForm = React.createRef();
    }

    close() {
        this.setState({ step: 1 });
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    componentDidMount() {
        this.setState({
            userFirstName: this.session.getAuthenticatedUserItem('firstName', 'session'),
            userEmail: this.session.getAuthenticatedUserItem('email', 'session'),
            federatedUser: this.session.getAuthenticatedUserItem('federatedUser', 'session'),
        });

        const at = this.session.getAuthenticatedUserItem('AT', 'session');

        // If this is false it means there is no user logged in and protectPage will redirect them back home
        if (at) {
            this.users.getUserInfoClaims(at).then((claims) => {
                this.setState({
                    subject: claims.sub,
                    preferredUsername: claims.preferred_username,
                    email: claims.email,
                    env: claims.env,
                    region: claims['p1.region'],
                    org: claims.org,
                    updatedAt: claims.updated_at,
                    profilePending: false,
                });
                this.users.readOneUser(claims.sub, at).then((userData) => {
                    console.log('USER RESPONSE', userData);
                    this.setState({
                        canAuthN: userData.account.canAuthenticate,
                        IdP: userData.identityProvider.type,
                        lastSSO: userData.lastSignOn.at,
                        remoteIP: userData.lastSignOn.remoteIp,
                        mfaOn: userData.mfaEnabled,
                        popId: userData.population.id,
                        verifyStatus: userData.verifyStatus,
                    });
                });
            });
        }
    }

    render() {
        return (
            <>
                <div className='accounts profile'>
                    <NavbarMain />
                    <WelcomeBar
                        title='My Account: '
                        firstName={this.state.userFirstName}
                        email={this.state.userEmail}
                    />
                    <Container>
                        <div className='inner'>
                            <div className='sidebar'>
                                {Object.keys(data.subnav).map((key) => {
                                    return <AccountsSubnav key={data.subnav[key].title} subnav={data.subnav[key]} />;
                                })}
                            </div>
                            <div className='content'>
                                <div className='accounts-hdr'>
                                    <h1>{data.title}</h1>
                                    <AccountsDropdown text={data.dropdown} />
                                </div>
                                <div className='module'>
                                    <h3>OAuth User Info Endpoint Claims</h3>
                                    {this.state.profilePending && (
                                        <div className='spinner' style={{ textAlign: 'center' }}>
                                            <FontAwesomeIcon icon={faCircleNotch} size='3x' className='fa-spin' />
                                        </div>
                                    )}
                                    <form
                                        className='profile-updates-form'
                                        ref={this.profileForm}
                                        onSubmit={(e) => e.preventDefault()}>
                                        <Row form>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='firstname'>{data.form.fields.subject.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='text'
                                                        autoComplete='new-firstname'
                                                        name='firstname'
                                                        id='firstname'
                                                        value={this.state.subject}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='lastname'>
                                                        {data.form.fields.preferredUsername.label}
                                                    </Label>
                                                    <Input
                                                        readOnly
                                                        type='text'
                                                        autoComplete='new-lastname'
                                                        name='lastname'
                                                        id='lastname'
                                                        value={this.state.preferredUsername}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='phone'>{data.form.fields.email.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='tel'
                                                        autoComplete='new-phone'
                                                        name='phone'
                                                        id='phone'
                                                        value={this.state.email}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='birthdate'>{data.form.fields.env.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='text'
                                                        autoComplete='new-birthdate'
                                                        name='birthdate'
                                                        id='birthdate'
                                                        value={this.state.env}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='street'>{data.form.fields.region.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='text'
                                                        autoComplete='new-street'
                                                        name='street'
                                                        id='street'
                                                        value={this.state.region}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='city'>{data.form.fields.org.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='text'
                                                        autoComplete='new-city'
                                                        name='city'
                                                        id='city'
                                                        value={this.state.org}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='zipCode'>{data.form.fields.updatedAt.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='text'
                                                        autoComplete='new-zipcode'
                                                        name='zipcode'
                                                        id='zipcode'
                                                        value={this.state.updatedAt}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </form>
                                    <h3>P1 Read User API Response</h3>
                                    <form
                                        className='profile-updates-form'
                                        ref={this.profileForm}
                                        onSubmit={(e) => e.preventDefault()}>
                                        <Row form>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='firstname'>{data.form.fields.canAuthN.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='text'
                                                        autoComplete='new-firstname'
                                                        name='firstname'
                                                        id='firstname'
                                                        value={this.state.canAuthN}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='lastname'>{data.form.fields.IdP.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='text'
                                                        autoComplete='new-lastname'
                                                        name='lastname'
                                                        id='lastname'
                                                        value={this.state.IdP}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='phone'>{data.form.fields.lastSSO.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='tel'
                                                        autoComplete='new-phone'
                                                        name='phone'
                                                        id='phone'
                                                        value={this.state.lastSSO}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='birthdate'>{data.form.fields.remoteIP.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='text'
                                                        autoComplete='new-birthdate'
                                                        name='birthdate'
                                                        id='birthdate'
                                                        value={this.state.remoteIP}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='street'>{data.form.fields.mfaOn.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='text'
                                                        autoComplete='new-street'
                                                        name='street'
                                                        id='street'
                                                        value={this.state.mfaOn}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='city'>{data.form.fields.popId.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='text'
                                                        autoComplete='new-city'
                                                        name='city'
                                                        id='city'
                                                        value={this.state.popId}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup>
                                                    <Label for='zipCode'>{data.form.fields.verifyStatus.label}</Label>
                                                    <Input
                                                        readOnly
                                                        type='text'
                                                        autoComplete='new-zipcode'
                                                        name='zipcode'
                                                        id='zipcode'
                                                        value={this.state.verifyStatus}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </Container>
                    <FooterMain />
                </div>
            </>
        );
    }
}
export default CommunicationPreferences;
