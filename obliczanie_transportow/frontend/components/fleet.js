import {
  Box,
  RecordCardList,
  useBase,
  useRecords,
  SelectButtons,
  Input,
  Label,
  Text,
} from '@airtable/blocks/ui';
import React, { useContext, useState, useEffect } from 'react';
import { GlobalContext } from './global-context';

export const Fleet = () => {
  const base = useBase();
  const carsTable = base.getTableById('tblDCO3fgPIqjNw4s');
  const queryResult = carsTable.selectRecords();
  const records = useRecords(queryResult);

  const { fleetConfiguration, setFleetConfiguration } =
    useContext(GlobalContext);

  const [selectedCar, setSelectedCar] = useState(null);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('21:00');

  const carOptions = records.map((record) => ({
    value: record.id,
    label: record.name || record.getCellValueAsString('Name'),
  }));

  const options = [...carOptions];

  const filteredRecords = selectedCar
    ? records.filter((record) => record.id === selectedCar)
    : records;

  const updateFleetConfiguration = () => {
    if (selectedCar) {
      const selectedRecord = records.find(
        (record) => record.id === selectedCar
      );

      if (selectedRecord) {
        const pricePerKm = selectedRecord.getCellValue('Cena za kilometr');
        const loadCapacity = selectedRecord.getCellValue('Ładowność');

        const existingCar = fleetConfiguration.find(
          (car) => car.id === selectedCar
        );

        if (existingCar) {
          const updatedConfiguration = fleetConfiguration.map((car) =>
            car.id === selectedCar
              ? { ...car, startTime, endTime, pricePerKm, loadCapacity }
              : car
          );
          setFleetConfiguration(updatedConfiguration);
        } else {
          setFleetConfiguration([
            ...fleetConfiguration,
            { id: selectedCar, startTime, endTime, pricePerKm, loadCapacity },
          ]);
        }
      }
    }
  };

  useEffect(() => {
    updateFleetConfiguration();
  }, [selectedCar, startTime, endTime]);

  return (
    <Box
      padding="24px"
      backgroundColor="white"
      borderRadius="12px"
      boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
    >
      {/* Sekcja wyboru samochodu */}
      <Text fontWeight="bold" marginBottom="8px">
        Wybierz samochód:
      </Text>
      <SelectButtons
        value={selectedCar}
        onChange={(newValue) => setSelectedCar(newValue)}
        options={options}
        size="large"
        width="100%"
        variant="outline"
        borderColor="#007bff"
        marginBottom="16px"
      />

      {/* Sekcja wyboru godzin pracy */}
      <Box
        display="flex"
        flexDirection="row"
        backgroundColor="#faf0e6"
        border="1px solid #e0e0e0"
        borderRadius="8px"
        padding="16px"
        gap="16px"
        marginBottom="16px"
      >
        <Box flex="1" display="flex" flexDirection="column">
          <Label htmlFor="startTime" marginBottom="4px" fontWeight="bold">
            Godzina rozpoczęcia pracy
          </Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            border="1px solid #ddd"
            borderRadius="6px"
            backgroundColor="white"
            padding="8px"
            width="100%"
          />
        </Box>

        <Box flex="1" display="flex" flexDirection="column">
          <Label htmlFor="endTime" marginBottom="4px" fontWeight="bold">
            Godzina zakończenia pracy
          </Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            border="1px solid #ddd"
            borderRadius="6px"
            backgroundColor="white"
            padding="8px"
            width="100%"
          />
        </Box>
      </Box>

      {/* Sekcja wyświetlania rekordów */}
      <Box
        height="135px"
        border="1px solid #e0e0e0"
        borderRadius="8px"
        backgroundColor="#f4f4f9"
        padding="16px"
        overflowY="auto"
      >
        <RecordCardList records={filteredRecords} />
      </Box>
    </Box>
  );
};

export default Fleet;
