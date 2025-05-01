import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Package, Download } from 'lucide-react';
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";

interface Order {
  id: string;
  clientName: string;
  price: number;
  weight: number;
  status: 'pending' | 'collected' | 'ironed' | 'delivered';
  date: string;
  time: string;
  options?: {
    ironing: boolean;
    stainRemoval: boolean;
    urgent: boolean;
    delivery: boolean;
  };
  formulaType?: string;
  washSite?: string;
}

const mockOrders: Order[] = [
  {
    id: '10548',
    clientName: 'Abdou Diop',
    price: 3500,
    weight: 3,
    status: 'pending',
    date: '05/05/2025',
    time: '10:30',
    options: {
      ironing: true,
      stainRemoval: false,
      urgent: true,
      delivery: false
    },
    formulaType: 'basic',
    washSite: 'Thiès Nord'
  },
  {
    id: '10547',
    clientName: 'Fatou Ndiaye',
    price: 5000,
    weight: 4.5,
    status: 'collected',
    date: '05/05/2025',
    time: '09:15',
    options: {
      ironing: true,
      stainRemoval: true,
      urgent: false,
      delivery: true
    },
    formulaType: 'subscription',
    washSite: 'Thiès Sud'
  },
  {
    id: '10546',
    clientName: 'Moustapha Seck',
    price: 2800,
    weight: 2,
    status: 'ironed',
    date: '04/05/2025',
    time: '16:45'
  },
  {
    id: '10545',
    clientName: 'Aminata Fall',
    price: 7200,
    weight: 6,
    status: 'collected',
    date: '04/05/2025',
    time: '14:20'
  },
  {
    id: '10544',
    clientName: 'Ousmane Diallo',
    price: 4500,
    weight: 3.5,
    status: 'delivered',
    date: '04/05/2025',
    time: '11:05'
  }
];

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const filterOrders = (status: string) => {
    if (status === 'all') return mockOrders;
    return mockOrders.filter(order => order.status === status);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    // In a real app, this would make an API call to update the status
    toast.success(`Commande #${orderId} mise à jour: ${getStatusLabel(newStatus)}`);
  };

  const getStatusLabel = (status: Order['status']) => {
    switch(status) {
      case 'pending': return 'En attente';
      case 'collected': return 'Collecté';
      case 'ironed': return 'Repassé';
      case 'delivered': return 'Livré';
      default: return status;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch(status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'collected': return 'bg-yellow-100 text-yellow-800';
      case 'ironed': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (status: Order['status']): Order['status'] | null => {
    switch(status) {
      case 'pending': return 'collected';
      case 'collected': return 'ironed';
      case 'ironed': return 'delivered';
      case 'delivered': return null;
    }
  };

  const downloadInvoice = (orderId: string) => {
    toast.success(`Téléchargement de la facture pour la commande #${orderId}`);
    // Simuler un téléchargement
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Commandes</h1>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">Tout</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="collected">Collecté</TabsTrigger>
          <TabsTrigger value="delivered">Livré</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          {filterOrders('all').map((order) => (
            <OrderCard 
              key={order.id}
              order={order}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              getNextStatus={getNextStatus}
              updateOrderStatus={updateOrderStatus}
              downloadInvoice={downloadInvoice}
            />
          ))}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4 mt-4">
          {filterOrders('pending').map((order) => (
            <OrderCard 
              key={order.id}
              order={order}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              getNextStatus={getNextStatus}
              updateOrderStatus={updateOrderStatus}
              downloadInvoice={downloadInvoice}
            />
          ))}
        </TabsContent>
        
        <TabsContent value="collected" className="space-y-4 mt-4">
          {filterOrders('collected').map((order) => (
            <OrderCard 
              key={order.id}
              order={order}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              getNextStatus={getNextStatus}
              updateOrderStatus={updateOrderStatus}
              downloadInvoice={downloadInvoice}
            />
          ))}
        </TabsContent>
        
        <TabsContent value="delivered" className="space-y-4 mt-4">
          {filterOrders('delivered').map((order) => (
            <OrderCard 
              key={order.id}
              order={order}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              getNextStatus={getNextStatus}
              updateOrderStatus={updateOrderStatus}
              downloadInvoice={downloadInvoice}
            />
          ))}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button 
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => navigate('/new-order')}
        >
          <Package className="h-4 w-4" />
          Nouvelle commande
        </Button>
      </div>
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  getStatusColor: (status: Order['status']) => string;
  getStatusLabel: (status: Order['status']) => string;
  getNextStatus: (status: Order['status']) => Order['status'] | null;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  downloadInvoice: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  getStatusColor,
  getStatusLabel,
  getNextStatus,
  updateOrderStatus,
  downloadInvoice
}) => {
  const nextStatus = getNextStatus(order.status);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="card-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Commande #{order.id}</div>
                <div className="text-sm text-gray-500">Client: {order.clientName}</div>
              </div>
              <div className="text-right">
                <div className="text-primary font-semibold">{order.price.toLocaleString()} FCFA</div>
                <div className="text-xs text-gray-500">{order.date} {order.time}</div>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className={`text-xs rounded-full px-2 py-1 ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
              <span className="text-xs text-gray-500">{order.weight} kg</span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Détails de la commande #{order.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Client</p>
              <p className="text-sm text-gray-500">{order.clientName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Date & Heure</p>
              <p className="text-sm text-gray-500">{order.date} à {order.time}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Poids</p>
              <p className="text-sm text-gray-500">{order.weight} kg</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Prix</p>
              <p className="text-sm text-primary font-semibold">{order.price.toLocaleString()} FCFA</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Statut</p>
              <p className={`text-xs rounded-full inline-block px-2 py-1 ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Site de lavage</p>
              <p className="text-sm text-gray-500">{order.washSite || "Non spécifié"}</p>
            </div>
          </div>
          
          {order.options && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Options</p>
              <div className="flex flex-wrap gap-2">
                {order.options.ironing && (
                  <span className="text-xs bg-gray-100 rounded-full px-2 py-1">Repassage</span>
                )}
                {order.options.stainRemoval && (
                  <span className="text-xs bg-gray-100 rounded-full px-2 py-1">Détachage</span>
                )}
                {order.options.urgent && (
                  <span className="text-xs bg-gray-100 rounded-full px-2 py-1">Urgence</span>
                )}
                {order.options.delivery && (
                  <span className="text-xs bg-gray-100 rounded-full px-2 py-1">Livraison</span>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Formule</p>
            <p className="text-sm text-gray-500">
              {order.formulaType === 'basic' && "Formule de base"}
              {order.formulaType === 'subscription' && "Formule abonnement"}
              {order.formulaType === 'weight' && "Formule au kilo"}
              {!order.formulaType && "Non spécifiée"}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {nextStatus && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                updateOrderStatus(order.id, nextStatus);
                // Close dialog
                const closeButton = document.querySelector('[data-state="open"] button[data-dismiss]');
                if (closeButton && closeButton instanceof HTMLElement) {
                  closeButton.click();
                }
              }}
            >
              Passer à "{getStatusLabel(nextStatus)}"
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => downloadInvoice(order.id)}
          >
            <Download className="h-4 w-4" /> Télécharger facture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Orders;
