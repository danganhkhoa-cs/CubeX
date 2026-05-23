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
import { Textarea } from "@/components/ui/textarea"

export default function Page() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Create listing</h1>
        <p className="text-sm text-muted-foreground">
          Share your Rubik's cube with full specs and trusted seller details.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listing details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Aurora 3x3 Limited" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3x3">3x3</SelectItem>
                  <SelectItem value="4x4">4x4</SelectItem>
                  <SelectItem value="collector">Collector</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" placeholder="$120" />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gan">GAN</SelectItem>
                  <SelectItem value="moyu">MoYu</SelectItem>
                  <SelectItem value="qiyi">QiYi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Share the story, condition, and shipping details."
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="specs">Specs (JSON)</Label>
            <Textarea
              id="specs"
              rows={6}
              placeholder='{"size":"3x3","magnet_type":"edge","coated_type":"frosted"}'
            />
          </div>

          <Button className="w-full">Create listing</Button>
        </CardContent>
      </Card>
    </main>
  )
}
