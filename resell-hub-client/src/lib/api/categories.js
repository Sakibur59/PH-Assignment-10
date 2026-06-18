export const getCategories = async (products) => {
    
    if (!products || !products.length) return [];
    const categories = [...new Set(products.map(p => p.category))];
    return categories.map(category => ({
        name: category,
        count: products.filter(p => p.category === category).length
    }));
}