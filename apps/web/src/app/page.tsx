"use client"

import { useToast } from "../components/ui/use-toast"

export default function Home() {
  const { toast } = useToast()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <button
        onClick={() => {
          toast({
            title: "Test Toast",
            description: "This is a test toast notification",
          })
        }}
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Show Toast
      </button>
    </main>
  )
}
