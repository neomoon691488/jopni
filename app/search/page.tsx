import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import SearchComponent from '@/components/SearchComponent'

export default async function SearchPage() {
  const user = await getCurrentUser()
  
  if (!user || user.status !== 'approved') {
    redirect('/login')
  }

  return (
    <>
      <Navbar userName={user.name} userAvatar={user.avatar} userRole={user.role} />
      <SearchComponent />
    </>
  )
}

