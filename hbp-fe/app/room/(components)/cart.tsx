"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, CalendarDays, User } from "lucide-react";
import useCartStore from "@/app/(provider)/cart-store";
import Link from "next/link";

export const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCartStore();
  const count = cartItems.length;

  const formatDate = (d?: Date) => (d ? new Date(d).toLocaleDateString() : "—");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="w-4 h-4" />
          <span className="ml-2">Cart</span>
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
              {count}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Cart ({count} item{count !== 1 ? "s" : ""})
          </DialogTitle>
        </DialogHeader>

        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y space-y-0 pr-1">
              {cartItems.map((item) => (
                <li
                  key={item.roomCategoryUuid}
                  className="py-4 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 text-sm min-w-0">
                    <p className="font-medium truncate">
                      {item.roomCategoryName}
                    </p>
                    <p className="text-muted-foreground truncate">
                      {item.hotelName}
                    </p>
                    {(item.checkInDate || item.checkOutDate) && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="w-3 h-3 shrink-0" />
                        {formatDate(item.checkInDate)} →{" "}
                        {formatDate(item.checkOutDate)}
                      </p>
                    )}
                    {item.guestName && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3 shrink-0" />
                        {item.guestName}
                      </p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={() => removeFromCart(item.roomCategoryUuid)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={clearCart}
              >
                Clear all
              </Button>
              <Link href="/customer">
                <Button size="sm">Proceed to Checkout</Button>
              </Link>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
