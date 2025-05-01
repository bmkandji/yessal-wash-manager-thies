
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, ScanQrCode, User } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  phone: string;
  cardNumber: string;
}

const mockClients: Client[] = [
  { id: '1', name: 'Abdou Diop', phone: '77 123 45 67', cardNumber: 'Y10012' },
  { id: '2', name: 'Fatou Ndiaye', phone: '70 876 54 32', cardNumber: 'Y10025' },
  { id: '3', name: 'Moustapha Seck', phone: '76 543 21 98', cardNumber: 'Y10037' },
  { id: '4', name: 'Aminata Fall', phone: '78 765 43 21', cardNumber: 'Y10042' },
  { id: '5', name: 'Ousmane Diallo', phone: '77 987 65 43', cardNumber: 'Y10056' },
];

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Filter clients based on search query
    const results = mockClients.filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.replace(/\s/g, '').includes(searchQuery.replace(/\s/g, '')) ||
      client.cardNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
  };

  const startScanning = () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      // Pretend we found a client with the QR code
      setSearchResults([mockClients[2]]);
    }, 2000);
  };

  const selectClient = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const createNewOrder = () => {
    navigate('/new-order', { state: { clientType: 'non-registered' } });
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recherche Client</h1>
        <p className="text-muted-foreground">
          Rechercher un client ou scanner sa carte
        </p>
      </div>

      <Tabs defaultValue="search">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="search">Recherche</TabsTrigger>
          <TabsTrigger value="scan">Scanner</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Nom, téléphone ou numéro de carte" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="button" onClick={handleSearch}>
              <SearchIcon className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((client) => (
                <Card 
                  key={client.id} 
                  className="cursor-pointer hover:bg-gray-50" 
                  onClick={() => selectClient(client.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-500">Tél: {client.phone}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-primary font-semibold">{client.cardNumber}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun client trouvé</p>
            </div>
          ) : null}
        </TabsContent>
        
        <TabsContent value="scan" className="space-y-4">
          <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
            {isScanning ? (
              <div className="text-center">
                <div className="animate-pulse">
                  <ScanQrCode className="h-12 w-12 text-primary mx-auto" />
                </div>
                <p className="mt-4">Scan en cours...</p>
              </div>
            ) : (
              <div className="text-center">
                <ScanQrCode className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-4">Prêt à scanner</p>
                <Button className="mt-4" onClick={startScanning}>
                  Démarrer le scan
                </Button>
              </div>
            )}
          </div>
          
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((client) => (
                <Card 
                  key={client.id} 
                  className="cursor-pointer hover:bg-gray-50" 
                  onClick={() => selectClient(client.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-500">Tél: {client.phone}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-primary font-semibold">{client.cardNumber}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="border-t border-gray-200 pt-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={createNewOrder}
        >
          <User className="h-4 w-4" />
          Commande sans compte client
        </Button>
      </div>
    </div>
  );
};

export default Search;
