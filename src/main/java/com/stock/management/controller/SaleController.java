package com.stock.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;
import java.util.List;

import com.stock.management.model.Sale;
import com.stock.management.service.SaleService;

@RestController
@RequestMapping("/api/sales")  // ✅ CHANGED: Added /api prefix to match JS calls
public class SaleController {

    @Autowired
    private SaleService saleService;

    @PostMapping("/{productId}/{quantity}")
    public void makeSale(@PathVariable @NonNull Long productId, @PathVariable int quantity) {
        saleService.makeSale(productId, quantity);
    }

    // ✅ NEW: GET all sales endpoint
    @GetMapping
    public List<Sale> getAllSales() {
        return saleService.getAllSales();
    }
}