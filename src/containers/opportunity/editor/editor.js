import React from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { Icon, Grid, Button, Segment, Header } from 'semantic-ui-react'

import { InputImage } from '../../../components/media'

import { FormGeneral } from '../../../components/opportunity'
import { Input as InputInstitution } from '../../../components/institution'

import * as institutionActions from '../../../redux/institution/actions'

import { CourseFastEditor } from '../../shared'
import CourseList from '../../../components/course/list'
import { Actions } from '../../../utils/constants'

import withAuthorization, { UserState } from '../../../containers/authorization'

class Editor extends React.Component {
  constructor(props) {
    super(props)

    const { typesManager: { opportunity } } = props
    this.state = {
      ...opportunity.format(null),

      isNew: true,
      showCourseFastEditor: false,
      courseFastEditor: {
        value: null,
      }
    }
  }

  findOpportunity(id) {
    if (id) {
      const { typesManager: { opportunity } } = this.props
      opportunity.findOne(id)
    }
  }

  componentDidMount() {
    const { match } = this.props
    const { opportunityId } = match.params
    this.findOpportunity(opportunityId)

    const { typesManager: { opportunity } } = this.props
    opportunity.getTypes()
  }

  componentWillReceiveProps(nextProps) {
    const { opportunity, location: nextLocation, match: nextMatch } = nextProps

    if (typeof nextLocation !== 'undefined') {
      const { location } = this.props
      if (nextLocation.key !== location.key) {
        const { opportunityId } = nextMatch.params
        this.findOpportunity(opportunityId)
      }
    }
    if (typeof opportunity !== 'undefined') {
      if (opportunity && opportunity.id) {
        const { match } = this.props
        const { opportunityId } = match.params
        if (!opportunityId && this.state.isNew)
          this.props.history.push(`/opportunity/${opportunity.id}/editor`)
      }
      this.setState({
        ...this.props.typesManager.opportunity.format(opportunity),
        isNew: !opportunity,
      }, () => {
        window.scroll(window.top)
      })
    }
  }

  handleSave = () => {
    const { opportunity: current, typesManager: { opportunity } } = this.props
    opportunity.save(this.state, current)
  }

  handleInputChange = (e, props) => {
    this.setState({
      [props.name]: props.value,
    })
  }

  handleAddCourse = () => {
    this.setState({
      showCourseFastEditor: true,
      courseFastEditor: {
        value: null,
      }
    })
  }

  actionCourseFastEditor = (action, { ref, value, isNew } ) => {
    switch(action) {
      case Actions.save: 
        //const { typesManager: { course } } = this.props
        const { courses } = this.state
        const newList = isNew
          ? courses.concat([value])
          : courses.map(c => (c === ref) ? ({ ...c, ...value }): c)

        this.setState({
          courses: newList,
          showCourseFastEditor: false,
          courseFastEditor: {
            value: null,
          }
        })
        
        break;
    }
  }

  closeCourseFastEditor = () => {
    this.setState({
      showCourseFastEditor: false,
      courseFastEditor: {
        value: null,
      }
    })
  }

  courseListClickAction = (action, course) => {
    switch(action) {
      case Actions.fastEdit:
        this.setState({
          showCourseFastEditor: true,
          courseFastEditor: {
            value: course,
          }
        })
        break;
    }
  }

  renderCoursesActionButtons() {
    return (
      <Button.Group floated="right" size='medium'>
        <Button 
          onClick={this.handleAddCourse}
          primary
        >
          <Icon name="plus" />Create
        </Button>
      </Button.Group>
    )
  }

  renderActionButtons() {
    const { isNew } = this.state
    const { opportunity: { id } } = this.props
    return (
      <Button.Group floated="right" size='medium'>
        <Button 
          onClick={this.handleSave}
          primary
        >
          <Icon name={isNew ? 'plus': 'save'} />{ isNew ? 'Create': 'Save' }
        </Button>
        <Button as={Link} to={`/opportunity/${id}`} secondary><Icon name="eye" />View</Button>
        <Button secondary><Icon name="remove" />Delete</Button>
      </Button.Group>
    )
  }

  renderHeader() {
    const { isNew, name } = this.state
    return (
      <Grid.Column width={16}>
        <Header size="huge">
          {isNew ? "Create a new Opportunity": name}
          { this.renderActionButtons() }
        </Header>
      </Grid.Column>
    )
  }
  render() {
    const { logo, institution, courses } = this.state
    const { institutions, constants, opportunity } = this.props
    const { showCourseFastEditor } = this.state

    if (opportunity) {
      return (
        <Grid container stackable>
          <Grid.Column width={16}>
            { this.renderHeader() }
          </Grid.Column>
          <Grid.Column width={6}>
            <Segment>
              <InputInstitution name="institution" value={institution}
                institutions={institutions}
                onChange={this.handleInputChange}
                unselected="This opportunity does not belong to an institution. Add one"
              />
            </Segment>
            <Segment>
              <Header size="medium">Logo Profile</Header>
              <InputImage
                name="logo" 
                onChange={this.handleInputChange}
                value={logo}
              />
            </Segment>
          </Grid.Column>

          <Grid.Column width={10}>
            <Segment>
              <Header size="medium">Overview</Header>
              <FormGeneral onChange={this.handleInputChange}
                value={this.state}
                constants={constants}
              />
            </Segment>

            <Segment>
              <Header size="medium">Courses
                {this.renderCoursesActionButtons()}
              </Header>
              <CourseList items={courses}
                onClickAction={this.courseListClickAction}
              />
            </Segment>
          </Grid.Column>
          { showCourseFastEditor && (
            <CourseFastEditor
              onAction={this.actionCourseFastEditor}
              onCancel={this.closeCourseFastEditor}
              visible={this.state.showCourseFastEditor}
              courses={courses}
              {...this.state.courseFastEditor}
            />
          )}
        </Grid>
      )
    }
    return <h1>Loading</h1>
  }
}

function mapStateToProps (state) {
  const { institution, opportunity } = state
  return {
    institutions: institution.list,
    opportunity: opportunity.current,
    processing: opportunity.loading,
    constants: {
      ...opportunity.constants,
    }
  }
}

function mapDispatchToProps(dispatch) {
  return {
  }
}


const ConnectedOpportunity = connect(mapStateToProps, mapDispatchToProps)(withRouter(Editor))

export default withAuthorization(ConnectedOpportunity, [UserState.ACCOUNT])

