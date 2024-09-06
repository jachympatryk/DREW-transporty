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
    <Box marginTop={4}>
      <Settings />

      <Fleet />

      <OrdersList />

      <Route />
    </Box>
  );
};
