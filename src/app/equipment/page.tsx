"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'

interface Category {
  id: number
  name: string
  description: string | null
}

interface Equipment {
  id: number
  name: string
  description: string
  image: string
  status: string
  totalCount: number
  availableCount: number
  serialNumber: string
  categoryId: number
  category: Category
}

export default function EquipmentPage() {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [equipmentResponse, categoriesResponse] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/categories')
      ])

      if (!equipmentResponse.ok || !categoriesResponse.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다')
      }

      const [equipmentData, categoriesData] = await Promise.all([
        equipmentResponse.json(),
        categoriesResponse.json()
      ])

      setEquipmentData(equipmentData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('데이터 조회 중 오류:', error)
      toast.error('데이터를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const filteredEquipment = equipmentData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || item.categoryId === parseInt(categoryFilter)
    return matchesSearch && matchesCategory
  })

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
    <main className="min-h-screen p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold">기자재 목록</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="기자재 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48"
            >
              <option value="">전체 카테고리</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((equipment) => (
            <div key={equipment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img
                  src={equipment.image}
                  alt={equipment.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{equipment.name}</h2>
                <p className="text-gray-600 mb-4">{equipment.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    총 {equipment.totalCount}대 중 {equipment.availableCount}대 대여 가능
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    equipment.availableCount > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {equipment.availableCount > 0 ? '대여 가능' : '대여 불가'}
                  </span>
                </div>
                {equipment.availableCount > 0 ? (
                  <Link
                    href={`/rental/apply?id=${equipment.id}&name=${encodeURIComponent(equipment.name)}&serial=${equipment.serialNumber}`}
                    className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
                  >
                    대여하기
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed"
                  >
                    대여 불가
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
} 