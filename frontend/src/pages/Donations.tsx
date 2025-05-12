import React from 'react';
import { Trash2, Edit, GripVertical } from 'lucide-react';
import { FoodItem } from '../components/FoodItemModal';
import { toast } from 'react-toastify';

interface DonationItem {
  item: FoodItem;
  quantityInStock: number;
  quantityToDonation: number;
}

interface InventoryTableProps {
  data: FoodItem[] | DonationItem[];
  isDonationTable?: boolean;
  onEdit?: (item: FoodItem) => void;
  onDelete?: (id: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLTableRowElement>, item: FoodItem) => void;
  expandedRowId?: string | null;
  onRowClick?: (id: string) => void;
  getExpirationColor: (date: string) => string;
}

const Donations: React.FC<InventoryTableProps> = ({
  data,
  isDonationTable = false,
  onEdit,
  onDelete,
  onDragStart,
  expandedRowId,
  onRowClick,
  getExpirationColor,
}) => {
  const renderRow = (item: FoodItem | DonationItem) => {
    const baseItem = 'item' in item ? item.item : item;
    const isExpanded = expandedRowId === baseItem._id;
    return (
      <React.Fragment key={baseItem._id}>
        <tr
          className="hover:bg-gray-100 cursor-pointer"
          draggable={!!onDragStart && baseItem.status === 'In Stock'}
          onDragStart={(e) => onDragStart?.(e, baseItem)}
          onClick={() => onRowClick?.(baseItem._id)}
        >
          <td className="pl-4">
            <GripVertical className="text-gray-400" />
          </td>
          <td className="px-6 py-4">
            <img src={baseItem.imageUrl} alt={baseItem.title} className="w-12 h-12 object-cover rounded" />
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{baseItem.title}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{baseItem.quantityInStock}</td>
          {isDonationTable && (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{'quantityToDonation' in item ? item.quantityToDonation : baseItem.quantityToDonation}</td>
          )}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <span className={`text-sm font-medium ${getExpirationColor(baseItem.expirationDate)}`}>{new Date(baseItem.expirationDate).toLocaleDateString()}</span>
          </td>
          <td className="px-6 py-4 text-right space-x-2">
            {onEdit && (
              <button onClick={() => onEdit(baseItem)} className="text-blue-500 hover:text-blue-700">
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(baseItem._id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={16} />
              </button>
            )}
          </td>
        </tr>
        {isExpanded && (
          <tr className="bg-gray-50">
            <td colSpan={isDonationTable ? 7 : 6} className="px-6 py-4 text-sm text-gray-700">
              {baseItem.description || 'No description provided.'}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-2 py-3"></th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity In Stock</th>
          {isDonationTable && (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marked For Donation</th>
          )}
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
          <th className="px-6 py-3"></th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((item) => renderRow(item))}
      </tbody>
    </table>
  );
};

export default Donations;
