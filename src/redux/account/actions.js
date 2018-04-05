import { AccountService } from '../../services'
import { push } from 'react-router-redux'
import IdentityService from '../../services/identity'
import { createActionLabels, handleRequest, handleRequestO, handleRequestEmpty } from '../utils'

import * as ModalActions from '../modal/actions'

export const CREATE = createActionLabels('ACCOUNT_CREATE')
export const LOGIN = createActionLabels('SESSION_LOGIN')
export const LOGOUT = createActionLabels('SESSION_LOGOUT')
export const RESTORE = createActionLabels('SESSION_RESTORE')
export const FIND = createActionLabels('ACCOUNT_FIND')
export const IDENTITY_UPDATE = createActionLabels('IDENTITY_UPDATE')
export const UPLOAD_PHOTO = createActionLabels('IDENTITY_UPLOAD_PHOTO')
export const CONFIRM = createActionLabels('CONFIRM')
export const RECONFIRM = createActionLabels('RECONFIRM')

const aService = new AccountService()
const iService = new IdentityService()

export function create(data, options = {}) {
  return (dispatch, getState) => {
    const request = aService.create(data)
    return handleRequest(dispatch, getState, CREATE, request, 
      null,
      (payload) => {
        if (options && options.modal)
          dispatch(ModalActions.hide(options.modal.name))
      })
  }
}

export function updateIdentity(data) {
  return (dispatch, getState) => {
    const { session } = getState().account
    iService.setSession(session)
    const request = iService.update(data)
    return handleRequest(dispatch, getState, IDENTITY_UPDATE, request)
  }
}

export function login(data, options = {}) {
  return (dispatch, getState) => {
    const request = aService.login(data)
    return handleRequestO(dispatch, LOGIN, request,
      {
        postThen: (payload) => {
          aService.storeSessionLocal(payload)
          dispatch(findById(payload.accountId))
          dispatch(push('/institutions'))
          if (options && options.modal)
            dispatch(ModalActions.hide(options.modal.name))
        }
      }
    )
  }
}

export function confirm(uid, token) {
  return (dispatch, getState) => {
    const request = aService.confirm(uid, token)
    return handleRequestEmpty(dispatch, getState, CONFIRM, request, null,
      (payload) => {
        setTimeout(() => {
          dispatch(push('/'))
        }, 1500)
      },
      (error) => {
        setTimeout(() => {
          dispatch(push('/'))
        }, 1500)
      }
    )
  }
}

export function reConfirm() {
  return (dispatch, getState) => {
    const { account: { session } } = this.props
    aService.setSession(session)
    const request = aService.reConfirm()
    return handleRequestEmpty(dispatch, getState, CONFIRM, request)
  }
}

export function uploadPhoto(file) {
  return (dispatch, getState) => {
    const { account } = getState()
    iService.setSession(account.session)
    const request = iService.uploadPhoto(account.identity.id, file)
    return handleRequest(dispatch, getState, UPLOAD_PHOTO, request)
  }
}

export function findById(id) {
  return (dispatch, getState) => {
    const { account } = getState()
    aService.setSession(account.session)
    const request = aService.get(id)
    return handleRequest(dispatch, getState, FIND, request)
  }
}

export function logout() {
  return (dispatch, getState) => {
    aService.clearSessionLocal()
    dispatch(push('/'))
    return dispatch({
      type: LOGOUT.start,
    })
  }
}

export function sessionRestore() {
  return (dispatch, getState) => {
    const payload = aService.restoreSessionLocal()
    if (payload) {
      dispatch(findById(payload.accountId))
      return dispatch({
        type: RESTORE.success,
        payload: payload, 
      })
    } else {
      return dispatch({
        type: RESTORE.failed,
        payload: new Error('Not found'), 
      })
    }
  }
}

