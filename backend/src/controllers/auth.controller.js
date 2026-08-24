const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { generateToken } = require("../utils/jwt");

// Demo mock users in case database is offline or in mock test mode
const mockUsers = new Map([
  [
    "test@urbancompany.com",
    {
      id: "usr_mock_customer_001",
      email: "test@urbancompany.com",
      passwordHash: bcrypt.hashSync("password123", 10),
      name: "Alex Johnson",
      phone: "+1 555-0199",
      role: "CUSTOMER",
    },
  ],
]);

/**
 * Register a new user with email and password
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, password, name, phone } = req.body || {};

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Email is required." },
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Password must be at least 6 characters long." },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check database or mock
    if (prisma) {
      const existing = await prisma.user.findFirst({
        where: { email: normalizedEmail },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: { code: "EMAIL_EXISTS", message: "An account with this email already exists." },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: name ? name.trim() : null,
          phone: phone ? phone.trim() : null,
          role: "CUSTOMER",
        },
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
      });
    } else {
      // Mock mode fallback
      if (mockUsers.has(normalizedEmail)) {
        return res.status(409).json({
          success: false,
          error: { code: "EMAIL_EXISTS", message: "An account with this email already exists." },
        });
      }

      const id = `usr_${Date.now()}`;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        name: name ? name.trim() : "New User",
        phone: phone ? phone.trim() : null,
        role: "CUSTOMER",
      };

      mockUsers.set(normalizedEmail, newUser);

      const token = generateToken({
        id,
        email: normalizedEmail,
        name: newUser.name,
        role: "CUSTOMER",
      });

      return res.status(201).json({
        success: true,
        token,
        user: {
          id,
          email: normalizedEmail,
          name: newUser.name,
          phone: newUser.phone,
          role: "CUSTOMER",
        },
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Log in an existing user with email and password
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Email and password are required." },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (prisma) {
      const user = await prisma.user.findFirst({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        });
      }

      // If user exists and password is set, verify with bcrypt
      let isMatch = false;
      if (user.password) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        // Legacy seeded user without password: allow default password
        isMatch = password === "password123" || password === "password";
      }

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
      });
    } else {
      // Mock mode
      const user = mockUsers.get(normalizedEmail);
      if (!user) {
        // If demo testing email
        if (normalizedEmail === "test@urbancompany.com" && password === "password123") {
          const demoId = "usr_demo_001";
          const token = generateToken({
            id: demoId,
            email: normalizedEmail,
            name: "Demo Customer",
            role: "CUSTOMER",
          });
          return res.status(200).json({
            success: true,
            token,
            user: { id: demoId, email: normalizedEmail, name: "Demo Customer", role: "CUSTOMER" },
          });
        }

        return res.status(401).json({
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "User context missing." },
      });
    }

    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
      });

      if (!user) {
        return res.status(200).json({
          success: true,
          user: req.user,
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
};
