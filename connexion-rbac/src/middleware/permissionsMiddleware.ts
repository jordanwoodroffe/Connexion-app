import { Request, Response, NextFunction } from "express";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  Role,
  ROLES_TABLE,
  User,
  USERS_TABLE,
} from "../routes/user/userRoutes";
import { dynamoDB } from "..";

export const permissionsMiddleware = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.header("X-User-Id"); // Typically this would be a JWT token, for a demo we're using a user ID in a custom header

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: X-User-Id header missing" });
    }

    const userParams = {
      TableName: USERS_TABLE,
      Key: { UserId: userId },
    };

    try {
      // Fetch user details
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

      const rolePermissions = role.Permissions || [];

      console.log("role permissions", rolePermissions);

      const userPermissionsOverride = user.PermissionsOverride || [];

      const combinedPermissions = new Set([
        ...rolePermissions,
        ...userPermissionsOverride,
      ]);

      console.log("combined permissions", combinedPermissions);

      const hasPermission = requiredPermissions.every((permission) =>
        combinedPermissions.has(permission)
      );

      console.log("has permissions", hasPermission);

      if (hasPermission) {
        return next();
      } else {
        return res
          .status(403)
          .json({ error: "Forbidden: Insufficient permissions" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};

export default permissionsMiddleware;
