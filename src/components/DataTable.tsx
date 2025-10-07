import React, { useState, useMemo } from 'react';
import SearchIcon from './icons/SearchIcon';

interface DataTableProps<T> {
  data: T[];
  columns: { header: string; accessor: string, render?: (item: T) => React.ReactNode }[];
  searchKeys: (keyof T)[];
  actionAccessor?: string;
}

const DataTable = <T extends { id: number | string }>(
  { data, columns, searchKeys, actionAccessor = 'actions' }: DataTableProps<T>
) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      searchKeys.some((key) =>
        String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, searchKeys]);
  
  const inputStyles = "w-full p-2 ps-10 text-sm text-text-primary border border-secondary rounded-lg bg-surface focus:ring-primary focus:border-primary";

  return (
    <div className="bg-surface rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-secondary">
        <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <SearchIcon className="w-4 h-4 text-text-secondary" />
            </div>
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputStyles}
            placeholder={`ابحث في ${searchKeys.join(', ')}...`}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm text-right text-text-primary">
          <thead className="text-xs uppercase bg-secondary/30 text-text-secondary">
            <tr>
              {columns.map((col) => (
                <th key={col.header} scope="col" className="px-6 py-3">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item.id} className={`border-b border-secondary ${index % 2 === 0 ? 'bg-surface' : 'bg-background'}`}>
                {columns.map((col, cIndex) => (
                  <td key={`${item.id}-${col.accessor}-${cIndex}`} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(item) : String(item[col.accessor as keyof T])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        <div className="p-4 space-y-4">
          {filteredData.map((item) => {
            const actionColumn = columns.find(c => c.accessor === actionAccessor);
            return (
              <div key={item.id} className="bg-background rounded-lg p-4 border border-secondary">
                {columns.map((col) => {
                  if (col.accessor === 'id' || col.accessor === actionAccessor) return null; // Skip rendering ID and actions inline
                  return (
                    <div key={col.accessor} className="flex justify-between items-center text-sm py-1.5 border-b border-secondary/50 last:border-b-0">
                      <span className="font-semibold text-text-secondary">{col.header}:</span>
                      <span className="text-right text-text-primary break-all">
                        {col.render ? col.render(item) : String(item[col.accessor as keyof T])}
                      </span>
                    </div>
                  );
                })}
                {actionColumn && actionColumn.render && (
                   <div className="flex justify-end pt-3 mt-2">
                     {actionColumn.render(item)}
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

       {filteredData.length === 0 && (
        <div className="text-center p-6 text-text-secondary">
          لم يتم العثور على بيانات مطابقة.
        </div>
      )}
    </div>
  );
};

export default DataTable;
