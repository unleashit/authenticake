import { Login } from '@authenticake/client';
import React from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

// import styles from './login.module.scss';

const onSuccess = (navigate: NavigateFunction) => (res: any) => {
  console.log(res);
  navigate('/profile');
};

function LoginPage() {
  const navigate = useNavigate();

  return <Login signupUrl="/register" onSuccess={onSuccess(navigate)} />;
}

export default LoginPage;
