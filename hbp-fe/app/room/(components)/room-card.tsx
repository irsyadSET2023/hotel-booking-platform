"use client";

interface RoomCardProps {
  name: string;
  hotelName: string;
  basePrice: string;
  maxOccupancy: number;
}

export const RoomCard = ({
  name,
  hotelName,
  basePrice,
  maxOccupancy,
}: RoomCardProps) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">{name}</h2>
      <p className="text-gray-600 mb-1">Hotel: {hotelName}</p>
      <p className="text-gray-600 mb-1">Base Price: RM {basePrice}</p>
      <p className="text-gray-600">Max Occupancy: {maxOccupancy}</p>
    </div>
  );
};
