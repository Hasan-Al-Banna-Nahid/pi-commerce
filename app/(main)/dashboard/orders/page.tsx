"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Search, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/app/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { OrderStatus, PaymentStatus, type Order } from "@/app/types/order";

type OrderWithUser = Order & {
  user?: {
    _id: string;
    name: string;
    email: string;
  };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithUser | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await api.get<{ orders: OrderWithUser[] }>("/api/orders");
      setOrders(res.data.orders);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const filteredOrders = orders.filter((order: OrderWithUser) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(searchLower) ||
      order.user?.name.toLowerCase().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower) ||
      order.paymentStatus.toLowerCase().includes(searchLower)
    );
  });

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ): Promise<void> => {
    try {
      setIsUpdatingStatus(true);
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const deleteOrder = async (): Promise<void> => {
    if (!selectedOrder) return;

    try {
      await api.delete(`/api/orders/${selectedOrder._id}`);
      toast.success("Order deleted successfully");
      fetchOrders();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete order");
      console.error("Error deleting order:", error);
    }
  };

  const getStatusBadge = (status: OrderStatus): JSX.Element => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>;
      case OrderStatus.PROCESSING:
        return <Badge className="bg-blue-500">Processing</Badge>;
      case OrderStatus.SHIPPED:
        return <Badge className="bg-purple-500">Shipped</Badge>;
      case OrderStatus.DELIVERED:
        return <Badge className="bg-green-500">Delivered</Badge>;
      case OrderStatus.CANCELLED:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPaymentBadge = (status: PaymentStatus): JSX.Element => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <Badge className="bg-green-500">Paid</Badge>;
      case PaymentStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>;
      case PaymentStatus.FAILED:
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Manage Orders</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-9"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button onClick={() => router.push("/admin/orders/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    #{order._id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell>{order.user?.name || "Guest User"}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    {isUpdatingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      getStatusBadge(order.status)
                    )}
                  </TableCell>
                  <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/orders/${order._id}`)
                          }
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/orders/${order._id}/edit`)
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                        {order.status !== OrderStatus.CANCELLED && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(
                                order._id,
                                OrderStatus.CANCELLED
                              )
                            }
                            className="text-red-600"
                          >
                            Cancel Order
                          </DropdownMenuItem>
                        )}
                        {order.status === OrderStatus.PENDING && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(
                                order._id,
                                OrderStatus.PROCESSING
                              )
                            }
                          >
                            Mark as Processing
                          </DropdownMenuItem>
                        )}
                        {order.status === OrderStatus.PROCESSING && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(order._id, OrderStatus.SHIPPED)
                            }
                          >
                            Mark as Shipped
                          </DropdownMenuItem>
                        )}
                        {order.status === OrderStatus.SHIPPED && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateOrderStatus(
                                order._id,
                                OrderStatus.DELIVERED
                              )
                            }
                          >
                            Mark as Delivered
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Order Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete order #
            {selectedOrder?._id.slice(-8).toUpperCase()}? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteOrder}>
              Delete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
