import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // 단일 기자재 조회
      const equipment = await prisma.equipment.findUnique({
        where: {
          id: parseInt(id)
        },
        include: {
          category: true
        }
      })

      if (!equipment) {
        return NextResponse.json(
          { error: '기자재를 찾을 수 없습니다' },
          { status: 404 }
        )
      }

      return NextResponse.json(equipment)
    } else {
      // 전체 기자재 목록 조회
      const equipment = await prisma.equipment.findMany({
        where: {
          isPublic: true,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return NextResponse.json(equipment)
    }
  } catch (error) {
    console.error('기자재 조회 중 오류:', error)
    return NextResponse.json(
      { error: '기자재 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

// 기자재 등록 (관리자용)
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // 이미지 URL이 없는 경우 null로 설정
    const imageUrl = data.image && data.image.length > 0 ? data.image : null

    const equipment = await prisma.equipment.create({
      data: {
        name: data.name,
        description: data.description,
        image: imageUrl,
        totalCount: parseInt(data.totalCount),
        availableCount: parseInt(data.totalCount),
        serialNumber: data.serialNumber,
        categoryId: parseInt(data.categoryId),
        status: 'available',
        isPublic: data.isPublic || false,
        caution: data.caution || null,
      },
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('기자재 등록 중 오류:', error)
    return NextResponse.json({ error: '기자재 등록에 실패했습니다' }, { status: 500 })
  }
} 