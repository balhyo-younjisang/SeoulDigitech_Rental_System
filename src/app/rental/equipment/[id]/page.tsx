"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'

interface Equipment {
  id: number
  name: string
  description: string
  imageUrl: string | null
  availableCount: number
  category: {
    id: number
    name: string
  }
  caution: string | null
}

export default function EquipmentDetail() {
  const params = useParams()
  const router = useRouter()
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`/api/equipment?id=${params.id}`)
      if (!response.ok) {
        throw new Error('기자재 정보를 불러오는데 실패했습니다')
      }
      const data = await response.json()
      setEquipment(data)
    } catch (error) {
      console.error('기자재 정보 조회 중 오류:', error)
      toast.error('기자재 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

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

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">기자재를 찾을 수 없습니다</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{equipment.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                {equipment.imageUrl && (
                  <img
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
              </div>
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">기자재 정보</h2>
                  <p className="text-gray-600">{equipment.description}</p>
                </div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">카테고리</h2>
                  <p className="text-gray-600">{equipment.category.name}</p>
                </div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">재고 현황</h2>
                  <p className={`text-lg font-medium ${
                    equipment.availableCount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {equipment.availableCount > 0 ? `대여 가능: ${equipment.availableCount}개` : '대여 불가'}
                  </p>
                </div>
                {equipment.caution && (
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">사용 주의사항</h2>
                    <p className="text-gray-600 whitespace-pre-line">{equipment.caution}</p>
                  </div>
                )}
                <button
                  onClick={() => router.push(`/rental/apply?equipmentId=${equipment.id}`)}
                  disabled={equipment.availableCount <= 0}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                    equipment.availableCount > 0
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {equipment.availableCount > 0 ? '대여 신청하기' : '대여 불가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 