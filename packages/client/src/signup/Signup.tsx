import '@unleashit/signup/dist/signup.css';

import Signup, {
  FormValues,
  ServerResponse,
  SignupProps,
} from '@unleashit/signup';
import React from 'react';

import AuthenticakeContext from '../provider/context';

export type ClientSignupProps = Partial<SignupProps> & {};

const defaultOnSuccess = (response: ServerResponse) => {
  console.log(`onSuccess: ${response}`);
};

function SignupDemo({
  onSuccess = defaultOnSuccess,
  // signupHandler = () => Promise.resolve(serverResponse),
  ...rest
}: ClientSignupProps) {
  const {
    AuthenticakeAPI,
    linkComponent: LinkComponent,
    linkComponentHrefAttr,
  } = React.useContext(AuthenticakeContext);

  const signupHandler = async (vals: FormValues): Promise<ServerResponse> => {
    const res = await fetch(`${AuthenticakeAPI}/signup`, {
      method: 'post',
      body: JSON.stringify(vals),
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();

    const serverResponse: ServerResponse = {
      success: res.status >= 200 && res.status <= 299,
    };

    if (json.error) {
      serverResponse.errors = {
        ...(json.messages || null),
        serverAuth: json.error,
      };
    }

    return serverResponse;
  };

  return (
    <Signup
      signupHandler={signupHandler}
      onSuccess={onSuccess}
      {...(LinkComponent && { linkComponent: LinkComponent })}
      {...(linkComponentHrefAttr && { linkComponentHrefAttr })}
      {...rest}
    />
  );
}

export default SignupDemo;
