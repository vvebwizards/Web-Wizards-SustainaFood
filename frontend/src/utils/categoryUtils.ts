import { useInventory } from '../context/InventoryContext';

export const useCategoryManager = () => {
  const { categories, addCategory } = useInventory();

  /**
   * Checks if a category exists by name (case-insensitive)
   * @param categoryName - The name of the category to check
   * @returns The existing category or null if not found
   */
  const getCategoryByName = (categoryName: string) => {
    if (!categoryName) return null;
    return categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    ) || null;
  };

  /**
   * Ensures a category exists, creates it if it doesn't
   * @param categoryName - The name of the category to ensure exists
   * @returns Promise that resolves with the category ID
   */
  const ensureCategoryExists = async (categoryName: string): Promise<string> => {
    if (!categoryName) {
      throw new Error('Category name is required');
    }

    // Check if category already exists
    const existingCategory = getCategoryByName(categoryName);
    if (existingCategory) {
      return existingCategory._id;
    }

    // If not, create it
    try {
      await addCategory({ name: categoryName });
      // The category will be added to the context by the InventoryProvider
      // We need to find it again to get the ID
      const newCategory = getCategoryByName(categoryName);
      if (!newCategory) {
        throw new Error('Failed to create category');
      }
      return newCategory._id;
    } catch (error) {
      console.error('Error ensuring category exists:', error);
      throw error;
    }
  };

  return {
    getCategoryByName,
    ensureCategoryExists,
  };
};

export default useCategoryManager;
