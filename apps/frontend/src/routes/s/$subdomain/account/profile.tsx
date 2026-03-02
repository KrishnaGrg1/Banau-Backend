import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMyProfile, useUpdateMyProfile } from '@/hooks/use-customer-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Loader2, UserCircle } from 'lucide-react'

export const Route = createFileRoute('/s/$subdomain/account/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: res, isLoading } = useMyProfile()
  const { mutate: update, isPending } = useUpdateMyProfile()

  const profile = res?.data

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' })

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
      })
    }
  }, [profile])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    update(form)
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-xl font-bold">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information.
        </p>
      </div>

      {/* Avatar block */}
      <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <UserCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-semibold">
            {profile?.firstName} {profile?.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold text-sm mb-4">Personal Information</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, firstName: e.target.value }))
                }
                placeholder="First name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lastName: e.target.value }))
                }
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={profile?.email ?? ''} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="Phone number"
            />
          </div>

          <Separator />

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
