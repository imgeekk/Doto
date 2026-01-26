import { auth } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

const POST = async (req: Request) => {
  try {
    const session = await auth.api.getSession(req);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const { name, email, bio, image } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        bio,
        image
      },
    });

    return NextResponse.json({ ok: true, updatedUser });
  } catch (error) {
    console.error("Error updating user: ", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later" },
      { status: 500 }
    );
  }
};

export { POST };
