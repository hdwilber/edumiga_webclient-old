import { AccountService } from '../../services'
import { push } from 'react-router-redux'
import IdentityService from '../../services/identity'
import { createActionTypesObject, dispatchRequestActions, createActionLabels, handleRequest,
  withService,
} from '../utils'
import * as ModalActions from '../modal/actions'
import BaseActions from '../base-actions'
import Identity from './types/identity'

export const Names = {
  FIND: createActionLabels('Identity/find'),
  CREATE: createActionLabels('Identity/create'),
  UPDATE: createActionLabels('Identity/Update'),
  UPLOAD_PHOTO: createActionLabels('Identity/UploadPhoto'),
}

export const CREATE = createActionTypesObject('ACCOUNT_CREATE')
export const LOGIN = createActionTypesObject('SESSION_LOGIN')
export const FIND = createActionTypesObject('ACCOUNT_FIND')

export const LOGOUT = createActionLabels('SESSION_LOGOUT')

export const RESTORE = createActionLabels('SESSION_RESTORE')
export const IDENTITY_UPDATE = createActionLabels('IDENTITY_UPDATE')
export const UPLOAD_PHOTO = createActionLabels('IDENTITY_UPLOAD_PHOTO')
export const CONFIRM = createActionLabels('CONFIRM')
export const RECONFIRM = createActionLabels('RECONFIRM')
export const CALCULATE = createActionLabels('CALCULATE')

const aService = new AccountService()
const iService = new IdentityService()

class IdentityActions extends BaseActions {
  constructor(services) {
    super(Identity, services)
    this.attachMethods()
  }
}
export default IdentityActions

function _calculate(service, data, options) {
  return {
    name: CALCULATE,
    request: service.login(data),
    postThen: (dispatch, result, options) => {
      if (options && options.modal)
        dispatch(ModalActions.hide(options.modal.name))
    },
    options,
  }
}
export const calculate = withService(_calculate, aService)

function _create(service, data, options) {
  return {
    name: CREATE,
    request: service.create(data),
    postThen: (dispatch, result, options) => {
      if (options && options.modal)
        dispatch(ModalActions.hide(options.modal.name))
    },
    options,
  }
}
export const create = withService(_create, aService)

//export function create(data, options = {}) {
  //return (dispatch, getState) => {
    //const request = aService.create(data)
    //return dispatchRequestActions(dispatch, CREATE, request, 
      //{
        //postThen: (result) => {
          //if (options && options.modal)
            //dispatch(ModalActions.hide(options.modal.name))
        //}
      //}, 
      //options
    //)
  //}
//}

function _updateIdentity(service, data) {
  return {
    name: IDENTITY_UPDATE,
    request: iService.update(data),
  }
}
export const updateIdentity = withService(_updateIdentity, aService)

//export function updateIdentity(data) {
  //return (dispatch, getState) => {
    //const { session } = getState().account
    //iService.setSession(session)
    //const request = iService.update(data)
    //return handleRequest(dispatch, getState, IDENTITY_UPDATE, request)
  //}
//}

export function login(data, options = {}) {
  return (dispatch, getState) => {
    const request = aService.login(data)
    return dispatchRequestActions(dispatch, LOGIN, request,
      {
        postThen: (result) => {
          aService.storeSessionLocal(result)
          dispatch(findById(result.accountId))
          dispatch(push('/institutions'))
          if (options && options.modal)
            dispatch(ModalActions.hide(options.modal.name))
        }
      }, 
      options
    )
  }
}

export function confirm(uid, token) {
  return (dispatch, getState) => {
    const request = aService.confirm(uid, token)
    return dispatchRequestActions(dispatch, CONFIRM, request,
      {
        postThen: (payload) => {
          setTimeout(() => {
            dispatch(push('/'))
          }, 1500)
        },
        postCatch: (error) => {
          setTimeout(() => {
            dispatch(push('/'))
          }, 1500)
        }
      }
    )
  }
}

export function reConfirm() {
  return (dispatch, getState) => {
    const { account: { session } } = this.props
    aService.setSession(session)
    const request = aService.reConfirm()
    return dispatchRequestActions(dispatch, CONFIRM, request)
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
    return dispatchRequestActions(dispatch, FIND, request)
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

