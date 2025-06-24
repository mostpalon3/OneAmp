import prismaClient from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";




export async function GET(request: Request, { params }: { params: { jamId: string } }) {
    try {
        const session = await getServerSession();
        const isDev = process.env.NODE_ENV === "development";
        if (!session && !isDev) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }
        const jamId = String(params.jamId);
        console.log("Fetching jam with ID:", jamId);
        const jam = await prismaClient.jam.findUnique({
            where: {
                id: jamId,
            },
            select: {
                id: true,
                title: true,
                genre: true,
                likes: true,
                createdBy: true,
                createdAt: true,
            },
        });

        if (!jam) {
            return NextResponse.json("Jam not found", { status: 404 });
        }

        return NextResponse.json(
            {
                message: "Jam fetched successfully",
                ...jam,
            }
            , { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching jam:", error);
        return NextResponse.json({msg:"Internal Server Error",error}, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { jamId: string } }) {
    try {
        const session = await getServerSession();
        const isDev = process.env.NODE_ENV === "development";
        if (!session && !isDev) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }
        const jamId = String(params.jamId);
        console.log("Deleting jam with ID:", jamId);
        const deletedJam = await prismaClient.jam.delete({
            where: {
                id: jamId,
            },
        });

        return NextResponse.json(
            {
                message: "Jam deleted successfully",
                deletedJam,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting jam:", error);
        return NextResponse.json({msg:"Internal Server Error",error}, { status: 500 });
    }
}