import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Page() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">System config</h1>
        <p className="text-sm text-muted-foreground">
          Tune fees, brand catalogs, and marketplace defaults.
        </p>
      </header>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
        </TabsList>
        <TabsContent value="marketplace">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fees & rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fee">Platform fee (%)</Label>
                  <Input id="fee" placeholder="3.5" />
                </div>
                <div className="space-y-2">
                  <Label>Settlement schedule</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Weekly" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <Button>Save settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="catalog">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Brand & category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Add brand</Label>
                <Input id="brand" placeholder="GAN" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Add category</Label>
                <Input id="category" placeholder="Limited editions" />
              </div>
              <Separator />
              <Button variant="outline">Update catalog</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
