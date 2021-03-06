import React, { Component } from 'react';
import './Auth.css';
import AuthContext from '../context/auth-context';

class AuthPage extends Component {
  state = {
    isLogin: true
  }

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
  }

  switchModeHandler = () => {
    this.setState(prevState => {
      return {isLogin: !prevState.isLogin};
    });
  }
  
  submitHandler = (event) => {
    event.preventDefault();
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `
        query {
          login(email: "${email}", password: "${password}") {
            userId
            token
            tokenExpiration
          }
        }
      `
    };

    if (!this.state.isLogin) {
      requestBody = {
        query: `
          mutation {
            createUser(userInput: {email: "${email}", password: "${password}"}) {
              _id
              email
            }
          }
        `
      };
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed!')
      }
      return res.json();
    }).then(resData => {
      if(resData.data.login.token) {
        this.context.login(
          resData.data.login.token,
          resData.data.login.userId,
          resData.data.login.tokenExpiration
        )
      }
    }).catch(err => {
      console.log(err)
    })
  };

  render() {
    return (
      <form onSubmit={this.submitHandler} className="auth-form">
        <div className="form-control">
          <label htmlFor="email">E-Mail</label>
          <input ref={this.emailEl} type="email" name="email" id="email"/>
        </div>
        <div className="form-control">
          <label htmlFor="password">Passwordl</label>
          <input ref={this.passwordEl} type="password" name="password" id="password"/>
        </div>
        <div className="form-actions">
          <button className="btn" type="submit">Submit</button>
          <button className="btn" type="button" onClick={this.switchModeHandler}>Switch to {this.state.isLogin ? 'Signup' : 'Login'}</button>
        </div>
      </form>
    );
  }
}

export default AuthPage;