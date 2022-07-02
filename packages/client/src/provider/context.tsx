import * as React from 'react';

import { AuthenticakeProps } from './AuthenticakeProvider';

export type ContextVals = Pick<
  AuthenticakeProps,
  'linkComponent' | 'linkComponentHrefAttr'
> & {
  AuthenticakeAPI: AuthenticakeProps['API'];
  _AUTHED: boolean;
  _GRANTS: string[];
};

export const DefaultLinkComponent = ({
  children,
  ...rest
}: // eslint-disable-next-line react/jsx-props-no-spreading
React.PropsWithChildren<any>) => <a {...rest}>{children}</a>;

const AuthenticakeContext = React.createContext<ContextVals>({
  AuthenticakeAPI: '',
  linkComponent: DefaultLinkComponent,
  linkComponentHrefAttr: 'href',
  _AUTHED: false,
  _GRANTS: [],
});

AuthenticakeContext.displayName = 'Authenticake';

export default AuthenticakeContext;
