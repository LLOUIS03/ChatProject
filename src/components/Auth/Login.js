import React from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import { Link } from 'react-router-dom'
import firebase from '../../firebase';

class Login extends React.Component {

    state = {
        email: '',
        password: '',
        errors: [],
        loading: false,
    };

    handelChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid(this.state)){
            this.setState({ errors:[], loading: true })
            firebase
            .auth()
            .signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(signedIdUser => {
                console.log(signedIdUser);
            })
            .catch(err => {
                console.error(err);
                this.setState({
                   errors: this.state.errors.concat(err)
                })
            })
        }
    };

    isFormValid = ({email, password}) => email && password;

    displayErrors = errors => {
        return errors.map((error, i) => {
            return <p key={i}>{error.message}</p>
        })
    }

    handleInputError = (errors, inputName) => {
        return errors.some(error => {
            return error.message.toLowerCase().includes(inputName)
        }) ? 'error' : '';
    }

    render() {
        const { 
            email, 
            password, 
            errors, 
            loading 
        } = this.state;

        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ maxWidth: 450}}>
                    <Header as="h1" icon color="violet" textAlign="center">
                        <Icon name="code branch" color="violet" />
                        Login to DevChat
                    </Header>
                    <Form onSubmit={this.handleSubmit} size="large">
                        <Segment stacked>
                            <Form.Input 
                                fluid 
                                name="email" 
                                icon="mail" 
                                iconPosition="left" 
                                placeholder="Email" 
                                onChange={this.handelChange}
                                value={email}
                                className={this.handleInputError(errors, 'email')}
                                type="email" 
                            />
                            <Form.Input 
                                fluid 
                                name="password" 
                                icon="lock" 
                                iconPosition="left" 
                                placeholder="Password" 
                                onChange={this.handelChange}
                                value={password}
                                className={this.handleInputError(errors, 'password')}
                                type="password"
                            />
                            <Button disabled={loading}
                                    className={loading ? 'loading' : ''} 
                                    color="violet" 
                                    fluid size="large">
                                Submmit
                            </Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && 
                        (<Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                        )
                    }    
                    <Message>
                        Don't have an account? <Link to="/register">Register</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Login;