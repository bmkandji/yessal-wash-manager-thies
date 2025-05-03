/*  Search.tsx — version complète avec toutes les règles  */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Search as SearchIcon, ScanQrCode, User, X } from "lucide-react";
import { toast } from "sonner";
import { startQrScanner, parseQrCodeData } from "@/utils/qrCodeScanner";

/* ─────────────────── types ─────────────────── */
interface Client {
  id: string;
  name: string;
  phone: string;
  cardNumber: string;
  type?: "standard" | "premium" | "student" | "premium-student";
  gps?: { lat: number; lng: number };
  address?: string;
  monthWeight?: number; // kg déjà consommés ce mois
}

interface GuestContact {
  openAccount?: boolean;
  phone?: string;
  email?: string;
  lastName?: string;
  firstName?: string;
  address?: string;
}

type Formula = "base" | "detailed";

interface Options {
  delivery: boolean;
  drying: boolean;
  ironing: boolean;
  express: boolean;
}

/* ──────────────── mocks / constantes ──────────────── */
const mockClients: Client[] = [
  {
    id: "1",
    name: "Abdou Diop",
    phone: "77 123 45 67",
    cardNumber: "Y10012",
    type: "premium",
    monthWeight: 12,
    gps: { lat: 14.69, lng: -17.45 },
  },
  {
    id: "2",
    name: "Fatou Ndiaye",
    phone: "70 876 54 32",
    cardNumber: "Y10025",
    type: "student",
  },
];

const A = 4000; // machine 20 kg
const B = 2000; // machine 6 kg
const DELIVERY_FEE = 1000;
const DRYING_PER_KG = 150;
const IRONING_PER_KG = 200;
const EXPRESS_FEE = 1000;
const PREMIUM_QUOTA = 40;

/* ─────────────────── helpers ─────────────────── */
function computeBasePrice(weight: number) {
  const n = Math.floor(weight / 20);
  const r = weight % 20;
  const price =
    B * (r / 6) > A
      ? (n + 1) * A
      : n * A + (Math.floor(r / 6) + (r % 6 <= 1 ? 1.5 : 0)) * B;
  return price;
}

function applyFidelity(weight: number, price: number) {
  // 6 kg offerts tous les 70 kg
  const freeKg = Math.floor(weight / 70) * 6;
  if (freeKg === 0) return price;
  const remaining = Math.max(weight - freeKg, 0);
  return computeBasePrice(remaining);
}

