"use client";

import Link from "next/link";
import Image from "next/image";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

// Navigation items for consistency
const navigationItems = [
  { href: "/storage", label: "Storage" },
  { href: "/streaming", label: "Streaming" },
  { href: "/explore", label: "Explore" },
  { href: "/creators", label: "Creators" },
  { href: "/community", label: "Community" },
];

const Logo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <Image
    src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg"
    className={className}
    alt="Stream Verse Logo"
    loading="eager"
    width={32}
    height={32}
  />
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          className="flex h-14 sm:h-16 items-center justify-between"
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
            aria-label="Stream Verse Home"
          >
            <Logo />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Stream Verse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex items-center space-x-1">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    href={item.href}
                    className={navigationMenuTriggerStyle()}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <ConnectButton
                chainStatus="icon"
                accountStatus={{
                  smallScreen: "avatar",
                  largeScreen: "full",
                }}
                showBalance={{
                  smallScreen: false,
                  largeScreen: false,
                }}
                label="Connect Wallet"
              />
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <ConnectButton
                chainStatus="none"
                accountStatus="avatar"
                showBalance={false}
                label="Connect"
              />

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="Open navigation menu"
                  >
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[280px] sm:w-[320px] px-0 flex flex-col"
                >
                  {/* Mobile Menu Header */}
                  <SheetHeader className="border-b px-6 pb-4">
                    <SheetTitle className="text-left">
                      <Link
                        href="/"
                        className="flex items-center gap-2"
                        onClick={handleLinkClick}
                      >
                        <Logo className="h-6 w-6" />
                        <span className="text-base font-semibold">
                          Stream Verse
                        </span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  {/* Mobile Menu Content */}
                  <div className="flex flex-col flex-1 px-6 py-6">
                    {/* Navigation Links */}
                    <div className="space-y-1 mb-8">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                        Navigation
                      </h3>
                      {navigationItems.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={handleLinkClick}
                          className="flex items-center py-3 px-3 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>

                    {/* Mobile Settings */}
                    <div className="mt-auto space-y-4">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Settings
                      </h3>

                      {/* Theme Toggle */}
                      <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-accent/50">
                        <span className="text-sm font-medium">Theme</span>
                        <ThemeToggle />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
