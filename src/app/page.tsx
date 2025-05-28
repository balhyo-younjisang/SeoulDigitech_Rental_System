import dynamic from 'next/dynamic'

const HomePage = dynamic(() => import('@/app/HomePage'))

export default function Home() {
  return <HomePage />
}
