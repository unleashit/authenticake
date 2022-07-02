import React, { useState } from 'react';

import AppRoutes from '../../routes';
import Nav from '../Nav/Nav';
import styles from './app.module.scss';

// function WhatsYourName() {
//   const [hello, setHello] = useState('?');
//
//   const helloHandler: React.ChangeEventHandler<HTMLInputElement> =
//     React.useCallback((e) => setHello(e.target.value), []);
//
//   return (
//     <div>
//       <p>Hi {hello}</p>
//       <p>
//         Whats your name?{' '}
//         <input type="text" name="hello" onChange={helloHandler} />
//       </p>
//     </div>
//   );
// }

function App() {
  return (
    <>
      <header className={styles.mainHeader}>
        <Nav />
      </header>
      <main className="content-body">
        <AppRoutes />
      </main>
    </>
  );
}

export default App;
