'use client'

import { useState, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'

interface Rental {
  id: number
  equipment: {
    id: number
    name: string
    category: {
      id: number
      name: string
    }
  }
  renterName: string
  studentId: string
  email: string
  phone: string
  startDate: string
  endDate: string
  status: string
  createdAt: string
}

export default function RentalPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRentals()
  }, [])

  const fetchRentals = async () => {
    try {
      const response = await fetch('/api/rentals')
      if (!response.ok) {
        throw new Error('대여 목록을 불러오는데 실패했습니다')
      }
      const data = await response.json()
      setRentals(data)
    } catch (error) {
      console.error('대여 목록 조회 중 오류:', error)
      toast.error('대여 목록을 불러오는데 실패했습니다')
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

  return (
    <main className="min-h-screen p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">대여 목록</h1>

        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  기자재
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  대여자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  대여 기간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rentals.map((rental) => (
                <tr key={rental.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rental.equipment.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {rental.equipment.category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{rental.renterName}</div>
                    <div className="text-sm text-gray-500">{rental.studentId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(rental.startDate).toLocaleDateString()} ~{' '}
                      {new Date(rental.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      rental.status === 'rented' ? 'bg-green-100 text-green-800' :
                      rental.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rental.status === 'rented' ? '대여중' :
                       rental.status === 'returned' ? '반납완료' :
                       '대기중'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
} 