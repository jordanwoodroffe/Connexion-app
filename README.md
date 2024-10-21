# connexion-rbac

## Description

connexion-rbac is the backend service responsible for managing user roles and permissions using DynamoDB. It provides RESTful APIs for creating, reading, updating, and deleting users, as well as managing their permissions.

### Running the Application

Please paste the emailed .env which required AWS credentials to connect to DB inside of connexion-rbac root directory

1. **Install dependencies**:
   npm install

2. **Start the development server**:
   npm run dev

## Design Choices

- Node.js and Express: Chosen for its simplicity and performance in building RESTful APIs.
- DynamoDB: Used for its scalability and flexibility in managing user data.
- AWS SDK: Utilized for interacting with DynamoDB and other AWS services.

## DynamoDB Schema

- Table Name: connexion-users
- Primary Key: UserId (string)
- Attributes:

  - Name (string)
  - Username (string)
  - Email (string)
  - Role (string)
  - PermissionsOverride (array of strings)

- Table Name: connexion-roles
- Primary Key: RoleId (string)
- Attributes:
  - Name (string)
  - Username (string)
  - Email (string)
  - Role (string)
  - PermissionsOverride (array of strings)

## CI/CD

![image](https://github.com/user-attachments/assets/1bfcca30-39dd-4c2a-9546-082dc0ebd891)

- GitHub Actions: Used for continuous integration and deployment.
- Manual Trigger: A GitHub Actions workflow is set up to manually trigger the creation of a randomized user.

## Example Basic CDK for Backend
```
import _ as cdk from '@aws-cdk/core';
import _ as dynamodb from '@aws-cdk/aws-dynamodb';

export class BackendStack extends cdk.Stack {
constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
super(scope, id, props);

    new dynamodb.Table(this, 'UsersTable', {
      partitionKey: { name: 'UserId', type: dynamodb.AttributeType.STRING },
      tableName: 'connexion-users',
    });

}
}
```

## Project Structure

- connexion-rbac
  - src
    - routes
    - middleware
    - models
  - package.json
  - README.md

## Role System

### Admin Role

**Permissions**:

- CanCreateUser
- CanReadUser
- CanUpdateUser
- CanDeleteUser
- CanViewProtectedRoute

### Staff Role

**Permissions**:

- CanReadUser
- CanViewProtectedRoute (If Permissions/ PermissionOverrides array contains 'CanViewProtectedRoute' on user)

## API Documentation and Test Curls

### GET USER

Fetch a specific user by their `UserId`.

**Request:**

```
curl -X GET "http://localhost:8080/user/1" \
 -H "Content-Type: application/json" \
 -H "X-User-Id: 5"
```

**Response:**

- **200 OK**: Returns the user details.
- **404 Not Found**: If the user does not exist.
- **401 Unauthorized**: If the `X-User-Id` header is missing or invalid.

**Response Body:**

```json
{
  "UserId": "1",
  "Name": "John Doe",
  "Username": "johndoe",
  "Email": "johndoe@example.com",
  "Role": "Admin",
  "PermissionsOverride": ["CanEditUser"]
}
```

### GET ALL USERS

Fetch all users.

**Request:**

```
curl -X GET "http://localhost:8080/user" \
 -H "Content-Type: application/json" \
 -H "X-User-Id: 5"
```

**Response:**

- **200 OK**: Returns a list of all users.
- **401 Unauthorized**: If the `X-User-Id` header is missing or invalid.

**Response Body:**

```json
[
  {
    "UserId": "1",
    "Name": "John Doe",
    "Username": "johndoe",
    "Email": "johndoe@example.com",
    "Role": "Admin",
    "PermissionsOverride": ["CanEditUser"]
  },
  {
    "UserId": "2",
    "Name": "Jane Smith",
    "Username": "janesmith",
    "Email": "janesmith@example.com",
    "Role": "User",
    "PermissionsOverride": []
  }
]
```

### CREATE USER

Create a new user.

**Request:**

```
curl -X POST "http://localhost:8080/user" \
 -H "Content-Type: application/json" \
 -H "X-User-Id: 5" \
 -d '{
  "UserId": "INSERT_USER_ID",
  "Name": "Cherry Mathers",
  "Username": "cherrymathers",
  "Email": "cherrymathers@example.com",
  "Role": "Staff"
}'
```

**Response:**

- **201 Created**: If the user is created successfully.
- **400 Bad Request**: If the request body is invalid.
- **401 Unauthorized**: If the `X-User-Id` header is missing or invalid.

**Response Body:**

```json
{
  "message": "User created successfully"
}
```

### DELETE USER

Delete a specific user by their `UserId`.

**Request:**

```
curl -X DELETE "http://localhost:8080/user/6" \
 -H "Content-Type: application/json" \
 -H "X-User-Id: 5"
```

**Response:**

- **200 OK**: If the user is deleted successfully.
- **404 Not Found**: If the user does not exist.
- **401 Unauthorized**: If the `X-User-Id` header is missing or invalid.

**Response Body:**

```json
{
  "message": "User deleted successfully"
}
```

### UPDATE USER

Update a specific user by their `UserId`.

**Request:**

```
curl -X PUT "http://localhost:8080/user/1" \
 -H "Content-Type: application/json" \
 -H "X-User-Id: 5" \
 -d '{
  "Name": "Jane Doe",
  "Username": "janedoe",
  "Email": "janedoe@example.com",
  "Role": "User",
  "PermissionsOverride": ["CanViewProtectedRoute"]
}'
```

**Response:**

- **200 OK**: If the user is updated successfully.
- **404 Not Found**: If the user does not exist.
- **400 Bad Request**: If the request body is invalid.
- **401 Unauthorized**: If the `X-User-Id` header is missing or invalid.

**Response Body:**

```json
{
  "UserId": "1",
  "Name": "Jane Doe",
  "Username": "janedoe",
  "Email": "janedoe@example.com",
  "Role": "User",
  "PermissionsOverride": ["CanViewProtectedRoute"]
}
```

### TypeScript Types

**User Type:**

```typescript
interface User {
  UserId: string;
  Name: string;
  Username: string;
  Email: string;
  Role: string;
  PermissionsOverride: string[];
}
```

**Role Type:**

```typescript
interface Role {
  RoleId: string;
  Permissions: string[];
}
```

**Create User Request:**

```typescript
interface CreateUserRequest {
  UserId: string;
  Name: string;
  Username: string;
  Email: string;
  Role: string;
}
```

**Update User Request:**

```typescript
interface UpdateUserRequest {
  Name?: string;
  Username?: string;
  Email?: string;
  Role?: string;
  PermissionsOverride?: string[];
}
```

**Create/Update User Response:**

```typescript
interface CreateUserResponse {
  message: string;
}

interface UpdateUserResponse extends User {}
```

**Get User Response:**

```typescript
interface GetUserResponse extends User {}
```

**Get All Users Response:**

```typescript
type GetAllUsersResponse = User[];
```

**Delete User Response:**

```typescript
interface DeleteUserResponse {
  message: string;
}
```

---

# connexion-ui

## Description

connexion-ui is the frontend application built with React and Chakra UI. It provides a user interface for viewing users and accessing a protected route.

## Design Choices

- React: Chosen for its component-based architecture and ease of use.
- Chakra UI: Used for its accessible and customizable component library.
- React Query: Utilized for data fetching and state management.

## Example Basic CDK for Frontend

```
import _ as cdk from '@aws-cdk/core';
import _ as s3 from '@aws-cdk/aws-s3';
import _ as cloudfront from '@aws-cdk/aws-cloudfront';
import _ as s3deploy from '@aws-cdk/aws-s3-deployment';

export class FrontendStack extends cdk.Stack {
constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
super(scope, id, props);

    const bucket = new s3.Bucket(this, 'FrontendBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../connexion-ui/build')],
      destinationBucket: bucket,
    });

    new cloudfront.CloudFrontWebDistribution(this, 'CDN', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    });

}
}
```

## Project Structure

```
- connexion-ui
  - src
    - components
    - pages
    - hooks
  - public
  - tests
  - package.json
  - README.md
```

## Routes

- /users: A list of all users with navigation to their respective protected pages.
- /protectedroute: The protected route only accessible with the CanViewProtectedRoute permission.

## Example Usage

### Running the Application

1. **Install dependencies**:
   npm install

2. **Start the development server**:
   npm run dev
