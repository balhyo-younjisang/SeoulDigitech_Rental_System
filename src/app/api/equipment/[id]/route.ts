import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const data = await request.json()

    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        totalCount: data.totalCount,
        availableCount: data.availableCount,
        status: data.status,
        isPublic: data.isPublic,
        caution: data.caution,
        categoryId: data.categoryId,
      },
    })

    return NextResponse.json(updatedEquipment)
  } catch (error) {
    console.error('기자재 수정 중 오류:', error)
    return NextResponse.json(
      { error: '기자재 정보 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: {
        id: parseInt(params.id)
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
  } catch (error) {
    console.error('기자재 조회 중 오류:', error)
    return NextResponse.json(
      { error: '기자재 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    // 기자재가 존재하는지 확인
    const equipment = await prisma.equipment.findUnique({
      where: { id },
    })

    if (!equipment) {
      return NextResponse.json(
        { error: '기자재를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 기자재 삭제
    await prisma.equipment.delete({
      where: { id },
    })

    return NextResponse.json({ message: '기자재가 삭제되었습니다' })
  } catch (error) {
    console.error('기자재 삭제 중 오류:', error)
    return NextResponse.json(
      { error: '기자재 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
} 