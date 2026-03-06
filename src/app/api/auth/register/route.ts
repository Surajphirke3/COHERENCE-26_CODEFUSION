// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Organization from "@/models/Organization";
import mongoose from "mongoose";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  workspaceName: z
    .string()
    .min(2, "Workspace name must be at least 2 characters"),
});

/**
 * POST /api/auth/register
 *
 * Creates a new user account and organization.
 * Validates input, checks for duplicate emails, hashes the password,
 * and creates both records in a MongoDB transaction.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, workspaceName } = parsed.data;

    await connectDB();

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User + Organization in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [user] = await User.create(
        [
          {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "admin",
          },
        ],
        { session }
      );

      const [organization] = await Organization.create(
        [
          {
            name: workspaceName,
            ownerId: user._id,
            plan: "free",
          },
        ],
        { session }
      );

      // Link user to organization
      user.organizationId = organization._id;
      await user.save({ session });

      await session.commitTransaction();

      return NextResponse.json(
        {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: organization._id.toString(),
          },
        },
        { status: 201 }
      );
    } catch (txError) {
      await session.abortTransaction();
      throw txError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
