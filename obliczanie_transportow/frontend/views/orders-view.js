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
import { OrdersList } from '../components/orders-list';
import { Route } from '../components/route';
import { Settings } from '../components/settings';

export const OrdersView = () => {
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
      <Settings />

      <Fleet />

      <OrdersList />

      <Route />
    </Box>
  );
};
