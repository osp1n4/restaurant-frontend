
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Página principal - Landing page profesional del restaurante
 */
function Home() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOrderNow = () => {
    navigate('/order');
  };

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <>
      <div className="relative w-full bg-background-light dark:bg-background-dark">
      {/* Header Sticky */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-primary">restaurant</span>
              <h1 className="text-xl font-bold text-primary dark:text-primary">
                {t('home.title')}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleOrderNow}
                className="bg-primary text-white font-semibold px-6 py-2 rounded-lg hover:bg-primary/90 transition-all"
              >
                {t('home.orderNow')}
              </button>
              <select
                value={i18n.language}
                onChange={handleLanguageChange}
                className="bg-primary text-white font-semibold px-6 py-2 rounded-lg hover:bg-primary/90 transition-all"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section con Parallax */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <img
            src="/smash-burger-que-es.jpg"
            alt="Delicious Burger"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <h2
            className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up text-primary"
            style={{ animationDelay: '0.2s' }}
          >
            {t('home.title')}
          </h2>
          <p
            className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            {t('home.heroSubtitle')}
          </p>
          <p
            className="text-lg mb-10 max-w-2xl mx-auto text-gray-300 animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            {t('home.heroDescription')}
          </p>
          <button
            onClick={handleOrderNow}
            className="bg-primary text-white font-bold px-10 py-4 rounded-xl text-lg shadow-2xl hover:bg-primary/90 hover:scale-105 transition-all animate-fade-in-up"
            style={{ animationDelay: '0.8s' }}
          >
            {t('home.orderNow')}
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white dark:bg-background-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h3 className="text-4xl md:text-5xl font-bold text-[#181311] dark:text-white mb-4">
              {t('home.ourStory')}
            </h3>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-lg text-[#896f61] dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t('home.aboutDescription')}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="py-20 bg-background-light dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-[#181311] dark:text-white mb-4">
              {t('home.featuredDishes')}
            </h3>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-lg text-[#896f61] dark:text-gray-400">
              {t('home.featuredSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Dish 1 - Burger */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <img
                  src="/smash-burger-que-es.jpg"
                  alt="Smash Burger"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="text-xl font-bold mb-2 text-primary">Smash Burger</h4>
                    <p className="text-sm text-gray-200">
                      Juicy beef patty with melted cheese, fresh veggies, and our special sauce
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <h4 className="text-xl font-bold text-[#181311] dark:text-white">Smash Burger</h4>
                <p className="text-primary font-semibold">$20,000</p>
              </div>
            </div>

            {/* Dish 2 - Pasta */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <img
                  src="/pastas-carbonara.webp"
                  alt="Creamy Carbonara"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="text-xl font-bold mb-2 text-primary">Creamy Carbonara</h4>
                    <p className="text-sm text-gray-200">
                      Traditional Italian pasta with crispy bacon, eggs, and parmesan
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <h4 className="text-xl font-bold text-[#181311] dark:text-white">Creamy Carbonara</h4>
                <p className="text-primary font-semibold">$30,000</p>
              </div>
            </div>

            {/* Dish 3 - Salad */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <img
                  src="/Ensalada-pollo-vinagreta-limon.webp"
                  alt="Caesar Salad"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="text-xl font-bold mb-2 text-primary">Caesar Salad</h4>
                    <p className="text-sm text-gray-200">
                      Fresh greens with grilled chicken, lemon vinaigrette, and croutons
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <h4 className="text-xl font-bold text-[#181311] dark:text-white">Caesar Salad</h4>
                <p className="text-primary font-semibold">$18,000</p>
              </div>
            </div>

            {/* Dish 4 - Pizza */}
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <img
                  src="/tomato-mozzarella-pizza.webp"
                  alt="Margherita Pizza"
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="text-xl font-bold mb-2 text-primary">Margherita Pizza</h4>
                    <p className="text-sm text-gray-200">
                      Classic pizza with fresh mozzarella, tomatoes, and basil
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <h4 className="text-xl font-bold text-[#181311] dark:text-white">Margherita Pizza</h4>
                <p className="text-primary font-semibold">$28,000</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleOrderNow}
              className="bg-primary text-white font-bold px-8 py-3 rounded-lg hover:bg-primary/90 hover:scale-105 transition-all"
            >
              {t('home.viewFullMenu')}
            </button>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-20 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-[#181311] dark:text-white mb-4">
              {t('home.expertTeam')}
            </h3>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-lg text-[#896f61] dark:text-gray-400 max-w-3xl mx-auto">
              {t('home.teamDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Chef 1 */}
            <div className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <img
                  src="/chef-cooking-kitchen-while-wearing-professional-attire.jpg"
                  alt="Master Chef"
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h4 className="text-2xl font-bold mb-2 text-[#FF6B35]">{t('home.expertArtists')}</h4>
                    <p className="text-gray-200 mb-4">
                      {t('home.expertArtistsDescription')}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">star</span>
                      <span className="text-sm text-[#FF6B35]">{t('home.michelinExcellence')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chef 2 */}
            <div className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <img
                  src="/chef-cooking-kitchen-while-wearing-professional-attire (1).jpg"
                  alt="Professional Chef"
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h4 className="text-2xl font-bold mb-2 text-[#FF6B35]">{t('home.passionateProfessionals')}</h4>
                    <p className="text-gray-200 mb-4">
                      {t('home.passionateProfessionalsDescription')}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">restaurant</span>
                      <span className="text-sm text-[#FF6B35] ">{t('home.awardWinningTeam')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 rounded-xl bg-background-light dark:bg-gray-900 transform hover:scale-105 transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">verified</span>
              </div>
              <h4 className="text-xl font-bold text-[#181311] dark:text-white mb-2">
                {t('home.certifiedExcellence')}
              </h4>
              <p className="text-[#896f61] dark:text-gray-400">
                {t('home.certifiedExcellenceDescription')}
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-background-light dark:bg-gray-900 transform hover:scale-105 transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">eco</span>
              </div>
              <h4 className="text-xl font-bold text-[#181311] dark:text-white mb-2">
                {t('home.freshIngredients')}
              </h4>
              <p className="text-[#896f61] dark:text-gray-400">
                {t('home.freshIngredientsDescription')}
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-background-light dark:bg-gray-900 transform hover:scale-105 transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">favorite</span>
              </div>
              <h4 className="text-xl font-bold text-[#181311] dark:text-white mb-2">
                {t('home.madeWithLove')}
              </h4>
              <p className="text-[#896f61] dark:text-gray-400">
                {t('home.madeWithLoveDescription')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            {t('home.ctaTitle')}
          </h3>
          <p className="text-xl mb-10 text-white/90">
            {t('home.ctaText')}
          </p>
          <button
            onClick={handleOrderNow}
            className="bg-white text-primary font-bold px-12 py-4 rounded-xl text-lg shadow-2xl hover:bg-gray-100 hover:scale-105 transition-all"
          >
            {t('home.orderNow')}
          </button>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 bg-white dark:bg-background-dark">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF6B35]/20 rounded-full mb-4">
            <span className="material-symbols-outlined text-3xl text-[#FF6B35]">rate_review</span>
          </div>
          <h3 className="text-3xl font-bold text-[#181311] dark:text-white mb-4">
            {t('home.seeReviews')}
          </h3>
          <p className="text-lg text-[#896f61] dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('home.reviewsDescription')}
          </p>
          <button
            onClick={() => navigate('/reviews')}
            className="bg-[#FF6B35] hover:bg-[#e55d2e] text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-white">star</span>
            {t('home.viewCustomerReviews')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#181311] dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">restaurant</span>
                <h4 className="text-xl font-bold text-primary">Delicious Kitchen</h4>
              </div>
              <p className="text-gray-400">
                Freshly Made, Just for You
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-primary">Contact</h4>
              <p className="text-gray-400 mb-2">Phone: +123-423-1261</p>
              <p className="text-gray-400">Email: info@deliciouskitchen.com</p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-primary">Hours</h4>
              <p className="text-gray-400 mb-2">Mon - Fri: 11am - 10pm</p>
              <p className="text-gray-400">Sat - Sun: 10am - 11pm</p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">&copy; 2024 Delicious Kitchen. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
export default Home;