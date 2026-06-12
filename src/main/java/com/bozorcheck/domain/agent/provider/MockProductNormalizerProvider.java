package com.bozorcheck.domain.agent.provider;

import com.bozorcheck.domain.agent.dto.ProductNormalizeRequest;
import com.bozorcheck.domain.agent.dto.ProductNormalizeResponse;
import com.bozorcheck.domain.catalog.Product;
import com.bozorcheck.domain.catalog.ProductAlias;
import com.bozorcheck.domain.catalog.ProductAliasRepository;
import com.bozorcheck.domain.catalog.ProductRepository;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class MockProductNormalizerProvider implements ProductNormalizerProvider {

    private static final BigDecimal EXACT_CONFIDENCE = new BigDecimal("0.95");
    private static final BigDecimal PHRASE_CONFIDENCE = new BigDecimal("0.88");
    private static final BigDecimal MEDIUM_CONFIDENCE = new BigDecimal("0.78");
    private static final BigDecimal PARTIAL_CONFIDENCE = new BigDecimal("0.55");
    private static final BigDecimal LOW_CONFIDENCE = new BigDecimal("0.20");
    private static final Set<String> GENERIC_TOKENS = Set.of(
        "unknown",
        "local",
        "vegetable",
        "product",
        "item",
        "market",
        "fresh"
    );

    private final ProductRepository productRepository;
    private final ProductAliasRepository productAliasRepository;

    public MockProductNormalizerProvider(
        ProductRepository productRepository,
        ProductAliasRepository productAliasRepository
    ) {
        this.productRepository = productRepository;
        this.productAliasRepository = productAliasRepository;
    }

    @Override
    public ProductNormalizeResponse normalize(ProductNormalizeRequest request) {
        String normalizedInput = normalizeText(request.rawProductName());
        Match bestMatch = productRepository.search(null, true).stream()
            .map(product -> scoreProduct(product, normalizedInput))
            .max(Comparator.comparingInt(Match::score).thenComparing(match -> match.product().getCode()))
            .orElse(Match.none());

        if (bestMatch.score() <= 0) {
            return noReliableMatch(request.rawProductName());
        }

        Product product = bestMatch.product();
        List<String> matchedAliases = matchedAliases(product, normalizedInput);
        BigDecimal confidence = confidence(bestMatch.score());
        boolean needsHumanReview = confidence.compareTo(new BigDecimal("0.70")) < 0;
        return new ProductNormalizeResponse(
            request.rawProductName(),
            product.getCode(),
            product.getNameEn(),
            variant(normalizedInput),
            confidence,
            needsHumanReview,
            matchedAliases,
            bestMatch.score() >= 100
                ? "Matched an exact backend product name, code, or alias."
                : needsHumanReview
                    ? "Matched only a weak backend product token; human review is required."
                    : "Matched backend product aliases or meaningful name tokens."
        );
    }

    private ProductNormalizeResponse noReliableMatch(String rawProductName) {
        return new ProductNormalizeResponse(
            rawProductName,
            null,
            null,
            "UNKNOWN",
            LOW_CONFIDENCE,
            true,
            List.of(),
            "No reliable product alias match was found in backend catalog data."
        );
    }

    private Match scoreProduct(Product product, String normalizedInput) {
        List<Term> terms = new ArrayList<>();
        addTerm(terms, product.getCode(), false);
        addTerm(terms, product.getNameEn(), false);
        addTerm(terms, product.getNameKo(), false);
        addTerm(terms, product.getNameUz(), false);
        addTerm(terms, product.getNameRu(), false);
        productAliasRepository.findByProductIdOrderByLocaleAscAliasAsc(product.getId())
            .forEach(alias -> addTerm(terms, alias.getAlias(), true));

        int bestScore = 0;
        for (Term term : terms) {
            String normalizedTerm = normalizeText(term.value());
            if (normalizedTerm.isBlank()) {
                continue;
            }
            if (normalizedInput.equals(normalizedTerm)) {
                return new Match(product, 100);
            }

            Set<String> inputTokens = meaningfulTokens(normalizedInput);
            Set<String> termTokens = meaningfulTokens(normalizedTerm);
            int overlap = tokenOverlap(inputTokens, termTokens);
            if (overlap == 0) {
                continue;
            }

            boolean inputContainsTerm = phraseContains(normalizedInput, normalizedTerm);
            boolean termContainsInput = phraseContains(normalizedTerm, normalizedInput);
            if (inputContainsTerm && termTokens.size() == 1) {
                bestScore = Math.max(bestScore, term.alias() ? 86 : 80);
            } else if (inputContainsTerm || termContainsInput) {
                int requiredOverlap = Math.min(2, Math.min(inputTokens.size(), termTokens.size()));
                if (overlap >= requiredOverlap) {
                    bestScore = Math.max(bestScore, term.alias() ? 88 : 82);
                }
            } else if (overlap >= 2) {
                bestScore = Math.max(bestScore, 76);
            } else if (overlap == 1) {
                bestScore = Math.max(bestScore, 55);
            }
        }
        return new Match(product, bestScore);
    }

    private List<String> matchedAliases(Product product, String normalizedInput) {
        return productAliasRepository.findByProductIdOrderByLocaleAscAliasAsc(product.getId()).stream()
            .map(ProductAlias::getAlias)
            .filter(alias -> {
                String normalizedAlias = normalizeText(alias);
                Set<String> inputTokens = meaningfulTokens(normalizedInput);
                Set<String> aliasTokens = meaningfulTokens(normalizedAlias);
                return normalizedInput.equals(normalizedAlias)
                    || phraseContains(normalizedInput, normalizedAlias)
                    || tokenOverlap(inputTokens, aliasTokens) > 0;
            })
            .distinct()
            .toList();
    }

    private void addTerm(List<Term> terms, String value, boolean alias) {
        if (value != null && !value.isBlank()) {
            terms.add(new Term(value, alias));
        }
    }

    private int tokenOverlap(Set<String> leftTokens, Set<String> rightTokens) {
        Set<String> rightTokensCopy = new LinkedHashSet<>(rightTokens);
        rightTokensCopy.retainAll(leftTokens);
        return rightTokensCopy.size();
    }

    private Set<String> meaningfulTokens(String value) {
        if (value == null || value.isBlank()) {
            return Set.of();
        }
        Set<String> tokens = new LinkedHashSet<>(List.of(value.split(" ")));
        tokens.removeIf(token -> token.isBlank() || GENERIC_TOKENS.contains(token));
        return tokens;
    }

    private boolean phraseContains(String text, String phrase) {
        Set<String> phraseTokens = meaningfulTokens(phrase);
        if (phraseTokens.isEmpty()) {
            return false;
        }
        if (phraseTokens.size() == 1) {
            return meaningfulTokens(text).contains(phraseTokens.iterator().next());
        }
        Set<String> leftTokens = Set.of(text.split(" "));
        Set<String> rightTokens = new LinkedHashSet<>(List.of(phrase.split(" ")));
        rightTokens.retainAll(leftTokens);
        return rightTokens.size() == phraseTokens.size();
    }

    private BigDecimal confidence(int score) {
        if (score >= 100) {
            return EXACT_CONFIDENCE;
        }
        if (score >= 85) {
            return PHRASE_CONFIDENCE;
        }
        if (score >= 70) {
            return MEDIUM_CONFIDENCE;
        }
        if (score > 0) {
            return PARTIAL_CONFIDENCE;
        }
        return LOW_CONFIDENCE;
    }

    private String variant(String normalizedInput) {
        boolean pink = normalizedInput.contains("pink");
        boolean red = normalizedInput.contains("red");
        boolean greenhouse = normalizedInput.contains("greenhouse");
        if (pink && greenhouse) {
            return "PINK_GREENHOUSE";
        }
        if (red && greenhouse) {
            return "RED_GREENHOUSE";
        }
        if (normalizedInput.contains("cherry")) {
            return "CHERRY";
        }
        if (normalizedInput.contains("local")) {
            return "LOCAL";
        }
        if (greenhouse) {
            return "GREENHOUSE";
        }
        if (pink) {
            return "PINK_GREENHOUSE";
        }
        if (red) {
            return "RED_GREENHOUSE";
        }
        return "STANDARD";
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value.toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .replace("'", "")
            .replace("`", "")
            .replaceAll("[^\\p{L}\\p{Nd}]+", " ")
            .trim()
            .replaceAll("\\s+", " ");
    }

    private record Term(String value, boolean alias) {
    }

    private record Match(Product product, int score) {

        private static Match none() {
            return new Match(null, 0);
        }
    }
}
