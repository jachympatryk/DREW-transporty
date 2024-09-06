import React, { createContext, useState } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [routeDay, setRouteDay] = useState(null);
  const [fleetConfiguration, setFleetConfiguration] = useState([]);
  const [ordersToRoute, setOrdersToRoute] = useState([]);

  console.log('handleTransports', fleetConfiguration);
  console.log('ordersToRoute', ordersToRoute);

  return (
    <GlobalContext.Provider
      value={{
        routeDay,
        setRouteDay,
        fleetConfiguration,
        setFleetConfiguration,
        ordersToRoute,
        setOrdersToRoute,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
