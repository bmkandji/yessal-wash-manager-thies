
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, User } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export const TopBar: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <Link to="/dashboard" className="flex items-center">
          <img src="/yessal-logo.png" alt="Yessal Logo" className="h-8 w-auto mr-2" />
          <span className="font-bold text-xl text-primary">Yessal Manager</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Rechercher</span>
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Profil</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon Profil</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm">
                <p><strong>Nom:</strong> Diop</p>
                <p><strong>Prénom:</strong> Abdou</p>
                <p><strong>Adresse:</strong> Thiès Nord, Sénégal</p>
                <p><strong>Téléphone:</strong> 77 123 45 67</p>
              </div>
              <DropdownMenuSeparator />
              <Link to="/">
                <DropdownMenuItem className="cursor-pointer text-red-600">
                  Déconnexion
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
