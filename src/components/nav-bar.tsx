"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import type { Session } from "next-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

type NavBarProps = {
  session: Session;
};

const primaryLinks = [
  { href: "/", label: "Marché" },
  { href: "/portfolio", label: "Portfolio" },
];

export function NavBar({ session }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const userName = session.user?.name?.trim() || session.user?.email?.split("@")[0] || "Compte";
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-[0.18em] uppercase text-foreground"
        >
          <span className="inline-flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            N
          </span>
          <span className="hidden sm:inline">NGCrops</span>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-1">
            {primaryLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    href={link.href}
                    data-active={isActive}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "text-sm",
                      isActive && "bg-muted text-foreground"
                    )}
                  >
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-2 py-1.5 text-left shadow-sm transition-colors hover:bg-card">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-none text-foreground">{userName}</p>
                <p className="mt-1 text-xs text-muted-foreground">Connecté</p>
              </div>
              <Avatar className="size-9">
                <AvatarImage src={session.user?.image ?? undefined} alt={userName} />
                <AvatarFallback>{userInitials || "NG"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="space-y-1">
                <div className="text-sm font-medium text-foreground">{userName}</div>
                <div className="text-xs font-normal text-muted-foreground">
                  {session.user?.email ?? "Compte connecté"}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push("/")}>Marché global</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/portfolio")}>Mon portfolio</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/profile")}>Mon profil</DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  void signOut({ callbackUrl: "/auth/signin" });
                }}
              >
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
