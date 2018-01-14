import React from 'react'
import { Link } from 'react-router-dom'
import { Icon, Button, Dropdown, Image, Menu } from 'semantic-ui-react'

const logo = require('../images/edumiga-logo.png')

const Items = {
  UNDEFINED: 0,
  INSTITUTION: 1,
  OPPORTUNITY: 2,
  USER: 3,
}

class Navbar extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      activeItem: Items.UNDEFINED
    }

    this.handleItemClick = this.handleItemClick.bind(this)
  }

  handleItemClick(e, {index}) {
    this.setState({
      activeItem: index,
    })
  }

  render() {
    const { activeItem } = this.state
    const { onLogout, account } = this.props

    return (
      <Menu>
        <Menu.Item>
          <Image src={logo} width="100" />
        </Menu.Item>
        <Menu.Item as={Dropdown} item index={Items.INSTITUTION} active={activeItem === Items.INSTITUTION} onClick={this.handleItemClick}
          text="Institutions"
        >
          <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/institution/create"><Icon name="edit"/>Create</Dropdown.Item>
            <Dropdown.Item as={Link} to="/institutions"><Icon name="list"/>List</Dropdown.Item>
          </Dropdown.Menu>
        </Menu.Item>

        <Menu.Item index={Items.OPPORTUNITY} active={activeItem === Items.OPPORTUNITY} onClick={this.handleItemClick}>
          Opportunities
        </Menu.Item>

        {(account && account.session) ? <MenuItemUser onLogout={onLogout} account={account}/> : (
          <Menu.Item position="right">
            <Button><Icon name="sign in" /> Login</Button>
          </Menu.Item>
        )}
      </Menu>
    )
  }
}

const MenuItemUser = (props) => {
  const { account: { current, identity }, onLogout } = props
  if (identity) {
    return (
      <Menu.Item as={Dropdown} item 
        text={(identity && identity.displayName === '') ? (current || current.email): (identity.displayName)}
        position="right"
      >
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/account/identity" icon='edit' text='Edit Profile' />
          <Dropdown.Item icon='settings' text='Account Settings' />
          <Dropdown.Item icon='sign out' text='Logout' onClick={(e) => onLogout()}/>
        </Dropdown.Menu>
      </Menu.Item>
    )
  } else {
    return <Menu.Item>Loading...</Menu.Item>
  }
}

export default Navbar
