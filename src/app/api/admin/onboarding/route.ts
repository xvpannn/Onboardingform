import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const submissions = await prisma.onboardingSubmission.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json({ success: true, submissions });
  } catch (error: any) {
    console.error("Fetch onboarding submissions error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data onboarding." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID submission wajib diisi." },
        { status: 400 }
      );
    }

    await prisma.onboardingSubmission.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete onboarding submission error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data onboarding." },
      { status: 500 }
    );
  }
}
