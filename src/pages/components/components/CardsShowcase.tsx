import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, MapPin, Heart, Share2, MoreVertical } from "lucide-react";

const CardsShowcase = () => {
  return (
    <div className="space-y-6">
      {/* Basic Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
            <CardDescription>
              A basic card with header and content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is the card content area. Add any content here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card with Footer</CardTitle>
            <CardDescription>
              Card with header, content, and footer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Card content with action buttons in the footer.
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button size="sm">Action</Button>
            <Button size="sm" variant="outline">Cancel</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Card</CardTitle>
          <CardDescription>
            User profile with stats and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              JD
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">John Doe</h3>
                  <p className="text-sm text-muted-foreground">Product Designer</p>
                </div>
                <Button size="sm" variant="outline">Follow</Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  San Francisco, CA
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined Jan 2024
                </div>
              </div>
              <div className="flex gap-4 mt-3">
                <div>
                  <div className="font-semibold">1,234</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div>
                  <div className="font-semibold">567</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
                <div>
                  <div className="font-semibold">89</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Stats Cards</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2,350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Content Cards</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge>Featured</Badge>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle>Beautiful Sunset</CardTitle>
              <CardDescription>
                Amazing sunset captured at the beach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A stunning view of the sunset over the ocean, with vibrant colors painting the sky.
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Heart className="h-4 w-4 mr-1" />
                  234
                </Button>
                <Button size="sm" variant="ghost">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-500" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">New</Badge>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle>Mountain Peak</CardTitle>
              <CardDescription>
                Majestic mountain landscape
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Breathtaking view from the summit, overlooking the valley below with snow-capped peaks.
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Heart className="h-4 w-4 mr-1" />
                  189
                </Button>
                <Button size="sm" variant="ghost">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">5 hours ago</span>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Interactive Card */}
      <Card className="border-2 border-dashed hover:border-solid hover:border-primary transition-all cursor-pointer">
        <CardContent className="flex flex-col items-center justify-center h-48">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Create New Card</h3>
          <p className="text-sm text-muted-foreground">
            Click to add a new card
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardsShowcase;
