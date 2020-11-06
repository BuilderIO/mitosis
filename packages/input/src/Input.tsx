import React from 'react';
import { makeStyles } from '@material-ui/styles';

export interface LabelProps {
  labelWidth?: number;
}

export interface InputWithLabelProps extends LabelProps {
  id?: string;
  label?: string;
}

export interface InputWithoutLabelProps extends LabelProps {
  id: string;
  label: string;
}

export type InputLabelProps = InputWithLabelProps | InputWithoutLabelProps;

export interface InputProps {
  name?: string;
  type?: string;
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    margin: '10px',
  },
  label: {
    marginRight: '10px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
  },
});

export const Input: React.FunctionComponent<InputProps & InputLabelProps> = ({
  label,
  id,
  labelWidth,
  ...rest
}) => {
  const classes = useStyles({ labelWidth });

  return (
    <div className={classes.root}>
      {label && (
        <label className={classes.label} htmlFor={id}>
          {label}:
        </label>
      )}
      <input className={classes.input} id={id} {...rest} />
    </div>
  );
};

Input.defaultProps = {
  type: 'text',
};
