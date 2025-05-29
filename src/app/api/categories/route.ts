import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        equipment: true
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('카테고리 목록 조회 중 오류:', error)
    return NextResponse.json(
      { error: '카테고리 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: '카테고리 이름은 필수입니다' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        description
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('카테고리 생성 중 오류:', error)
    return NextResponse.json(
      { error: '카테고리 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
} 