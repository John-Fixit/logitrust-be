const userDao = require("../dao/userDao");
const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { verifyToken } = require("@clerk/backend");
const { sendMail } = require("../utils/mailer");

const buildVerificationToken = () => crypto.randomBytes(32).toString("hex");
const buildVerificationUrl = (token) => {
  const frontendBaseUrl =
    process.env.FRONTEND_BASE_URL || "http://localhost:5173";
  return `${frontendBaseUrl}/auth/verify-email?token=${token}`;
};

class UserService {
  createAppJwt(user) {
    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET is not configured");
      error.statusCode = 500;
      throw error;
    }

    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      },
    );
  }

  toAuthUser(user) {
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verification_status: user.verification_status,
      created_at: user.created_at,
    };
  }

  async createUser(userData) {
    const existingUser = await userDao.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error("Email already in use");
      error.statusCode = 409;
      throw error;
    }

    const password_hash = await bcrypt.hash(userData.password, 10);
    const verification_token = buildVerificationToken();
    const verification_token_expires_at = new Date(
      Date.now() + 1000 * 60 * 60 * 24,
    ); // 24h

    const user = await db.sequelize.transaction(async (transaction) => {
      const user = await userDao.create(
        {
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          password_hash,
          verification_status: "pending",
          verification_token,
          verification_token_expires_at,
        },
        transaction,
      );

      await db.Wallet.create(
        {
          user_id: user.id,
          balance: 0,
        },
        { transaction },
      );

      return user;
    });

    await this.sendVerificationEmail(
      user.email,
      verification_token,
      user.full_name,
    );
    return user;
  }

  async loginUser(credentials) {
    const user = await userDao.findByEmailWithPassword(credentials.email);

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (user.verification_status !== "verified") {
      const error = new Error(
        "Please verify your email before logging in. Use the verification link sent to your email.",
      );
      error.statusCode = 403;
      throw error;
    }

    const validPassword = await bcrypt.compare(
      credentials.password,
      user.password_hash || "",
    );

    if (!validPassword) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const token = this.createAppJwt(user);

    return {
      token,
      user: this.toAuthUser(user),
    };
  }

  async exchangeClerkGoogleToken(clerkSessionToken) {
    if (!process.env.CLERK_SECRET_KEY) {
      const error = new Error("CLERK_SECRET_KEY is not configured");
      error.statusCode = 500;
      throw error;
    }

    const payload = await verifyToken(clerkSessionToken, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const provider = "clerk_google";
    const providerUserId =
      payload.sub ||
      payload.user_id ||
      (Array.isArray(payload.fva) ? payload.fva[0] : undefined);
    const email =
      payload.email ||
      payload.email_address ||
      payload.primary_email_address ||
      null;

    if (!providerUserId || !email) {
      const error = new Error("Unable to resolve Clerk Google identity");
      error.statusCode = 400;
      throw error;
    }

    const existingIdentity = await userDao.findByProviderIdentity(
      provider,
      String(providerUserId),
    );

    let user = existingIdentity?.user || null;
    if (!user) {
      user = await userDao.findByEmail(email);
    }

    if (!user) {
      user = await db.sequelize.transaction(async (transaction) => {
        const createdUser = await userDao.create(
          {
            full_name: payload.name || email.split("@")[0] || "Google User",
            email,
            phone: null,
            role: "customer",
            verification_status: "verified",
          },
          transaction,
        );

        await db.Wallet.create(
          {
            user_id: createdUser.id,
            balance: 0,
          },
          { transaction },
        );

        return createdUser;
      });
    } else if (user.verification_status !== "verified") {
      await user.update({ verification_status: "verified" });
    }

    await userDao.upsertProviderIdentity({
      user_id: user.id,
      provider,
      provider_user_id: String(providerUserId),
      email,
    });

    const token = this.createAppJwt(user);
    return {
      token,
      user: this.toAuthUser(user),
    };
  }

  async verifyEmail(token) {
    const user = await userDao.findByVerificationToken(token);
    console.log(user, "user");
    if (!user) {
      const error = new Error("Invalid verification token");
      error.statusCode = 400;
      throw error;
    }

    if (
      !user.verification_token_expires_at ||
      user.verification_token_expires_at < new Date()
    ) {
      const error = new Error(
        "Verification token expired. Request a new verification email.",
      );
      error.statusCode = 400;
      throw error;
    }

    await user.update({
      verification_status: "verified",
      verification_token: null,
      verification_token_expires_at: null,
    });

    return {
      id: user.id,
      email: user.email,
      verification_status: user.verification_status,
    };
  }

  async resendVerificationEmail(email) {
    const user = await userDao.findByEmailWithPassword(email);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (user.verification_status === "verified") {
      return { already_verified: true };
    }

    const verification_token = buildVerificationToken();
    const verification_token_expires_at = new Date(
      Date.now() + 1000 * 60 * 60 * 24,
    );
    await user.update({ verification_token, verification_token_expires_at });
    await this.sendVerificationEmail(
      user.email,
      verification_token,
      user.full_name,
    );
    return { already_verified: false };
  }

  async sendVerificationEmail(email, token, fullName) {
    const verifyUrl = buildVerificationUrl(token);
    const subject = "Verify your Logicrow account";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Welcome to Logicrow, ${fullName || "there"}!</h2>
        <p>Please verify your email to activate your account.</p>
        <p>
          <a href="${verifyUrl}" style="background:#1f6feb;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px;">
            Verify Email
          </a>
        </p>
        <p>If the button does not work, copy this link:</p>
        <p>${verifyUrl}</p>
        <p>This link expires in 24 hours.</p>
      </div>
    `;
    await sendMail({ to: email, subject, html });
  }

  async getProfile(userId) {
    const user = await userDao.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = new UserService();
