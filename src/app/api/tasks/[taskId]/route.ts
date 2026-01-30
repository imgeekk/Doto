import { auth } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { taskId: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const task = await prisma.tasks.findUnique({
      where: {
        id: params.taskId,
      },
      include: {
        column: {
          select: {
            title: true
          }
        }
      }
    })

    return NextResponse.json(task);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
