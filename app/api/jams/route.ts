import prismaClient from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/app/lib/auth"
import { DashboardCacheService } from '@/app/lib/redis/dashboard-cache'; // 🔥 NEW

const devUserId = "4e507200-c0e2-4346-8315-664a71c7ee57";

const createJamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  genre: z.string().min(1, "Genre is required"),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isDev = process.env.NODE_ENV === "development";

    if (!session && !isDev) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const data = createJamSchema.parse(await request.json());
    const { title, genre } = data;
    const userId = session?.user?.id ?? devUserId;

    const jam = await prismaClient.jam.create({
      data: {
        userId: userId,
        title,
        genre,
        createdBy: session?.user?.name ?? "Dev Tester",
      },
    });

    // 🔥 Invalidate user's dashboard caches after creating jam
    await Promise.all([
      DashboardCacheService.invalidateUserJamsList(userId),
      DashboardCacheService.invalidateUserDashboard(userId),
    ]);

    return NextResponse.json({
      message: "Jam created successfully",
      jam, 
    }, { status: 201 });

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

    const userId = session?.user?.id ?? devUserId;

    // 🔥 STEP 1: Try to get user jams from cache first
    const cachedJams = await DashboardCacheService.getCachedUserJamsList(userId);
    
    if (cachedJams) {
      return NextResponse.json({
        message: "Jams fetched successfully",
        jams: cachedJams,
        source: 'cache' // For debugging
      }, { status: 200 });
    }

    // 🔥 STEP 2: Cache miss - fetch from database
    const jams = await prismaClient.jam.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        genre: true,
        _count: {
          select: {
            streams: {
              where: {
                played: false
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
      // Cache empty result too
      await DashboardCacheService.cacheUserJamsList(userId, []);
      
      return NextResponse.json({
        message: "No jams found",
        jams: [],
        source: 'database'
      }, { status: 200 });
    }

    // 🔥 STEP 3: Cache the jams data
    await DashboardCacheService.cacheUserJamsList(userId, jams);

    // 🔥 STEP 4: Cache individual jam stats
    for (const jam of jams) {
      const jamStats = {
        streamCount: jam._count.streams,
        likesCount: jam.likesCount || 0,
      };
      await DashboardCacheService.cacheJamStats(jam.id, jamStats);
    }

    return NextResponse.json({
      message: "Jams fetched successfully",
      jams,
      source: 'database' // For debugging
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching jams:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}