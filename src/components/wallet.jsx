import React from 'react';
import { Box, Text, VStack, Heading, Button } from '@chakra-ui/react';

const WalletCard = ({ amount, onClick }) => {
  return (
    <Box
      bg="gray.800"
      color="white"
      borderRadius="md"
      boxShadow="lg"
      p={6}
      w="full"
      maxW="xs"
    >
      <VStack spacing={4} align="start">
        <Heading size="md" color="teal.300">
          Wallet Balance
        </Heading>
        <Text fontSize="2xl" fontWeight="bold" color="white">
          ${amount.toFixed(2)}
        </Text>
        <Button colorScheme='purple' rounded={'md'} onClick={onClick}>
          Recharge
        </Button>
      </VStack>
    </Box>
  );
};

export default WalletCard;
