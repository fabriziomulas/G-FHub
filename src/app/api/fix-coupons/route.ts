import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLevel, LEVEL_COUPONS } from "@/lib/levels";

// ✅ ESPORTAZIONE CORRETTA per App Router
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "USER" },
    });

    const results = [];

    for (const user of users) {
      const level = getLevel(user.xp);
      const hasCoupon = await prisma.coupon.findFirst({
        where: { 
          userId: user.id, 
          used: false, 
          expiresAt: { gt: new Date() } 
        },
      });

      if (!hasCoupon && LEVEL_COUPONS[level.name]) {
        const config = LEVEL_COUPONS[level.name];
        const code = "SL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await prisma.coupon.create({
          data: {
            code,
            userId: user.id,
            discount: config.discount,
            minSpent: config.minSpent,
            expiresAt,
          },
        });

        results.push({ 
          user: user.email, 
          level: level.name, 
          code,
          discount: config.discount,
          minSpent: config.minSpent
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Creati ${results.length} coupon`,
      fixed: results 
    });
    
  } catch (error) {
    console.error("Errore nella creazione coupon:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Errore interno del server",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}