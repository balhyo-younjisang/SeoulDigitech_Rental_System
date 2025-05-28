import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const { status } = await request.json()

    const rental = await prisma.rental.update({
      where: { id },
      data: { status },
      include: {
        equipment: true
      }
    })

    // 대여 상태가 'returned'로 변경되면 기자재의 availableCount를 증가
    if (status === 'returned') {
      await prisma.equipment.update({
        where: { id: rental.equipmentId },
        data: {
          availableCount: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json(rental)
  } catch (error) {
    console.error('대여 상태 변경 중 오류:', error)
    return NextResponse.json(
      { error: '대여 상태 변경에 실패했습니다' },
      { status: 500 }
    )
  }
} 