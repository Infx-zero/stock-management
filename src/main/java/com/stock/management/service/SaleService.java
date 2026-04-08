package com.stock.management.service;

import com.stock.management.model.Product;
import com.stock.management.model.Sale;
import com.stock.management.repository.ProductRepository;
import com.stock.management.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;

import java.time.LocalDate;
import java.util.List;


@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    // Make a sale (IMPORTANT LOGIC)
    public void makeSale(@NonNull Long productId, int quantity) {

        Product product = productRepository.findById(productId).orElse(null);

        if (product != null && product.getQuantity() >= quantity) {

            // Reduce stock
            product.setQuantity(product.getQuantity() - quantity);
            productRepository.save(product);

            // Save sale
            Sale sale = new Sale();
            sale.setProduct(product);
            sale.setQuantity(quantity);
            sale.setDate(LocalDate.now());

            saleRepository.save(sale);
        }
    }

    // Get all sales
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }


    public List<Sale> getRecentSales() {
    return saleRepository.findTop5ByOrderByIdDesc();
}


}