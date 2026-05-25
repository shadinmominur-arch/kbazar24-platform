<?php
/**
 * Dry-run/apply pa_origin + stale custom Origin sync.
 *
 * Default: dry-run only.
 * Apply:   APPLY=1 wp --path=/var/www/wordpress --allow-root eval-file workspace/scripts/active/pa-origin-custom-origin-sync.php
 */

$apply = getenv('APPLY') === '1';
$today = date('Ymd');
$out = "/root/emart-platform/workspace/audit/active/pa-origin-custom-origin-sync-dry-run-{$today}.csv";

$originMap = [
    60750 => 'south-korea',
    60756 => 'france',
    60764 => 'bangladesh',
    60789 => 'bangladesh',
    60811 => 'south-korea',
    60817 => 'south-korea',
    60827 => 'bangladesh',
    60829 => 'south-korea',
    61401 => 'bangladesh',
    63049 => 'bangladesh',
    74259 => 'south-korea',
    74295 => 'china',
    74296 => 'china',
    74306 => 'bangladesh',
    74935 => 'china',
    74937 => 'china',
    74939 => 'china',
];

$brandOriginOverrides = [
    'bath-and-body-works' => 'malaysia',
    'clean-and-clear' => 'uk',
    'durex' => 'malaysia',
    'gfors' => 'south-korea',
    'sheglam' => 'singapore',
    'st-ives' => 'uk',
    'vatika-naturals' => 'india',
    'vaseline' => 'uk',
];

$labelBySlug = [
    'south-korea' => 'South Korea',
    'japan' => 'Japan',
    'china' => 'China',
    'taiwan' => 'Taiwan',
    'usa' => 'USA',
    'uk' => 'UK',
    'france' => 'France',
    'germany' => 'Germany',
    'canada' => 'Canada',
    'poland' => 'Poland',
    'spain' => 'Spain',
    'india' => 'India',
    'singapore' => 'Singapore',
    'thailand' => 'Thailand',
    'bangladesh' => 'Bangladesh',
    'malaysia' => 'Malaysia',
    'philippines' => 'Philippines',
    'sri-lanka' => 'Sri Lanka',
    'pakistan' => 'Pakistan',
    'uae' => 'UAE',
    'south-africa' => 'South Africa',
    'turkey' => 'Turkey',
    'multinational' => 'Multinational',
];

function emart_origin_slug_from_label(string $value): string {
    $v = strtolower(trim($value));
    $v = preg_replace('/\s+/', ' ', $v);

    if ($v === '') return '';
    if (str_contains($v, 'korea')) return 'south-korea';
    if (str_contains($v, 'japan')) return 'japan';
    if (str_contains($v, 'china')) return 'china';
    if (str_contains($v, 'taiwan')) return 'taiwan';
    if ($v === 'usa' || str_contains($v, 'united states') || str_contains($v, 'america')) return 'usa';
    if ($v === 'uk' || str_contains($v, 'united kingdom') || str_contains($v, 'britain')) return 'uk';
    if (str_contains($v, 'france')) return 'france';
    if (str_contains($v, 'germany')) return 'germany';
    if (str_contains($v, 'canada')) return 'canada';
    if (str_contains($v, 'poland')) return 'poland';
    if (str_contains($v, 'spain')) return 'spain';
    if (str_contains($v, 'india')) return 'india';
    if (str_contains($v, 'singapore')) return 'singapore';
    if (str_contains($v, 'thailand')) return 'thailand';
    if (str_contains($v, 'bangladesh')) return 'bangladesh';
    if (str_contains($v, 'malaysia')) return 'malaysia';
    if (str_contains($v, 'philippines')) return 'philippines';
    if (str_contains($v, 'sri lanka') || str_contains($v, 'sri-lanka')) return 'sri-lanka';
    if (str_contains($v, 'pakistan')) return 'pakistan';
    if ($v === 'uae' || str_contains($v, 'united arab emirates')) return 'uae';
    if (str_contains($v, 'south africa')) return 'south-africa';
    if (str_contains($v, 'turkey')) return 'turkey';
    if (str_contains($v, 'multinational')) return 'multinational';

    return sanitize_title($value);
}

