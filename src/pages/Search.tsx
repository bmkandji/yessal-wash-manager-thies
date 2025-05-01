
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, ScanQrCode, User, X } from 'lucide-react';
import { toast } from "sonner";

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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(true);
  const navigate = useNavigate();

  // Effet pour la recherche dynamique
  useEffect(() => {
    if (searchQuery.trim()) {
      // Filtrer les clients en fonction de la recherche
      const results = mockClients.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.replace(/\s/g, '').includes(searchQuery.replace(/\s/g, '')) ||
        client.cardNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    // Cette fonction reste pour la soumission explicite mais 
    // la recherche se fait déjà dynamiquement avec l'effet ci-dessus
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedClient(null);
    setShowSearchResults(true);
  };

  const startScanning = () => {
    setIsScanning(true);
    // Simuler la lecture d'un code QR
    setTimeout(() => {
      setIsScanning(false);
      // Supposons que le QR code contient l'ID du client
      const scannedId = '3'; // ID simulé du client
      const foundClient = mockClients.find(client => client.id === scannedId);
      
      if (foundClient) {
        setSelectedClient(foundClient);
        setSearchResults([foundClient]);
        toast.success(`Client trouvé: ${foundClient.name}`);
      } else {
        toast.error("Aucun client trouvé avec ce code");
      }
    }, 2000);
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    navigate('/new-order', { state: { client } });
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
          <div className="flex gap-2 relative">
            <Input 
              placeholder="Nom, téléphone ou numéro de carte" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {searchQuery && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0" 
                onClick={resetSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button type="button" onClick={handleSearch}>
              <SearchIcon className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
          
          {showSearchResults && searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((client) => (
                <Card 
                  key={client.id} 
                  className="cursor-pointer hover:bg-gray-50" 
                  onClick={() => selectClient(client)}
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
              <Button className="mt-4" onClick={resetSearch}>
                Nouvelle recherche
              </Button>
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
          
          {selectedClient && (
            <div className="space-y-2">
              <Card className="cursor-pointer hover:bg-gray-50" onClick={() => selectClient(selectedClient)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{selectedClient.name}</div>
                      <div className="text-sm text-gray-500">Tél: {selectedClient.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary font-semibold">{selectedClient.cardNumber}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button className="w-full" onClick={resetSearch} variant="outline">
                Nouvelle recherche
              </Button>
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
