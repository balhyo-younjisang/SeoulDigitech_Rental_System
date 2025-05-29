"use client"

import { useState, useEffect, useCallback, use } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import Link from 'next/link'

interface Rental {
  id: number
  startDate: string
  endDate: string
  status: string
  serialNumber: string
  renterName: string
  renterClass: string
  studentId: string
  email: string
  phone: string
  equipment: {
    name: string
    serialNumber: string
  }
}

interface Equipment {
  id: number
  name: string
  serialNumber: string
  totalCount: number
  availableCount: number
}

export default function EquipmentRentalsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [rentals, setRentals] = useState<Rental[]>([])
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    serialNumber: '',
    searchTerm: ''
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [equipmentRes, rentalsRes] = await Promise.all([
        fetch(`/api/equipment/${resolvedParams.id}`),
        fetch(`/api/equipment/${resolvedParams.id}/rentals`)
      ])

      if (!equipmentRes.ok) {
        throw new Error(`기자재 정보 조회 실패: ${equipmentRes.statusText}`)
      }

      if (!rentalsRes.ok) {
        throw new Error(`대여 현황 조회 실패: ${rentalsRes.statusText}`)
      }

      const [equipmentData, rentalsData] = await Promise.all([
        equipmentRes.json(),
        rentalsRes.json()
      ])

      setEquipment(equipmentData)
      setRentals(rentalsData)
    } catch (error) {
      console.error('데이터 조회 중 오류:', error)
      toast.error(error instanceof Error ? error.message : '데이터를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStatusChange = async (rentalId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/rentals/${rentalId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('상태 변경에 실패했습니다')
      }

      toast.success('대여 상태가 변경되었습니다')
      fetchData()
    } catch (error) {
      console.error('상태 변경 중 오류:', error)
      toast.error('상태 변경에 실패했습니다')
    }
  }

  const filteredRentals = rentals.filter(rental => {
    const matchesStatus = !filters.status || rental.status === filters.status
    const matchesSerialNumber = !filters.serialNumber || rental.serialNumber === filters.serialNumber
    const matchesSearch = !filters.searchTerm || 
      rental.renterName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      rental.studentId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      rental.phone.includes(filters.searchTerm)

    return matchesStatus && matchesSerialNumber && matchesSearch
  })

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
            <p className="text-gray-600">기자재를 찾을 수 없습니다</p>
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
          <div>
            <h1 className="text-3xl font-bold">{equipment.name} 대여 현황</h1>
            <p className="text-gray-600 mt-2">
              시리얼번호: {equipment.serialNumber} | 
              총 수량: {equipment.totalCount} | 
              대여가능: {equipment.availableCount}
            </p>
          </div>
          <Link
            href="/admin/equipment"
            className="text-blue-600 hover:text-blue-900"
          >
            ← 기자재 목록으로
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">대여 상태</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="pending">대기중</option>
                <option value="approved">승인됨</option>
                <option value="rejected">거절됨</option>
                <option value="returned">반납됨</option>
                <option value="overdue">연체</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">시리얼번호</label>
              <select
                value={filters.serialNumber}
                onChange={(e) => setFilters({ ...filters, serialNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">전체</option>
                {Array.from(new Set(rentals.map(rental => rental.serialNumber))).map(serialNumber => (
                  <option key={serialNumber} value={serialNumber}>
                    {serialNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">검색</label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                placeholder="이름, 학번, 전화번호"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  대여자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시리얼번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  대여기간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRentals.map((rental) => (
                <tr key={rental.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{rental.renterName}</div>
                    <div className="text-sm text-gray-500">{rental.studentId}</div>
                    <div className="text-sm text-gray-500">{rental.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{rental.serialNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(rental.startDate).toLocaleDateString()} ~ {new Date(rental.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      rental.status === 'approved' ? 'bg-green-100 text-green-800' :
                      rental.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      rental.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      rental.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {rental.status === 'approved' ? '승인됨' :
                       rental.status === 'pending' ? '대기중' :
                       rental.status === 'rejected' ? '거절됨' :
                       rental.status === 'returned' ? '반납됨' :
                       '연체'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {rental.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(rental.id, 'approved')}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleStatusChange(rental.id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          거절
                        </button>
                      </>
                    )}
                    {rental.status === 'approved' && (
                      <button
                        onClick={() => handleStatusChange(rental.id, 'returned')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        반납처리
                      </button>
                    )}
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