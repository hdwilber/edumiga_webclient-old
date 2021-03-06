import React from 'react'
import { Button, Table } from 'semantic-ui-react'
import { Actions as Action } from '../../utils/constants'

export const Actions = {
  EDIT: 1,
  REMOVE: 2,
}
export class List extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !(nextProps.items === this.props.items)
  }

  render() {
    const { onSelectRow, items, onClickAction } = this.props

    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Administrative Level</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            items && ( 
              items.map(i => {
                //console.log(i)
                return (
                  <Table.Row key={i.id} onClick={() => onSelectRow(i)}>
                    <Table.Cell>{i.name}</Table.Cell>
                    <Table.Cell>{i.adminLevel}</Table.Cell>
                    <Table.Cell>
                      <Button.Group>
                        <Button icon="external" disabled={!i.id} compact onClick={(e) => {e.stopPropagation(); onClickAction(Action.fullEdit, i)}} />
                        <Button icon="edit" compact onClick={(e) => {e.stopPropagation(); onClickAction(Action.fastEdit, i)}} />
                        <Button icon="remove" compact onClick={(e) => {e.stopPropagation(); onClickAction(Action.delete, i)}} />
                      </Button.Group>
                    </Table.Cell>
                  </Table.Row>
                )
                }
            ))
          }
        </Table.Body>
      </Table>
    )
  }
}

export default List;
