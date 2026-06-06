import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { emitToJam } from "@/app/lib/socket";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    const isDev = process.env.NODE_ENV === "development";

    if (!session?.user?.email && !isDev) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
    }

    const { streamId } = await req.json();

    if (!streamId) {
      return NextResponse.json({ message: "streamId is required" }, { status: 400 });
    }

    // Get the stream and its jam to verify ownership
    const stream = await prismaClient.stream.findUnique({
      where: { id: streamId },
      include: { jam: { select: { userId: true } } },
    });

    if (!stream) {
      return NextResponse.json({ message: "Stream not found" }, { status: 404 });
    }

    // Only the jam creator can delete songs
    const user = await prismaClient.user.findUnique({
      where: { email: session?.user?.email || "" },
    });

    if (!isDev && stream.jam.userId !== user?.id) {
      return NextResponse.json({ message: "Only the host can remove songs" }, { status: 403 });
    }

    // Delete related votes first, then the stream
    await prismaClient.$transaction([
      prismaClient.upvote.deleteMany({ where: { streamId } }),
      prismaClient.downvote.deleteMany({ where: { streamId } }),
      prismaClient.stream.delete({ where: { id: streamId } }),
    ]);

    // Notify all jam participants
    emitToJam(stream.jamId, "stream-removed", { streamId });

    return NextResponse.json({ message: "Song removed from queue" });
  } catch (error) {
    console.error("Error deleting stream:", error);
    return NextResponse.json({ message: "Failed to delete stream" }, { status: 500 });
  }
}
