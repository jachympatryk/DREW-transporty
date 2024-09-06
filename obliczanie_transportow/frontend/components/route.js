import React, { useContext, useState } from 'react';
import { Box, Button } from '@airtable/blocks/ui';
import RoutificClient from '../client/routific';
import { GlobalContext } from './global-context';
import { RoutesInterface } from './routes-interface';

export const Route = () => {
  const { routeDay, fleetConfiguration, ordersToRoute } =
    useContext(GlobalContext);

  const routificClient = new RoutificClient(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmQ0MjE4YzNiNjIwNzAwMWIzODJiYjMiLCJpYXQiOjE3MjUxNzgyNTJ9.LkB0IajsGcO5ZgdYv-1S96LxevAG5p9K71J_37-1dTA'
  );

  const [routesData, setRoutesData] = useState(null);

  const mapOrders = (orders) => {
    return orders.reduce((acc, order) => {
      acc[order.id] = {
        location: {
          name: order.addressName,
          lat: order.lat,
          lng: order.lng,
        },

        load: order.load,
      };

      return acc;
    }, {});
  };

  const mapFleet = (fleet) => {
    const baseLocation = {
      id: 'base',
      name: '33-100 Tarnów',
      lat: 50.0121,
      lng: 20.985842,
    };

    return fleet.reduce((fleet, vehicle, index) => {
      fleet[vehicle.id] = {
        start_location: baseLocation,
        end_location: baseLocation,
        shift_start: vehicle.startTime,
        shift_end: vehicle.endTime,
        capacity: vehicle.loadCapacity,
      };
      return fleet;
    }, {});
  };

  const handleTransports = async () => {
    try {
      const data = {
        visits: mapOrders(ordersToRoute),
        fleet: mapFleet(fleetConfiguration),
        options: {
          shortest_distance: true,
          polylines: true,
        },
      };

      const result = await routificClient.calculateTransports(data);

      setRoutesData(result);
      console.log('Response:', result);
    } catch (error) {
      console.error('Error during transport calculation:', error);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      padding="24px"
      backgroundColor="white"
      borderRadius="12px"
      boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
    >
      {/* Przycisk obliczania tras */}
      <Button
        margin="16px 0"
        onClick={handleTransports}
        type="button"
        width="100%"
        style={{
          backgroundColor: '#ff6347', // Tomato kolor w hex
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '8px',
          border: 'none',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#e5533d')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#ff6347')}
      >
        Oblicz trasy
      </Button>

      {routesData && (
        <Box width="100%" marginTop="16px">
          <RoutesInterface data={routesData} />
        </Box>
      )}

      {/*<RoutesInterface />*/}
    </Box>
  );
};
