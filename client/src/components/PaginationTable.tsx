import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    currentPage: number;
    totalPages: number;
    indexOfFirstItem: number;
    indexOfLastItem: number;
    handlePageChange: (pageNumber: number) => void;
    handlePrevPage: () => void;
    handleNextPage: () => void;
    itemLength: number;
}

const PaginationTable = ({currentPage, totalPages, indexOfFirstItem, indexOfLastItem, handlePageChange, handlePrevPage, handleNextPage, itemLength} : Props) => {
    return (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> sampai <span className="font-medium">{Math.min(indexOfLastItem, itemLength)}</span> dari <span className="font-medium">{itemLength}</span> produk
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border ${currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                            <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNumber
                                    ? 'bg-[#F26A24] text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border ${currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    )
}

export default PaginationTable