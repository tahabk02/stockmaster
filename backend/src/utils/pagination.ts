export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export function getPagination(query: PaginationQuery) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(Number(query.limit) || 20, 100));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
