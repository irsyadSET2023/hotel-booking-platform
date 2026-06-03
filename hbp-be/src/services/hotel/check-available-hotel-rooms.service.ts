import type { number } from "zod";
import { RoomStatus } from "../../../generated/prisma";
import prisma from "../../config/prisma";

export const checkAvailableHotelRooms = async ({
  hotelUuid,
  bookingUuid,
}: {
  hotelUuid: string;
  bookingUuid: string;
}) => {
  const booking = await prisma.booking.findFirst({
    where: {
      uuid: bookingUuid,
      deletedAt: null,
    },
    include: {
      roomCategory: true,
      hotel: true,
    },
  });

  if (!booking || booking.hotel.uuid !== hotelUuid) {
    throw new Error("Booking not found for the specified hotel");
  }

  const availableRooms = await prisma.room.findMany({
    where: {
      hotelId: booking.hotelId,
      roomCategoryId: booking.roomCategoryId,
      deletedAt: null,
      status: RoomStatus.AVAILABLE,
    },
  });

  return availableRooms.map((room) => ({
    uuid: room.uuid,
    floor: room.floor,
    number: room.roomNumber,
  }));
};
