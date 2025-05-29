import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { status } = body

    const rental = await prisma.rental.update({
      where: { id: parseInt(await (await params).id) },
      data: { status },
      include: {
        equipment: true
      }
    })

    // 대여 상태가 'returned'로 변경되면 기자재의 가용 수량을 증가
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
      { error: '대여 상태 변경 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
} 