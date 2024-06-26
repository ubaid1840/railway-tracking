'use client'

import { useState, useRef, useEffect } from "react";
import { Box, Button, Heading, VStack, Text, HStack, Stack, useToast, Image as ChakraImage } from "@chakra-ui/react";
import { useRouter } from 'next/navigation';
import Webcam from "react-webcam";
import axios from "axios";
import { addDoc, collection, doc } from "firebase/firestore";
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
     
      await axios.post('/api/verify', formData)
      .then(async()=>{
        const formData = new FormData();
        formData.append('picture', picture);
        const date = new Date()
        await addDoc(collection(db, 'Data'), {
          email: 'ubaid@gmail.com',
          timeStamp: date.getTime()
        })
          .then(() => {
            
      toast({
        title: "Submitted.",
        description: "Your image has been submitted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
            setPicture(null)
          })
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
