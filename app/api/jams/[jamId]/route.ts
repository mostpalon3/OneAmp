import prismaClient from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { DashboardCacheService } from '@/app/lib/redis/dashboard-cache'; // 🔥 NEW

export async function GET(request: NextRequest, { params }: { params: Promise<{ jamId: string }> }) {
    try {
        const resolvedParams = await params;
        const jamId = resolvedParams.jamId;
        const session = await getServerSession();
        const isDev = process.env.NODE_ENV === "development";
        
        if (!session && !isDev) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        // 🔥 Try to get jam details from cache first
        const cachedJamStats = await DashboardCacheService.getCachedJamStats(jamId);
        
        if (cachedJamStats) {
            // Get basic jam info from database (lightweight query)
            const jam = await prismaClient.jam.findUnique({
                where: { id: jamId },
                select: {
                    id: true,
                    title: true,
                    genre: true,
                    createdBy: true,
                    createdAt: true,
                },
            });

            if (jam) {
                return NextResponse.json({
                    message: "Jam fetched successfully",
                    ...jam,
                    likesCount: cachedJamStats.likesCount,
                    source: 'cache'
                }, { status: 200 });
            }
        }

        // Cache miss - fetch from database
        const jam = await prismaClient.jam.findUnique({
            where: { id: jamId },
            select: {
                id: true,
                title: true,
                genre: true,
                likesCount: true,
                createdBy: true,
                createdAt: true,
            },
        });

        if (!jam) {
            return NextResponse.json("Jam not found", { status: 404 });
        }

        // Cache the jam stats
        await DashboardCacheService.cacheJamStats(jamId, {
            streamCount: 0, // Would need additional query for accurate count
            likesCount: jam.likesCount || 0,
        });

        return NextResponse.json({
            message: "Jam fetched successfully",
            ...jam,
            source: 'database'
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching jam:", error);
        return NextResponse.json({msg:"Internal Server Error",error}, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ jamId: string }> }) {
    try {
        const resolvedParams = await params;
        const jamId = resolvedParams.jamId;
        const session = await getServerSession();
        const isDev = process.env.NODE_ENV === "development";
        
        if (!session && !isDev) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        // Get jam owner before deletion for cache invalidation
        const jam = await prismaClient.jam.findUnique({
            where: { id: jamId },
            select: { userId: true }
        });

        const deletedJam = await prismaClient.jam.delete({
            where: { id: jamId },
        });

        // 🔥 Invalidate relevant caches after deletion
        if (jam?.userId) {
            await Promise.all([
                DashboardCacheService.invalidateUserJamsList(jam.userId),
                DashboardCacheService.invalidateUserDashboard(jam.userId),
                DashboardCacheService.invalidateJamStats(jamId),
            ]);
        }

        return NextResponse.json({
            message: "Jam deleted successfully",
            deletedJam,
        }, { status: 200 });

    } catch (error) {
        console.error("Error deleting jam:", error);
        return NextResponse.json({msg:"Internal Server Error",error}, { status: 500 });
    }
}