# connexion-rbac


## Description

connexion-rbac is the backend service responsible for managing user roles and permissions using DynamoDB. It provides RESTful APIs for creating, reading, updating, and deleting users, as well as managing their permissions.

### Running the Application

Please paste the emailed .env (contains required AWS credentials to connect to DynamoDB) inside of the connexion-rbac root directory

1. **Install dependencies**:
   npm install

2. **Start the development server**:
   npm run dev

## DynamoDB Schema

![image](https://github.com/user-attachments/assets/bf7f3fce-ebed-4da1-b0e4-d80ebd6f78c3)

- Table Name: connexion-users
- Primary Key: UserId (string)
- Attributes:

  - Name (string)
  - Username (string)
  - Email (string)
  - Role (string)
  - PermissionsOverride (array of strings)

![image](https://github.com/user-attachments/assets/0d44930b-d7f5-4146-ae49-3f3254756745)

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
- CanViewProtectedRoute (If Permissions/ PermissionOverrides array contains 'CanViewProtectedRoute')

## API and Test Curls

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
  "PermissionsOverride": ["CanUpdateUser"]
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
    "PermissionsOverride": ["CanUpdateUser"]
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

### GET USER PERMISSIONS

Fetch the combined permissions of a user by their `UserId`, including role permissions and permission overrides.

**Request:**

```
curl -X GET "http://localhost:8080/user/10/permissions" \
 -H "Content-Type: application/json" \
 -H "X-User-Id: 5"
```

**Response:**

- **200 OK**: Returns the combined permissions of the user.
- **404 Not Found**: If the user or role does not exist.
- **401 Unauthorized**: If the `X-User-Id` header is missing or invalid.

**Response Body:**

```json
{
  "permissions": ["CanUpdateUser", "CanViewProtectedRoute"]
}
```

---

# connexion-ui

![image](https://github.com/user-attachments/assets/dbb17993-03ae-42c0-bc16-46dcf86122c7)

## Description

connexion-ui is the frontend application built with React and Chakra UI. It provides a user interface for viewing users and accessing a protected route.

### Running the Application

1. **Install dependencies**:
   npm install

2. **Start the development server**:
   npm run dev

## Routes

- /users: A list of all users with navigation to their respective protected pages.
- /protectedroute: The protected route only accessible with the CanViewProtectedRoute permission.

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
