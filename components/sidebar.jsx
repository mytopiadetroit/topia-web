import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  BarChart3, 
  Package, 
  Grid3X3, 
  Menu,
  LogOut, 
  X,
  ChevronDown,
  ChevronRight,
  Users
} from "lucide-react";
import { fetchAllCategories } from "../service/service";

export default function Sidebar({ className }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState("");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const router = useRouter();
  
  // Load categories for product dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetchAllCategories(router);
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [router]);

  // Update active module based on the current URL path
  useEffect(() => {
    if (router.pathname.includes("/dashboard")) {
      setActiveModule("dashboard");
    } else if (router.pathname.includes("/product")) {
      setActiveModule("product");
    } else if (router.pathname.includes("/categories")) {
      setActiveModule("categories");
    } else if (router.pathname.includes("/users")) {
      setActiveModule("users");
    }
  }, [router.pathname]);

  const getModuleClasses = (moduleName) => {
    const baseClasses = `w-full flex items-center justify-start p-2 rounded-lg ${
      collapsed ? "px-2" : "px-4"
    }`;
    
    if (activeModule === moduleName) {
      return `${baseClasses} bg-white text-[#80A6F7]`;
    } else {
      return `${baseClasses} text-white hover:bg-blue-600`;
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
  };

  const handleLogoutConfirm = () => {
    // Remove user tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userDetail');
    
    // Close the popup
    setShowLogoutPopup(false);
    
    // Navigate to the home page
    router.push('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutPopup(false);
  };

  return (
    <>
      <div
        className={`fixed left-0 top-0 flex h-screen flex-col justify-between bg-gradient-to-b from-[#80A6F7] to-[#80A6F7] text-white transition-all duration-300 ${
          collapsed ? "w-[70px]" : "w-[240px]"
        } ${className}`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center px-4 py-6">
            <div className="flex items-center">
              {!collapsed && (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-2">
                    <span className="text-blue-600 text-lg font-bold">🍄</span>
                  </div>
                  <span className="text-white font-bold text-lg">ShroomTopia</span>
                </div>
              )}
          </div>
            <button 
              className="ml-auto text-white hover:bg-blue-700 p-2 rounded-lg"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu className="h-5 w-5" />
            </button>
        </div>

          {/* Navigation */}
          <nav className="mt-6 px-2">
            <div className="space-y-1">
              <Link href="/dashboard">
                <button
                  className={getModuleClasses("dashboard")}
                >
                  <BarChart3 className={`h-5 w-5 ${activeModule === "dashboard" ? "text-[#80A6F7]" : ""}`} />
                  {!collapsed && <span className="ml-2">Dashboard</span>}
                </button>
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                  className={getModuleClasses("product")}
                >
                  <Package className={`h-5 w-5 ${activeModule === "product" ? "text-[#80A6F7]" : ""}`} />
                  {!collapsed && (
                    <>
                      <span className="ml-2">Product</span>
                      {productDropdownOpen ? (
                        <ChevronDown className="ml-auto h-4 w-4" />
                      ) : (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </>
                  )}
                </button>
                
                {/* Product Dropdown */}
                {productDropdownOpen && !collapsed && (
                  <div className="ml-4 mt-1 space-y-1">
                    {categoriesLoading ? (
                      <div className="px-4 py-2 text-sm text-blue-100 italic">Loading categories...</div>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <Link key={category._id} href={`/products/${category._id}`}>
                          <button className="w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-blue-600 rounded">
                            {category.category}
                          </button>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-blue-100 italic">No categories found</div>
                    )}
                  </div>
                )}
              </div>
              
              <Link href="/categories">
                <button
                  className={getModuleClasses("categories")}
                >
                  <Grid3X3 className={`h-5 w-5 ${activeModule === "categories" ? "text-[#80A6F7]" : ""}`} />
                  {!collapsed && <span className="ml-2">Categories</span>}
                </button>
              </Link>
              
              <Link href="/users">
                <button
                  className={getModuleClasses("users")}
                >
                  <Users className={`h-5 w-5 ${activeModule === "users" ? "text-[#80A6F7]" : ""}`} />
                  {!collapsed && <span className="ml-2">Users</span>}
                </button>
              </Link>
            </div>
        </nav>
        </div>
        
        {/* Logout button */}
        <div className="mb-8 px-4">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-start text-white hover:bg-blue-600 p-2 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Log out</span>}
          </button>
        </div>
      </div>

      {/* Logout Confirmation Popup */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-72 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Log out Confirmation</h3>
              <button
                onClick={handleLogoutCancel}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-5">
              <p className="text-sm text-gray-500">Are you sure you want to log out?</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-[#80A6F7] hover:bg-blue-700 text-white text-sm font-medium rounded-md"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}