import { Input } from '@taxi/input';
import * as React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    margin: '10px',
  },
  wrapper: {
    textAlign: 'right',
  },
});

export interface LoginFormProps {
  onClick?: () => void;
}

export const LoginForm: React.FunctionComponent<LoginFormProps> = ({
  onClick,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Input id="name" label="Name" />
      <Input id="password" label="Password" />

      <div className={classes.wrapper}>
        <button onClick={onClick}>Log in</button>
      </div>
    </div>
  );
};
