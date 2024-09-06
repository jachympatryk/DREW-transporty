import { Box, Input, Label, Select, Text } from '@airtable/blocks/ui';
import React, { useContext, useState } from 'react';
import { GlobalContext } from './global-context';

export const Settings = () => {
  const { routeDay, setRouteDay } = useContext(GlobalContext);
  const [hours, setHours] = useState(12);

  const hoursOptions = Array.from({ length: 24 }, (_, i) => i + 1).map(
    (hour) => ({
      value: hour,
      label: `${hour} godzin${hour === 1 ? '' : 'y'}`,
    })
  );

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
        Ustawienia tras
      </Text>

      <Box
        display="flex"
        alignItems="center"
        padding="12px"
        borderRadius="8px"
        backgroundColor="#f8f9fa"
        boxShadow="0 2px 4px rgba(0, 0, 0, 0.05)"
        border="1px solid #ddd"
      >
        <Box width="100%" marginRight={3}>
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

        <Box width="100%" marginLeft={3}>
          <Label htmlFor="hoursSelect" marginBottom="4px" fontWeight="bold">
            Ilość godzin pracy
          </Label>
          <Select
            id="hoursSelect"
            options={hoursOptions}
            value={hours}
            onChange={(newValue) => setHours(newValue)}
            border="1px solid #ddd"
            borderRadius="6px"
            backgroundColor="white"
            padding="8px"
            width="100%"
          />
        </Box>
      </Box>
    </Box>
  );
};