function emart_get_pa_origin_slugs(int $postId): array {
    $terms = wp_get_object_terms($postId, 'pa_origin', ['fields' => 'slugs']);
    if (is_wp_error($terms)) return [];
    return array_values(array_filter(array_map('strval', $terms)));
}

function emart_get_product_brand_slugs(int $postId): array {
    $terms = wp_get_object_terms($postId, 'product_brand', ['fields' => 'slugs']);
    if (is_wp_error($terms)) return [];
    return array_values(array_filter(array_map('strval', $terms)));
}

function emart_get_origin_attr(array $attrs): string {
    if (!isset($attrs['origin']) || !is_array($attrs['origin'])) return '';
    return trim((string)($attrs['origin']['value'] ?? ''));
}

function emart_set_origin_attr(array $attrs, string $label): array {
    $position = 0;
    foreach ($attrs as $attr) {
        if (is_array($attr) && isset($attr['position'])) {
            $position = max($position, (int)$attr['position'] + 1);
        }
    }

    $attrs['origin'] = [
        'name' => 'Origin',
        'value' => $label,
        'position' => isset($attrs['origin']['position']) ? (int)$attrs['origin']['position'] : $position,
        'is_visible' => 1,
        'is_variation' => 0,
        'is_taxonomy' => 0,
    ];

    return $attrs;
}

function emart_replace_origin_text(string $text, string $oldLabel, string $newLabel): string {
    if ($text === '') return $text;
    $out = $text;
    $oldQuoted = preg_quote($oldLabel, '/');

    $out = preg_replace('/Origin:\s*' . $oldQuoted . '\b/i', 'Origin:' . $newLabel, $out);
    $out = preg_replace('/authentic\s+' . $oldQuoted . '\s+/i', 'authentic ' . $newLabel . ' ', $out);

    return $out ?? $text;
}

function emart_term_id_for_slug(string $slug): int {
    global $labelBySlug;

    $term = get_term_by('slug', $slug, 'pa_origin');
    if ($term && !is_wp_error($term)) {
        return (int)$term->term_id;
    }

    if (!isset($labelBySlug[$slug])) {
        return 0;
    }

    $created = wp_insert_term($labelBySlug[$slug], 'pa_origin', ['slug' => $slug]);
    if (is_wp_error($created)) {
        return 0;
    }

    return (int)($created['term_id'] ?? 0);
}

$products = get_posts([
    'post_type' => 'product',
    'post_status' => 'publish',
    'fields' => 'ids',
    'posts_per_page' => -1,
    'orderby' => 'ID',
    'order' => 'ASC',
]);

$rows = [];
$counts = [
    'set_pa_origin' => 0,
    'sync_custom_origin' => 0,
    'sync_structured_description' => 0,
    'sync_faq' => 0,
    'errors' => 0,
];

