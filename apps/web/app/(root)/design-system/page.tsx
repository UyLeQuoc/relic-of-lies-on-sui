"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComponentShowcase } from "./_components/component-showcase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ButtonGroup } from "@/components/ui/button-group"
import { AlertCircle, X, ChevronDownIcon } from "lucide-react"
import { CardCharacter } from "@/components/common/game-ui/cards/card-character"
import { CardConceptType, CardType, cardTypes, cardsMap } from "@/components/common/game-ui/cards/types"

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Design System</h1>
        <p className="text-muted-foreground">
          A comprehensive showcase of all UI components available in the design system.
        </p>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-8">
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-6">
          <ComponentShowcase
            title="Card Character - All Cards"
            description="All card types from Relic of Lies"
          >
            <div className="flex flex-wrap gap-6 justify-center items-start">
              {cardTypes.map((cardType) => (
                <div key={cardType} className="flex flex-col items-center gap-2">
                  <CardCharacter
                    cardType={cardType}
                    size="md"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {cardsMap[CardConceptType.RelicOfLies].cards[cardType].name}
                  </p>
                </div>
              ))}
            </div>
          </ComponentShowcase>

          <ComponentShowcase
            title="Card Character - With Flip"
            description="Card with flip functionality enabled"
          >
            <div className="flex flex-wrap gap-6 justify-center items-start">
              {[CardType.Value0, CardType.Value1, CardType.Value2].map((cardType) => (
                <div key={cardType} className="flex flex-col items-center gap-2">
                  <CardCharacter
                    cardConcept={cardsMap[CardConceptType.RelicOfLies]}
                    cardType={cardType}
                    height={280}
                    isFlip
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {cardsMap[CardConceptType.RelicOfLies].cards[cardType].name} (Click to flip)
                  </p>
                </div>
              ))}
            </div>
          </ComponentShowcase>

          <ComponentShowcase
            title="Card Character - Different Sizes"
            description="Cards with different height sizes"
          >
            <div className="flex flex-wrap gap-6 justify-center items-end">
              <div className="flex flex-col items-center gap-2">
                <CardCharacter
                  cardConcept={cardsMap[CardConceptType.RelicOfLies]}
                  cardType={CardType.Value0}
                  height={200}
                />
                <p className="text-xs text-muted-foreground">Small (200px)</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CardCharacter
                  cardConcept={cardsMap[CardConceptType.RelicOfLies]}
                  cardType={CardType.Value5}
                  height={280}
                />
                <p className="text-xs text-muted-foreground">Medium (280px)</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CardCharacter
                  cardConcept={cardsMap[CardConceptType.RelicOfLies]}
                  cardType={CardType.Value9}
                  height={384}
                />
                <p className="text-xs text-muted-foreground">Large (384px)</p>
              </div>
            </div>
          </ComponentShowcase>
        </TabsContent>

        <TabsContent value="buttons" className="space-y-6">
          <ComponentShowcase
            title="Button"
            description="Button component with multiple variants and sizes"
          >
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </ComponentShowcase>

          <ComponentShowcase
            title="Toggle"
            description="Toggle button component"
          >
            <Toggle>Toggle</Toggle>
            <Toggle pressed>Pressed</Toggle>
            <Toggle disabled>Disabled</Toggle>
          </ComponentShowcase>

          <ComponentShowcase
            title="Toggle Group"
            description="Group of toggle buttons"
          >
            <ToggleGroup type="single">
              <ToggleGroupItem value="a">Option A</ToggleGroupItem>
              <ToggleGroupItem value="b">Option B</ToggleGroupItem>
              <ToggleGroupItem value="c">Option C</ToggleGroupItem>
            </ToggleGroup>
          </ComponentShowcase>

          <ComponentShowcase
            title="Button Group"
            description="Group of buttons"
          >
            <ButtonGroup>
              <Button>First</Button>
              <Button>Middle</Button>
              <Button>Last</Button>
            </ButtonGroup>
          </ComponentShowcase>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <ComponentShowcase
            title="Input"
            description="Text input component"
          >
            <Input placeholder="Enter text..." />
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
            <Input disabled placeholder="Disabled" />
          </ComponentShowcase>

          <ComponentShowcase
            title="Textarea"
            description="Multi-line text input"
          >
            <Textarea placeholder="Enter message..." className="w-full max-w-md" />
          </ComponentShowcase>

          <ComponentShowcase
            title="Label"
            description="Form label component"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" />
            </div>
          </ComponentShowcase>

          <ComponentShowcase
            title="Checkbox"
            description="Checkbox input"
          >
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="newsletter" defaultChecked />
              <Label htmlFor="newsletter">Subscribe to newsletter</Label>
            </div>
          </ComponentShowcase>

          <ComponentShowcase
            title="Radio Group"
            description="Radio button group"
          >
            <RadioGroup defaultValue="option-one">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-one" id="option-one" />
                <Label htmlFor="option-one">Option One</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-two" id="option-two" />
                <Label htmlFor="option-two">Option Two</Label>
              </div>
            </RadioGroup>
          </ComponentShowcase>

          <ComponentShowcase
            title="Switch"
            description="Toggle switch component"
          >
            <div className="flex items-center space-x-2">
              <Switch id="airplane-mode" />
              <Label htmlFor="airplane-mode">Airplane Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" defaultChecked />
              <Label htmlFor="notifications">Notifications</Label>
            </div>
          </ComponentShowcase>

          <ComponentShowcase
            title="Select"
            description="Dropdown select component"
          >
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </ComponentShowcase>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <ComponentShowcase
            title="Alert"
            description="Alert component for displaying messages"
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                This is an alert message.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong.
              </AlertDescription>
            </Alert>
          </ComponentShowcase>

          <ComponentShowcase
            title="Progress"
            description="Progress bar component"
          >
            <div className="w-full max-w-md space-y-2">
              <Progress value={33} />
              <Progress value={66} />
              <Progress value={100} />
            </div>
          </ComponentShowcase>

          <ComponentShowcase
            title="Skeleton"
            description="Loading skeleton component"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-12 w-full" />
            </div>
          </ComponentShowcase>

          <ComponentShowcase
            title="Spinner"
            description="Loading spinner component"
          >
            <Spinner />
          </ComponentShowcase>

          <ComponentShowcase
            title="Empty"
            description="Empty state component"
          >
            <Empty className="w-full max-w-md">
              <EmptyHeader>
                <EmptyTitle>No items found</EmptyTitle>
                <EmptyDescription>
                  Get started by creating a new item.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </ComponentShowcase>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <ComponentShowcase
            title="Breadcrumb"
            description="Breadcrumb navigation component"
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </ComponentShowcase>

          <ComponentShowcase
            title="Accordion"
            description="Collapsible accordion component"
          >
            <Accordion type="single" collapsible className="w-full max-w-md">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>
                  Yes. It comes with default styles that match the other components.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ComponentShowcase>

          <ComponentShowcase
            title="Pagination"
            description="Pagination navigation component"
          >
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">10</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </ComponentShowcase>

          <ComponentShowcase
            title="Collapsible"
            description="Collapsible content component"
          >
            <Collapsible className="w-full max-w-md space-y-2">
              <div className="flex items-center justify-between space-x-4 px-4">
                <h4 className="text-sm font-semibold">
                  @peduarte starred 3 repositories
                </h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <div className="rounded-md border px-4 py-3 font-mono text-sm">
                @radix-ui/primitives
              </div>
              <CollapsibleContent className="space-y-2">
                <div className="rounded-md border px-4 py-3 font-mono text-sm">
                  @radix-ui/colors
                </div>
                <div className="rounded-md border px-4 py-3 font-mono text-sm">
                  @stitches/react
                </div>
              </CollapsibleContent>
            </Collapsible>
          </ComponentShowcase>
        </TabsContent>

        <TabsContent value="overlays" className="space-y-6">
          <ComponentShowcase
            title="Dialog, Sheet, Drawer, Popover, Tooltip"
            description="Overlay components - see individual component files for usage examples"
          >
            <p className="text-sm text-muted-foreground">
              These components require interactive state management. Refer to their individual component files for implementation examples.
            </p>
          </ComponentShowcase>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <ComponentShowcase
            title="Card"
            description="Card container component"
          >
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card content area</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>
          </ComponentShowcase>

          <ComponentShowcase
            title="Badge"
            description="Badge component with variants"
          >
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="ghost">Ghost</Badge>
          </ComponentShowcase>

          <ComponentShowcase
            title="Avatar"
            description="Avatar component"
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <AvatarGroup>
              <Avatar>
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>CD</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>EF</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>+5</AvatarGroupCount>
            </AvatarGroup>
          </ComponentShowcase>

          <ComponentShowcase
            title="Separator"
            description="Visual separator component"
          >
            <div className="space-y-1">
              <div>Section 1</div>
              <Separator />
              <div>Section 2</div>
              <Separator orientation="vertical" className="h-4" />
              <div>Section 3</div>
            </div>
          </ComponentShowcase>

          <ComponentShowcase
            title="Table"
            description="Table component for displaying data"
          >
            <Table className="w-full max-w-md">
              <TableCaption>A list of recent invoices.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">INV001</TableCell>
                  <TableCell>Paid</TableCell>
                  <TableCell className="text-right">$250.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">INV002</TableCell>
                  <TableCell>Pending</TableCell>
                  <TableCell className="text-right">$150.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">INV003</TableCell>
                  <TableCell>Unpaid</TableCell>
                  <TableCell className="text-right">$350.00</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell className="text-right">$750.00</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </ComponentShowcase>

          <ComponentShowcase
            title="Kbd"
            description="Keyboard key indicator component"
          >
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>Alt</Kbd>
            <Kbd>Del</Kbd>
          </ComponentShowcase>
        </TabsContent>
      </Tabs>
    </div>
  )
}

