import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(await (await params).id) },
      include: {  
        equipment: true
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: '카테고리를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('카테고리 조회 중 오류:', error)
    return NextResponse.json(
      { error: '카테고리 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { name, description } = body

    const category = await prisma.category.update({
      where: { id: parseInt(await (await params).id) },
      data: {
        name,
        description
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('카테고리 수정 중 오류:', error)
    return NextResponse.json(
      { error: '카테고리 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.category.delete({
      where: { id: parseInt(await (await params).id) }
    })

    return NextResponse.json({ message: '카테고리가 삭제되었습니다' })
  } catch (error) {
    console.error('카테고리 삭제 중 오류:', error)
    return NextResponse.json(
      { error: '카테고리 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
} 