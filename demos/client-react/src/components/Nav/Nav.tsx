import Navigation, { NavigationLink } from '@unleashit/navigation';
import baseStyle from '@unleashit/navigation/dist/navigation.module.css';
import React from 'react';
import { Link } from 'react-router-dom';

import overrides from './nav.module.scss';

const styles = {
  ...baseStyle,
  ...overrides,
};

const links: NavigationLink[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Products',
    href: '/products',
  },
  {
    title: 'About',
    href: '/about',
  },
];

const authLinks = {
  login: {
    title: 'Login',
    href: '/login',
  },
  logout: {
    title: 'Logout',
    href: '/logout',
  },
  signup: {
    title: 'Register',
    href: '/register',
  },
};

function Nav() {
  return (
    <Navigation
      links={links}
      linkComponent={Link}
      linkComponentHrefAttr="to"
      isAuth={false}
      authLinks={authLinks}
      template="dark-buttons"
      cssModule={styles}
    />
  );
}

export default Nav;
