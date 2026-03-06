import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { connectDB } from '@/lib/mongodb/client'
import { User } from '@/lib/mongodb/models/User'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    // ── Google OAuth ──
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // ── Email / Password ──
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        await connectDB()
        const user = await User.findOne({ email: credentials.email.toLowerCase().trim() })

        if (!user) {
          throw new Error('No account found with this email')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Auto-create user in MongoDB on first Google sign-in
      if (account?.provider === 'google' && user.email) {
        await connectDB()
        const existing = await User.findOne({ email: user.email.toLowerCase().trim() })
        if (!existing) {
          await User.create({
            name: user.name || user.email.split('@')[0],
            email: user.email.toLowerCase().trim(),
            role: 'member',
            avatarUrl: user.image || '',
          })
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        // For credentials provider, user.id is already the MongoDB _id
        if (!account || account.provider === 'credentials') {
          token.id = user.id
          token.role = (user as any).role || 'member'
        }
        // For Google provider, look up the MongoDB user by email
        if (account?.provider === 'google' && user.email) {
          await connectDB()
          const dbUser = await User.findOne({ email: user.email.toLowerCase().trim() })
          if (dbUser) {
            token.id = dbUser._id.toString()
            token.role = dbUser.role || 'member'
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
