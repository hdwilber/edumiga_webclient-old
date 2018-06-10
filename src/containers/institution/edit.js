import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Grid, Button, Segment, Header } from 'semantic-ui-react'
import { FormOverview } from '../../components/institution'

import LocationMap from '../../components/location/map'

import OpportunityForm from '../../components/opportunity/create'
import OpportunitiesList from '../../components/opportunity/list'
import SimpleMediaUploader from '../../components/media/image-uploader'

import InstForm from '../../components/institution/create'
import InstList from '../../components/institution/list'

import * as institutionActions from '../../redux/institution/actions'
import * as opportunityActions from '../../redux/opportunity/actions'
import * as categoryActions from '../../redux/category/actions'
import { uploadLogo } from '../../redux/opportunity/actions'

import { Actions as OppListActions } from '../../components/opportunity/list'
import { Actions as DepListActions } from '../../components/institution/list'
import { Institution as InstTemplate, format, formatOutput, } from '../../types'

import withAuthorization, { UserState } from '../../containers/authorization'

class Create extends React.Component {
  constructor(props) {
    super(props)

    this.handleSave = this.handleSave.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
    this.handleClickUploadLogo = this.handleClickUploadLogo.bind(this)

    this.handleAddOpportunity = this.handleAddOpportunity.bind(this)
    this.handleOpportunitySave = this.handleOpportunitySave.bind(this)
    this.handleOpportunityCancel = this.handleOpportunityCancel.bind(this)

    this.handleAddDependency = this.handleAddDependency.bind(this)
    this.handleDepSelectRow = this.handleDepSelectRow.bind(this)
    this.handleDepListAction = this.handleDepListAction.bind(this)

    this.handleOppSelectRow = this.handleOppSelectRow.bind(this)
    this.handleOppListAction = this.handleOppListAction.bind(this)
    this.handleInstSave = this.handleInstSave.bind(this)
    this.handleInstCancel = this.handleInstCancel.bind(this)

    this.state = {
      ...format(InstTemplate),
      isNew: true,

      selectedDep: null,
      opportunity: null,
      showOpportunityForm: false,
      showInstForm: false,
      institution: null,

      currentLocation: {
        point: {
          lat: 0,
          lng: 0,
        },
        zoom: 3,
      }
    }
  }

  componentDidMount() {
    const { match, institutionFind, categoryFindAll } = this.props
    const { institutionId } = match.params

    if (institutionId) {
      institutionFind(institutionId)
    } else {
      this.props.institutionUnset()
      this.setState({
        ...format(InstTemplate, null),
        isNew: true,
      })
    }

    categoryFindAll()
    this.props.institutionGetTypes()
    this.props.opportunityGetTypes()
  }

  componentWillReceiveProps(nextProps) {
    const { institution } = nextProps

    if (institution && institution.current) {
      this.setState({
        ...format(InstTemplate, institution.current),
        isNew: !institution.current,
      })
    }
  }

  // Save institution overview and location
  handleSave() {
    const { institutionCreate, institutionUpdate } = this.props
    const output = formatOutput(InstTemplate, this.state)
    if (this.state.id) {
      institutionUpdate({
        ...output
      })
    } else {
      delete(output.id)
      institutionCreate({
        ...output
      })
    }
  }

  handleDelete() {
    const { institutionDelete } = this.props
    if (!this.state.isNew) {
      institutionDelete(this.state.id)
    }
  }

  handleInputChange(e, props) {
    if (props.name === 'currentLocation') {
      console.log('Current localization: %o', props)
    }
    this.setState({
      [props.name]: props.value,
    })
  }

