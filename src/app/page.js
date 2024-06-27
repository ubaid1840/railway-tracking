'use client'

import { useState, useRef, useEffect } from "react";
import { Box, Button, Heading, VStack, Text, HStack, Stack, useToast, Image as ChakraImage } from "@chakra-ui/react";
import { useRouter } from 'next/navigation';
import Webcam from "react-webcam";
import axios from "axios";
import { addDoc, collection, doc, getDoc, getDocs, limit, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import LoadingIndicator from "@/components/loadingIndicator";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [picture, setPicture] = useState(null);
  const [cameraMode, setCameraMode] = useState(false);
  const webcamRef = useRef(null);
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedIn(true)
      } else {
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleFileChange = (e) => {
    setPicture(e.target.files[0]);
  };

  const handleCameraCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "capture.png", { type: "image/png" });
        setPicture(file);
        setCameraMode(false);
      });
  };

  const handleSubmit = async () => {
    try {
      let list = []
      const formData = new FormData();
      formData.append('image', picture);
      let wallet = 0
      const date = new Date()

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/verify`, formData)
        .then(async (response) => {
          if (response.data.username) {
            await getDocs(query(collection(db, 'Data'), where('email', '==', response.data.username), limit(1)))
            .then((snaphshot) => {
              snaphshot.forEach((docs) => {
                list.push({ ...docs.data(), id: docs.id })
              })
            })
          if (list.length == 0) {
            await addDoc(collection(db, 'Data'), {
              email: response.data.username,
              startTime: date.getTime()
            })
              .then(() => {
                toast({
                  title: "Submitted.",
                  description: "Image verified.",
                  status: "success",
                  duration: 5000,
                  isClosable: true,
                });
              
              })
          } else {
            if (list[0].endTime) {
              await addDoc(collection(db, 'Data'), {
                email: response.data.username,
                startTime: date.getTime()
              })
                .then(() => {
                  toast({
                    title: "Submitted.",
                    description: "Image verified.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                  });
                
                })
            } else {
              const difference = date.getTime() - list[0].startTime
              const inMinutes = difference / 60000
              const fare = inMinutes.toFixed(0) * process.env.NEXT_PUBLIC_FARE
              await updateDoc(doc(db, 'Data', list[0].id), {
                endTime: date.getTime(),
                fare: fare
              }).then(async () => {
                await getDoc(doc(db, 'Users', response.data.username))
                  .then(async (docs) => {
                    wallet = docs.data().wallet
                    wallet = wallet - fare
                    await updateDoc(doc(db, 'Users', response.data.username), {
                      wallet: wallet
                    })
                      .then(() => {
                        toast({
                          title: "Submitted.",
                          description: "Image verified.",
                          status: "success",
                          duration: 5000,
                          isClosable: true,
                        });
                        if (wallet < 10) {
                          toast({
                            title: "Low balance.",
                            description: "Kindly recharge your account.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                          });
                        }
                      })
                  })
    
               
              })
    
            }
          }

          }
          if (response.data.message) {
            toast({
              title: "Error.",
              description: "Image not verified.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }

        })

    } catch (error) {
      toast({
        title: "Submission failed.",
        description: "Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPicture(null)
      setLoading(false)
    }
  };

  return (
    <Box
      w="100vw"
      h="100vh"
      display="flex"
      flexDirection="column"
      bg="gray.900"
      bgImage="/image4.jpg"
      bgRepeat="no-repeat"
      bgSize="cover"
      bgPosition="center"
      alignItems="center"

    >
      <HStack w="100%" justifyContent="flex-end" p={4} >
        {loggedIn
          ? <Button colorScheme="blue" size="sm" onClick={() => router.push('/dashboard')}>Dashboard</Button>
          :
          <Button colorScheme="blue" size="sm" onClick={() => router.push('/login')}>Login</Button>
        }

        <Button colorScheme="blue" size="sm" onClick={() => router.push('/signup')}>Signup</Button>
      </HStack>

      <VStack
        spacing={6}
        boxShadow="lg"
        p={8}
        bg="rgba(0, 0, 0, 0.6)"
        borderRadius="xl"
        w="90%"
        maxW="lg"
        textAlign="center"
        alignSelf={'center'}
      >
        <Heading size="lg" color="orange.300">Railway Tracking System</Heading>
        <Text fontSize="md" color="gray.400">A modern way to track fares using facial recognition.</Text>

        {!cameraMode && (
          <Stack spacing={4} alignItems="center">
            <Text fontSize="sm" color="white">Select a picture to recognize or use your camera</Text>
            <HStack spacing={4}>
              <Button as="label" colorScheme="blue" size="md">
                Select Picture
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Button>
              <Button colorScheme="blue" size="md" onClick={() => setCameraMode(true)}>Use Camera</Button>
            </HStack>
          </Stack>
        )}

        {cameraMode && (
          <VStack spacing={4} alignItems="center">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              width={320}
              height={240}
              videoConstraints={{ facingMode: "user" }}
            />
            <HStack spacing={4}>
              <Button colorScheme="green" size="md" onClick={handleCameraCapture}>Capture</Button>
              <Button colorScheme="red" size="md" onClick={() => setCameraMode(false)}>Cancel</Button>
            </HStack>
          </VStack>
        )}

        {picture && (
          <Box>
            <Text fontSize="sm" color="white">Selected Image:</Text>
            <ChakraImage
              src={URL.createObjectURL(picture)}
              alt="Selected"
              boxSize="200px"
              objectFit="cover"
              borderRadius="md"
              mt={2}
            />
          </Box>
        )}

        <Button onClick={() => {
          setLoading(true)
          handleSubmit()
        }} colorScheme="blue" size="md" isDisabled={!picture}>Submit</Button>
      </VStack>
      {loading ? <LoadingIndicator /> : null}
    </Box>
  );
}
