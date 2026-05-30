package com.bozorcheck.domain.market;

import com.bozorcheck.common.enums.MarketType;
import com.bozorcheck.common.exception.ApiException;
import com.bozorcheck.common.exception.ErrorCode;
import com.bozorcheck.domain.market.dto.MarketCreateRequest;
import com.bozorcheck.domain.market.dto.MarketResponse;
import com.bozorcheck.domain.market.dto.MarketUpdateRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class MarketService {

    private final MarketRepository marketRepository;

    public MarketService(MarketRepository marketRepository) {
        this.marketRepository = marketRepository;
    }

    @Transactional(readOnly = true)
    public List<MarketResponse> search(MarketType type, Boolean active, String city) {
        Boolean activeFilter = active == null ? Boolean.TRUE : active;
        String cityFilter = StringUtils.hasText(city) ? city.trim() : null;
        return marketRepository.findAll().stream()
            .filter(market -> type == null || market.getMarketType() == type)
            .filter(market -> activeFilter == null || market.isActive() == activeFilter)
            .filter(market -> cityFilter == null || cityFilter.equalsIgnoreCase(market.getCity()))
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public MarketResponse get(UUID marketId) {
        return toResponse(findById(marketId));
    }

    @Transactional
    public MarketResponse create(MarketCreateRequest request) {
        Market market = new Market();
        market.setCode(request.code());
        market.setName(request.name());
        market.setCity(request.city());
        market.setDistrict(request.district());
        market.setAddress(request.address());
        market.setLatitude(request.latitude());
        market.setLongitude(request.longitude());
        market.setMarketType(request.marketType());
        market.setActive(request.active());
        return toResponse(marketRepository.save(market));
    }

    @Transactional
    public MarketResponse update(UUID marketId, MarketUpdateRequest request) {
        Market market = findById(marketId);
        if (request.name() != null) {
            market.setName(request.name());
        }
        if (request.city() != null) {
            market.setCity(request.city());
        }
        if (request.district() != null) {
            market.setDistrict(request.district());
        }
        if (request.address() != null) {
            market.setAddress(request.address());
        }
        if (request.latitude() != null) {
            market.setLatitude(request.latitude());
        }
        if (request.longitude() != null) {
            market.setLongitude(request.longitude());
        }
        if (request.marketType() != null) {
            market.setMarketType(request.marketType());
        }
        if (request.active() != null) {
            market.setActive(request.active());
        }
        return toResponse(market);
    }

    public Market findByCode(String code) {
        return marketRepository.findByCode(code)
            .orElseThrow(() -> new ApiException(ErrorCode.MARKET_NOT_FOUND));
    }

    private Market findById(UUID marketId) {
        return marketRepository.findById(marketId)
            .orElseThrow(() -> new ApiException(ErrorCode.MARKET_NOT_FOUND));
    }

    private MarketResponse toResponse(Market market) {
        return new MarketResponse(
            market.getId(),
            market.getCode(),
            market.getName(),
            market.getCity(),
            market.getDistrict(),
            market.getAddress(),
            market.getLatitude(),
            market.getLongitude(),
            market.getMarketType(),
            market.isActive()
        );
    }
}
