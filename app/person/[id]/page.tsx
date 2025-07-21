import { getPersonDetails } from "@/lib/tmdb"
import PersonDetails from "@/components/person-details"
import { notFound } from "next/navigation"

interface PersonPageProps {
  params: Promise<{ id: string }>
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params

  try {
    const person = await getPersonDetails(id);

    if (!person) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="container mx-auto px-4 py-8">
          <PersonDetails person={person} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading person details:", error)
    notFound()
  }
}
