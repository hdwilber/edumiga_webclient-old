import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import { withRouter } from 'react-router-dom'
import Navbar from '../components/navbar'
import * as accountActions from '../redux/account/actions'
import * as ModalActions from '../redux/modal/actions'
import '../sass/index.scss'
import { createServices }  from '../services'

import LoginModal from '../containers/account/modals/login'

const LOGIN_MODAL_NAME = 'login-modal'

class Edumiga extends Component {
  constructor(props) {
    super(props)
    this.handleLogout = this.handleLogout.bind(this)
    this.checkAuthorization = this.checkAuthorization.bind(this)
    this.handleToggleLogin = this.handleToggleLogin.bind(this)
    this.handleLoginClose = this.handleLoginClose.bind(this)
    this.apiServices = createServices()
  }

  componentDidMount() {
    const { store, sessionRestore } = this.props
    sessionRestore()
    //console.log(this.props)
    this.props.calculate({data: 
      { email: 'dev@edumiga.com', password: 'asdf'}
    })
  }

  componentWillReceiveProps(nextProps) {
    const { account } = nextProps
    if (account.session) {
      console.log(account.session)
      this.apiServices.setSession(account.session)
    }
  }

  handleLogout() {
    const { logout } = this.props
    logout()
  }

  checkAuthorization() {
    const { account: { session }, location: { pathname, query } } =  this.props
    if (pathname.indexOf('institution/create') > -1) {
      if (!session) {
        return false 
      } else if (!query.owned) {
        return true 
      }
    } else if (pathname.indexOf('institutions') > -1) {
      if (query.owned) {
        if (!session) {
          return false
        }
      }
    }
    return true
  }

  handleToggleLogin() {
    const { showModal } = this.props
    showModal(LOGIN_MODAL_NAME)
  }

  handleLoginClose() {
    const { hideModal } = this.props
    hideModal(LOGIN_MODAL_NAME)
  }

  render() {
    const { account, modal } = this.props
    return (
      <React.Fragment>
        <Navbar account={account}
          onClickLogin={this.handleToggleLogin}
          onLogout={this.handleLogout}
        />
        { this.checkAuthorization() ? (this.props.children): (<Redirect to="/"/>)}


        { modal && (
          <LoginModal 
            visible={ModalActions.checkIfVisible(modal.visibleModals, LOGIN_MODAL_NAME)}
            name={LOGIN_MODAL_NAME}
            onClose={this.handleLoginClose}
          />
        )}
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  account: state.account,
  modal: state.modal,
}), (dispatch => ({
  sessionRestore: () => dispatch(accountActions.sessionRestore()),
  logout: () => dispatch(accountActions.logout()),
  login: (data) => dispatch(accountActions.login(data)),
  showModal: (name) => dispatch(ModalActions.show(name)),
  hideModal: (name) => dispatch(ModalActions.hide(name)),
  calculate: (data, ops) => dispatch(accountActions.calculate(data, ops))
  }))) (withRouter(Edumiga))
