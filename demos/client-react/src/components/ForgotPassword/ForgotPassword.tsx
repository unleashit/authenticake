import { ForgotPassword } from '@authenticake/client';
import React from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

// import styles from './signup.module.scss';
const onSuccess = (navigate: NavigateFunction) => () => {
  navigate('/home');
};

function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <div>
      <ForgotPassword onSuccess={onSuccess(navigate)} />
    </div>
  );
}

export default ForgotPasswordPage;
