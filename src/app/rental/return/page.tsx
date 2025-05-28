'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast, Toaster } from 'react-hot-toast'

interface FormData {
  name: string
  phone: string
}

interface RentalInfo {
  id: number
  equipmentName: string
  startDate: string
  endDate: string
  status: string
}

export default function ReturnPage() {
  const router = useRouter()
  const [rentalInfo, setRentalInfo] = useState<RentalInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/rentals?name=${encodeURIComponent(data.name)}&phone=${encodeURIComponent(
          data.phone
        )}`
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '예약 정보를 찾을 수 없습니다')
      }

      const rentalData = await response.json()
      setRentalInfo(rentalData)
    } catch (error) {
      console.error('예약 정보 조회 중 오류:', error)
      toast.error(error instanceof Error ? error.message : '예약 정보를 찾을 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async () => {
    if (!rentalInfo) return

    try {
      const response = await fetch(`/api/rentals/${rentalInfo.id}/return`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '반납 처리에 실패했습니다')
      }

      toast.success('반납이 완료되었습니다')
      router.push('/rental')
    } catch (error) {
      console.error('반납 처리 중 오류:', error)
      toast.error(error instanceof Error ? error.message : '반납 처리에 실패했습니다')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-center" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">기자재 반납</h1>

          {!rentalInfo ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  예약 정보 조회
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      이름
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: '이름을 입력해주세요' })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      전화번호
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { required: '전화번호를 입력해주세요' })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '조회 중...' : '예약 정보 조회'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  예약 정보
                </h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">기자재</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {rentalInfo.equipmentName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">예약일</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(rentalInfo.startDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">반납일</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(rentalInfo.endDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">상태</dt>
                      <dd className="mt-1">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            rentalInfo.status === 'rented'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {rentalInfo.status === 'rented' ? '예약 중' : '반납 완료'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setRentalInfo(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  다른 예약 조회
                </button>
                <button
                  type="button"
                  onClick={handleReturn}
                  disabled={rentalInfo.status === 'returned'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  반납 확인
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 