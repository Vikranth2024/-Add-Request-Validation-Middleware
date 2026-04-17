const { z } = require('zod');

// Zod Schema handling all 10 rules elegantly
const userSchema = z.object({
  username: z.string({ required_error: "Username is required" }) // R01
    .trim() // R08
    .min(3, "Username must be at least 3 characters") // R02
    .max(30, "Username cannot exceed 30 characters"), // R02

  email: z.string({ required_error: "Email is required" }) // R01
    .trim() // R08
    .toLowerCase() // R09
    .email("Must be a valid email format"), // R03

  password: z.string({ required_error: "Password is required" }) // R01
    .min(6, "Password must be at least 6 characters") // R02
    .regex(/[a-zA-Z]/, "Password must contain at least one letter") // R10
    .regex(/\d/, "Password must contain at least one number"), // R10

  age: z.number({ 
      required_error: "Age is required", // R01
      invalid_type_error: "Age must be a number type" // R04
    })
    .min(18, "Age must be at least 18"), // R05

  role: z.enum(["user", "admin"], {
    required_error: "Role is required", // R01
    invalid_type_error: "Role must be exactly 'user' or 'admin'"
  }), // R06

  website: z.string()
    .url("If provided, website must be a valid URL")
    .optional() // R07
});

function validateUser(req, res, next) {
  // Parse the incoming request body
  const result = userSchema.safeParse(req.body);

  if (!result.success) {
    // Map Zod's error array into a clean array of strings
    const errorMessages = result.error.errors.map(err => err.message);
    
    // Return immediately to block the controller
    return res.status(400).json({
      error: "Validation failed",
      details: errorMessages
    });
  }

  // ✅ Overwrite req.body with Zod's clean, trimmed, lowercased data
  req.body = result.data;

  // Hand off to the controller
  next();
}

module.exports = validateUser;