import React, { useContext, useState } from 'react';
import { Box, Button, Text } from '@airtable/blocks/ui';
import RoutificClient from '../client/routific';
import { GlobalContext } from './global-context';
import { RoutesInterface } from './routes-interface';

export const Route = () => {
  const {
    routeDay,
    fleetConfiguration,
    ordersToRoute,
    routesData,
    setRoutesData,
  } = useContext(GlobalContext);

  const [error, setError] = useState(false);

  const routificClient = new RoutificClient(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmQ0MjE4YzNiNjIwNzAwMWIzODJiYjMiLCJpYXQiOjE3MjUxNzgyNTJ9.LkB0IajsGcO5ZgdYv-1S96LxevAG5p9K71J_37-1dTA'
  );

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

  const mapFleet = (vehicle) => {
    const baseLocation = {
      id: 'base',
      name: '33-100 Tarnów',
      lat: 50.0121,
      lng: 20.985842,
    };

    return {
      [vehicle.id]: {
        start_location: baseLocation,
        end_location: baseLocation,
        shift_start: vehicle.startTime,
        shift_end: vehicle.endTime,
        capacity: vehicle.loadCapacity,
      },
    };
  };

  const handleTransports = async () => {
    if (!ordersToRoute || fleetConfiguration) {
      setError(true);
      return;
    }

    setError(false);

    try {
      const transportPromises = fleetConfiguration.map(async (vehicle) => {
        const data = {
          visits: mapOrders(ordersToRoute),
          fleet: mapFleet(vehicle),
          options: {
            shortest_distance: true,
            polylines: true,
          },
        };

        const result = await routificClient.calculateTransports(data);
        console.log('Response for vehicle:', vehicle.id, result);
        return result;
      });

      const results = await Promise.all(transportPromises);

      setRoutesData(results);
    } catch (error) {
      console.error('Error during transport calculation:', error);
    }
  };

  console.log(routesData);

  return (
    <Box
      padding="24px"
      backgroundColor="white"
      borderRadius="16px"
      boxShadow="0 6px 12px rgba(0, 0, 0, 0.1)"
      maxWidth="800px"
      margin="auto"
      marginTop="24px"
      border="1px solid #e0e0e0"
    >
      {/* Przycisk obliczania tras */}
      <Button
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

      {error && (
        <Text marginTop={1} textColor="tomato">
          Uzupełnij wszystkie dane
        </Text>
      )}

      {/*{routesData && (*/}
      {/*  <Box width="100%" marginTop="16px">*/}
      {/*    <RoutesInterface data={routesData} />*/}
      {/*  </Box>*/}
      {/*)}*/}

      <RoutesInterface />
    </Box>
  );
};
