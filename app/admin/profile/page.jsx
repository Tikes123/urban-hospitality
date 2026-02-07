"use client"

import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600 mb-6">Manage your account details.</p>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-green-100 text-green-800 text-xl">TR</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Trainee</CardTitle>
                  <CardDescription>Admin</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Trainee" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@example.com" />
              </div>
              <Button className="bg-green-600 hover:bg-green-700">Save changes</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
