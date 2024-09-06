import {
  Box,
  Button,
  Heading,
  useBase,
  useRecords,
  Text,
  ProgressBar,
} from '@airtable/blocks/ui';
import React, { useContext, useState } from 'react';
import { fetchLatLng } from '../utils/geocoding';
import { GlobalContext } from './global-context';

// const data = {
//   total_travel_time: 365,
//   total_idle_time: 0,
//   total_visit_lateness: 0,
//   total_vehicle_overtime: 0,
//   vehicle_overtime: {
//     recjKBCRFYgWuo3wa: 0,
//     recxw8bNMtSifdcxl: 0,
//   },
//   total_break_time: 0,
//   num_unserved: 0,
//   unserved: null,
//   solution: {
//     recjKBCRFYgWuo3wa: [
//       {
//         location_id: 'base',
//         location_name: '33-100 Tarnów',
//         distance: 0,
//       },
//       {
//         location_id: 'recEl7V4PVzy8gDvp',
//         location_name: '33-151 Stare Żukowice, Poland',
//         distance: 18653.8,
//       },
//       {
//         location_id: 'base',
//         location_name: '33-100 Tarnów',
//         distance: 18897,
//       },
//     ],
//     recxw8bNMtSifdcxl: [
//       {
//         location_id: 'base',
//         location_name: '33-100 Tarnów',
//         distance: 0,
//       },
//       {
//         location_id: 'recLy9q3OIBRl8MFw',
//         location_name: '42-200 Częstochowa, Poland',
//         distance: 228621.8,
//       },
//       {
//         location_id: 'rece8R0aFAVDaTeTd',
//         location_name: '30-003 Kraków, Poland',
//         distance: 145209.7,
//       },
//       {
//         location_id: 'base',
//         location_name: '33-100 Tarnów',
//         distance: 84676.9,
//       },
//     ],
//   },
//   total_working_time: 365,
//   status: 'success',
//   num_late_visits: 0,
//   pl_precision: 6,
//   distances: {
//     recjKBCRFYgWuo3wa: 37.5508,
//     recxw8bNMtSifdcxl: 458.50840000000005,
//   },
//   total_distance: 496.05920000000003,
// };

