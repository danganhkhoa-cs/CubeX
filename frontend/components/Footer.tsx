export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-foreground">CubeX Marketplace</p>
            <p>Rare Rubik&apos;s cubes, trusted trades.</p>
          </div>
          <p className="text-xs text-muted-foreground">
            (c) 2026 CubeX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
