import Service from './service'

class Institution extends Service {
  constructor() {
    super('institutions')
  }

  create(data) {
    return this.createRequest('POST', '', data, false )
  }

  get(id, filter = {}) {
    const defaultFilter = {
      include: ['account', 'logo', 'media', 'opportunities'],
      ...filter,
    }
    return this.createRequest('GET',`${id}/?filter=${JSON.stringify(defaultFilter)}`)
  }
  update(data) {
    return this.createRequest('PATCH',`${data.id}`, data)
  }

  uploadLogo(id, file)  {
    return this.createUploadRequest(`${id}/uploadLogo`, file)
  }

  getAll(filter = {}) {
    const defaultFilter = {
      include: ['account', 'logo', 'media', 'opportunities'],
      ...filter,
    }
    return this.createRequest('GET', `?filter=${JSON.stringify(defaultFilter)}`, null, false)
  }

  addOpportunity(id, data) {
    return this.createRequest('POST', `${id}/opportunities`, data)
  }

  remOpportunity(id, oid) {
    return this.createRequest('DELETE', `${id}/opportunities/${oid}`)
  }
}

export default Institution
