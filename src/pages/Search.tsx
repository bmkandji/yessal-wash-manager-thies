
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, ScanQrCode, User, X } from 'lucide-react';
import { toast } from "sonner";
import { startQrScanner, parseQrCodeData } from '@/utils/qrCodeScanner';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  cardNumber: string;
  address?: string;
  geo?: { lat: number; lng: number };
  isPremium?: boolean;
  isStudent?: boolean;
  monthlyTotal?: number;
}


interface GuestContact {
  openAccount?: boolean;   // ← nouveau
  phone?: string;
  email?: string;
  lastName?: string;
  firstName?: string;
  address?: string;
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
  const [guestContact, setGuestContact] = useState<GuestContact>({});
  const [showGuestForm, setShowGuestForm] = useState(false);
  const navigate = useNavigate();
  const [addressInput, setAddressInput] = useState('');
  const [editAddress, setEditAddress]   = useState(false);
  // Add missing weight state
  const [weight, setWeight] = useState<number>(6);
  // Add missing formula state
  const [formula, setFormula] = useState<'base' | 'detaillee'>('base');

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

  const resetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedClient(null);
    setShowSearchResults(true);
    setShowGuestForm(false);
    setGuestContact({});
  };

  const startScanning = async () => {
    setIsScanning(true);
    
    try {
      // Call the actual scanner utility
      const qrData = await startQrScanner();
      const parsedData = parseQrCodeData(qrData);
      
      if (parsedData && parsedData.clientId) {
        const foundClient = mockClients.find(client => client.id === parsedData.clientId);
        
        if (foundClient) {
          setSelectedClient(foundClient);
          setSearchResults([foundClient]);
          toast.success(`Client trouvé: ${foundClient.name}`);
          
          // Redirect directly to new order with this client
          navigate('/new-order', { state: { client: foundClient } });
        } else {
          toast.error("Aucun client trouvé avec ce code");
        }
      } else {
        toast.error("QR code invalide");
      }
    } catch (error) {
      toast.error("Erreur lors du scan");
    } finally {
      setIsScanning(false);
    }
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    navigate('/new-order', { state: { client } });
  };

  const showGuestContactForm = () => {
    setShowGuestForm(true);
  };

  const handleGuestContactSubmit = () => {
    // Store contact info and proceed to order creation
    navigate('/new-order', { 
      state: { 
        clientType: 'non-registered',
        guestContact 
      } 
    });
  };

  const skipGuestContact = () => {
    // Proceed without contact info
    navigate('/new-order', { state: { clientType: 'non-registered' } });
  };

  return (
      <div className="space-y-6 pb-8">
      {(selectedClient || guestContact.firstName) && (
          <div className="border rounded-lg p-4 space-y-1 bg-muted/50">
            <p className="font-semibold">
              {selectedClient?.firstName ?? guestContact.firstName}{" "}
              {selectedClient?.lastName ?? guestContact.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedClient?.phone ?? guestContact.phone}
            </p>
          </div>
        )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Commande Client</h1>
        <p className="text-muted-foreground">
          Rechercher un client ou scanner sa carte
        </p>
      </div>
    {selectedClient && (
      <>
        {/* si géoloc → carte */}
        {selectedClient.geo ? (
          <div className="h-56 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            <span className="text-muted-foreground">Carte localisation</span>
          </div>
        ) : (
          /* sinon adresse texte si présente */
          selectedClient.address && !editAddress && (
            <div className="p-3 bg-muted/50 rounded-lg">
              {selectedClient.address}
            </div>
          )
        )}
    
        {/* case « Modifier l'adresse » */}  
        {(selectedClient.address || !selectedClient.geo) && (
          <div className="flex items-center gap-2 mt-2">
            <input
              id="editAddress"
              type="checkbox"
              checked={editAddress}
              onChange={(e) => setEditAddress(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <label htmlFor="editAddress" className="text-sm">
              Modifier l'adresse
            </label>
          </div>
        )}
    
        {/* zone texte si adresse manquante OU édition demandée */}  
        {(!selectedClient.address || editAddress) && (
          <textarea
            className="mt-2 w-full border rounded-md p-2"
            placeholder="Entrer l'adresse précise…"
            required
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
        )}
      </>
    )}

      <div className="grid gap-1">
        <label htmlFor="indicativeWeight" className="text-sm font-medium">
          Poids indicatif (kg) <span className="text-destructive">*</span>
        </label>
        <Input
          id="indicativeWeight"
          type="number"
          min={6}
          step={0.1}
          value={weight}
          onChange={(e) => setWeight(parseFloat(e.target.value))}
          required
        />
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium mb-2">Formule</p>
        <RadioGroup
          value={formula}
          onValueChange={(val) => setFormula(val as 'base' | 'detaillee')}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem id="rb-base" value="base" />
            <label htmlFor="rb-base" className="text-sm">Formule de base</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="rb-det" value="detaillee" />
            <label htmlFor="rb-det" className="text-sm">Formule détaillée</label>
          </div>
        </RadioGroup>
      </div>

      {showGuestForm ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Coordonnées du client (facultatif)</h2>
          <p className="text-sm text-gray-500">
            Ces informations seront utilisées pour l'envoi de la facture. Le client peut choisir de ne pas les fournir.
          </p>
          <div>
            <label htmlFor="guestLastName" className="text-sm font-medium">
              Nom
            </label>
            <Input
              id="guestLastName"
              placeholder="Ex : Ndiaye"
              value={guestContact.lastName || ''}
              onChange={(e) =>
                setGuestContact({ ...guestContact, lastName: e.target.value })
              }
            />
          </div>
          
          <div>
            <label htmlFor="guestFirstName" className="text-sm font-medium">
              Prénom
            </label>
            <Input
              id="guestFirstName"
              placeholder="Ex : Fatou"
              value={guestContact.firstName || ''}
              onChange={(e) =>
                setGuestContact({ ...guestContact, firstName: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="guestPhone" className="text-sm font-medium">
              Numéro de téléphone
            </label>
            <Input 
              id="guestPhone" 
              type="tel" 
              placeholder="Ex: 77 123 45 67" 
              value={guestContact.phone || ''}
              onChange={(e) => setGuestContact({...guestContact, phone: e.target.value})}
            />
          </div>
          
          <div>
            <label htmlFor="guestAddress" className="text-sm font-medium">
              Adresse
            </label>
            <Input
              id="guestAddress"
              placeholder="Ex : 24 rue des Manguiers, Dakar"
              value={guestContact.address || ''}
              onChange={(e) =>
                setGuestContact({ ...guestContact, address: e.target.value })
              }
            />
          </div>
          <div className="space-y-4">
            
            <div>
              <label htmlFor="guestEmail" className="text-sm font-medium">
                Email
              </label>
              <Input 
                id="guestEmail" 
                type="email" 
                placeholder="Ex: client@example.com" 
                value={guestContact.email || ''}
                onChange={(e) => setGuestContact({...guestContact, email: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="openAccount"
              type="checkbox"
              checked={guestContact.openAccount || false}
              onChange={(e) =>
                setGuestContact({ ...guestContact, openAccount: e.target.checked })
              }
              className="h-4 w-4 accent-primary"
            />
            <label htmlFor="openAccount" className="text-sm">
              Souhaite ouvrir un compte
            </label>
          </div>
          <div className="flex gap-2">
            <Button 
              className="flex-1"
              variant="default" 
              onClick={handleGuestContactSubmit}
            >
              Continuer
            </Button>
            <Button 
              className="flex-1"
              variant="outline" 
              onClick={skipGuestContact}
            >
              Passer cette étape
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={resetSearch}
          >
            Annuler et revenir à la recherche
          </Button>
        </div>
      ) : (
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
              <Button type="button" onClick={() => setSearchQuery(searchQuery)}>
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
          </TabsContent>
        </Tabs>
      )}

      {!showGuestForm && (
        <div className="border-t border-gray-200 pt-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={showGuestContactForm}
          >
            <User className="h-4 w-4" />
            Commande sans compte client
          </Button>
        </div>
      )}
    </div>
  );
};

export default Search;
