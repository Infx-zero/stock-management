package com.stock.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.stock.management.model.Sale;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findTop5ByOrderByIdDesc();
}

