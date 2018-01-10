import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Button, Segment, Header } from 'semantic-ui-react'
import { Form as InstitutionForm} from '../../components/institution'
import { default as InstitutionMap } from '../../components/location/map'
import { default as InstitutionProfile } from '../../components/media/image-uploader'

import { buildImageUrl } from '../../redux/utils'


import * as institutionActions from '../../redux/institution/actions'


class Create extends React.Component {
  constructor(props) {
    super(props)

    this.handleSave = this.handleSave.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleClickUploadLogo = this.handleClickUploadLogo.bind(this)
    this.getSerializedData = this.getSerializedData.bind(this)

    this.handleCenterChange = this.handleCenterChange.bind(this)
    this.handleLocationFound = this.handleLocationFound.bind(this)

    this.state = {
      name: '',
      description: '',
      draft: '',
      type: '',
      address: '',
      lat: -21,
      lng: -66,
      levels: [],
      profileLogo: {
        file: null,
        url: '',
        fakeUrl: '',
      },
      location: {
        lat: null,
        lng: null,
      }
    }
  }

  componentDidMount() {
    const { match, institutionFind } = this.props
    const { institutionId } = match.params

    if (institutionId) {
      institutionFind(institutionId)
    } else {
      const { institutionCreate } = this.props
      institutionCreate({})
    }
  }

  componentWillReceiveProps(nextProps) {
    const { institution } = nextProps
    console.log(institution)
    if (institution && institution.current) {
      const i = institution.current
      this.setState({
        name: i.name,
        description: i.description,
        draft: i.draft,
        address: i.address || '',
        type: i.type,
        levels: i.levels || [],
        profileLogo: {
          file: null,
          url: buildImageUrl(i.logo.url),
          fakeUrl: '',
        },
        location: i.location,
      })
    }
  }

  getSerializedData() {
    const { institution } = this.props
    return {
      id: institution.current.id,
      name: this.state.name,
      description: this.state.description,
      draft: this.state.draft,
      address: this.state.address,
      type: this.state.type,
      levels: this.state.levels,
      location: this.state.location,
    }
  }

  handleSave() {
    const { institutionUpdate } = this.props
    institutionUpdate({
      ...this.getSerializedData()
    })
  }

  handleInputChange(e, props) {
    this.setState({
      [props.name]: props.value,
    })
  }

  handleCheckboxChange(e, props) {
    console.log(e)
    console.log(props)
    if (props.name === 'levels'){
      if (props.checked) {
        this.setState({
          levels: this.state.levels.concat([props.value])
        })
      } else {
        this.setState({
          levels: this.state.levels.filter(v => v !== props.value)
        })
      }
    } else {
      this.setState({
        [props.name]: props.checked,
      })
    }
  }

  handleFileChange (e, props) {
    const files = e.target.files
    this.setState({
      [props.name]: {
        ...this.state[props.name],
        file: files[0],
        fakeUrl: URL.createObjectURL(files[0]),
      }
    })
  }

  handleCenterChange(e) {
    this.setState({
      location: e.target.getCenter(),
    })
  }

  handleLocationFound(e) {
    console.log('My location')
    console.log(e)
    if (!this.state.location.lat) {
      this.setState({
        location: e.latlng,
      })
    }
  }

  handleClickUploadLogo() {
    const { institution, institutionUploadLogo } = this.props
    console.log(this.state.profileLogo)
    if (institution && institution.current)
      institutionUploadLogo(institution.current.id, this.state.profileLogo.file)
  }

  render() {
    const { institution } = this.props
    const { profileLogo, name, description, levels, type, address, draft, location } = this.state
    if (institution) {
      return (
        <div>
          <Header size="huge">Institution</Header>
          {(institution.current) &&(
            <div>
              <Segment>
                <Header size="normal">Logo Profile</Header>
                <InstitutionProfile 
                  onFileChange={this.handleFileChange}
                  url={profileLogo.fakeUrl === '' ? profileLogo.url : profileLogo.fakeUrl }
                />
                <Button disabled={!profileLogo.fakeUrl} onClick={this.handleClickUploadLogo}>Upload</Button>
              </Segment>

              <Segment>
                <Header size="normal">Overview</Header>
                <InstitutionForm onInputChange={this.handleInputChange}
                  onCheckboxChange={this.handleCheckboxChange}
                  name={name} description={description}
                  levels={levels}
                  draft={draft}
                  type={type}
                />
              </Segment>
              <Segment>
                <Header size="normal">Location</Header>
                <InstitutionMap onInputChange={this.handleInputChange} 
                  onCenterChange={this.handleCenterChange}
                  onLocationFound={this.handleLocationFound}
                  position={location}
                  address={address}/>
              </Segment>
              <Button loading={institution.loading} disabled={institution.loading} 
                default
                onClick={this.handleSave}
              >Save</Button>
            </div>
          )}
        </div>
      )
    } else {
      return <Header size="huge">Loading...</Header>
    }
  }
}

export default connect((state) => ({
  account: state.account,
  institution: state.institution,
}), (dispatch) => ({
  institutionCreate: (data) => dispatch(institutionActions.create(data)),
  institutionUploadLogo: (id, file) => dispatch(institutionActions.uploadLogo(id, file)),
  institutionFind: (id) => dispatch(institutionActions.findById(id)),
  institutionUpdate: (data) => dispatch(institutionActions.update(data)),
})) (withRouter(Create))
