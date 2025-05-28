import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rentals = await prisma.rental.findMany({
      where: {
        equipmentId: parseInt(params.id)
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
    console.error('대여 현황 조회 중 오류:', error)
    return NextResponse.json(
      { error: '대여 현황 조회에 실패했습니다' },
      { status: 500 }
    )
  }
} 