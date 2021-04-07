import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Slide from '@material-ui/core/Slide';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from 'components/Shared/Fields/Text';
import Toast from 'components/Shared/Toast';
import { logError } from 'helpers/rxjs-operators/logError';
import { useFormikObservable } from 'hooks/useFormikObservable';
import IOrder from 'interfaces/models/order';
import React, { forwardRef, Fragment, memo, useCallback } from 'react';
import { tap } from 'rxjs/operators';
import orderService from 'services/order';
import * as yup from 'yup';

interface IProps {
  opened: boolean;
  order?: IOrder;
  onComplete: (order: IOrder) => void;
  onCancel: () => void;
}

const validationSchema = yup.object().shape({
  description: yup.string().required('Este campo é obrigatório').min(3, 'A descrição deve ter no mínimo 3 caracteres'),
  price: yup.number().typeError('Este campo precisa ser um numero').required('Este campo é obrigatório'),
  quantity: yup
    .number()
    .typeError('Este campo precisa ser um numero')
    .required('Este campo é obrigatório')
    .min(1, 'A quantidade deve ter ao menos um item')
});

const useStyle = makeStyles({
  content: {
    maxWidth: 'calc(95vw - 50px)'
  },
  heading: {
    marginTop: 20,
    marginBottom: 10
  }
});

const FormDialog = memo((props: IProps) => {
  const classes = useStyle(props);

  const formik = useFormikObservable<IOrder>({
    validationSchema,
    onSubmit(model) {
      model.price = parseFloat(model.price.toString());
      model.quantity = parseInt(model.quantity.toString());

      console.log(model);

      return orderService.save(model).pipe(
        tap(order => {
          Toast.show('Salvo com sucesso!');
          props.onComplete(order);
          window.location.reload();
        }),
        logError(true)
      );
    }
  });
  const handleEnter = useCallback(() => {
    formik.setValues(props.order ?? formik.initialValues, false);
  }, [formik, props.order]);

  const handleExit = useCallback(() => {
    formik.resetForm();
  }, [formik]);

  return (
    <Dialog
      open={props.opened}
      disableBackdropClick
      disableEscapeKeyDown
      onEnter={handleEnter}
      onExited={handleExit}
      TransitionComponent={Transition}
    >
      {formik.isSubmitting && <LinearProgress color='primary' />}

      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{formik.values.id ? 'Editar' : 'Novo'} Pedido</DialogTitle>
        <DialogContent className={classes.content}>
          <Fragment>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={4} label='Descrição' name='description' formik={formik} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label='Preço' name='price' formik={formik} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label='Quantidade' name='quantity' type='quantity' formik={formik} />
              </Grid>
            </Grid>
          </Fragment>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancel}>Cancelar</Button>
          <Button color='primary' variant='contained' type='submit' disabled={formik.isSubmitting}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

const Transition = memo(
  forwardRef((props: any, ref: any) => {
    return <Slide direction='up' {...props} ref={ref} />;
  })
);

export default FormDialog;
