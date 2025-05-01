
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
  const clientType = location.state?.clientType || 'registered';
  
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

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nouvelle Commande</h1>
        <p className="text-muted-foreground">
          {clientType === 'registered' 
            ? 'Créer une commande pour le client sélectionné' 
            : 'Créer une commande sans compte client'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2">Client</h2>
            {clientType === 'registered' ? (
              <div>
                <p className="text-sm text-gray-500">Moustapha Seck</p>
                <p className="text-sm text-gray-500">Tél: 76 543 21 98</p>
                <p className="text-sm text-gray-500">Carte: Y10037</p>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Non inscrit - Commande anonyme
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formula type */}
        <div className="space-y-2">
          <h2 className="font-semibold">Formule</h2>
          <RadioGroup 
            value={formData.formulaType}
            onValueChange={(value) => handleFormulaChange(value as 'basic' | 'subscription' | 'weight')}
            className="grid grid-cols-3 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="basic" id="formula-basic" />
              <Label htmlFor="formula-basic">Basique</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="subscription" id="formula-subscription" />
              <Label htmlFor="formula-subscription">Abonnement</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weight" id="formula-weight" />
              <Label htmlFor="formula-weight">Au kilo</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <h2 className="font-semibold">Poids</h2>
          <div className="flex items-center space-x-2">
            <Input 
              type="number" 
              min="0" 
              step="0.1"
              value={formData.weight || ''}
              onChange={handleWeightChange}
              className="w-24"
            />
            <span>kg</span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <h2 className="font-semibold">Options</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="option-ironing" 
                checked={formData.options.ironing}
                onCheckedChange={() => handleOptionChange('ironing')}
              />
              <Label htmlFor="option-ironing">Repassage (+100 FCFA/kg)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="option-stain" 
                checked={formData.options.stainRemoval}
                onCheckedChange={() => handleOptionChange('stainRemoval')}
              />
              <Label htmlFor="option-stain">Détachage (+500 FCFA)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="option-urgent" 
                checked={formData.options.urgent}
                onCheckedChange={() => handleOptionChange('urgent')}
              />
              <Label htmlFor="option-urgent">Urgence (+15%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="option-delivery" 
                checked={formData.options.delivery}
                onCheckedChange={() => handleOptionChange('delivery')}
              />
              <Label htmlFor="option-delivery">Livraison (+1000 FCFA)</Label>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="space-y-2">
          <h2 className="font-semibold">Mode de paiement</h2>
          <Select onValueChange={handlePaymentMethodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le mode de paiement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Espèces</SelectItem>
              <SelectItem value="orange_money">Orange Money</SelectItem>
              <SelectItem value="wave">Wave</SelectItem>
              <SelectItem value="free_money">Free Money</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Wash site */}
        <div className="space-y-2">
          <h2 className="font-semibold">Site de lavage</h2>
          <Select onValueChange={handleWashSiteChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thies_nord">Thiès Nord</SelectItem>
              <SelectItem value="thies_sud">Thiès Sud</SelectItem>
              <SelectItem value="thies_est">Thiès Est</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order summary */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2">Résumé</h2>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Poids total</span>
                <span className="font-medium">{formData.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span>Prix total</span>
                <span className="font-bold text-lg">{price.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Date de commande</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
          Enregistrer la commande
        </Button>
      </form>
    </div>
  );
};

export default NewOrder;
