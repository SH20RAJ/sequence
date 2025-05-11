import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-card-pattern opacity-5 z-0"></div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-center bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300 bg-clip-text text-transparent drop-shadow-lg animate-shimmer">
            Sequence
          </h1>
          <p className="mt-3 text-xl md:text-2xl text-center text-blue-300 font-light">
            The Classic Board and Card Game
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Create Game Section */}
        <section className="mb-16">
          <div className="bg-dark-800 bg-opacity-80 rounded-2xl p-8 shadow-premium border border-gold-500/20 relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-premium-hover">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-gold-500/20 to-transparent opacity-60"></div>

            <h2 className="text-3xl font-bold mb-6 text-gold-400">Create a New Game</h2>

            <form className="space-y-4">
              <div>
                <label htmlFor="yourName" className="block text-sm font-medium text-blue-300 mb-1">Your Name</label>
                <input
                  type="text"
                  id="yourName"
                  className="w-full px-4 py-3 bg-dark-900 border border-blue-900 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your name"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-dark-900 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Create Game
              </button>
            </form>
          </div>
        </section>

        {/* Join Game Section */}
        <section className="mb-16">
          <div className="bg-dark-800 bg-opacity-80 rounded-2xl p-8 shadow-premium border border-blue-900/30 relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-premium-hover">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-blue-500/20 to-transparent opacity-60"></div>

            <h2 className="text-3xl font-bold mb-6 text-blue-400">Join Existing Game</h2>

            <form className="space-y-4 sm:flex sm:items-end sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <label htmlFor="yourNameJoin" className="block text-sm font-medium text-blue-300 mb-1">Your Name</label>
                <input
                  type="text"
                  id="yourNameJoin"
                  className="w-full px-4 py-3 bg-dark-900 border border-blue-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your name"
                />
              </div>

              <div className="flex-1">
                <label htmlFor="gameId" className="block text-sm font-medium text-blue-300 mb-1">Game ID</label>
                <input
                  type="text"
                  id="gameId"
                  className="w-full px-4 py-3 bg-dark-900 border border-blue-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter game ID"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Join Game
              </button>
            </form>
          </div>
        </section>

        {/* How to Play Section */}
        <section>
          <div className="bg-dark-800 bg-opacity-80 rounded-2xl p-8 shadow-premium border border-emerald-500/20 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-emerald-500/20 to-transparent opacity-60"></div>

            <h2 className="text-3xl font-bold mb-8 text-emerald-400">How to Play</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-900 bg-opacity-60 p-6 rounded-xl border-l-4 border-emerald-500 shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-xl font-bold mb-2 text-emerald-300">Playing Cards</h3>
                <p className="text-gray-300">Play a card from your hand and place a chip on the corresponding card on the board</p>
              </div>

              <div className="bg-dark-900 bg-opacity-60 p-6 rounded-xl border-l-4 border-emerald-500 shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-xl font-bold mb-2 text-emerald-300">Forming Sequences</h3>
                <p className="text-gray-300">Form sequences of 5 chips in a row (horizontally, vertically, or diagonally)</p>
              </div>

              <div className="bg-dark-900 bg-opacity-60 p-6 rounded-xl border-l-4 border-emerald-500 shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-xl font-bold mb-2 text-emerald-300">Special Cards</h3>
                <p className="text-gray-300">Use Jacks strategically - Two-eyed Jacks are wild, One-eyed Jacks remove opponent chips</p>
              </div>

              <div className="bg-dark-900 bg-opacity-60 p-6 rounded-xl border-l-4 border-emerald-500 shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-xl font-bold mb-2 text-emerald-300">Winning</h3>
                <p className="text-gray-300">First player to form the required number of sequences wins! (1 sequence in 1v1 mode)</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 mt-12 border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <p className="text-sm text-gray-400">© 2025 Sequence Card Game | Created with Next.js</p>
          <div className="mt-4 flex space-x-6">
            <Link href="#" className="text-gray-400 hover:text-gold-400 transition-colors duration-200">
              Rules
            </Link>
            <Link href="#" className="text-gray-400 hover:text-gold-400 transition-colors duration-200">
              About
            </Link>
            <Link href="#" className="text-gray-400 hover:text-gold-400 transition-colors duration-200">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
