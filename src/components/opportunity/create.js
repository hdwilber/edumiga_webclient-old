import React from 'react'
import { Grid, Segment, Header, Checkbox, Button, Modal, TextArea, Input, Form } from 'semantic-ui-react'
import SimpleMediaUploader from '../../components/media/image-uploader'
import FormOverview from './form-overview'

import { buildImageUrl } from '../../redux/utils'

class OppForm extends React.Component {
  constructor(props) {
    super(props)
    if (props.opportunity) {
      const { logo, name, type, degree, description, draft, duration } = props.opportunity
      this.state = {
        name,
        description,
        degree,
        type,
        draft,
        duration,
        logo: {
          file: null,
          url: logo ? (buildImageUrl(logo.url)): '',
          fakeUrl: '',
        }
      }
    } else {
      this.state ={
        name : '',
        description: '',
        draft: true,
        type: '',
        degree: '',
        duration: 0,
        logo: {
          file: null,
          url: '',
          fakeUrl: '',
        }
      }
    }

    this.handleClickSave = this.handleClickSave.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
    this.serializeData = this.serializeData.bind(this)
  }

  handleClickSave() {
    const { onSave } = this.props
    onSave({
      id: this.state.id,
      name: this.state.name,
      description: this.state.description,
      draft: this.state.draft,
      duration: this.state.duration,
      type: this.state.type,
      degree: this.state.degree,
    })
  }

  serializeData(returnData = false) {
    const { opportunity } = this.props

    return {
      id: (opportunity) ? opportunity.id: null,
      name: this.state.name,
      description: this.state.description,
      draft: this.state.draft,
      degree: this.state.degree,
      type: this.state.type,
      [returnData ? 'logoId': 'logo']: returnData ? this.state.logo.id: this.state.logo,
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps)

    if (nextProps.opportunity) {
      const { id, name, type, degree, description, draft, duration, logo } = nextProps.opportunity
      this.setState({
        id,
        name,
        description,
        draft,
        duration,
        type,
        degree,
        logo: {
          file: null,
          url: logo && (buildImageUrl(logo.url)),
          fakeUrl: '',
        },
      })
    } 
  }

  handleInputChange(e, props) {
    this.setState({
      [props.name]: props.value,
    })
  }

  handleCheckboxChange(e, props) {
    this.setState({
      [props.name]: props.checked,
    })
  }

  render() {
    const { onSave, onLogoUpload, onCancel, visible } = this.props
    const { name, description, draft, duration, logo } = this.state

    const data = this.serializeData()
    return (
      <Modal open={visible} >
        <Modal.Header>Enter a new Opportunity</Modal.Header>
        <Modal.Content image>
          <Grid container>
            <Grid.Column width={5}>
              <Segment>
                <Header size="normal">Logo Profile</Header>
                <SimpleMediaUploader
                  name="logo"
                  onChange={this.handleInputChange}
                  onUpload={onLogoUpload}
                  disabled={false}
                  url={logo.fakeUrl === '' ? logo.url : logo.fakeUrl }
                />
              </Segment>
            </Grid.Column>
            <Grid.Column width={11}>
              <Segment>
                <FormOverview onInputChange={this.handleInputChange}
                  data={data}
                />
                <Button.Group>
                  <Button default onClick={this.handleClickSave} >Save</Button>
                  <Button secondary onClick={onCancel} >Cancel</Button>
                </Button.Group>
              </Segment>
            </Grid.Column>
          </Grid>

        </Modal.Content>
      </Modal>
    )
  }
}

export default OppForm
