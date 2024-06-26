"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  ChakraProvider,
  HStack,
} from "@chakra-ui/react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/loadingIndicator";
import { collection, getDocs, query, where } from "firebase/firestore";
import moment from "moment";

export default function Dashboard() {
  const [userData, setUserData] = useState([]);
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email);
      } else {
        router.push("/");
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (email) {
      fetchUserData();
    }
  }, [email]);

  async function fetchUserData() {
    try {
      let list = [];
      await getDocs(
        query(collection(db, "Data"), where("email", "==", email))
      ).then((snapshot) => {
        snapshot.forEach((docs) => {
          list.push(docs.data());
        });
      });
      const sortedData = list.sort((a, b) => a.timeStamp - b.timeStamp);
      const updatedArray = [];
      for (let i = 0; i < sortedData.length - 1; i += 2) {
        const startTimeObject = sortedData[i];
        const endTimeObject = sortedData[i + 1];

        const newObject = {
          startTime: startTimeObject.timeStamp,
          endTime: endTimeObject ? endTimeObject.timeStamp : null,
        };

        updatedArray.push(newObject);
      }
      if (sortedData.length % 2 !== 0) {
        const lastObject = sortedData[sortedData.length - 1];
        const lastObjectEntry = {
          startTime: lastObject.timeStamp,
          endTime: "",
        };
        updatedArray.push(lastObjectEntry);
      }
      updatedArray.reverse()
      setUserData(updatedArray);
    } catch (error) {
      toast({
        title: "Failed to fetch data.",
        description: "Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    signOut(auth).then(() => {
      router.push("/");
    });
  }

  function calculateFare(start, end) {
    if (!end) {
      return "";
    } else {
      const difference = end - start;
      const inMinutes = difference / 60000;
      return inMinutes.toFixed(0) * process.env.NEXT_PUBLIC_FARE;
    }
  }

  return (
    <Box
      w="100%"
      minH="100vh"
      display="flex"
      flexDir="column"
      alignItems="center"
      bg="gray.900"
    >
      <HStack w="100%" justifyContent="flex-end" p={4} spacing={4}>
        <Button colorScheme="blue" size="sm" onClick={() => router.push("/")}>
          Home
        </Button>
        <Button colorScheme="blue" size="sm" onClick={() => handleLogout()}>
          Logout
        </Button>
      </HStack>
      <VStack
        spacing={8}
        boxShadow="2xl"
        p={8}
        bg="gray.800"
        borderRadius="xl"
        w={{sm : '100%', md : '90%', lg : '80%' }}
        textAlign="center"
        overflowX={'auto'}
      >
        <Heading size="lg" color="teal.300">
          Dashboard
        </Heading>
        <Table variant="simple" colorScheme="teal" size="md" minWidth={'100%'}>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Start Time</Th>
              <Th>End Time</Th>
              <Th>Fare</Th>
            </Tr>
          </Thead>
          <Tbody>
            {userData.map((user, index) => (
              <Tr key={index}>
                <Td>{moment(new Date(user?.startTime)).format("LL")}</Td>
                <Td>{moment(new Date(user?.startTime)).format("LT")}</Td>
                <Td>{user.endTime ? moment(new Date(user?.endTime)).format("LT") : ""}</Td>
                <Td>{calculateFare(user.startTime, user.endTime)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
      {loading && <LoadingIndicator />}
    </Box>
  );
}
