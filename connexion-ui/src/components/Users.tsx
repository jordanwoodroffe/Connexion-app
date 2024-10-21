import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  List,
  ListItem,
  Spinner,
  Stack,
  Text,
  useToast,
  Center,
} from "@chakra-ui/react";
import axios from "axios";

interface User {
  UserId: string;
  Name: string;
  PermissionsOverride: string[];
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get<User[]>("http://localhost:8080/user", {
    headers: { "X-User-Id": "5" }, // Hardcoded admin user ID, this would normally be the logged in user's token
  });
  return response.data;
};

const Users = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    data: users,
    error,
    isLoading,
  } = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  if (isLoading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    toast({
      title: "Error fetching users.",
      description: "There was an error fetching the users.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
    return <Text>Error loading users</Text>;
  }

  const handleAccessProtected = (permissions: string[] | undefined) => {
    if (
      Array.isArray(permissions) &&
      permissions.includes("CanViewProtectedRoute")
    ) {
      navigate("/protectedroute");
    } else {
      toast({
        title: "Access denied.",
        description: "You do not have permission to view this route.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={5}>
      <Heading mb={5}>Users</Heading>
      <List spacing={3}>
        {users?.map((user) => (
          <ListItem key={user.UserId} p={3} borderWidth="1px" borderRadius="md">
            <Stack
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align="center"
            >
              <Text>{user.Name}</Text>
              <Button
                colorScheme="blue"
                onClick={() => handleAccessProtected(user.PermissionsOverride)}
              >
                Access protected page
              </Button>
            </Stack>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Users;
