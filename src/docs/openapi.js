/**
 * OpenAPI 3 spec for Swagger UI. Resource CRUD paths are generated from
 * `src/modules/resource-registry.js` to stay aligned with mounted routes.
 */
const resourceRegistry = require("../modules/resource-registry");

const bearerSecurity = [{ bearerAuth: [] }];

/** Standard CRUD operations served by `buildResourceRouter` + `buildCrudController`. */
function buildResourcePaths() {
  const paths = {};

  for (const resource of resourceRegistry) {
    const base = `/api/resources/${resource.path}`;
    const tag = "Resources";
    const label = resource.label;

    paths[base] = {
      get: {
        tags: [tag],
        summary: `List ${label}s`,
        description: `Generic list for **${resource.path}**. Supports query params passed through to the service (e.g. filters).`,
        security: bearerSecurity,
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessList" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
      post: {
        tags: [tag],
        summary: `Create ${label}`,
        description: `Request body shape depends on the Sequelize model for **${resource.model}**.`,
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: true,
                description: "Model attributes",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessItem" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    };

    paths[`${base}/{id}`] = {
      get: {
        tags: [tag],
        summary: `Get ${label} by id`,
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessItem" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
      put: {
        tags: [tag],
        summary: `Update ${label}`,
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: true,
                description: "Fields to update",
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessItem" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
      delete: {
        tags: [tag],
        summary: `Delete ${label}`,
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccessEmpty" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    };
  }

  return paths;
}

function getOpenApiSpec() {
  const port = process.env.PORT || 8002;
  const publicUrl = process.env.API_PUBLIC_URL || `http://127.0.0.1:${port}`;

  const staticPaths = {
    "/test": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "API is running",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
        },
      },
    },
    "/api/user": {
      get: {
        tags: ["User"],
        summary: "List all users",
        description: "Admin only.",
        security: bearerSecurity,
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserListResponse" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/user/{id}": {
      get: {
        tags: ["User"],
        summary: "Get user by id",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProfileResponse" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description:
          "Sends plaintext `password`; middleware hashes it before persistence.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterSuccess" },
              },
            },
          },
          400: {
            description: "Validation / missing fields",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorMessage" },
              },
            },
          },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        description: "Returns JWT token and user profile.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginSuccess" },
              },
            },
          },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get logged-in user profile",
        security: bearerSecurity,
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProfileResponse" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/auth/clerk/google": {
      post: {
        tags: ["Auth"],
        summary: "Exchange Clerk session for app JWT",
        description:
          "POST `clerk_session_token` from the Clerk session; backend verifies with Clerk and returns app JWT + user.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ClerkGoogleExchangeRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginSuccess" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorWithSuccessFlag" },
              },
            },
          },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/auth/verify-email": {
      post: {
        tags: ["Auth"],
        summary: "Verify email with token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyEmailRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Verified",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SimpleSuccess" },
              },
            },
          },
          400: {
            description: "Invalid or expired token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorWithSuccessFlag" },
              },
            },
          },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/auth/resend-verification": {
      post: {
        tags: ["Auth"],
        summary: "Resend verification email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResendVerificationRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SimpleSuccess" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorWithSuccessFlag" },
              },
            },
          },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/shipments": {
      get: {
        tags: ["Shipments"],
        summary: "List my shipments",
        security: bearerSecurity,
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ShipmentListResponse" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
      post: {
        tags: ["Shipments"],
        summary: "Create shipment",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateShipmentRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ShipmentItemResponse" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/shipments/{trackingCode}": {
      get: {
        tags: ["Shipments"],
        summary: "Get shipment by tracking code",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/TrackingCodePath" }],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ShipmentItemResponse" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/shipments/{trackingCode}/status": {
      patch: {
        tags: ["Shipments"],
        summary: "Update shipment status",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/TrackingCodePath" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateShipmentStatusRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ShipmentItemResponse" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List notifications for current user",
        security: bearerSecurity,
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/NotificationListResponse" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
    "/api/disputes": {
      get: {
        tags: ["Disputes"],
        summary: "List disputes",
        security: bearerSecurity,
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DisputeListResponse" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
      post: {
        tags: ["Disputes"],
        summary: "Create dispute",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateDisputeRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DisputeItemResponse" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          500: { $ref: "#/components/responses/ServerError" },
        },
      },
    },
  };

  return {
    openapi: "3.0.3",
    info: {
      title: "Digital Delivery API",
      version: "1.0.0",
      description:
        "Express + Sequelize backend for the logistics app. Use **Try it out** to hit your local server.\n\n" +
        "**Auth:** most routes require `Authorization: Bearer <JWT>` from `POST /api/auth/login` or Clerk exchange.\n\n" +
        "**Resources:** generic CRUD under `/api/resources/{path}` is generated from the model registry (admin-style data access). " +
        "Domain flows also exist under `/api/shipments`, `/api/disputes`, etc.",
    },
    servers: [{ url: publicUrl, description: "Current server" }],
    tags: [
      { name: "Health", description: "Liveness checks" },
      { name: "Auth", description: "Registration, login, email verification, Clerk" },
      { name: "User", description: "User profiles (admin list + user by id)" },
      { name: "Shipments", description: "Shipment flows (tracking code, status)" },
      { name: "Notifications", description: "In-app notifications" },
      { name: "Disputes", description: "Dispute listing and creation" },
      {
        name: "Resources",
        description:
          "Generic Sequelize CRUD per registered resource (`GET/POST` on collection, `GET/PUT/DELETE` on `/{id}`).",
      },
    ],
    paths: {
      ...staticPaths,
      ...buildResourcePaths(),
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT from `POST /api/auth/login` or `POST /api/auth/clerk/google`. Click **Authorize** and paste the raw token.",
        },
      },
      parameters: {
        IdPath: {
          name: "id",
          in: "path",
          required: true,
          description: "Primary key (numeric id as string in URL)",
          schema: { type: "string", example: "1" },
        },
        TrackingCodePath: {
          name: "trackingCode",
          in: "path",
          required: true,
          schema: { type: "string", example: "LR-ABC123" },
        },
      },
      responses: {
        Unauthorized: {
          description: "Missing or invalid JWT",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorWithSuccessFlag" },
            },
          },
        },
        Forbidden: {
          description: "Authenticated but not allowed (e.g. non-admin)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorWithSuccessFlag" },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorWithSuccessFlag" },
            },
          },
        },
        ServerError: {
          description: "Server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorWithSuccessFlag" },
            },
          },
        },
      },
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "app on" },
            status: { type: "boolean", example: true },
          },
        },
        SimpleMessage: {
          type: "object",
          properties: {
            message: { type: "string" },
            status: { type: "boolean" },
          },
        },
        SimpleSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { nullable: true },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            full_name: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            role: { type: "string" },
            verification_status: { type: "string" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["full_name", "email", "phone", "role", "password"],
          properties: {
            full_name: { type: "string", example: "Ada Lovelace" },
            email: {
              type: "string",
              format: "email",
              example: "ada@example.com",
            },
            phone: { type: "string", example: "+2348000000000" },
            role: {
              type: "string",
              enum: ["customer", "rider", "driver", "admin"],
              example: "customer",
            },
            password: {
              type: "string",
              format: "password",
              example: "Str0ngP@ss",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
        },
        ClerkGoogleExchangeRequest: {
          type: "object",
          required: ["clerk_session_token"],
          properties: {
            clerk_session_token: {
              type: "string",
              description: "Clerk session JWT from the frontend",
            },
          },
        },
        VerifyEmailRequest: {
          type: "object",
          required: ["token"],
          properties: {
            token: { type: "string", description: "Verification token from email link" },
          },
        },
        ResendVerificationRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        CreateShipmentRequest: {
          type: "object",
          required: [
            "senderName",
            "senderPhone",
            "pickupAddress",
            "recipientName",
            "recipientPhone",
            "deliveryAddress",
            "category",
            "weight",
            "value",
            "deliveryType",
          ],
          properties: {
            senderName: { type: "string" },
            senderPhone: { type: "string" },
            pickupAddress: { type: "string" },
            recipientName: { type: "string" },
            recipientPhone: { type: "string" },
            deliveryAddress: { type: "string" },
            category: { type: "string" },
            weight: { type: "number", minimum: 0 },
            value: { type: "number", minimum: 0 },
            description: { type: "string", default: "" },
            deliveryType: { type: "string", enum: ["standard", "express"] },
          },
        },
        UpdateShipmentStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["pending", "in_transit", "delivered", "cancelled"],
            },
            note: { type: "string", default: "" },
            location: { type: "string", default: "" },
          },
        },
        CreateDisputeRequest: {
          type: "object",
          required: ["delivery_id", "reason"],
          properties: {
            delivery_id: { type: "string" },
            reason: { type: "string", minLength: 5 },
          },
        },
        RegisterSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Registered successfully" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
        LoginSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful" },
            data: {
              type: "object",
              properties: {
                token: { type: "string" },
                user: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
        ProfileResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Profile loaded" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
        UserListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Users loaded" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/User" },
            },
          },
        },
        ApiSuccessList: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: {
              type: "array",
              items: { type: "object", additionalProperties: true },
            },
          },
        },
        ApiSuccessItem: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object", additionalProperties: true },
          },
        },
        ApiSuccessEmpty: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "null" },
          },
        },
        ShipmentItemResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object", additionalProperties: true },
          },
        },
        ShipmentListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: {
              type: "array",
              items: { type: "object", additionalProperties: true },
            },
          },
        },
        NotificationListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: {
              type: "array",
              items: { type: "object", additionalProperties: true },
            },
          },
        },
        DisputeItemResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object", additionalProperties: true },
          },
        },
        DisputeListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: {
              type: "array",
              items: { type: "object", additionalProperties: true },
            },
          },
        },
        ErrorMessage: {
          type: "object",
          properties: {
            message: { type: "string", example: "Missing required fields" },
          },
        },
        ErrorWithSuccessFlag: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: { nullable: true },
          },
        },
      },
    },
  };
}

module.exports = { getOpenApiSpec };