export const RoutesInterface = ({ data }) => {
  const base = useBase();
  const { routeDay, setRoutesData, setOrdersToRoute, setFleetConfiguration } =
    useContext(GlobalContext);

  const carsTable = base.getTableById('tblDCO3fgPIqjNw4s');
  const ordersTable = base.getTableById('tblIdbNUshv6PjJil');
  const productsTable = base.getTableById('tblWA4P0D8aMioE1W');
  const totalSalesTable = base.getTableById('tblWfOyXw0Kax4bfQ');
  const transportsTable = base.getTableById('tblvwvsojXOGQCCSs');

  const carsRecords = useRecords(carsTable.selectRecords());
  const ordersRecords = useRecords(ordersTable.selectRecords());
  const productsRecords = useRecords(productsTable.selectRecords());
  const totalSalesRecords = useRecords(totalSalesTable.selectRecords());

  const [selectedRoute, setSelectedRoute] = useState(
    Object.keys(data[0]?.solution)[0]
  );

  const getCar = (id) => carsRecords.find((car) => car.id === id);

  const switchRoute = (routeId) => {
    setSelectedRoute(routeId);
  };

  const currentRoute =
    data.find((item) => item.solution[selectedRoute])?.solution[
      selectedRoute
    ] || [];
  const routeDistance =
    data.find((item) => item.distances[selectedRoute])?.distances[
      selectedRoute
    ] || 0;

  const routePriceValue = () => {
    const currentCar = getCar(selectedRoute);
    if (!currentCar) return 0;

    const pricePerKm = currentCar.getCellValue('Cena za kilometr');
    const loadPrice = currentCar.getCellValue('Opłata za załadunek');
    const price = routeDistance * pricePerKm + loadPrice;
    return price.toFixed(2);
  };

  const calculateTotalLoad = () => {
    let total = 0;
    currentRoute.forEach((route) => {
      const orderLoad = ordersRecords.find(
        (order) =>
          order.id === route.location_id && route.location_name !== 'base'
      );
      if (orderLoad) {
        const loadSize = orderLoad.getCellValue('Wielkość zamówienia (m3)');
        if (typeof loadSize === 'number') {
          total += loadSize;
        }
      }
    });
    return total;
  };

  const totalLoad = calculateTotalLoad();

  const getMaxLoad = () => {
    const currentCar = getCar(selectedRoute);
    return currentCar ? currentCar.getCellValue('Ładowność') : 0;
  };

  const maxLoad = getMaxLoad();
  const percentLoad = maxLoad > 0 ? (totalLoad / maxLoad) * 100 : 0;

  const getBarColor = (percentLoad) => {
    if (percentLoad < 50) {
      return 'red';
    } else if (percentLoad >= 50 && percentLoad < 85) {
      return 'orange';
    } else {
      return 'green';
    }
  };

  const calculateTotalProfit = () => {
    let baseProductsPrice = 0;
    let salesValue = 0;

    const orderMap = new Map(
      ordersRecords.map((record) => [record.id, record])
    );
    const saleRecordMap = new Map(
      totalSalesRecords.map((record) => [record.id, record])
    );
    const productMap = new Map(
      productsRecords.map((record) => [record.id, record])
    );

    currentRoute.forEach((route) => {
      if (route.location_id !== 'base') {
        const order = orderMap.get(route.location_id);
        if (!order) return;

        const salesItems = order.getCellValue('Sprzedaż') || [];
        salesItems.forEach((salesItem) => {
          const saleRecord = saleRecordMap.get(salesItem.id);
          if (!saleRecord) return;

          const saleProducts = saleRecord.getCellValue('Produkt') || [];
          const totalLoad = saleRecord.getCellValue('Ilość (m3)');
          const totalValue = saleRecord.getCellValue('Wartość całkowita');

          if (typeof totalValue === 'number') {
            salesValue += totalValue;
          }

          saleProducts.forEach((productItem) => {
            const product = productMap.get(productItem.id);
            if (!product) return;

            const basePrice = product.getCellValue('Cena bazowa');
            if (
              typeof basePrice === 'number' &&
              typeof totalLoad === 'number'
            ) {
              baseProductsPrice += totalLoad * basePrice;
            }
          });
        });
      }
    });

    const routeCost = Number(routePriceValue());
    const profit = salesValue - (baseProductsPrice + routeCost);

    return profit.toFixed(2);
  };

  const totalProfit = calculateTotalProfit();

  const handleCreateTransport = async () => {
    try {
      if (!transportsTable) {
        console.error('Tabela "Transporty" nie została znaleziona.');
        return;
      }

      const transportDateField = 'fldF85YatkC6TWx9f';
      const routeCarField = 'fldiytLkoal3K0qrc';
      const numberOfKmField = 'fld82qsdUf5p1JSuf';
      const totalLoadField = 'fld3iI8IjF44rLgt3';
      const percentageLoadField = 'fldFQfIWP9LuPMA3z';
      const totalRouteCostField = 'fldnKJs4KaBoesmzu';
      const ordersField = 'fldNkPYEdSG8kwWND';
      const totalProfitField = 'fldxLOGQGT4hLF736';

      const orders = currentRoute
        .filter((order) => order.location_id !== 'base')
        .map((order) => ({ id: order.location_id }));

      const newTransportData = {
        fields: {
          [transportDateField]: routeDay,
          [numberOfKmField]: routeDistance,
          [routeCarField]: [{ id: selectedRoute }],
          [totalLoadField]: Number(totalLoad.toFixed(2)),
          [percentageLoadField]: Number(percentLoad.toFixed(2)),
          [totalRouteCostField]: Number(routePriceValue()),
          [ordersField]: orders,
          [totalProfitField]: Number(totalProfit),
        },
      };

      const createdRecord = await transportsTable.createRecordAsync(
        newTransportData.fields
      );

      const ordersStatusField = 'fldonsYCVF9CaoUo5';
      const updates = orders.map((order) => ({
        id: order.id,
        fields: { [ordersStatusField]: { name: 'Zaplanowane' } },
      }));

      await ordersTable.updateRecordsAsync(updates);
      console.log('Status zamówień został zaktualizowany.');

      setRoutesData(null);
      setOrdersToRoute([]);
      setFleetConfiguration([]);

      console.log('Nowy transport utworzony:', createdRecord);
      alert('Nowy transport został utworzony!');
    } catch (error) {
      console.error('Błąd podczas tworzenia nowego transportu:', error);
      alert('Wystąpił błąd podczas tworzenia nowego transportu.');
    }
  };

  return (
    <Box
      backgroundColor="white"
      border="1px solid #e0e0e0"
      borderRadius="12px"
      minHeight="120px"
      marginTop="16px"
      padding="24px"
      width="100%"
      boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
    >
      <Heading size="small" marginBottom="16px">
        Trasy
      </Heading>
      {/* Przyciski do przełączania tras */}
      <Box display="flex" marginBottom="24px" flexWrap="wrap" gap="12px">
        {data.map(({ solution }) =>
          Object.keys(solution).map((routeId) => (
            <Button
              key={routeId}
              onClick={() => switchRoute(routeId)}
              variant={routeId === selectedRoute ? 'primary' : 'default'}
              size="large"
              marginBottom="8px"
            >
              {getCar(routeId)?.name || routeId}
            </Button>
          ))
        )}
      </Box>

      <Box padding="16px" border="1px solid #e0e0e0" borderRadius="8px">
        {currentRoute.map((location, index) => {
          return (
            <Box
              key={index}
              padding="12px"
              border="1px solid #ddd"
              borderRadius="8px"
              marginBottom="8px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              backgroundColor="#f9f9f9"
            >
              <Box display="flex" flexDirection="column">
                <Text textColor="light" fontSize="small">
                  {location.location_id === 'base'
                    ? 'Baza'
                    : `Miejsce: ${index + 1}`}
                </Text>
                <Text textColor="light" fontSize="small">
                  {location.location_id === 'base'
                    ? ''
                    : `ID: ${location.location_id}`}
                </Text>
              </Box>
              <Box display="flex" flexDirection="column">
                <Text fontWeight="bold">
                  {location.location_name.replace(', Poland', '')}
                </Text>
              </Box>
            </Box>
          );
        })}

        <Box marginTop="16px">
          <Text marginBottom="4px">
            <strong>Ładunek:</strong> {totalLoad.toFixed(2)} m³
          </Text>
          <Text marginBottom="4px">
            <strong>Całkowity dystans:</strong> {routeDistance.toFixed(2)} km
          </Text>
          <Text marginBottom="4px">
            <strong>Cena transportu:</strong> {routePriceValue()} ZŁ
          </Text>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          marginBottom="16px"
          marginTop="8px"
          gap="8px"
        >
          <Text flexShrink={0} marginRight={3}>
            <strong>Procentowe załadowanie:</strong> {percentLoad.toFixed(2)}%
          </Text>
          <ProgressBar
            barColor={getBarColor(percentLoad)}
            progress={percentLoad / 100}
            aria-label="Procentowe załadowanie samochodu"
            flexGrow={1}
          />
        </Box>

        <Text
          marginBottom="0"
          fontSize="large"
          textColor={totalProfit > 1 ? 'green' : 'tomato'}
          fontWeight="bold"
        >
          Zysk: {totalProfit} ZŁ
        </Text>
      </Box>
      <Box display="flex" justifyContent="flex-end" padding="16px">
        <Button
          type="submit"
          onClick={handleCreateTransport}
          style={{ backgroundColor: '#128d1e', color: '#fff' }}
        >
          Utwórz transport
        </Button>
      </Box>
    </Box>
  );
};
