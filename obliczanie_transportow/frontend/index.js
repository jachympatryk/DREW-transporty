import { initializeBlock, Box } from '@airtable/blocks/ui';
import React from 'react';
import { GlobalContext, GlobalProvider } from './components/global-context';
import { OrdersView } from './views/orders-view';

function HelloWorldApp() {
  return (
    <Box
      padding={3}
      // maxWidth="800px"
      margin="0 auto"
      border="thick"
      backgroundColor="white"
    >
      <OrdersView />
    </Box>
  );
}

initializeBlock(() => (
  <GlobalProvider>
    <HelloWorldApp />
  </GlobalProvider>
));
