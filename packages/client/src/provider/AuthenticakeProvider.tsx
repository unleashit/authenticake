import * as React from 'react';

import AuthenticakeContext from './context';

export interface AuthenticakeProps {
  API: string; // url for Authenticake server API
  linkComponent?: React.ComponentType<any>;
  linkComponentHrefAttr?: string;
}

function AuthenticakeProvider({
  API: AuthenticakeAPI,
  linkComponent,
  linkComponentHrefAttr = 'href',
  children,
}: React.PropsWithChildren<AuthenticakeProps>) {
  const [_AUTHED, setAUTHED] = React.useState(false);
  const [_GRANTS, setGRANTS] = React.useState([]);

  const contextValue = React.useMemo(
    () => ({
      AuthenticakeAPI,
      linkComponent,
      linkComponentHrefAttr,
      _AUTHED,
      _GRANTS,
    }),
    [_AUTHED, _GRANTS, AuthenticakeAPI, linkComponent, linkComponentHrefAttr],
  );

  return (
    <AuthenticakeContext.Provider value={contextValue}>
      {children}
    </AuthenticakeContext.Provider>
  );
}

export default AuthenticakeProvider;
