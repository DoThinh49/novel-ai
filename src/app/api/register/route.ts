import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng điền đầy đủ email và mật khẩu." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Mật khẩu phải chứa ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const emailLower = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email này đã được đăng ký." },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in Supabase
    const user = await prisma.user.create({
      data: {
        name,
        email: emailLower,
        password: passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Đăng ký thành công!", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi trên máy chủ, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
