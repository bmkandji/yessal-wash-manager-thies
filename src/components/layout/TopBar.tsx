
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Settings } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <Link to="/dashboard" className="flex items-center">
          <span className="font-bold text-xl text-primary">Yessal Manager</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Rechercher</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Paramètres</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
