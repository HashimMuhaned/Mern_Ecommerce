import React from "react";
import HomePage from "./pages/HomePage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CategoriesPage from "./pages/CategoriesPage";
import ContactPage from "./pages/ContactPage";
import CategoryListingPage from "./pages/CategoryListingPage";
import ProductDisplay from "./pages/ProductDisplay";
import ScrollToTop from "./components/ScrollToTop";
import CartPage from "./pages/CartPage";
import FavoritePage from "./pages/FavoritePage";
import ProfilePage from "./pages/ProfilePage";
import ProfileLayout from "./layouts/ProfileLayout";
import AddItemPage from "./pages/AddItemPage";
import ItemsAnalysisPage from "./pages/ItemsAnalysisPage";
import YourItemsPage from "./pages/YourItemsPage";
import EditYourItemPage from "./pages/EditYourItemPage";
import ItemAnalysisDashboardPage from "./pages/ItemAnalysisDashboardPage";
import CheckoutDetailsForm from "./pages/CheckoutDetailsFormPage";
import OrdersPage from "./pages/OrdersPage";
import BuyerOrderpage from "./pages/BuyerOrderpage";
import AllItems from "./pages/AllItems";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ConfirmEmailToResetPassword from "./pages/ConfirmEmailToResetPassword";
import ActivateAccountPage from "./pages/ActivateAccountPage";
import NotFoundPage from "./pages/NotFoundPage";


function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* <ChatBotLayout /> */}
        <Route path="/" element={<MainLayout />}>
          <Route path="/ethereal" element={<HomePage />} />
          <Route path="/ethereal/categories" element={<CategoriesPage />} />
          <Route path="/ethereal/contact" element={<ContactPage />} />
          <Route
            path="/ethereal/categories/:category"
            element={<CategoryListingPage />}
          />
          <Route
            path="/ethereal/categories/:category/:id"
            element={<ProductDisplay />}
          />
          <Route path="/ethereal/cart" element={<CartPage />} />
          <Route
            path="/ethereal/cart/checkout"
            element={<CheckoutDetailsForm />}
          />
          <Route path="/ethereal/favorites" element={<FavoritePage />} />
          <Route path="/ethereal/all" element={<AllItems />} />
          <Route path="/ethereal/profile" element={<ProfileLayout />}>
            <Route
              path="/ethereal/profile/settings"
              element={<ProfilePage />}
            />
            <Route
              path="/ethereal/profile/add-item"
              element={<AddItemPage />}
            />
            <Route
              path="/ethereal/profile/item-analysis"
              element={<ItemsAnalysisPage />}
            />
            <Route
              path="/ethereal/profile/yourItems"
              element={<YourItemsPage />}
            />
            <Route
              path="/ethereal/profile/edit-your-Item/:id"
              element={<EditYourItemPage />}
            />
            <Route
              path="/ethereal/profile/item-analysis/dashboard/:id"
              element={<ItemAnalysisDashboardPage />}
            />
            <Route path="/ethereal/profile/Orders" element={<OrdersPage />} />
            <Route
              path="/ethereal/profile/BuyerOrderpage"
              element={<BuyerOrderpage />}
            />
          </Route>
        </Route>
        <Route path="/ethereal/signup" element={<SignUpPage />} />
        <Route path="/ethereal/login" element={<LoginPage />} />
        <Route
          path="/ethereal/confirm-email-to-change-password"
          element={<ConfirmEmailToResetPassword />}
        />
        <Route
          path="/ethereal/reset-password/:token"
          element={<ResetPasswordPage />}
        />
        <Route
          path="/ethereal/activate-account"
          element={<ActivateAccountPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
