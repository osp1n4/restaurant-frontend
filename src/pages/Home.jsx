import { useNavigate } from 'react-router-dom';

/**
 * Página principal - Landing page del restaurante
 */
function Home() {
  const navigate = useNavigate();

  const handleOrderNow = () => {
    navigate('/order');
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-center bg-white dark:bg-background-dark p-4 pb-2 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-[#181311] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
          Delicious Kitchen
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-background-dark rounded-2xl shadow-2xl p-6 flex flex-col items-center">
            {/* Hero Image */}
            <div className="w-full rounded-xl overflow-hidden mb-6 shadow-lg">
              <img
                src="/smash-burger-que-es.jpg"
                alt="Delicious Burger with Fries"
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Title Section */}
            <div className="text-center mb-8">
              <h1 className="text-[#181311] dark:text-white text-4xl font-bold mb-2">
                Delicious Kitchen
              </h1>
              <p className="text-[#896f61] dark:text-gray-400 text-base">
                Freshly Made, Just for You
              </p>
            </div>

            {/* Order Button */}
            <button
              onClick={handleOrderNow}
              className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all transform hover:scale-105"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;