import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  Input,
  Button,
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"; // ↳ regroupe vos exports shadcn
import { Search as SearchIcon, ScanQrCode, User, X } from "lucide-react";
import { toast } from "sonner";
import { startQrScanner, parseQrCodeData } from "@/utils/qrCodeScanner";

interface Client {
  id: string;
  name: string;
  phone: string;
  cardNumber: string;
}
interface GuestContact {
  lastName?: string;
  firstName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

const mockClients: Client[] = [
  { id: "1", name: "Abdou Diop", phone: "77 123 45 67", cardNumber: "Y10012" },
  { id: "2", name: "Fatou Ndiaye", phone: "70 876 54 32", cardNumber: "Y10025" },
  { id: "3", name: "Moustapha Seck", phone: "76 543 21 98", cardNumber: "Y10037" },
  { id: "4", name: "Aminata Fall", phone: "78 765 43 21", cardNumber: "Y10042" },
  { id: "5", name: "Ousmane Diallo", phone: "77 987 65 43", cardNumber: "Y10056" },
];

const Search: React.FC = () => {
  /* ───────────────────────── state ───────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [guestContact, setGuestContact] = useState<GuestContact>({});
  const [showGuestForm, setShowGuestForm] = useState(false);
  const navigate = useNavigate();
  const [parent] = useAutoAnimate<HTMLDivElement>();

  /* ────────────────────── live filtering ──────────────────── */
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    setSearchResults(
      q
        ? mockClients.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
              c.cardNumber.toLowerCase().includes(q),
          )
        : [],
    );
  }, [searchQuery]);

  /* ───────────────────────── helpers ───────────────────────── */
  const resetSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowGuestForm(false);
    setGuestContact({});
  };

  const startScanning = async () => {
    setIsScanning(true);
    try {
      const data = parseQrCodeData(await startQrScanner());
      const client = mockClients.find((c) => c.id === data?.clientId);
      if (client) {
        navigate("/new-order", { state: { client } });
      } else {
        toast.error("Aucun client trouvé");
      }
    } catch {
      toast.error("Erreur scan");
    } finally {
      setIsScanning(false);
    }
  };

  /* ───────────────────────── render ───────────────────────── */
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      {/* header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Commande client</h1>
        <p className="text-muted-foreground">
          Recherchez un client ou scannez sa carte
        </p>
      </header>

      {/* guest form */}
      {showGuestForm ? (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Coordonnées (facultatif)</h2>

          {[
            { id: "guestLastName", label: "Nom", key: "lastName" },
            { id: "guestFirstName", label: "Prénom", key: "firstName" },
            { id: "guestAddress", label: "Adresse", key: "address" },
            { id: "guestPhone", label: "Téléphone", key: "phone" },
            { id: "guestEmail", label: "Email", type: "email", key: "email" },
          ].map(({ id, label, key, type }) => (
            <div key={id} className="grid gap-1">
              <label htmlFor={id} className="text-sm font-medium">
                {label}
              </label>
              <Input
                id={id}
                type={type}
                value={(guestContact as any)[key] || ""}
                onChange={(e) =>
                  setGuestContact({ ...guestContact, [key]: e.target.value })
                }
              />
            </div>
          ))}

          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => navigate("/new-order", { state: { clientType: "non-registered", guestContact } })}>
              Continuer
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => navigate("/new-order", { state: { clientType: "non-registered" } })}
            >
              Passer
            </Button>
          </div>
          <Button variant="ghost" className="w-full" onClick={resetSearch}>
            Annuler
          </Button>
        </div>
      ) : (
        /* search / scan tabs */
        <Tabs defaultValue="search">
          <TabsList className="bg-muted/50 p-1 rounded-lg shadow-inner grid grid-cols-2">
            <TabsTrigger value="search">Recherche</TabsTrigger>
            <TabsTrigger value="scan">Scanner</TabsTrigger>
          </TabsList>

          {/* search */}
          <TabsContent value="search" className="space-y-6">
            <div className="relative flex">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Nom, téléphone ou N° carte"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-10"
              />
              {searchQuery && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={resetSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* results */}
            {searchQuery && (
              <div ref={parent}>
                {searchResults.length ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {searchResults.map((c) => (
                      <Card
                        key={c.id}
                        onClick={() => navigate("/new-order", { state: { client: c } })}
                        className="cursor-pointer hover:ring-2 hover:ring-primary/40 transition"
                      >
                        <CardContent className="p-4 space-y-1">
                          <p className="font-medium">{c.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {c.phone}
                          </p>
                          <p className="text-right font-semibold">{c.cardNumber}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun résultat
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* scan */}
          <TabsContent value="scan">
            <div className="flex flex-col items-center gap-6">
              <ScanQrCode className="h-16 w-16 text-muted-foreground" />
              <Button onClick={startScanning}>Démarrer le scan</Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* footer */}
      {!showGuestForm && (
        <footer className="border-t pt-4">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setShowGuestForm(true)}
          >
            <User className="h-4 w-4" />
            Commande sans compte
          </Button>
        </footer>
      )}

      {/* scanner overlay */}
      <Dialog open={isScanning} onOpenChange={() => setIsScanning(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Scan en cours…</DialogTitle>
          </DialogHeader>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse">
              <ScanQrCode className="h-24 w-24 text-primary" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Search;
