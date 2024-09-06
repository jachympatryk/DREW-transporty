import {
  Box,
  RecordCard,
  Text,
  useBase,
  useRecords,
  Switch,
} from '@airtable/blocks/ui';
import React, { useContext } from 'react';
import { GlobalContext } from './global-context';

export const Fleet = () => {
  const base = useBase();
  const carsTable = base.getTableById('tblDCO3fgPIqjNw4s');
  const records = useRecords(carsTable.selectRecords());

  const { fleetConfiguration, setFleetConfiguration } =
    useContext(GlobalContext);

  const handleSwitchChange = (carId, isChecked) => {
    const selectedRecord = records.find((record) => record.id === carId);

    if (isChecked && selectedRecord) {
      const pricePerKm = selectedRecord.getCellValue('Cena za kilometr');
      const loadCapacity = selectedRecord.getCellValue('Ładowność');

      setFleetConfiguration((prev) => [
        ...prev,
        { id: carId, pricePerKm, loadCapacity },
      ]);
    } else {
      setFleetConfiguration((prev) => prev.filter((car) => car.id !== carId));
    }
  };

  const isCarSelected = (carId) => {
    return fleetConfiguration.some((car) => car.id === carId);
  };

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
        Wybierz samochody:
      </Text>

      <Box>
        {records.map((car) => (
          <Box
            key={car.id}
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
              value={isCarSelected(car.id)}
              onChange={(newValue) => handleSwitchChange(car.id, newValue)}
              label="Dodaj"
              width="120px"
              marginRight="16px"
            />

            <RecordCard
              record={car}
              backgroundColor="#fff"
              padding="8px"
              borderRadius="8px"
              boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
