import Link from "next/link"
import type { Genre } from "@/types/movie"

interface GenreGridProps {
  genres: Genre[]
}

const genreColors = {
  28: "from-red-600 to-red-800", // Action
  12: "from-yellow-500 to-yellow-700", // Adventure
  16: "from-purple-500 to-purple-700", // Animation
  35: "from-orange-500 to-orange-700", // Comedy
  80: "from-gray-600 to-gray-800", // Crime
  99: "from-blue-400 to-blue-600", // Documentary
  18: "from-teal-500 to-teal-700", // Drama
  10751: "from-pink-400 to-pink-600", // Family
  14: "from-indigo-500 to-indigo-700", // Fantasy
  36: "from-amber-600 to-amber-800", // History
  27: "from-stone-800 to-black", // Horror
  10402: "from-fuchsia-500 to-fuchsia-700", // Music
  9648: "from-zinc-700 to-zinc-900", // Mystery
  10749: "from-rose-400 to-rose-600", // Romance
  878: "from-sky-500 to-sky-700", // Science Fiction
  10770: "from-lime-600 to-lime-800", // TV Movie
  53: "from-slate-700 to-slate-900", // Thriller
  10752: "from-emerald-700 to-emerald-900", // War
  37: "from-yellow-800 to-yellow-900", // Western
}

export default function GenreGrid({ genres }: GenreGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {genres.map((genre) => (
        <Link
          key={genre.id}
          href={`/search?genre=${genre.id}`}
          className="group relative aspect-[4/3] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              genreColors[genre.id as keyof typeof genreColors] || "from-gray-800 to-gray-900"
            }`}
          />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-300"
            style={{
              backgroundImage: `url(/placeholder.svg?height=300&width=400&text=${encodeURIComponent(genre.name)})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-white text-xl font-bold text-center px-4 drop-shadow-lg">{genre.name}</h2>
          </div>
        </Link>
      ))}
    </div>
  )
}