  handleCheckboxChange(e, props) {
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

  handleClickUploadLogo() {
    const { institution, institutionUploadLogo } = this.props
    if (institution && institution.current)
      institutionUploadLogo(institution.current.id, this.state.logo.file)
  }

  handleOpportunitySave(data) {
    const { opportunityCreate, opportunityUpdate, institution } = this.props
    const { current } = institution
    if (!data.id) {
      delete(data.id)
      opportunityCreate({
        ...data,
        institutionId: current && current.id
      }, { inList: true })
    } else {
      opportunityUpdate({
        ...data,
      }, { inList: true })
    }

    this.setState({
      showOpportunityForm: false,
    })
  }

  handleOpportunityCancel() {
    this.setState({
      showOpportunityForm: false,
    })
  }

  handleAddOpportunity() {
    const { opportunitySet } = this.props
    opportunitySet(null)
    this.setState({
      showOpportunityForm: true,
      opportunity: null,
    })
  }

  handleOppSelectRow(opp) {
    const { opportunitySet } = this.props
    opportunitySet(opp.id)
    this.setState({
      showOpportunityForm: true,
    })
  }

  handleOppListAction(type, opp) {
    const { institution, history } = this.props
    if (type === OppListActions.EDIT) {

      history.push(`/institution/${institution.current.id}/opportunity/${opp.id}`)

    } else if (type === OppListActions.REMOVE) {

      const { opportunityDelete } = this.props
      opportunityDelete(opp.id, { inList: true })

    }
  }

  handleAddDependency() {
    this.setState({
      showInstForm: true,
    })
  }

  handleDepListAction(type, dep) {
    const { history } = this.props
    if (type === DepListActions.EDIT) {
      const { institutionFind } = this.props
      institutionFind(dep.id)
      history.push(`/institution/${dep.id}/edit`)
    } else  if (DepListActions.REMOVE) {
      const { institutionDelete } = this.props
      institutionDelete(dep.id, { isDependency: true })
    }
  }

  handleDepSelectRow(dep) {
    this.setState({
      selectedDep: dep,
      showInstForm: true,
    })
  }

  handleInstSave(data) {
    if(data.id) {
      const { institutionUpdate } = this.props
      institutionUpdate(data, {
        isDependency: true
      })
    } else {
      delete(data.id)
      data.parentId = this.state.id
      const { institutionCreate } = this.props
      institutionCreate(data, {
        isDependency: true,
      })
    }

    this.setState({
      showInstForm: false,
    })
  }
  handleInstCancel() {
    this.setState({
      showInstForm: false,
    })
  }

  render() {
    const { category, opp, institution } = this.props
    const { isNew, logo, location } = this.state

    if (category && institution && opp && institution.constants && opp.constants) {
      return (
        <Grid container stackable>
          <Grid.Column width={16}>
            <Header size="huge">
              {isNew ? "Create a new Institution": this.state.name}
            </Header>
          </Grid.Column>
          <Grid.Column width={6}>
            
          {!isNew && this.state.head && (
              <Segment>
                <Header size="tiny">Depends on:</Header>
                <Button onClick={() => this.props.institutionFind(institution.current.head.id, true)}>
                  {this.state.head.name}
                </Button>
              </Segment>
            )}

          {!isNew && (
            <Segment>
              <Header size="medium">Logo Profile</Header>
              <SimpleMediaUploader
                name="logo" 
                onChange={this.handleInputChange}
                onUpload={this.handleClickUploadLogo}
                url={logo.url || logo.fakeUrl}
                disabled={!logo.fakeUrl}
              />
            </Segment>
          )}
            <Segment>
              <Header size="medium">Location</Header>
              <LocationMap
                name="location"
                onCenterChange={this.handleInputChange}
                data={location.point ? location : this.state.currentLocation}
              />
            </Segment>

          </Grid.Column>

          <Grid.Column width={10}>
            <Segment>
              <Header size="medium">Overview</Header>
              <FormOverview onInputChange={this.handleInputChange}
                data={this.state}
                constants={institution.constants}
                categoryList={category.list}
              />
            </Segment>

            <Button loading={institution.loading} disabled={institution.loading} 
              default
              onClick={this.handleSave}
            >Save</Button>
            <Button loading={institution.loading} disabled={institution.loading} 
              default
              onClick={this.handleDelete}
            >Delete</Button>

            {!isNew && institution.current && (
              <Segment>
                <Header size="medium">Dependencies <Button default onClick={this.handleAddDependency}>Add</Button></Header>
                <InstList items={institution.current.dependencies} onSelectRow={this.handleDepSelectRow}
                  onClickAction={this.handleDepListAction}
                />
              </Segment>
            )}

            {!isNew && institution.current && (
              <Segment>
                <Header size="medium">Opportunities <Button default onClick={this.handleAddOpportunity}>Add</Button></Header>
                <OpportunitiesList items={opp.list} onSelectRow={this.handleOppSelectRow}
                  onClickAction={this.handleOppListAction}
                />
              </Segment>
            )}

          </Grid.Column>

          <OpportunityForm visible={this.state.showOpportunityForm} opportunity={this.props.opp.current} 
            constants={this.props.opp.constants}
            onSave={this.handleOpportunitySave} 
            onCancel={this.handleOpportunityCancel}
            onLogoUpload={this.handleOppLogoUpload}
          />
          <InstForm visible={this.state.showInstForm} 
            institution={this.state.selectedDep}
            constants={institution.constants}
            onSave={this.handleInstSave} 
            onCancel={this.handleInstCancel}
            onLogoUpload={this.handleInstLogoUpload}
          />

        </Grid>
      )
    }
    else {
      return <Header size="huge">Loading...</Header>
    }
  }
}

const ConnectedComponent = connect((state) => ({
  account: state.account,
  institution: state.institution,
  opp: state.opp,
  category: state.category,
}), (dispatch) => ({
  institutionCreate: (data, opts) => dispatch(institutionActions.create(data, opts)),
  institutionUploadLogo: (id, file) => dispatch(institutionActions.uploadLogo(id, file)),
  institutionFind: (id, change) => dispatch(institutionActions.findById(id, change)),
  institutionUnset: () => dispatch(institutionActions.unset()),
  institutionUpdate: (data, opts) => dispatch(institutionActions.update(data, opts)),
  institutionDelete: (data, opts) => dispatch(institutionActions.deleteI(data, opts)),
  institutionOppUploadLogo: (id, data) => dispatch(uploadLogo(id, data)),
  institutionGetTypes: () => dispatch(institutionActions.getTypes()),
  opportunityGetTypes: () => dispatch(opportunityActions.getTypes()),
  opportunityCreate: (data, opts) => dispatch(opportunityActions.create(data, opts)),
  opportunityUpdate: (data, opts) => dispatch(opportunityActions.update(data, opts)),
  opportunitySet: (id, opts) => dispatch(opportunityActions.set(id, opts)),
  opportunityDelete: (id, opts) => dispatch(opportunityActions.deletex(id, opts)),
  categoryFindAll: (opts) => dispatch(categoryActions.findAll(opts)),

})) (withRouter(Create))

export default withAuthorization(ConnectedComponent, [UserState.ACCOUNT])

