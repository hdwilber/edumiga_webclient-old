import Service from './service'

class Opportunity extends Service {
  constructor() {
    super('opportunities')
  }

  create(data) {
    return this.createRequest('POST', '', data, false )
  }

  get(id, filter={}) {
    const defaultFilter = {
      include: ['account', 'logo', 'media', 'subjects'],
      ...filter,
    }
    return this.createRequest('GET',`${id}/?filter=${JSON.stringify(defaultFilter)}`)
  }

  update(data) {
    return this.createRequest('PATCH',`${data.id}`, data)
  }

  uploadLogo(id, file)  {
    console.log('Service Opportunity')
    console.log(file)
    return this.createUploadRequest(`${id}/uploadLogo`, file)
  }

  getAll(filter = {}) {
    const defaultFilter = {
      include: ['account', 'institution', 'media' ],
      ...filter,
    }
    return this.createRequest('GET', `?${JSON.stringify(defaultFilter)}`, null, false)
  }
}

export default Opportunity 