
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Package, Truck, Zap, Drying, MagicWand } from 'lucide-react';
import { DeliveryDriverAssignmentDialog } from '@/components/dialogs/DeliveryDriverAssignmentDialog';
import { PendingOrderNotification } from '@/components/notifications/PendingOrderNotification';
import { toast } from "sonner";

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
    drying?: boolean;
    express?: boolean;
  };
  formulaType?: string;
  washSite?: string;
  driverId?: string;
  driverName?: string;
  accepted?: boolean;
  driverConfirmed?: boolean;
  clientDetails?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

const mockOrders: Order[] = [
  {
    id: '10548',
    clientName: 'Abdou Diop',
    price: 3500,
    weight: 6.5, // Updated to be ≥ 6 kg
    status: 'pending',
    date: '05/05/2025',
    time: '10:30',
    options: {
      ironing: true,
      stainRemoval: false,
      urgent: true,
      delivery: true,
      drying: true,
      express: true
    },
    formulaType: 'basic',
    washSite: 'Thiès Nord'
  },
  {
    id: '10547',
    clientName: 'Fatou Ndiaye',
    price: 5000,
    weight: 6, // Updated to be ≥ 6 kg
    status: 'collected',
    date: '05/05/2025',
    time: '09:15',
    options: {
      ironing: true,
      stainRemoval: true,
      urgent: false,
      delivery: true,
      drying: true
    },
    formulaType: 'subscription',
    washSite: 'Thiès Sud'
  },
  {
    id: '10546',
    clientName: 'Moustapha Seck',
    price: 2800,
    weight: 6, // Updated to be ≥ 6 kg
    status: 'ironed',
    date: '04/05/2025',
    time: '16:45',
    options: {
      ironing: true,
      stainRemoval: false,
      urgent: false,
      delivery: true,
      drying: true
    }
  },
  {
    id: '10545',
    clientName: 'Aminata Fall',
    price: 7200,
    weight: 6, // Updated to be ≥ 6 kg
    status: 'collected',
    date: '04/05/2025',
    time: '14:20',
    options: {
      ironing: false,
      stainRemoval: false,
      urgent: false,
      delivery: false
    }
  },
  {
    id: '10544',
    clientName: 'Ousmane Diallo',
    price: 4500,
    weight: 6.5, // Updated to be ≥ 6 kg
    status: 'delivered',
    date: '04/05/2025',
    time: '11:05',
    options: {
      ironing: true,
      stainRemoval: true,
      urgent: false,
      delivery: false
    }
  }
];

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const filterOrders = (status: string) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  const getStatusColor = (status: Order['status']) => {
    switch(status) {
      case 'pending': return 'bg-orange-100 text-orange-800'; // Changed to orange
      case 'collected': return 'bg-yellow-100 text-yellow-800';
      case 'ironed': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const viewOrderDetail = (order: Order) => {
    // Validation for weight before viewing order detail
    if (order.weight < 6) {
      toast.error("Poids minimum 6 kg");
      return;
    }
    navigate('/order-details', { state: { order } });
  };

  const openDriverAssignment = (orderId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedOrderId(orderId);
    setDriverDialogOpen(true);
  };

  const assignDriver = (driverId: string) => {
    if (selectedOrderId) {
      // Map of driver IDs to names
      const driverMap: Record<string, string> = {
        'drv1': 'Mamadou Diop',
        'drv2': 'Fatou Ndiaye',
        'drv3': 'Ousmane Seck',
        'drv4': 'Aissatou Fall'
      };
      
      setOrders(prev => prev.map(order => 
        order.id === selectedOrderId ? { 
          ...order, 
          driverId,
          driverName: driverMap[driverId] || 'Livreur assigné',
          driverConfirmed: false // Initialize as false
        } : order
      ));
      
      // Mock API call and SMS notification with timeout
      setTimeout(() => {
        setOrders(prev => prev.map(order => 
          order.id === selectedOrderId ? {
            ...order,
            driverConfirmed: true
          } : order
        ));
      }, 2000);
      
      setSelectedOrderId(null);
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, accepted: true } : order
    ));
  };

  const handleRejectOrder = (orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  // Get pending orders with delivery option that haven't been accepted yet
  const pendingDeliveryOrders = orders.filter(
    order => order.status === 'pending' && 
    order.options?.delivery && 
    !order.accepted
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Commandes</h1>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5"> {/* Changed to accommodate the new tab */}
          <TabsTrigger value="all">Tout</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="collected">Collecté</TabsTrigger>
          <TabsTrigger value="ironed">Repassé</TabsTrigger> {/* Added new tab */}
          <TabsTrigger value="delivered">Livré</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          {filterOrders('all').map((order) => (
            <OrderCard 
              key={order.id}
              order={order}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              onClick={() => viewOrderDetail(order)}
              onAssignDriver={(e) => order.accepted && order.status === 'pending' && !order.driverId && openDriverAssignment(order.id, e)}
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
              onClick={() => viewOrderDetail(order)}
              onAssignDriver={(e) => order.accepted && order.status === 'pending' && !order.driverId && openDriverAssignment(order.id, e)}
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
              onClick={() => viewOrderDetail(order)}
              onAssignDriver={(e) => order.accepted && order.status === 'pending' && !order.driverId && openDriverAssignment(order.id, e)}
            />
          ))}
        </TabsContent>
        
        <TabsContent value="ironed" className="space-y-4 mt-4">
          {filterOrders('ironed').map((order) => (
            <OrderCard 
              key={order.id}
              order={order}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              onClick={() => viewOrderDetail(order)}
              onAssignDriver={(e) => order.accepted && order.status === 'pending' && !order.driverId && openDriverAssignment(order.id, e)}
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
              onClick={() => viewOrderDetail(order)}
              onAssignDriver={(e) => order.accepted && order.status === 'pending' && !order.driverId && openDriverAssignment(order.id, e)}
            />
          ))}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button 
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => navigate('/search')}
        >
          <Package className="h-4 w-4" />
          Nouvelle commande
        </Button>
      </div>

      {/* Driver Assignment Dialog */}
      <DeliveryDriverAssignmentDialog 
        open={driverDialogOpen} 
        onOpenChange={setDriverDialogOpen}
        orderId={selectedOrderId || ''}
        onAssign={assignDriver}
      />

      {/* Pending Order Notification */}
      <PendingOrderNotification 
        pendingOrders={pendingDeliveryOrders}
        onAccept={handleAcceptOrder}
        onReject={handleRejectOrder}
      />
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  getStatusColor: (status: Order['status']) => string;
  getStatusLabel: (status: Order['status']) => string;
  onClick: () => void;
  onAssignDriver?: (event: React.MouseEvent) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  getStatusColor,
  getStatusLabel,
  onClick,
  onAssignDriver
}) => {
  return (
    <Card className="card-shadow cursor-pointer hover:bg-gray-50">
      <CardContent className="p-4" onClick={onClick}>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">Commande #{order.id}</div>
            <div className="text-sm text-gray-500">Client: {order.clientName}</div>
            {order.clientDetails && (
              <div className="text-xs text-gray-500">
                {order.clientDetails.firstName || ''} {order.clientDetails.lastName || ''} 
                {order.clientDetails.phone && ` • ${order.clientDetails.phone}`}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-primary font-semibold">{order.price.toLocaleString()} FCFA</div>
            <div className="text-xs text-gray-500">{order.date} {order.time}</div>
            {order.formulaType && (
              <span className="text-[10px] bg-gray-200 rounded px-1">
                {order.formulaType === 'basic' ? 'Formule de base' : 'Formule détaillée'}
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className={`text-xs rounded-full px-2 py-1 ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
          <div className="flex items-center gap-1">
            {order.options?.express && <Zap className="h-3 w-3 text-yellow-500" />}
            {order.options?.drying && <Drying className="h-3 w-3 text-orange-500" />}
            {order.options?.ironing && <MagicWand className="h-3 w-3 text-purple-500" />}
            <span className="text-xs text-gray-500 ml-1">{order.weight} kg</span>
          </div>
        </div>
        
        {order.options?.delivery && order.status === 'pending' && order.accepted && !order.driverId && (
          <div className="mt-3 flex justify-between">
            <Button
              size="sm"
              variant="outline"
              className="w-full flex items-center justify-center gap-1"
              onClick={(e) => onAssignDriver && onAssignDriver(e)}
            >
              <Truck className="h-4 w-4" />
              Affecter un livreur
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Orders;
