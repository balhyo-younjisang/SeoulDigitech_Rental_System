import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client';
type TxClient = Prisma.TransactionClient;

// 대여 정보 조회
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const phone = searchParams.get('phone')

  // 이름과 전화번호가 있는 경우 개별 대여 정보 조회
  if (name && phone) {
    try {
      const rental = await prisma.rental.findFirst({
        where: {
          renterName: name,
          phone: phone,
          status: 'rented',
        },
        include: {
          equipment: {
            include: {
              category: true
            }
          }
        },
      })

      if (!rental) {
        return NextResponse.json(
          { error: '대여 정보를 찾을 수 없습니다' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        id: rental.id,
        equipmentName: rental.equipment.name,
        startDate: rental.startDate,
        endDate: rental.endDate,
        status: rental.status,
      })
    } catch (error) {
      console.error('대여 정보 조회 중 오류:', error)
      return NextResponse.json(
        { error: '대여 정보 조회 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }
  }

  // 이름과 전화번호가 없는 경우 전체 대여 목록 조회
  try {
    const rentals = await prisma.rental.findMany({
      include: {
        equipment: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(rentals)
  } catch (error) {
    console.error('대여 목록 조회 중 오류:', error)
    return NextResponse.json(
      { error: '대여 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

// 대여 신청
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // 트랜잭션 시작
    const result = await prisma.$transaction(async (tx : TxClient) => {
      // 1. 기자재 재고 확인
      const equipment = await tx.equipment.findUnique({
        where: { id: data.equipmentId },
        select: { availableCount: true }
      })

      if (!equipment) {
        throw new Error('기자재를 찾을 수 없습니다')
      }

      if (equipment.availableCount <= 0) {
        throw new Error('해당 기자재의 재고가 없습니다')
      }

      // 2. 대여 정보 생성
      const rental = await tx.rental.create({
        data: {
          equipmentId: data.equipmentId,
          renterName: data.renterName,
          studentId: data.studentId,
          email: data.email,
          phone: data.phone,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          status: 'rented',
        },
      })

      // 3. 재고 감소
      await tx.equipment.update({
        where: { id: data.equipmentId },
        data: { availableCount: { decrement: 1 } }
      })

      return rental
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('대여 신청 중 오류:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '대여 신청에 실패했습니다' },
      { status: 500 }
    )
  }
} 