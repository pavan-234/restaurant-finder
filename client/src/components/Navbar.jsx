import { useState, useEffect } from "react";
import { Moon, Sun, Home, MapPin, Camera, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md py-4 px-6 flex justify-between items-center relative">
      {/* Logo / Title */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DineFinder</h1>

      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-4">
        <button onClick={() => navigate("/")} className="btn flex items-center gap-2 cursor-pointer">
          <Home className="w-5 h-5" /> Home
        </button>
        <button onClick={() => navigate("/location")} className="btn flex items-center gap-2 cursor-pointer">
          <MapPin className="w-5 h-5" /> Search by Location
        </button>
        <button onClick={() => navigate("/image-search")} className="btn flex items-center gap-2 cursor-pointer">
          <Camera className="w-5 h-5" /> Search by Image
        </button>
      </div>

      {/* Dark Mode & Mobile Menu Button */}
      <div className="flex items-center space-x-4">
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-800">
          {darkMode ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-gray-800" />}
        </button>
        
        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-800" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6 text-gray-900 dark:text-white" /> : <Menu className="w-6 h-6 text-gray-900 dark:text-white" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-md md:hidden flex flex-col items-center py-4 space-y-4 z-50">
          <button onClick={() => { navigate("/"); setMenuOpen(false); }} className="btn flex items-center gap-2">
            <Home className="w-5 h-5" /> Home
          </button>
          <button onClick={() => { navigate("/location"); setMenuOpen(false); }} className="btn flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Search by Location
          </button>
          <button onClick={() => { navigate("/image-search"); setMenuOpen(false); }} className="btn flex items-center gap-2">
            <Camera className="w-5 h-5" /> Search by Image
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
