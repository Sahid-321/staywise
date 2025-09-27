import PropertyList from './components/PropertyList';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Stay
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover amazing properties and create unforgettable memories
        </p>
      </div>
      
      <PropertyList />
    </div>
  );
}
