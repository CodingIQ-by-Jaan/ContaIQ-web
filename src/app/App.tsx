import { RouterProvider } from 'react-router';
import { router } from './router';
import Providers from './providers';

const App = () => (
  <Providers>
    <RouterProvider router={router} />
  </Providers>
);

export default App;
