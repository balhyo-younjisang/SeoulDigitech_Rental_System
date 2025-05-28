'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast, Toaster } from 'react-hot-toast'

interface FormData {
  equipmentId: number
  renterName: string
  studentId: string
  email: string
  phone: string
  startDate: string
  endDate: string
  isPrivacyAgreed: boolean
  isPrecautionsAgreed: boolean
}

interface Equipment {
  id: number
  name: string
  description: string
  image: string
  status: string
  totalCount: number
  availableCount: number
  caution: string | null
}

export default function RentalApply() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const equipmentId = searchParams.get('id')
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      equipmentId: equipmentId ? parseInt(equipmentId) : undefined,
      isPrivacyAgreed: false,
      isPrecautionsAgreed: false,
    },
  })

  useEffect(() => {
    if (equipmentId) {
      fetchEquipment()
    }
  }, [equipmentId])

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`/api/equipment?id=${equipmentId}`)
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

  const onSubmit = async (data: FormData) => {
    if (!data.isPrivacyAgreed || !data.isPrecautionsAgreed) {
      toast.error('모든 동의 항목에 체크해주세요')
      return
    }

    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '예약 신청에 실패했습니다')
      }

      toast.success('예약이 완료되었습니다. 신청서를 제출한 후 예약이 가능합니다.')
      router.push('/rental')
    } catch (error) {
      console.error('예약 신청 중 오류:', error)
      toast.error(error instanceof Error ? error.message : '예약 신청에 실패했습니다')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">기자재 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">기자재 정보를 찾을 수 없습니다</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              기자재 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-center" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">예약 신청</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                예약자 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    학번
                  </label>
                  <input
                    type="text"
                    {...register('studentId', { required: '학번을 입력해주세요' })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.studentId ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.studentId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.studentId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    이름
                  </label>
                  <input
                    type="text"
                    {...register('renterName', { required: '이름을 입력해주세요' })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.renterName ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.renterName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.renterName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    이메일
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: '이메일을 입력해주세요',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: '유효한 이메일 주소를 입력해주세요',
                      },
                    })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
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

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                예약 기간
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    시작일
                  </label>
                  <input
                    type="date"
                    {...register('startDate', { required: '시작일을 선택해주세요' })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.startDate ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    종료일
                  </label>
                  <input
                    type="date"
                    {...register('endDate', {
                      required: '종료일을 선택해주세요',
                      validate: (value) =>
                        new Date(value) >= new Date(watch('startDate')) ||
                        '종료일은 시작일보다 이후여야 합니다',
                    })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.endDate ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                사용 주의사항
              </h2>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                {equipment.caution && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">기자재 주의사항</h3>
                    <p className="text-gray-700 whitespace-pre-line">{equipment.caution}</p>
                  </div>
                )}
                <h3 className="font-medium text-gray-900 mb-2">일반 주의사항</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>기자재는 반드시 지정된 기간 내에 반납해주세요.</li>
                  <li>기자재 사용 중 발생한 손상은 사용자가 책임져야 합니다.</li>
                  <li>기자재는 지정된 용도로만 사용해주세요.</li>
                  <li>반납 시 기자재 상태를 확인합니다.</li>
                </ul>
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  {...register('isPrecautionsAgreed', {
                    required: '사용 주의사항에 동의해주세요',
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  사용 주의사항을 모두 확인했으며 이에 동의합니다
                </label>
              </div>
              {errors.isPrecautionsAgreed && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.isPrecautionsAgreed.message}
                </p>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                개인정보 수집 및 이용 동의
              </h2>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-gray-700">
                  본인은 기자재 예약을 위해 필요한 최소한의 개인정보를 수집하고
                  이용하는 것에 동의합니다. 수집된 정보는 예약 관리 목적으로만
                  사용됩니다.
                </p>
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  {...register('isPrivacyAgreed', {
                    required: '개인정보 수집 및 이용에 동의해주세요',
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  개인정보 수집 및 이용에 동의합니다
                </label>
              </div>
              {errors.isPrivacyAgreed && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.isPrivacyAgreed.message}
                </p>
              )}
              <div className="flex justify-center mt-4">
                <a
                  href="/files/대여신청서.hwp"
                  download
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  대여신청서 다운로드
                </a>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                예약 신청
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 