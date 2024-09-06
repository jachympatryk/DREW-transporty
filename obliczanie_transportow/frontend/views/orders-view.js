import {
  Box,
  Heading,
  Input,
  Label,
  RecordCardList,
  SelectButtons,
  Text,
  useBase,
  useRecords,
} from '@airtable/blocks/ui';
import React, { useContext, useState } from 'react';
import { Fleet } from '../components/fleet';
import { GlobalContext } from '../components/global-context';
import { OrdersList } from '../components/orders-list';
import { Route } from '../components/route';

export const OrdersView = () => {
  const { routeDay, setRouteDay } = useContext(GlobalContext);

  return (
    <Box marginTop={4}>
      <Box
        marginTop="24px"
        marginBottom="24px"
        padding="24px"
        backgroundColor="white"
        borderRadius="12px"
        boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
      >
        <Heading size="small" marginBottom="16px">
          Konfiguracja tworzenia tras
        </Heading>

        {/* Sekcja wyboru daty planowanego transportu */}
        <Box marginBottom="16px">
          <Label htmlFor="startDateInput" marginBottom="4px" fontWeight="bold">
            Data planowanego transportu
          </Label>
          <Input
            id="startDateInput"
            value={routeDay}
            onChange={(e) => setRouteDay(e.target.value)}
            border="1px solid #ddd"
            borderRadius="6px"
            backgroundColor="white"
            padding="8px"
            type="date"
            width="100%"
          />
        </Box>

        {/* Sekcja floty */}
        <Fleet />
      </Box>

      <OrdersList />

      <Route />
    </Box>
  );
};
