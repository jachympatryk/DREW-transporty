import {
  Box,
  Heading,
  Input,
  Label,
  RecordCardList,
  SelectButtons,
  useBase,
  useRecords,
} from '@airtable/blocks/ui';
import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from './global-context';
import { fetchLatLng } from '../utils/geocoding';

export const OrdersList = () => {
  const base = useBase();
  const ordersTable = base.getTableById('tblIdbNUshv6PjJil');

  return (
    <Box
      padding="24px"
      backgroundColor="white"
      borderRadius="12px"
      boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
      marginBottom="24px"
    >
      <Heading size="small" marginBottom="16px" fontWeight="bold">
        Zamówienia oczekujące na zaplanowanie transportu:
      </Heading>

      <List table={ordersTable} />
    </Box>
  );
};

const List = ({ table }) => {
  const { ordersToRoute, setOrdersToRoute } = useContext(GlobalContext);

  const queryResult = table.selectRecords();
  const records = useRecords(queryResult);

  const [filterValue, setFilterValue] = useState('Obliczyc transport');

  const getFilteredRecords = () => {
    if (filterValue === 'all') {
      return records;
    }
    return records.filter((record) => {
      const fieldValue = record.getCellValue('Status');

      return fieldValue.name === filterValue;
    });
  };

  const filterOptions = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'Obliczyc transport', label: 'Obliczyc transport' },
    { value: 'Zaplanowane', label: 'Zaplanowane' },
  ];

  useEffect(() => {
    const fetchOrdersToRoute = async () => {
      if (filterValue === 'Obliczyc transport') {
        const filteredOrders = await Promise.all(
          records
            .filter((record) => {
              const fieldValue = record.getCellValue('Status');
              return fieldValue?.name === 'Obliczyc transport';
            })
            .map(async (record) => {
              const id = record.id;
              const postalCode = record.getCellValue('Kod pocztowy');
              const load = record.getCellValue('Wielkość zamówienia (m3)');

              const { lat, lng, addressName } = await fetchLatLng(postalCode);

              return { id, postalCode, load, lat, lng, addressName };
            })
        );

        setOrdersToRoute(filteredOrders);
      } else {
        setOrdersToRoute([]);
      }
    };

    fetchOrdersToRoute().then();
  }, [filterValue]);

  return (
    <Box padding="24px" backgroundColor="white" borderRadius="12px">
      <Box marginBottom="16px">
        <SelectButtons
          value={filterValue}
          onChange={(newValue) => setFilterValue(newValue)}
          options={filterOptions}
          size="large"
          width="100%"
          variant="outline"
          borderColor="#007bff"
        />
      </Box>

      <Box height="300px" borderRadius="8px" overflowY="auto">
        <RecordCardList records={getFilteredRecords()} />
      </Box>
    </Box>
  );
};
