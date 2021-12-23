import { Table} from 'react-bootstrap'
import { useForm } from '../hooks/useForm';
import { useState } from 'react';
import EditableRow from './EditableRow';
import ReadOnlyRow from './ReadOnlyRow';

export default function Datatable({ data, columns, columnHeading }) {
  return (
    <Table bordered hover striped responsive style={{"border": "1px solid #000"}} cellPadding={0} cellSpacing={0}>
      <thead><tr>{data[0] && columnHeading.map(heading => <th>{heading}</th>)}</tr></thead>

      <tbody>
        {data.map((row, index) => (
          <tr key={index}>{columns.map((column, index) => (<td key={index}>{row[column]}</td>))}</tr>
        ))}
      </tbody>

      <tfoot><tr>{data[0] && columnHeading.map(heading => <th>{heading}</th>)}</tr></tfoot>
    </Table>
  );
}


export function EditableDatable({ columns, columnHeading, editContactId, handleDeleteClick, handleEditClick, currentClients, editFormData, handleEditFormChange, handleCancelClick }){

  const [ editClient, setEditClient ] = useState(false)

  // const columns = ["id", "name", "gender", "email", "contact", "address"]

  return (
    <Table bordered hover striped responsive style={{"border": "1px solid #000"}} cellPadding={0} cellSpacing={0}>
      <thead>
          <tr>{columnHeading.map(heading => (<th>{heading}</th>))}</tr>
      </thead>
      <tbody>
        {currentClients.map((row) => (
          <>
            {editContactId === row.id ? (
            <EditableRow
              row={row}
              editFormData={editFormData}
              handleEditFormChange={handleEditFormChange}
              handleCancelClick={handleCancelClick}
            />
            ) : (
              <ReadOnlyRow
                    columns={columns}
                    row={row}
                    handleEditClick={handleEditClick}
                    handleDeleteClick={handleDeleteClick}
                  />
            )}
          </>
        ))}
      </tbody>
      <tfoot>
        <tr>{columnHeading.map(heading => (<th>{heading}</th>))}</tr>
       </tfoot>
    </Table>
  )
}
