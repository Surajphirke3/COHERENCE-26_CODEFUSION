// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import UserModel from "@/lib/models/User";
import OrganizationModel from "@/lib/models/Organization";
import { RegisterSchema } from "@/lib/validators/auth.schema";
import { slugify } from "@/lib/utils";
import mongoose from "mongoose";

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
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create User + Organization in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create org first so we can assign orgId to user
      const [organization] = await OrganizationModel.create(
        [
          {
            name: workspaceName,
            slug: slugify(workspaceName),
            plan: "free",
            members: [],
          },
        ],
        { session }
      );

      const [user] = await UserModel.create(
        [
          {
            name,
            email: email.toLowerCase(),
            passwordHash,
            role: "owner",
            orgId: organization._id,
          },
        ],
        { session }
      );

      // Add user as owner member
      organization.members.push({
        userId: user._id,
        role: "owner",
        joinedAt: new Date(),
      });
      await organization.save({ session });

      await session.commitTransaction();

      return NextResponse.json(
        {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            orgId: organization._id.toString(),
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
