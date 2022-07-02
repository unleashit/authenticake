import ForgotPassword, { ServerResponse } from '@unleashit/forgot-password';
import React from 'react';

interface ForgotPasswordProps {
  onSuccess: (response: ServerResponse) => any;
}

const serverResponse: ServerResponse = {
  success: true,
};

const defaultOnSuccess = (response: ServerResponse) => {
  console.log(`onSuccess: ${response}`);
};

function ForgotPasswordDemo(
  { onSuccess }: ForgotPasswordProps = {
    onSuccess: defaultOnSuccess,
  },
) {
  return (
    <div>
      <div>Forgot Password</div>

      <ForgotPassword
        forgotPasswordHandler={() => Promise.resolve(serverResponse)}
        onSuccess={onSuccess}
      />
    </div>
  );
}

export default ForgotPasswordDemo;
