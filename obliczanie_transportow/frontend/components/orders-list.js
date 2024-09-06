import {
  Box,
  Button,
  Heading,
  Icon,
  Input,
  Label,
  RecordCard,
  RecordCardList,
  SelectButtons,
  Switch,
  Text,
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
      borderRadius="16px"
      boxShadow="0 6px 12px rgba(0, 0, 0, 0.1)"
      maxWidth="800px"
      margin="auto"
      marginTop="24px"
      border="1px solid #e0e0e0"
    >
      <Text
        fontWeight="bold"
        fontSize="medium"
        marginBottom="16px"
        color="#333"
      >
        Wybierz zamówienia:
      </Text>

      <List table={ordersTable} />
    </Box>
  );
};

const List = ({ table }) => {
  const { ordersToRoute, setOrdersToRoute } = useContext(GlobalContext);

  const queryResult = table.selectRecords();
  const records = useRecords(queryResult);

  const [filterValue, setFilterValue] = useState('Obliczyc transport');

  const ordersViewValues = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'selected', label: 'Wybrane' },
  ];
  const [currentOrdersView, setCurrentOrdersView] = useState(
    ordersViewValues[0].value
  );

  const getFilteredRecords = () => {
    return records.filter((record) => {
      const statusValue = record.getCellValue('Status');

      if (statusValue.name === 'Obliczyc transport') {
        return record;
      }
    });
  };

  const getSelectedRecords = () => {
    return records.filter((record) =>
      ordersToRoute.some((order) => order.id === record.id)
    );
  };

  const filterOptions = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'Obliczyc transport', label: 'Obliczyc transport' },
    { value: 'Zaplanowane', label: 'Zaplanowane' },
  ];

  const isOrderSelected = (carId) => {
    return ordersToRoute.some((car) => car.id === carId);
  };

  const handleSwitchChange = async (orderId, isChecked) => {
    const selectedRecord = records.find((record) => record.id === orderId);

    if (isChecked && selectedRecord) {
      const postalCode = selectedRecord.getCellValue('Kod pocztowy');
      const load = selectedRecord.getCellValue('Wielkość zamówienia (m3)');

      try {
        const { lat, lng, addressName } = await fetchLatLng(postalCode);

        setOrdersToRoute((prev) => [
          ...prev,
          {
            id: orderId,
            postalCode,
            load,
            lat,
            lng,
            addressName,
          },
        ]);
      } catch (error) {
        console.error(
          `Błąd podczas pobierania danych dla zamówienia ${orderId}:`,
          error
        );
      }
    } else {
      setOrdersToRoute((prev) => prev.filter((order) => order.id !== orderId));
    }
  };

  const handleRemoveOrder = (orderId) => {
    setOrdersToRoute((prev) => prev.filter((order) => order.id !== orderId));
  };

  const addAll = async () => {
    const filteredRecords = records.filter((record) => {
      const statusValue = record.getCellValue('Status');

      if (statusValue.name === 'Obliczyc transport') {
        return record;
      }
    });

    const addRecordPromises = filteredRecords.map(async (record) => {
      const orderId = record.id;

      const postalCode = record.getCellValue('Kod pocztowy');
      const load = record.getCellValue('Wielkość zamówienia (m3)');

      try {
        const { lat, lng, addressName } = await fetchLatLng(postalCode);

        setOrdersToRoute((prev) => {
          if (prev.some((order) => order.id === orderId)) {
            return prev;
          }

          return [
            ...prev,
            {
              id: orderId,
              postalCode,
              load,
              lat,
              lng,
              addressName,
            },
          ];
        });
      } catch (error) {
        console.error(
          `Błąd podczas pobierania danych dla zamówienia ${orderId}:`,
          error
        );
      }
    });

    await Promise.all(addRecordPromises);
  };

  // useEffect(() => {
  //   const fetchOrdersToRoute = async () => {
  //     if (filterValue === 'Obliczyc transport') {
  //       const filteredOrders = await Promise.all(
  //         records
  //           .filter((record) => {
  //             const fieldValue = record.getCellValue('Status');
  //             return fieldValue?.name === 'Obliczyc transport';
  //           })
  //           .map(async (record) => {
  //             const id = record.id;
  //             const postalCode = record.getCellValue('Kod pocztowy');
  //             const load = record.getCellValue('Wielkość zamówienia (m3)');
  //
  //             const { lat, lng, addressName } = await fetchLatLng(postalCode);
  //
  //             return { id, postalCode, load, lat, lng, addressName };
  //           })
  //       );
  //
  //       setOrdersToRoute(filteredOrders);
  //     } else {
  //       setOrdersToRoute([]);
  //     }
  //   };
  //
  //   fetchOrdersToRoute().then();
  // }, [filterValue]);

  return (
    <Box>
      <Box
        padding="12px"
        borderRadius="8px"
        backgroundColor="#f8f9fa"
        boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
        border="1px solid #ddd"
      >
        <Text
          fontWeight="bold"
          fontSize="small"
          marginBottom="16px"
          color="#333"
        >
          Szybkie akcje
        </Text>
        <Box>
          <Button onClick={addAll} variant="primary" marginRight={2}>
            Dodaj wszystkie oczekujące
          </Button>
          <Button variant="primary" marginRight={2}>
            Dodaj wszystkie z czasem realizacji do 2 tygodnie
          </Button>
          <Button
            onClick={() => setOrdersToRoute([])}
            variant="danger"
            marginRight={2}
          >
            Usuń wybrane
          </Button>
          {/*<SelectButtons*/}
          {/*  value={filterValue}*/}
          {/*  onChange={(newValue) => setFilterValue(newValue)}*/}
          {/*  options={filterOptions}*/}
          {/*  size="large"*/}
          {/*  width="100%"*/}
          {/*  variant="outline"*/}
          {/*  borderColor="#007bff"*/}
          {/*/>*/}
        </Box>
      </Box>

      <Box
        padding="12px"
        borderRadius="8px"
        marginTop={3}
        backgroundColor="#f8f9fa"
        boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
        border="1px solid #ddd"
      >
        <Text
          fontWeight="bold"
          fontSize="small"
          marginBottom="16px"
          color="#333"
        >
          Filtry
        </Text>
        <Box>
          <Button variant="primary" marginRight={2}>
            Pilne
          </Button>
          <Button variant="primary" marginRight={2}>
            Przedawnione
          </Button>
        </Box>
      </Box>

      <SelectButtons
        value={currentOrdersView}
        onChange={(newValue) => setCurrentOrdersView(newValue)}
        options={ordersViewValues}
        size="large"
        width="100%"
        marginTop={3}
      />
      <Box height="90vh" borderRadius="8px" marginTop="16px" overflowY="auto">
        {currentOrdersView === 'all' && (
          <>
            {getFilteredRecords().map((order) => {
              return (
                <Box
                  key={order.id}
                  display="flex"
                  alignItems="center"
                  marginBottom="12px"
                  padding="12px"
                  borderRadius="8px"
                  backgroundColor="#f8f9fa"
                  boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                  border="1px solid #ddd"
                >
                  <Switch
                    value={isOrderSelected(order.id)}
                    onChange={(newValue) =>
                      handleSwitchChange(order.id, newValue)
                    }
                    label="Dodaj"
                    width="120px"
                    marginRight="16px"
                  />

                  <RecordCard record={order} />
                </Box>
              );
            })}
          </>
        )}

        {currentOrdersView === 'selected' && (
          <>
            {getSelectedRecords().map((order) => {
              return (
                <Box
                  key={order.id}
                  display="flex"
                  alignItems="center"
                  marginBottom="12px"
                  padding="12px"
                  borderRadius="8px"
                  backgroundColor="#f8f9fa"
                  boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
                  border="1px solid #ddd"
                >
                  <Button
                    onClick={() => handleRemoveOrder(order.id)}
                    marginRight={5}
                    variant="danger"
                  >
                    <Icon name="x" size={16} />
                  </Button>
                  <RecordCard record={order} />
                </Box>
              );
            })}
          </>
        )}
      </Box>
    </Box>
  );
};
