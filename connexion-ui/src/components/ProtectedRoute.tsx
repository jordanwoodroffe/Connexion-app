import React from "react";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";

const ProtectedRoute = () => {
  const navigate = useNavigate();

  return (
    <Box p={5}>
      <Button
        leftIcon={<ArrowBackIcon />}
        colorScheme="teal"
        variant="solid"
        mb={4}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
      <Heading as="h1" mb={4}>
        Protected Route
      </Heading>
      <Text>
        Only users with the 'CanViewProtectedRoute' permission can view this
        page.
      </Text>
    </Box>
  );
};

export default ProtectedRoute;
