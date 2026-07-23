import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  const hashedPassword = await bcrypt.hash("admin2026", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@storeluxe.com" },
    update: { role: "ADMIN", password: hashedPassword },
    create: {
      email: "admin@storeluxe.com",
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
      emailVerified: true,
    },
  });

  return NextResponse.json({ success: true, admin: { email: admin.email, role: admin.role } });
}