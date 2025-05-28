import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('카테고리 조회 중 오류:', error)
    return NextResponse.json(
      { error: '카테고리 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('카테고리 생성 중 오류:', error)
    return NextResponse.json(
      { error: '카테고리 생성에 실패했습니다' },
      { status: 500 }
    )
  }
} 