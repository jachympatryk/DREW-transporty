import React, { createContext, useState } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [routeDay, setRouteDay] = useState(null);

  const [fleetConfiguration, setFleetConfiguration] = useState([]);
  const [ordersToRoute, setOrdersToRoute] = useState([]);
  const [routesData, setRoutesData] = useState(null);

  //TODO: add start and end time while calculating routes

  console.log('fleetConfiguration', fleetConfiguration);
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
        routesData,
        setRoutesData,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
