import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await (await params).id

    const rentals = await prisma.rental.findMany({
      where: {
        equipmentId: parseInt(id)
      },
      include: {
        equipment: {
          select: {
            name: true,
            serialNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(rentals)
  } catch (error) {
    console.error('대여 내역 조회 중 오류:', error)
    return NextResponse.json(
      { error: '대여 내역 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
} 