import { RoomStatus } from "../../../generated/prisma";
import prisma from "../../config/prisma";

export const customerCheckInRoom = async ({
  bookingUuid,
  roomUuid,
}: {
  bookingUuid: string;
  roomUuid: string;
}) => {
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: {
        uuid: bookingUuid,
        deletedAt: null,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const roomResult = await tx.room.updateMany({
      where: {
        uuid: roomUuid,
        deletedAt: null,
        status: RoomStatus.AVAILABLE,
      },
      data: {
        status: RoomStatus.OCCUPIED,
      },
    });

    if (roomResult.count === 0) {
      throw new Error("Room is not available");
    }

    await tx.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        room: {
          connect: {
            uuid: roomUuid,
          },
        },
      },
    });
  });
};
