import express, { Request, Response } from "express";
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  UpdateCommandInput,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "../..";
import { userSchema } from "../../models/user";
import permissionsMiddleware from "../../middleware/permissionsMiddleware";

const router = express.Router();

export const USERS_TABLE = "connexion-users";
export const ROLES_TABLE = "connexion-roles";

export interface User {
  UserId: string;
  Name: string;
  Username: string;
  Email: string;
  Role: string;
  PermissionsOverride?: string[];
}

export interface Role {
  RoleId: string;
  Permissions: string[];
}

// Create User
router.post(
  "/",
  permissionsMiddleware(["CanCreateUser"]),
  async (req: Request, res: Response) => {
    const result = userSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }

    const { UserId, Name, Username, Email, Role, PermissionsOverride }: User =
      result.data;

    const params = {
      TableName: USERS_TABLE,
      Item: { UserId, Name, Username, Email, Role, PermissionsOverride },
    };

    try {
      await dynamoDB.send(new PutCommand(params));
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Could not create user" });
    }
  }
);

// Read User or All Users
router.get(
  "/:id?",
  permissionsMiddleware(["CanReadUser"]),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (id) {
      const params = {
        TableName: USERS_TABLE,
        Key: { UserId: id },
      };

      try {
        const data = await dynamoDB.send(new GetCommand(params));
        if (data.Item) {
          res.json(data.Item);
        } else {
          res.status(404).json({ error: "User not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Could not retrieve user" });
      }
    } else {
      const params = {
        TableName: USERS_TABLE,
      };

      try {
        const data = await dynamoDB.send(new ScanCommand(params));
        res.json(data.Items);
      } catch (error) {
        res.status(500).json({ error: "Could not retrieve users" });
      }
    }
  }
);

// Update User
router.put(
  "/:id",
  permissionsMiddleware(["CanUpdateUser"]),
  async (req: Request, res: Response) => {
    const result = userSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }

    const { Name, Username, Email, Role, PermissionsOverride }: User =
      result.data;

    const params: UpdateCommandInput = {
      TableName: USERS_TABLE,
      Key: { UserId: req.params.id },
      UpdateExpression:
        "set #name = :name, #username = :username, #email = :email, #role = :role, #permissionsOverride = :permissionsOverride",
      ExpressionAttributeNames: {
        "#name": "Name",
        "#username": "Username",
        "#email": "Email",
        "#role": "Role",
        "#permissionsOverride": "PermissionsOverride",
      },
      ExpressionAttributeValues: {
        ":name": Name,
        ":username": Username,
        ":email": Email,
        ":role": Role,
        ":permissionsOverride": PermissionsOverride,
      },
      ReturnValues: "UPDATED_NEW",
    };

    try {
      const data = await dynamoDB.send(new UpdateCommand(params));
      res.json(data.Attributes);
    } catch (error) {
      res.status(500).json({ error: "Could not update user" });
    }
  }
);

// Delete User
router.delete(
  "/:id",
  permissionsMiddleware(["CanDeleteUser"]),
  async (req: Request, res: Response) => {
    const params = {
      TableName: USERS_TABLE,
      Key: { UserId: req.params.id },
    };

    try {
      await dynamoDB.send(new DeleteCommand(params));
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Could not delete user" });
    }
  }
);

// Get User Permissions
router.get(
  "/:id/permissions",
  permissionsMiddleware(["CanReadUser"]),
  async (req: Request, res: Response) => {
    const userId = req.params.id;

    const userParams = {
      TableName: USERS_TABLE,
      Key: { UserId: userId },
    };

    try {
      const userData = await dynamoDB.send(new GetCommand(userParams));
      if (!userData.Item) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = userData.Item as User;

      // Fetch role permissions
      const roleParams = {
        TableName: ROLES_TABLE,
        Key: { RoleId: user.Role },
      };

      const roleData = await dynamoDB.send(new GetCommand(roleParams));
      if (!roleData.Item) {
        return res.status(404).json({ error: "Role not found" });
      }

      const role = roleData.Item as Role;

      const combinedPermissions = new Set([
        ...role.Permissions,
        ...(user.PermissionsOverride || []),
      ]);

      res.json({ permissions: Array.from(combinedPermissions) });
    } catch (error) {
      res.status(500).json({ error: "Could not retrieve permissions" });
    }
  }
);

export default router;
