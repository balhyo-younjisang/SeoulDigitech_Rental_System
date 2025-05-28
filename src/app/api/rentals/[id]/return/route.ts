import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const rentalId = parseInt(params.id)

  if (isNaN(rentalId)) {
    return NextResponse.json(
      { error: '잘못된 대여 ID입니다' },
      { status: 400 }
    )
  }

  try {
    // 대여 정보 조회
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { equipment: true },
    })

    if (!rental) {
      return NextResponse.json(
        { error: '대여 정보를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (rental.status === 'returned') {
      return NextResponse.json(
        { error: '이미 반납된 기자재입니다' },
        { status: 400 }
      )
    }

    // 트랜잭션으로 반납 처리
    const result = await prisma.$transaction([
      // 대여 상태 업데이트
      prisma.rental.update({
        where: { id: rentalId },
        data: { status: 'returned' },
      }),
      // 기자재 가용 수량 증가
      prisma.equipment.update({
        where: { id: rental.equipmentId },
        data: {
          availableCount: {
            increment: 1,
          },
        },
      }),
    ])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('반납 처리 중 오류:', error)
    return NextResponse.json(
      { error: '반납 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
} 