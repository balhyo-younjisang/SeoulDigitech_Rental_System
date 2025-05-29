"use client"

import { useState, useEffect, useCallback } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
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

export default function EquipmentRentalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [purpose, setPurpose] = useState('')
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchEquipment = useCallback(async () => {
    try {
      const response = await fetch(`/api/equipment/${await (await params).id}`)
      if (!response.ok) {
        throw new Error('기자재 정보를 불러오는데 실패했습니다')
      }
      const data = await response.json()
      setEquipment(data)
    } catch (error) {
      console.error('기자재 조회 중 오류:', error)
      toast.error('기자재 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  const isFormValid = startDate && endDate && purpose && privacyAgreed

  const handleSubmit = async () => {
    if (!isFormValid) return

    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipmentId: equipment?.id,
          startDate,
          endDate,
          purpose,
        }),
      })

      if (!response.ok) {
        throw new Error('대여 신청에 실패했습니다')
      }

      toast.success('대여가 신청되었습니다')
      router.push('/rental/history')
    } catch (error) {
      console.error('대여 신청 중 오류:', error)
      toast.error('대여 신청에 실패했습니다')
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

  return (
    <main className="min-h-screen p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-64 md:h-96">
            {equipment?.image ? (
              <Image
                src={equipment.image}
                alt={equipment.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-500">{equipment?.name}</span>
              </div>
            )}
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{equipment?.name}</h1>
            <p className="text-gray-600 mb-6">{equipment?.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">대여 정보</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      대여 시작일
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      대여 종료일
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      사용 목적
                    </label>
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="기자재 사용 목적을 입력해주세요"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-4">주의사항</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">기자재 주의사항</h3>
                  <p className="text-sm text-yellow-700 whitespace-pre-line">
                    {equipment?.caution || '등록된 주의사항이 없습니다.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-4 mb-8">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                  개인정보 수집 및 이용에 동의합니다. 수집된 정보는 대여 관리 목적으로만 사용되며, 대여 종료 후 즉시 파기됩니다.
                </label>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className={`px-6 py-3 rounded-md text-white font-medium ${
                  isFormValid
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                대여 신청하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 