foreach ($products as $postIdRaw) {
    $postId = (int)$postIdRaw;
    $title = get_the_title($postId);
    $paSlugs = emart_get_pa_origin_slugs($postId);
    $brandSlugs = emart_get_product_brand_slugs($postId);

    $proposedSlug = '';
    $actionParts = [];
    $reasonParts = [];

    $brandOverrideSlug = '';
    foreach ($brandSlugs as $brandSlug) {
        if (isset($brandOriginOverrides[$brandSlug])) {
            $brandOverrideSlug = $brandOriginOverrides[$brandSlug];
            break;
        }
    }

    if ($brandOverrideSlug !== '') {
        $proposedSlug = $brandOverrideSlug;
        $reasonParts[] = 'owner_brand_override';
        if (!in_array($proposedSlug, $paSlugs, true) || count($paSlugs) !== 1) {
            $actionParts[] = 'set_pa_origin';
        }
    } elseif (isset($originMap[$postId])) {
        $proposedSlug = $originMap[$postId];
        if (!in_array($proposedSlug, $paSlugs, true) || count($paSlugs) !== 1) {
            $actionParts[] = 'set_pa_origin';
            $reasonParts[] = 'approved_17_gap';
        }
    } elseif (count($paSlugs) === 1) {
        $proposedSlug = $paSlugs[0];
    } else {
        continue;
    }

    if (!isset($labelBySlug[$proposedSlug])) {
        $counts['errors']++;
        $rows[] = [$postId, $title, implode('|', $paSlugs), '', '', '', 'ERROR', 'unknown_proposed_origin_slug', '', '', ''];
        continue;
    }

    $proposedLabel = $labelBySlug[$proposedSlug];
    $attrsRaw = get_post_meta($postId, '_product_attributes', true);
    $attrs = is_array($attrsRaw) ? $attrsRaw : [];
    $customOrigin = emart_get_origin_attr($attrs);
    $customSlug = emart_origin_slug_from_label($customOrigin);

    if ($customSlug !== '' && $customSlug !== $proposedSlug) {
        $actionParts[] = 'sync_custom_origin';
        $reasonParts[] = "custom_origin_{$customSlug}_vs_{$proposedSlug}";
    } elseif ($customSlug === '' && isset($originMap[$postId])) {
        $actionParts[] = 'sync_custom_origin';
        $reasonParts[] = 'missing_custom_origin_on_17_gap';
    }

    $structured = (string)get_post_meta($postId, '_structured_description', true);
    $faq = (string)get_post_meta($postId, '_emart_product_faq', true);
    $newStructured = $customOrigin && $customSlug !== $proposedSlug
        ? emart_replace_origin_text($structured, $customOrigin, $proposedLabel)
        : $structured;
    $newFaq = $customOrigin && $customSlug !== $proposedSlug
        ? emart_replace_origin_text($faq, $customOrigin, $proposedLabel)
        : $faq;

    if ($newStructured !== $structured) {
        $actionParts[] = 'sync_structured_description';
    }
    if ($newFaq !== $faq) {
        $actionParts[] = 'sync_faq';
    }

    $actionParts = array_values(array_unique($actionParts));
    if (!$actionParts) continue;

    $rows[] = [
        $postId,
        $title,
        implode('|', $paSlugs),
        $proposedSlug,
        $customOrigin,
        $proposedLabel,
        implode('|', $actionParts),
        implode('|', array_unique($reasonParts)),
        $structured !== '' ? 'yes' : 'no',
        $newStructured !== $structured ? 'yes' : 'no',
        $newFaq !== $faq ? 'yes' : 'no',
    ];

    if ($apply) {
        if (in_array('set_pa_origin', $actionParts, true)) {
            $termId = emart_term_id_for_slug($proposedSlug);
            if ($termId <= 0) {
                $counts['errors']++;
                continue;
            }
            wp_set_object_terms($postId, [$termId], 'pa_origin', false);
            $counts['set_pa_origin']++;
        }

        if (in_array('sync_custom_origin', $actionParts, true)) {
            update_post_meta($postId, '_product_attributes', emart_set_origin_attr($attrs, $proposedLabel));
            $counts['sync_custom_origin']++;
        }
        if ($newStructured !== $structured) {
            update_post_meta($postId, '_structured_description', $newStructured);
            $counts['sync_structured_description']++;
        }
        if ($newFaq !== $faq) {
            update_post_meta($postId, '_emart_product_faq', $newFaq);
            $counts['sync_faq']++;
        }
        clean_post_cache($postId);
        clean_object_term_cache($postId, 'product');
    }
}

$fh = fopen($out, 'w');
fputcsv($fh, [
    'product_id',
    'product_title',
    'current_pa_origin',
    'proposed_pa_origin',
    'current_custom_origin',
    'proposed_custom_origin',
    'actions',
    'reasons',
    'has_structured_description',
    'structured_description_would_change',
    'faq_would_change',
]);
foreach ($rows as $row) {
    fputcsv($fh, $row);
}
fclose($fh);

if ($apply) {
    clean_taxonomy_cache('pa_origin');
    wc_delete_product_transients();
}

echo ($apply ? "APPLY complete\n" : "DRY RUN complete\n");
echo "CSV: {$out}\n";
echo "Rows: " . count($rows) . "\n";
foreach ($counts as $key => $value) {
    echo "{$key}: {$value}\n";
}
