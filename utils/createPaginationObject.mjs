const createPaginationObject = function(currentPage, limit, total, quantity) {
  const totalPages = Math.ceil(total / limit);
  const currentStart = (currentPage - 1) * limit + 1;
  const currentEnd = (currentPage - 1) * limit + quantity;

  return {
    currentPage,
    currentStart,
    currentEnd,
    limit,
    total,
    totalPages
  };
};

export default createPaginationObject;