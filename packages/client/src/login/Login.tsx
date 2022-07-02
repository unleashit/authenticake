import '@unleashit/login/dist/login.css';

import Login, {
  FormValues,
  LoginProps,
  ServerResponse,
} from '@unleashit/login';
import React from 'react';

import AuthenticakeContext from '../provider/context';

export type ClientSignupProps = Partial<LoginProps> & {};

const defaultOnSuccess = (response: ServerResponse) => {
  console.log(`onSuccess: ${response}`);
};

function LoginDemo({
  onSuccess = defaultOnSuccess,
  // loginHandler = () => Promise.resolve(serverResponse),
  ...rest
}: ClientSignupProps) {
  const {
    AuthenticakeAPI,
    linkComponent: LinkComponent,
    linkComponentHrefAttr,
  } = React.useContext(AuthenticakeContext);

  const loginHandler = async (vals: FormValues): Promise<ServerResponse> => {
    const res = await fetch(`${AuthenticakeAPI}/login`, {
      method: 'post',
      body: JSON.stringify(vals),
      headers: new Headers({
        // 'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }),
    });

    interface AuthenticakeLogin {
      error?: string;
      messages?: any[];
    }

    const json: AuthenticakeLogin = await res.json();

    const serverResponse: ServerResponse = {
      success: res.status >= 200 && res.status <= 299,
    };

    if (json.error) {
      serverResponse.errors = {
        // ...(json.messages || null),
        serverAuth: json.error,
      };
    }

    // if (serverResponse && serverResponse.errors && json.messages) {
    //   json.messages.forEach((m) => {
    //     serverResponse.errors = {
    //       ...serverResponse.errors,
    //       [m[0]]: m[1]
    //     };
    //   });
    // }

    console.log(serverResponse);

    return serverResponse;
  };

  return (
    <div>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Login
        loginHandler={loginHandler}
        onSuccess={onSuccess}
        {...(LinkComponent && { linkComponent: LinkComponent })}
        {...(linkComponentHrefAttr && { linkComponentHrefAttr })}
        {...rest}
      />
    </div>
  );
}

export default LoginDemo;
