
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from 'lucide-react';

interface OrderFormData {
  formulaType: 'basic' | 'subscription' | 'weight';
  weight: number;
  options: {
    ironing: boolean;
    stainRemoval: boolean;
    urgent: boolean;
    delivery: boolean;
  };
  paymentMethod: string;
  washSite: string;
}

const NewOrder: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const client = location.state?.client;
  const clientType = location.state?.clientType || (client ? 'registered' : 'non-registered');
  const guestContact = location.state?.guestContact || {};
  
  const [formData, setFormData] = useState<OrderFormData>({
    formulaType: 'basic',
    weight: 0,
    options: {
      ironing: false,
      stainRemoval: false,
      urgent: false,
      delivery: false
    },
    paymentMethod: '',
    washSite: ''
  });

  const [price, setPrice] = useState(0);

  useEffect(() => {
    // Calculate initial price when component mounts
    calculatePrice(formData);
  }, []);

  // Handle form field changes
  const handleFormulaChange = (value: 'basic' | 'subscription' | 'weight') => {
    setFormData({ ...formData, formulaType: value });
    calculatePrice({ ...formData, formulaType: value });
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weight = parseFloat(e.target.value) || 0;
    setFormData({ ...formData, weight });
    calculatePrice({ ...formData, weight });
  };

  const handleOptionChange = (option: keyof typeof formData.options) => {
    const newOptions = { 
      ...formData.options, 
      [option]: !formData.options[option] 
    };
    setFormData({ ...formData, options: newOptions });
    calculatePrice({ ...formData, options: newOptions });
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData({ ...formData, paymentMethod: value });
  };

  const handleWashSiteChange = (value: string) => {
    setFormData({ ...formData, washSite: value });
  };

  // Calculate price based on form data
  const calculatePrice = (data: OrderFormData) => {
    let total = 0;
    
    // Base price by formula type
    switch(data.formulaType) {
      case 'basic':
        total = 500 * data.weight; // 500 FCFA per kg
        break;
      case 'subscription':
        total = 400 * data.weight; // 400 FCFA per kg (20% discount)
        break;
      case 'weight':
        total = 450 * data.weight; // 450 FCFA per kg (10% discount)
        break;
    }
    
    // Add option prices
    if (data.options.ironing) total += data.weight * 100; // 100 FCFA per kg
    if (data.options.stainRemoval) total += 500; // Flat fee
    if (data.options.urgent) total += total * 0.15; // 15% surcharge
    if (data.options.delivery) total += 1000; // Flat fee
    
    setPrice(total);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (formData.weight <= 0) {
      toast.error("Veuillez entrer un poids valide");
      return;
    }
    
    if (!formData.paymentMethod) {
      toast.error("Veuillez sélectionner un mode de paiement");
      return;
    }
    
    if (!formData.washSite) {
      toast.error("Veuillez sélectionner un site de lavage");
      return;
    }

    // Process the order
    toast.success("Commande enregistrée avec succès");
    navigate('/orders');
  };

  const goBack = () => {
    navigate('/search');
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouvelle Commande</h1>
          <p className="text-muted-foreground">
            {clientType === 'registered' 
              ? 'Créer une commande pour le client sélectionné' 
              : 'Créer une commande sans compte client'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client info */}
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2">Client</h2>
            {clientType === 'registered' && client ? (
              <div>
                <p className="text-sm text-gray-500"><strong>{client.name}</strong></p>
                <p className="text-sm text-gray-500">Tél: {client.phone}</p>
                <p className="text-sm text-gray-500">Carte: {client.cardNumber}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500"><strong>Non inscrit - Commande anonyme</strong></p>
                {guestContact.phone && <p className="text-sm text-gray-500">Tél: {guestContact.phone}</p>}
                {guestContact.email && <p className="text-sm text-gray-500">Email: {guestContact.email}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Two column layout for smaller form sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formula type */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-4">Formule</h2>
              <RadioGroup 
                value={formData.formulaType}
                onValueChange={(value) => handleFormulaChange(value as 'basic' | 'subscription' | 'weight')}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="basic" id="formula-basic" />
                  <Label htmlFor="formula-basic" className="flex-grow cursor-pointer">Basique</Label>
                  <span className="text-sm text-gray-500">500 F/kg</span>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="subscription" id="formula-subscription" />
                  <Label htmlFor="formula-subscription" className="flex-grow cursor-pointer">Abonnement</Label>
                  <span className="text-sm text-gray-500">400 F/kg</span>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="weight" id="formula-weight" />
                  <Label htmlFor="formula-weight" className="flex-grow cursor-pointer">Au kilo</Label>
                  <span className="text-sm text-gray-500">450 F/kg</span>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Weight */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-4">Poids</h2>
              <div className="flex items-center space-x-2">
                <Input 
                  type="number" 
                  min="0" 
                  step="0.1"
                  value={formData.weight || ''}
                  onChange={handleWeightChange}
                  className="text-lg font-medium"
                />
                <span className="text-lg">kg</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Options */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-4">Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                <Checkbox 
                  id="option-ironing" 
                  checked={formData.options.ironing}
                  onCheckedChange={() => handleOptionChange('ironing')}
                />
                <div className="flex-grow">
                  <Label htmlFor="option-ironing" className="cursor-pointer">Repassage</Label>
                  <p className="text-xs text-gray-500">+100 FCFA/kg</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                <Checkbox 
                  id="option-stain" 
                  checked={formData.options.stainRemoval}
                  onCheckedChange={() => handleOptionChange('stainRemoval')}
                />
                <div className="flex-grow">
                  <Label htmlFor="option-stain" className="cursor-pointer">Détachage</Label>
                  <p className="text-xs text-gray-500">+500 FCFA</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                <Checkbox 
                  id="option-urgent" 
                  checked={formData.options.urgent}
                  onCheckedChange={() => handleOptionChange('urgent')}
                />
                <div className="flex-grow">
                  <Label htmlFor="option-urgent" className="cursor-pointer">Urgence</Label>
                  <p className="text-xs text-gray-500">+15% du total</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                <Checkbox 
                  id="option-delivery" 
                  checked={formData.options.delivery}
                  onCheckedChange={() => handleOptionChange('delivery')}
                />
                <div className="flex-grow">
                  <Label htmlFor="option-delivery" className="cursor-pointer">Livraison</Label>
                  <p className="text-xs text-gray-500">+1000 FCFA</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two column layout for payment and site */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment method */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-4">Mode de paiement</h2>
              <Select onValueChange={handlePaymentMethodChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="orange_money">Orange Money</SelectItem>
                  <SelectItem value="wave">Wave</SelectItem>
                  <SelectItem value="free_money">Free Money</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Wash site */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-4">Site de lavage</h2>
              <Select onValueChange={handleWashSiteChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thies_nord">Thiès Nord</SelectItem>
                  <SelectItem value="thies_sud">Thiès Sud</SelectItem>
                  <SelectItem value="thies_est">Thiès Est</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-3">Résumé</h2>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span>Poids total</span>
                <span className="font-medium">{formData.weight} kg</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-lg">Prix total</span>
                <span className="font-bold text-xl text-primary">{price.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Date de commande</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
          Enregistrer la commande
        </Button>
      </form>
    </div>
  );
};

export default NewOrder;
