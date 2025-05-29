"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import Image from 'next/image'

interface Equipment {
  id: number
  name: string
  description: string
  image: string | null
  status: string
  totalCount: number
  availableCount: number
  serialNumber: string
  category: {
    id: number
    name: string
  }
  isPublic: boolean
  caution: string | null
}

export default function RentalApply() {
  const router = useRouter()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEquipment = useCallback(async () => {
    try {
      const response = await fetch('/api/equipment')
      if (!response.ok) {
        throw new Error('기자재 목록을 불러오는데 실패했습니다')
      }
      const data = await response.json()
      setEquipment(data)
    } catch (error) {
      console.error('기자재 조회 중 오류:', error)
      toast.error('기자재 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">기자재 대여 신청</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500">{item.name}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    대여 가능: {item.availableCount}개
                  </span>
                  <button
                    onClick={() => router.push(`/rental/equipment/${item.id}`)}
                    disabled={item.availableCount <= 0}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      item.availableCount > 0
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {item.availableCount > 0 ? '대여하기' : '대여 불가'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
} 