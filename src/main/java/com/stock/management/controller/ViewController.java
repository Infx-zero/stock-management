package com.stock.management.controller;

import com.stock.management.service.ProductService;
import com.stock.management.service.SaleService;
import com.stock.management.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.stock.management.model.User;

@Controller
public class ViewController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Autowired
    private SaleService saleService;

    @GetMapping("/")
        public String home() {
    return "redirect:/login";
    }

    // ================= DASHBOARD =================
    @GetMapping("/dashboard")
public String dashboard(Model model) {
    // ✅ FIXED: Remove duplicate addAttribute
    model.addAttribute("totalProducts", productService.countProducts());
    model.addAttribute("recentSales", saleService.getRecentSales() != null ? saleService.getRecentSales() : java.util.List.of());
    model.addAttribute("lowStockProducts", productService.getLowquantityProducts() != null ? productService.getLowquantityProducts() : java.util.List.of());
    return "dashboard";
}
    // ================= PRODUCTS =================
    @GetMapping("/products")
    public String productsPage(Model model) {

        model.addAttribute("products",
                productService.getAllProducts() != null
                        ? productService.getAllProducts()
                        : java.util.List.of());

        return "products";
    }

    // ================= SALES =================
    @GetMapping("/sales")
    public String salesPage(Model model) {

        model.addAttribute("recentSales",
                saleService.getRecentSales() != null
                        ? saleService.getRecentSales()
                        : java.util.List.of());

        return "sales";
    }

    @GetMapping("/login")
        public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String registerPage() {
    return "register";
    }

    @PostMapping("/register")
    public String registerUser(@RequestParam String username,
    @RequestParam String password,Model model) {

    try {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);

        userService.saveUser(user);

        return "redirect:/login";

    } catch (Exception e) {
        model.addAttribute("error", e.getMessage());
        return "register";
    }
    }
}


