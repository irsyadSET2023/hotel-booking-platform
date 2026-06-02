import { getRoomList } from "../(services)/list-rooms-service";
import { Room } from "../interfaces";
import { RoomCardList } from "./(components)/room-card-list";

export default async function RoomList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const search = String(params.search ?? "");
  const checkInDate = String(params.checkInDate ?? "2026-06-01T00:00:00.000Z");
  const checkOutDate = String(
    params.checkOutDate ?? "2026-06-02T00:00:00.000Z",
  );
  const roomCategory = String(params.roomCategory ?? "");

  const { data, success, message } = await getRoomList(
    page,
    pageSize,
    checkInDate,
    checkOutDate,
    search,
    roomCategory,
  );

  if (success && data) {
    return (
      <RoomCardList
        rooms={data.data as Room[]}
        currentPage={page}
        totalPages={data.meta.totalPages}
        pageSize={pageSize}
        searchTerm={search}
        roomCategory={roomCategory}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
      />
    );
  }
}
