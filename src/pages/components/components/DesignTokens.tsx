import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DesignTokens = () => {
  const colors = [
    { name: "Primary", class: "bg-primary", textClass: "text-primary-foreground" },
    { name: "Secondary", class: "bg-secondary", textClass: "text-secondary-foreground" },
    { name: "Accent", class: "bg-accent", textClass: "text-accent-foreground" },
    { name: "Destructive", class: "bg-destructive", textClass: "text-destructive-foreground" },
    { name: "Muted", class: "bg-muted", textClass: "text-muted-foreground" },
    { name: "Card", class: "bg-card border", textClass: "text-card-foreground" },
  ];

  const spacings = [
    { name: "0.5", value: "2px", class: "h-0.5" },
    { name: "1", value: "4px", class: "h-1" },
    { name: "2", value: "8px", class: "h-2" },
    { name: "3", value: "12px", class: "h-3" },
    { name: "4", value: "16px", class: "h-4" },
    { name: "6", value: "24px", class: "h-6" },
    { name: "8", value: "32px", class: "h-8" },
    { name: "12", value: "48px", class: "h-12" },
    { name: "16", value: "64px", class: "h-16" },
  ];

  const typography = [
    { name: "xs", class: "text-xs", sample: "The quick brown fox jumps" },
    { name: "sm", class: "text-sm", sample: "The quick brown fox jumps" },
    { name: "base", class: "text-base", sample: "The quick brown fox jumps" },
    { name: "lg", class: "text-lg", sample: "The quick brown fox jumps" },
    { name: "xl", class: "text-xl", sample: "The quick brown fox jumps" },
    { name: "2xl", class: "text-2xl", sample: "The quick brown fox" },
    { name: "3xl", class: "text-3xl", sample: "The quick brown" },
    { name: "4xl", class: "text-4xl", sample: "The quick" },
  ];

  const borderRadius = [
    { name: "none", class: "rounded-none" },
    { name: "sm", class: "rounded-sm" },
    { name: "default", class: "rounded" },
    { name: "md", class: "rounded-md" },
    { name: "lg", class: "rounded-lg" },
    { name: "xl", class: "rounded-xl" },
    { name: "2xl", class: "rounded-2xl" },
    { name: "3xl", class: "rounded-3xl" },
    { name: "full", class: "rounded-full" },
  ];

  return (
    <div className="space-y-6">
      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>
            Semantic color tokens used throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {colors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div className={`${color.class} ${color.textClass} p-4 rounded-lg`}>
                  <p className="font-semibold">{color.name}</p>
                  <p className="text-sm opacity-90">Text Color</p>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {color.class}
                </code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Scale</CardTitle>
          <CardDescription>
            Font sizes and line heights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {typography.map((type) => (
              <div key={type.name} className="flex items-center gap-4 border-b pb-4">
                <div className="w-16 text-sm text-muted-foreground font-mono">
                  {type.name}
                </div>
                <div className={type.class}>
                  {type.sample}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card>
        <CardHeader>
          <CardTitle>Spacing Scale</CardTitle>
          <CardDescription>
            Consistent spacing values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {spacings.map((spacing) => (
              <div key={spacing.name} className="flex items-center gap-4">
                <div className="w-12 text-sm text-muted-foreground font-mono">
                  {spacing.name}
                </div>
                <div className="w-16 text-xs text-muted-foreground">
                  {spacing.value}
                </div>
                <div className={`${spacing.class} bg-primary rounded`} style={{ width: spacing.value }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card>
        <CardHeader>
          <CardTitle>Border Radius</CardTitle>
          <CardDescription>
            Rounded corner variations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {borderRadius.map((radius) => (
              <div key={radius.name} className="space-y-2">
                <div className={`${radius.class} bg-primary h-16 w-full`} />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{radius.name}</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {radius.class}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shadows */}
      <Card>
        <CardHeader>
          <CardTitle>Shadows</CardTitle>
          <CardDescription>
            Shadow elevations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="shadow-sm bg-card border p-4 rounded-lg">
                <p className="text-sm font-medium">Small</p>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                shadow-sm
              </code>
            </div>
            <div className="space-y-2">
              <div className="shadow bg-card border p-4 rounded-lg">
                <p className="text-sm font-medium">Default</p>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                shadow
              </code>
            </div>
            <div className="space-y-2">
              <div className="shadow-md bg-card border p-4 rounded-lg">
                <p className="text-sm font-medium">Medium</p>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                shadow-md
              </code>
            </div>
            <div className="space-y-2">
              <div className="shadow-lg bg-card border p-4 rounded-lg">
                <p className="text-sm font-medium">Large</p>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                shadow-lg
              </code>
            </div>
            <div className="space-y-2">
              <div className="shadow-xl bg-card border p-4 rounded-lg">
                <p className="text-sm font-medium">Extra Large</p>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                shadow-xl
              </code>
            </div>
            <div className="space-y-2">
              <div className="shadow-2xl bg-card border p-4 rounded-lg">
                <p className="text-sm font-medium">2XL</p>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                shadow-2xl
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignTokens;
