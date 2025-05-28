"use client"

import { useState, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'

interface Rental {
  id: number
  equipment: {
    id: number
    name: string
    category: {
      name: string
    }
  }
  renterName: string
  renterClass: string
  studentId: string
  email: string
  phone: string
  startDate: string
  endDate: string
  status: string
  createdAt: string
}

interface Category {
  id: number
  name: string
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    categoryId: '',
    searchTerm: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rentalsRes, categoriesRes] = await Promise.all([
        fetch('/api/rentals'),
        fetch('/api/categories')
      ])

      if (!rentalsRes.ok || !categoriesRes.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다')
      }

      const [rentalsData, categoriesData] = await Promise.all([
        rentalsRes.json(),
        categoriesRes.json()
      ])

      setRentals(rentalsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('데이터 조회 중 오류:', error)
      toast.error('데이터를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/rentals/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('대여 상태 변경에 실패했습니다')
      }

      toast.success('대여 상태가 변경되었습니다')
      fetchData()
    } catch (error) {
      console.error('대여 상태 변경 중 오류:', error)
      toast.error('대여 상태 변경에 실패했습니다')
    }
  }

  const filteredRentals = rentals.filter(rental => {
    const matchesStatus = !filters.status || rental.status === filters.status
    const matchesCategory = !filters.categoryId || 
      rental.equipment.category.name === categories.find(c => c.id.toString() === filters.categoryId)?.name
    const matchesSearch = !filters.searchTerm || 
      rental.renterName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      rental.studentId.includes(filters.searchTerm) ||
      rental.equipment.name.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesStatus && matchesCategory && matchesSearch
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

  return (
    <main className="min-h-screen p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">대여 관리</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">상태</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="rented">대여중</option>
                <option value="returned">반납완료</option>
                <option value="overdue">연체</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">카테고리</label>
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">전체</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
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
                placeholder="이름, 학번, 기자재명"
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
                  기자재
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  대여자
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
                    <div className="text-sm font-medium text-gray-900">{rental.equipment.name}</div>
                    <div className="text-sm text-gray-500">{rental.equipment.category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{rental.renterName}</div>
                    <div className="text-sm text-gray-500">{rental.studentId}</div>
                    <div className="text-sm text-gray-500">{rental.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(rental.startDate).toLocaleDateString()} ~ {new Date(rental.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      rental.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                      rental.status === 'returned' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {rental.status === 'rented' ? '대여중' :
                       rental.status === 'returned' ? '반납완료' : '연체'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {rental.status === 'rented' && (
                      <button
                        onClick={() => handleStatusChange(rental.id, 'returned')}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        반납처리
                      </button>
                    )}
                    {rental.status === 'rented' && (
                      <button
                        onClick={() => handleStatusChange(rental.id, 'overdue')}
                        className="text-red-600 hover:text-red-900"
                      >
                        연체처리
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