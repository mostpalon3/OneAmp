import prismaClient from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/app/lib/auth"

const devUserId = "4e507200-c0e2-4346-8315-664a71c7ee57";

const createJamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  genre: z.string().min(1, "Genre is required"),
});

export async function POST(request: Request) {
  try {
    // Get session or fallback if in dev
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV === "development";

    if (!session && !isDev) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const data = createJamSchema.parse(await request.json());
    const { title, genre } = data;

    const jam = await prismaClient.jam.create({
      data: {
        // Fallback fake user & name if no session in dev
        userId: session?.user?.id ?? devUserId,
        title,
        genre,
        createdBy: session?.user?.name ?? "Dev Tester",
      },
    });

    return NextResponse.json(
      {
        message: "Jam created successfully",
        jam, 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating jam:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV === "development";

    if (!session && !isDev) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

const jams = await prismaClient.jam.findMany({
  where: {
    userId: session?.user?.id ?? devUserId, // Fallback for dev mode
  },
  select: {
    id: true,
    title: true,
    genre: true,
    _count: {
      select: {
        streams:{
          where:{
            played:false
          }
        }
      },
    },
    likesCount: true,
    createdBy: true,
    createdAt: true,
  },
  orderBy: {
    createdAt: "desc",
  },
});



    if (!jams || jams.length === 0) {
      return NextResponse.json(
        {
          message: "No jams found",
          jams: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Jams fetched successfully",
        jams 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching jams:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}