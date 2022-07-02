import { Signup } from '@authenticake/client';
import React from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

// import styles from './signup.module.scss';
const onSuccess = (navigate: NavigateFunction) => (res: any) => {
  console.log(res);
  navigate('/profile');
};

function SignupPage() {
  const navigate = useNavigate();

  return <Signup onSuccess={onSuccess(navigate)} />;
}

export default SignupPage;
