"use client"

import { useState, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import Link from 'next/link'
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

interface Category {
  id: number
  name: string
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    searchTerm: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [equipmentRes, categoriesRes] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/categories')
      ])

      if (!equipmentRes.ok || !categoriesRes.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다')
      }

      const [equipmentData, categoriesData] = await Promise.all([
        equipmentRes.json(),
        categoriesRes.json()
      ])

      setEquipment(equipmentData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('데이터 조회 중 오류:', error)
      toast.error('데이터를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  
  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 기자재를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('기자재 삭제에 실패했습니다')
      }

      toast.success('기자재가 삭제되었습니다')
      fetchData()
    } catch (error) {
      console.error('기자재 삭제 중 오류:', error)
      toast.error('기자재 삭제에 실패했습니다')
    }
  }

  const filteredEquipment = equipment.filter(item => {
    const matchesCategory = !filters.category || item.category.id === parseInt(filters.category)
    const matchesStatus = !filters.status || item.status === filters.status
    const matchesSearch = !filters.searchTerm || 
      item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(filters.searchTerm.toLowerCase())

    return matchesCategory && matchesStatus && matchesSearch
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">기자재 관리</h1>
          <Link
            href="/admin/equipment/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            기자재 등록
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">카테고리</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700">상태</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="available">대여가능</option>
                <option value="unavailable">대여불가</option>
                <option value="maintenance">수리중</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">검색</label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                placeholder="기자재명, 설명"
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
                  이미지
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  기자재명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수량
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
              {filteredEquipment.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative h-16 w-16">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover rounded-md"
                          priority
                          unoptimized
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-500">{item.name}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      총 {item.totalCount}개 / 대여가능 {item.availableCount}개
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'available' ? 'bg-green-100 text-green-800' :
                      item.status === 'unavailable' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'available' ? '대여가능' :
                       item.status === 'unavailable' ? '대여불가' :
                       '수리중'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/equipment/${item.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      수정
                    </Link>
                    <Link
                      href={`/admin/equipment/${item.id}/rentals`}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      대여현황
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
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