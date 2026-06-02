"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import useCartStore from "@/app/(provider)/cart-store";
import { useState } from "react";

interface RoomCardProps {
  uuid: string;
  name: string;
  hotelName: string;
  basePrice: string;
  maxOccupancy: number;
  checkInDate?: string;
  checkOutDate?: string;
}

export const RoomCard = ({
  uuid,
  name,
  hotelName,
  basePrice,
  maxOccupancy,
  checkInDate,
  checkOutDate,
}: RoomCardProps) => {
  const { cartItems, addToCart, removeFromCart } = useCartStore();
  const [added, setAdded] = useState(false);

  const isInCart = cartItems.some((item) => item.roomCategoryUuid === uuid);

  const handleAddToCart = () => {
    if (isInCart) {
      removeFromCart(uuid);
      return;
    }

    addToCart({
      roomCategoryUuid: uuid,
      roomCategoryName: name,
      hotelName,
      checkInDate: checkInDate ? new Date(checkInDate) : undefined,
      checkOutDate: checkOutDate ? new Date(checkOutDate) : undefined,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold leading-tight">{name}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{hotelName}</p>
      </div>

      <div className="text-sm space-y-0.5">
        <p className="font-medium">RM {basePrice}</p>
        <p className="text-muted-foreground">Max {maxOccupancy} guests</p>
      </div>

      <Button
        size="sm"
        variant={isInCart ? "secondary" : "default"}
        className="w-full mt-auto"
        onClick={handleAddToCart}
      >
        {isInCart ? (
          <>
            <Check className="w-3.5 h-3.5 mr-1.5" />
            In Cart
          </>
        ) : added ? (
          <>
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Added!
          </>
        ) : (
          <>
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
};
