import { useState, type ComponentType, type ReactNode } from "react";
import PaginationTable from "./PaginationTable";
import type { Role } from "../services/auth.service";
import type { OrderStatus } from "../services/order.service";

interface Column {
    header: string;
    accessor?: string;
    render?: (row: any) => ReactNode;
}

interface Props {
    columns: Column[];
    data: any[];
    actions?: {
        label: string;
        icon: ComponentType<{ size?: number }>;
        color: string;
        hoverColor: string;
        onClick: (row: any) => void;
    }[];
    itemsPerPage?: number;
    role?: Role;
    orderStatus?: OrderStatus;
}


const DataTable = ({ columns, data, actions, itemsPerPage = 5, role, orderStatus } : Props) => {
    const [currentPage, setCurrentPage] = useState(1);
    // Pagination logic
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(row) : column.accessor ? row[column.accessor] : null}
                  </td>
                ))}
                {role === 'Admin' && orderStatus === 'shipping' && actions && (
                   <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {actions.map((action, actionIndex) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={`p-2 ${action.color} hover:${action.hoverColor} rounded-lg transition-colors cursor-pointer`}
                            title={action.label}
                          >
                            <Icon size={18} />
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
                {!role && !orderStatus && actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {actions.map((action, actionIndex) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={`p-2 ${action.color} hover:${action.hoverColor} rounded-lg transition-colors cursor-pointer`}
                            title={action.label}
                          >
                            <Icon size={18} />
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationTable currentPage={currentPage} totalPages={totalPages} indexOfFirstItem={indexOfFirstItem} indexOfLastItem={indexOfLastItem} handlePageChange={handlePageChange} handlePrevPage={handlePrevPage} handleNextPage={handleNextPage} itemLength={data.length}/>
    </div>
  )
}

export default DataTable