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
  Text,
  useToast,
  Center,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import axios from "axios";

interface User {
  UserId: string;
  Name: string;
  PermissionsOverride: string[];
  Role: string;
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

  const handleAccessProtected = async (userId: string) => {
    try {
      const response = await axios.get<{ permissions: string[] }>(
        `http://localhost:8080/user/${userId}/permissions`,
        {
          headers: { "X-User-Id": "5" }, // Hardcoded admin user ID, this would normally be the logged in user's token
        }
      );

      const { permissions } = response.data;

      if (permissions.includes("CanViewProtectedRoute")) {
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
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while checking permissions.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={5}>
      <Heading mb={5}>Users</Heading>
      <Grid
        templateColumns={{ base: "1fr", md: "2fr 2fr 1fr 1fr" }}
        gap={4}
        alignItems="center"
        mb={3}
        fontWeight="bold"
      >
        <GridItem>
          <Text>ID</Text>
        </GridItem>
        <GridItem>
          <Text>Name</Text>
        </GridItem>
        <GridItem>
          <Text>Role</Text>
        </GridItem>
        <GridItem>
          <Text>Action</Text>
        </GridItem>
      </Grid>
      <List spacing={3}>
        {users?.map((user) => (
          <ListItem key={user.UserId} p={3} borderWidth="1px" borderRadius="md">
            <Grid
              templateColumns={{ base: "1fr", md: "2fr 2fr 1fr 1fr" }}
              gap={4}
              alignItems="center"
            >
              <GridItem>
                <Text>{user.UserId}</Text>
              </GridItem>
              <GridItem>
                <Text>{user.Name}</Text>
              </GridItem>
              <GridItem>
                <Text>{user.Role}</Text>
              </GridItem>
              <GridItem>
                <Button
                  colorScheme="blue"
                  onClick={() => handleAccessProtected(user.UserId)}
                >
                  Access protected page
                </Button>
              </GridItem>
            </Grid>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Users;
