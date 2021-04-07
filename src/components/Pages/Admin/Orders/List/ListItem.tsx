import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Alert from 'components/Shared/Alert';
import Description from 'components/Shared/Description';
import { IOption } from 'components/Shared/DropdownMenu';
import TableCellActions from 'components/Shared/Pagination/TableCellActions';
import Toast from 'components/Shared/Toast';
import { formatCurrency } from 'helpers/formatters/currency';
import { logError } from 'helpers/rxjs-operators/logError';
import IOrder from 'interfaces/models/order';
import DeleteIcon from 'mdi-react/DeleteIcon';
import EditIcon from 'mdi-react/EditIcon';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useCallbackObservable } from 'react-use-observable';
import { from } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import orderService from 'services/order';

interface IProps {
  order: IOrder;
  onEdit: (order: IOrder) => void;
  onDeleteComplete: () => void;
}

const ListItem = memo((props: IProps) => {
  const { order, onEdit, onDeleteComplete } = props;

  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleDismissError = useCallback(() => setError(null), []);

  const handleEdit = useCallback(() => {
    onEdit(order);
  }, [onEdit, order]);

  const [handleDelete] = useCallbackObservable(() => {
    return from(Alert.confirm('Tem certeza que deseja deletar esse registro?')).pipe(
      filter(ok => ok),
      tap(() => setLoading(true)),
      switchMap(() => orderService.delete(order.id)),
      logError(),
      tap(
        () => {
          Toast.show('Deletado com sucesso!');
          setLoading(true);
          setDeleted(true);
          onDeleteComplete();
        },
        error => {
          setLoading(false);
          setError(error);
        }
      )
    );
  }, []);

  const options = useMemo<IOption[]>(() => {
    return [
      { text: 'Editar', icon: EditIcon, handler: handleEdit },
      { text: 'Excluir', icon: DeleteIcon, handler: handleDelete }
    ];
  }, [handleDelete, handleEdit]);

  if (deleted) {
    return null;
  }

  return (
    <TableRow>
      <TableCell>{order.id}</TableCell>
      <TableCell>
        <Description description={order.description}></Description>
      </TableCell>
      <TableCell>{order.quantity}</TableCell>
      <TableCell>{formatCurrency(order.price)}</TableCell>
      <TableCellActions options={options} loading={loading} error={error} onDismissError={handleDismissError} />
    </TableRow>
  );
});

export default ListItem;
