
const getPaginationResponse = (total , currentPage , limit) => {
    const pageCounts = Math.ceil(total / 10);
    currentPage = currentPage === undefined ? 1 : currentPage;
    const pagination = {
        pages: pageCounts,
        currentPage,
        limit,
        total
    }

    return pagination;
}

module.exports = {
    getPaginationResponse
}