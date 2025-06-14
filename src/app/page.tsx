'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-xl flex flex-col items-center gap-10 pt-20">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Game Recommender</h1>
          <p className="text-gray-500 text-lg">
            Discover new games based on what you like.
          </p>
        </div>

        <Card className="w-full shadow-md">
          <CardContent className="p-6 space-y-4">
            <Input
              placeholder="Enter query here...."
              className="text-base"
            />
            <Button className="w-full" disabled>
              Search
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
