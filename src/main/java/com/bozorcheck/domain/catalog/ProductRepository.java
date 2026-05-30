package com.bozorcheck.domain.catalog;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findByCode(String code);

    @Query("""
        select distinct p
        from Product p
        left join ProductAlias a on a.product = p
        where (:active is null or p.active = :active)
          and (
              :query is null
              or :query = ''
              or lower(p.code) like lower(concat('%', :query, '%'))
              or lower(p.nameKo) like lower(concat('%', :query, '%'))
              or lower(p.nameEn) like lower(concat('%', :query, '%'))
              or lower(coalesce(p.nameUz, '')) like lower(concat('%', :query, '%'))
              or lower(coalesce(p.nameRu, '')) like lower(concat('%', :query, '%'))
              or lower(coalesce(a.alias, '')) like lower(concat('%', :query, '%'))
          )
        order by p.code
        """)
    List<Product> search(@Param("query") String query, @Param("active") Boolean active);
}
