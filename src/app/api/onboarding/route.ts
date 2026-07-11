import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      whatsapp,
      businessProfile,
      bottleneck,
      triedSolves,
      exactOutcome,
      references,
    } = body;

    // Strict validation of the 4 required onboarding fields
    if (
      !businessProfile?.trim() ||
      !bottleneck?.trim() ||
      !triedSolves?.trim() ||
      !exactOutcome?.trim()
    ) {
      return NextResponse.json(
        { error: "Semua pertanyaan wajib diisi kecuali referensi." },
        { status: 400 }
      );
    }

    const submission = await prisma.onboardingSubmission.create({
      data: {
        name: name?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        businessProfile: businessProfile.trim(),
        bottleneck: bottleneck.trim(),
        triedSolves: triedSolves.trim(),
        exactOutcome: exactOutcome.trim(),
        references: references?.trim() || "",
      },
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error: any) {
    console.error("Onboarding submission error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat menyimpan data." },
      { status: 500 }
    );
  }
}
