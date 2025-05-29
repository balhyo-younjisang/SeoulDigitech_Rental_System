'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import Image from 'next/image'

interface Equipment {
  id: number
  name: string
  description: string
  image: string
  status: string
  totalCount: number
  availableCount: number
  serialNumber: string
}

export default function HomePage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment')
      if (!response.ok) {
        throw new Error('기자재 목록을 불러오는데 실패했습니다')
      }
      const data = await response.json()
      setEquipment(data)
    } catch (error) {
      console.error('기자재 목록 조회 중 오류:', error)
      toast.error('기자재 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleRent = (id: number) => {
    router.push(`/rental/apply?id=${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">기자재 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            서울디지텍고등학교 기자재 예약 시스템
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            필요한 기자재를 예약하고 사용하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-64">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.availableCount > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.availableCount > 0 ? '예약 가능' : '예약 불가'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.name}
                </h2>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <p>총 수량: {item.totalCount}개</p>
                    <p>가용 수량: {item.availableCount}개</p>
                  </div>
                  <button
                    onClick={() => handleRent(item.id)}
                    disabled={item.availableCount <= 0}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      item.availableCount > 0
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    예약하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 