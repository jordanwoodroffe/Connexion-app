# connexion-rbac

## Description

connexion-rbac is the backend service responsible for managing user roles and permissions using DynamoDB. It provides RESTful APIs for creating, reading, updating, and deleting users, as well as managing their permissions.

### Running the Application

.env contains required AWS credentials to connect to DB, which will be sent seperately

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

- GitHub Actions: Used for continuous integration and deployment.
- Manual Trigger: A GitHub Actions workflow is set up to manually trigger the creation of a randomized user.

## Example Basic CDK for Backend

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

## Project Structure

- connexion-rbac
  - src
    - routes
    - middleware
    - schemas
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

```
curl -X GET "http://localhost:8080/user/1" \
 -H "Content-Type: application/json" \
 -H "X-User-Id: 5"
```

### CREATE USER

```
curl -X POST "http://localhost:8080/user" \
 -H "Content-Type: application/json" \
 -H "X-User-Id: 5" \
 -d '{
"UserId": "6",
"Name": "Billy Mathers",
"Username": "billmathers",
"Email": "billmathers@example.com",
"Role": "Staff",
"PermissionsOverride": ["CanViewProtectedRoute"]
}'
```

### DELETE USER

```
curl -X DELETE "http://localhost:8080/user/6" \
 -H "Content-Type: application/json" \
 -H "X-User-Id: 5"
```

### UPDATE USER

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