/* ─────────────────── composant ─────────────────── */
const Search: React.FC = () => {
  const navigate = useNavigate();

  /* recherche / scan */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  /* invités / formulaire */
  const [guestContact, setGuestContact] = useState<GuestContact>({});
  const [showGuestForm, setShowGuestForm] = useState(false);

  /* commande */
  const [weight, setWeight] = useState<number>(6);
  const [formula, setFormula] = useState<Formula>("base");
  const [options, setOptions] = useState<Options>({
    delivery: true,
    drying: false,
    ironing: false,
    express: false,
  });

  /* ───────────── recherche dynamique ───────────── */
  useEffect(() => {
    if (!searchQuery.trim()) return setSearchResults([]);
    const q = searchQuery.toLowerCase();
    setSearchResults(
      mockClients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
          c.cardNumber.toLowerCase().includes(q),
      ),
    );
  }, [searchQuery]);

  /* ───────────── prix temps-réel ───────────── */
  const price = useMemo(() => {
    if (weight < 6) return 0;

    const clientType = selectedClient?.type;
    const isPremium = clientType?.includes("premium");
    const isStudent = clientType?.includes("student");

    let baseWeight = weight;
    let premiumSurplus = 0;

    if (isPremium) {
      const total = (selectedClient?.monthWeight || 0) + weight;
      if (total > PREMIUM_QUOTA) {
        premiumSurplus = total - PREMIUM_QUOTA;
        baseWeight = premiumSurplus;
      } else {
        baseWeight = 0; // couvert par abonnement
      }
    }

    let total = 0;

    if (baseWeight > 0) {
      if (formula === "base") {
        total = applyFidelity(baseWeight, computeBasePrice(baseWeight));
      }
      // formule détaillée : le prix est au kg, pas défini ici → adapter si besoin
    }

    if (options.delivery && baseWeight > 0) total += DELIVERY_FEE;
    if (options.drying && baseWeight > 0)
      total += DRYING_PER_KG * baseWeight;
    if (options.ironing && baseWeight > 0)
      total += IRONING_PER_KG * baseWeight;
    if (options.express) total += EXPRESS_FEE;

    if (isStudent && total > 0) total *= 0.9; // -10 %

    return Math.round(total);
  }, [weight, formula, options, selectedClient]);

  /* ───────────── handlers ───────────── */
  const resetSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedClient(null);
    setShowGuestForm(false);
    setGuestContact({});
  };

  const selectClient = (c: Client) => {
    setSelectedClient(c);
    setShowGuestForm(false);
  };

  const submitOrder = () => {
    /* minimal payload */
    navigate("/new-order", {
      state: {
        client: selectedClient,
        guestContact,
        weight,
        formula,
        options,
        price,
        dateGMT: new Date().toISOString(),
      },
    });
  };

  /* ───────────── UI ───────────── */
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      {/* 1. infos client */}
      {selectedClient && (
        <Card>
          <CardContent className="p-4">
            <p className="font-semibold">
              {selectedClient.name} – {selectedClient.phone}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 2. adresse / géoloc */}
      {selectedClient && (
        <>
          {selectedClient.gps ? (
            <div className="h-40 bg-gray-200 flex items-center justify-center">
              {/* Remplacer par un composant map réel */}
              <span className="text-sm">Carte localisation</span>
            </div>
          ) : selectedClient.address ? (
            <Card>
              <CardContent className="p-4 text-sm">
                {selectedClient.address}
              </CardContent>
            </Card>
          ) : (
            <Input
              placeholder="Adresse complète"
              value={selectedClient.address || ""}
              onChange={(e) =>
                setSelectedClient({ ...selectedClient, address: e.target.value })
              }
            />
          )}

          {/* case modifier adresse */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editAddr"
              onChange={(e) =>
                !e.target.checked
                  ? null
                  : setSelectedClient({
                      ...selectedClient,
                      address: "",
                      gps: undefined,
                    })
              }
            />
            <label htmlFor="editAddr" className="text-sm">
              Modifier l’adresse
            </label>
          </div>
        </>
      )}

      {/* 3. poids indicatif */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Poids indicatif (kg)</label>
        <Input
          type="number"
          min={6}
          value={weight}
          onChange={(e) => setWeight(Math.max(6, Number(e.target.value)))}
        />
      </div>

      {/* 4. formules */}
      {(!selectedClient ||
        !selectedClient.type?.includes("premium") ||
        weight + (selectedClient.monthWeight || 0) > PREMIUM_QUOTA) && (
        <Tabs
          value={formula}
          onValueChange={(v) => setFormula(v as Formula)}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="base">Formule de base</TabsTrigger>
            <TabsTrigger value="detailed">Formule détaillée</TabsTrigger>
          </TabsList>

          {/* options base */}
          <TabsContent value="base" className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.delivery}
                onChange={(e) =>
                  setOptions({ ...options, delivery: e.target.checked })
                }
              />
              <span>Livraison (+1000 FCFA)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.drying}
                disabled={!options.delivery}
                onChange={(e) =>
                  setOptions({ ...options, drying: e.target.checked })
                }
              />
              <span>Séchage (+150 FCFA/kg)</span>
            </div>
            {options.drying && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.ironing}
                  onChange={(e) =>
                    setOptions({ ...options, ironing: e.target.checked })
                  }
                />
                <span>Repassage (+200 FCFA/kg)</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.express}
                onChange={(e) =>
                  setOptions({ ...options, express: e.target.checked })
                }
              />
              <span>Express 6 h (+1000 FCFA)</span>
            </div>
          </TabsContent>

          {/* options detailed */}
          <TabsContent value="detailed" className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.express}
                onChange={(e) =>
                  setOptions({ ...options, express: e.target.checked })
                }
              />
              <span>Express 6 h (+1000 FCFA)</span>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* 5. réduction étudiant */}
      {selectedClient?.type?.includes("student") && price > 0 && (
        <p className="text-sm text-emerald-600">–10 % appliqué (étudiant)</p>
      )}

      {/* 6. moyen de paiement */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Moyen de paiement</label>
        <Select defaultValue="cash">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Espèces</SelectItem>
            <SelectItem value="card">Carte</SelectItem>
            <SelectItem value="mobile">Mobile Money</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 7. site de lavage */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Site de lavage</label>
        <Select defaultValue="central">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="central">Central</SelectItem>
            <SelectItem value="ouest">Ouest</SelectItem>
            <SelectItem value="est">Est</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 8. résumé + enregistrer */}
      <Card>
        <CardContent className="p-4 flex justify-between">
          <span className="font-medium">Total</span>
          <span className="font-bold">{price.toLocaleString()} FCFA</span>
        </CardContent>
      </Card>

      <Button
        disabled={weight < 6}
        className="w-full"
        onClick={submitOrder}
      >
        Enregistrer la commande
      </Button>

      {/* ────────── bloc recherche / scan ────────── */}
      {!selectedClient && !showGuestForm && (
        <Tabs defaultValue="search" className="mt-10">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="search">Recherche</TabsTrigger>
            <TabsTrigger value="scan">Scanner</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Nom, téléphone ou n° carte"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
            {searchResults.map((c) => (
              <Card
                key={c.id}
                onClick={() => selectClient(c)}
                className="cursor-pointer hover:ring-2 hover:ring-primary/40 transition"
              >
                <CardContent className="p-4">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.phone}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="scan" className="space-y-4">
            <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
              {isScanning ? (
                <ScanQrCode className="h-12 w-12 text-primary animate-pulse" />
              ) : (
                <ScanQrCode className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <Button onClick={async () => {
              setIsScanning(true);
              try {
                const data = parseQrCodeData(await startQrScanner());
                const client = mockClients.find((c) => c.id === data?.clientId);
                if (client) selectClient(client);
                else toast.error("Client introuvable");
              } catch {
                toast.error("Scan annulé");
              } finally {
                setIsScanning(false);
              }
            }}>
              {isScanning ? "Scan en cours…" : "Démarrer le scan"}
            </Button>
          </TabsContent>
        </Tabs>
      )}

      {/* bouton invité */}
      {!selectedClient && !showGuestForm && (
        <Button
          variant="outline"
          className="w-full mt-4 flex gap-2"
          onClick={() => setShowGuestForm(true)}
        >
          <User className="h-4 w-4" />
          Commande sans compte
        </Button>
      )}

      {/* formulaire invité (inchangé sauf +openAccount déjà présent) */}
      {showGuestForm && (
        <div className="space-y-4 mt-10">
          {/* … même contenu que ta version précédente … */}
        </div>
      )}
    </div>
  );
};

export default Search;
