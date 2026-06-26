"use client";

import { Sheet,SheetTrigger,SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "../ui/button";
import Link from "next/link";
import { ChartArea, Home, LogOut, Package, PanelBottom, Settings, User } from "lucide-react";


export function Sidebar() {
  return (
    <div className="flex w-full flex-col bg-muted/40">
        
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 border-r bg-background sm:flex flex-col"
        >
            <nav className="flex flex-col items-center gap-4 py-5 px-2">
                    <Link href="#"
                           className=" flex items-center h-9 w-9 bg-primary rounded-full text-primary-foreground justify-center shrink-0"
                     >
                     <Package className="h-4 w-4" />
                     <span className="sr-only">Logo</span>
                     </Link>                   
                    <Link
                      href="/"
                      title="Dashboard"
                      className=" flex items-center h-9 w-9  rounded-lg text-muted-foreground justify-center shrink-0 transition-colors hover:text-foreground"
                    >
                      <ChartArea className="h-4 w-4" />
                      <span className="sr-only">Dashboard</span>
                    </Link>
                    <Link
                      href="/clientes"
                      title="Clientes"
                      className=" flex items-center h-9 w-9  rounded-lg text-muted-foreground justify-center shrink-0 transition-colors hover:text-foreground"
                    >
                      <User className="h-4 w-4" />
                      <span className="sr-only">clientes</span>
                    </Link>
                  
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 py-5 px-2">
                    <Link
                      href="#"
                      title="Sair"
                      className=" flex items-center h-9 w-9  rounded-lg text-muted-foreground justify-center shrink-0 transition-colors hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Sair</span>
                    </Link>
            </nav>
        </aside>
        
        <div className="sm:hidden flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <header className="sticky top-0 z-30 flex h-14 items-center px-4 border-b bg-background gap-4 sm:static sm:border-0 sm:bg-transparent sm:px-6 sm:h-auto">
               <Sheet >
                 <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                        <PanelBottom className="h-5 w-5 " />
                        <span className="sr-only">Abrir / fechar menu</span>
                    </Button>
                 </SheetTrigger>
                 <SheetContent side="left" className="sm:max-w-xs p-6">
                   <SheetTitle>
                    <Link href="#"
                           className=" flex items-center h-10 w-10 bg-primary rounded-full text-primary-foreground text-lg justify-center md:text-base gap-2"
                           prefetch={false}
                     >
                     <Package className="h-5 w-5 transition-all" />
                     <span className="sr-only">Logo</span>
                     </Link>
                   </SheetTitle>

                   <nav className="grid gap-6 text-lg font-medium">
                     

                     <Link href="#"
                           className="flex items-center px-2.5 text-muted-foreground hover:text-foreground gap-4"
                           prefetch={false}
                     >
                     <Home className="h-5 w-5 transition-all" />
                     Inicio
                     </Link>
                          <Link href="/clientes"
                           className="flex items-center px-2.5 text-muted-foreground hover:text-foreground gap-4"
                           prefetch={false}
                     >
                     <ChartArea className="h-5 w-5 transition-all" />
                     Dashboard
                     </Link>
                      <Link href="#"
                           className="flex items-center px-2.5 text-muted-foreground hover:text-foreground gap-4"
                           prefetch={false}
                     >
                     <User className="h-5 w-5 transition-all" />
                     Clientes
                     </Link>
                      <Link href="#"
                           className="flex items-center px-2.5 text-muted-foreground hover:text-foreground gap-4"
                           prefetch={false}
                     >
                     <Settings className="h-5 w-5 transition-all" />
                     Configurações
                     </Link>
                   </nav>
                 </SheetContent>
               </Sheet>

            </header>
        </div>
    </div>
  );
}
