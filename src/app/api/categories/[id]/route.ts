import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const data = await request.json()

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('카테고리 수정 중 오류:', error)
    return NextResponse.json(
      { error: '카테고리 수정에 실패했습니다' },
      { status: 500 }
    )
  }
} 