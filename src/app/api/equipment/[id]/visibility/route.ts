import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await (await params).id
    const { isPublic } = await request.json()

    const updatedEquipment = await prisma.equipment.update({
      where: { id: parseInt(id) },
      data: { isPublic },
    })

    return NextResponse.json(updatedEquipment)
  } catch (error) {
    console.error('기자재 공개 상태 변경 중 오류:', error)
    return NextResponse.json(
      { error: '기자재 공개 상태 변경에 실패했습니다' },
      { status: 500 }
    )
  }
} 