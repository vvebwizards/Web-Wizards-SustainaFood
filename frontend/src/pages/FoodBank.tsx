import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { FoodCard } from '../components/FoodCard';
import { FoodItem } from '../components/FoodItemModal';
import { useFoodBank } from '../context/FoodBankContext';

function FoodBank() {
  const { toDonationFood, fetchToDonationFood, error } = useFoodBank();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    if (!isFetched) {
      fetchToDonationFood().then(() => setIsFetched(true));
    }
  }, [fetchToDonationFood, isFetched]);

  const filteredItems = toDonationFood.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleOrder = (item: FoodItem) => {
    alert(`Ordered: ${item.title}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {error && <div className="text-red-600 mb-4">Error: {error}</div>}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for food items..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="fruits">Fruits</option>
                <option value="vegetables">Vegetables</option>
                <option value="dairy">Dairy</option>
                <option value="grains">Grains</option>
                <option value="protein">Protein</option>
                <option value="other">Other</option>
              </select>

              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="free">Free Items</option>
                <option value="reduced">Reduced Price</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <FoodCard
              key={item._id}
              item={item}
              onOrder={handleOrder}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No food items found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default FoodBank;