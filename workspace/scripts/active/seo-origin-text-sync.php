<?php
/**
 * Dry-run/apply SEO text origin cleanup for products touched by origin sync.
 *
 * Default: dry-run only.
 * Apply:   APPLY=1 wp --path=/var/www/wordpress --allow-root eval-file workspace/scripts/active/seo-origin-text-sync.php
 */

$apply = getenv('APPLY') === '1';
$today = date('Ymd');
$scopeCsv = "/root/emart-platform/workspace/audit/active/pa-origin-custom-origin-sync-brand-wise-{$today}.csv";
$out = "/root/emart-platform/workspace/audit/active/seo-origin-text-sync-dry-run-{$today}.csv";

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

function emart_seo_origin_slugs(int $postId): array {
    $terms = wp_get_object_terms($postId, 'pa_origin', ['fields' => 'slugs']);
    if (is_wp_error($terms)) return [];
    return array_values(array_filter(array_map('strval', $terms)));
}

function emart_seo_clean_excerpt(string $value): string {
    $value = wp_strip_all_tags($value);
    $value = preg_replace('/\s+/', ' ', $value) ?? $value;
    return mb_substr(trim($value), 0, 180);
}

function emart_seo_replace_origin_context(string $text, string $originSlug, string $originLabel): string {
    if ($text === '') return $text;

    $out = $text;
    $countryLabels = [
        'Korea', 'South Korea', 'USA', 'United States', 'America', 'UK', 'United Kingdom',
        'China', 'Japan', 'India', 'France', 'Germany', 'Canada', 'Poland', 'Spain',
        'Thailand', 'Bangladesh', 'Malaysia', 'Philippines', 'Sri Lanka', 'Pakistan',
        'UAE', 'South Africa', 'Turkey', 'Singapore',
    ];

    foreach ($countryLabels as $label) {
        if (strcasecmp($label, $originLabel) === 0) continue;
        if ($originSlug === 'south-korea' && strcasecmp($label, 'Korea') === 0) continue;
        if ($originSlug === 'usa' && in_array(strtolower($label), ['united states', 'america'], true)) continue;
        if ($originSlug === 'uk' && strcasecmp($label, 'United Kingdom') === 0) continue;

        $quoted = preg_quote($label, '/');
        $out = preg_replace('/Origin:\s*' . $quoted . '\b/i', 'Origin:' . $originLabel, $out) ?? $out;
        $out = preg_replace('/authentic\s+' . $quoted . '\s+/i', 'authentic ' . $originLabel . ' ', $out) ?? $out;
        $out = preg_replace('/as an authentic\s+' . $quoted . '\s+/i', 'as an authentic ' . $originLabel . ' ', $out) ?? $out;
    }

    if ($originSlug !== 'south-korea') {
        $out = str_replace(
            'Korean skincare-এর অনেক পণ্য test করার পর এটা আমাদের catalog-এ এসেছে।',
            'Emart team এই product carefully review করে Bangladesh shoppers-এর জন্য catalog-এ এনেছে।',
            $out
        );
        $out = str_replace(
            'K-Beauty-এর trending shades',
            'beauty-trend shades',
            $out
        );
        $out = preg_replace(
            '/\bKorean skincare has always been a favorite(?:[^.?!]*)([.?!])/i',
            'Quality beauty products are always valued by Emart shoppers$1',
            $out
        ) ?? $out;
        $out = preg_replace(
            '/\bKorean skincare excellence\b/i',
            'trusted beauty quality',
            $out
        ) ?? $out;
        $out = preg_replace(
            '/\bKorean skincare is a favorite(?:[^.?!]*)([.?!])/i',
            'Quality beauty products are popular with Emart shoppers$1',
            $out
        ) ?? $out;
        $out = preg_replace(
            '/\bKorean skincare has always been a for me(?:[^.?!]*)([.?!])/i',
            'Quality skincare has always been important to our customers$1',
            $out
        ) ?? $out;
        $out = preg_replace('/\bKorean skincare\s*এর অনেক পণ্য test করার পর এটা আমাদের catalog-এ এসেছে।/u', 'Emart team এই product carefully review করে Bangladesh shoppers-এর জন্য catalog-এ এনেছে।', $out) ?? $out;
        $out = preg_replace('/\bKorean skincare অনেক পণ্য test করার পর এটা আমাদের catalog-এ এসেছে।/u', 'Emart team এই product carefully review করে Bangladesh shoppers-এর জন্য catalog-এ এনেছে।', $out) ?? $out;
        $out = preg_replace('/গত Winter-এ Korea ভ্রমণের সময়/u', 'গত Winter collection review করার সময়', $out) ?? $out;
        $out = preg_replace('/কোরিয়ান\s+বন্ধুটি/u', 'একজন friend', $out) ?? $out;
        $out = preg_replace('/কোরিয়ান\s+টাচ/u', 'modern beauty টাচ', $out) ?? $out;
        $out = preg_replace('/কোরিয়ান\s+প্রোডাক্ট/u', 'authentic beauty প্রোডাক্ট', $out) ?? $out;
        $out = preg_replace('/কোরিয়ান\s+বিউটি\s+প্রোডাক্টের/u', 'quality beauty product-এর', $out) ?? $out;
        $out = preg_replace('/কোরিয়ান\s+স্কিনকেয়ারের/u', 'quality skincare-এর', $out) ?? $out;
        $out = preg_replace('/\bDeveloped in Korea\b/i', 'Developed for reliable daily use', $out) ?? $out;
        $out = preg_replace('/\s*\(Korea\)/i', '', $out) ?? $out;
        $out = preg_replace('/\bfrom\s+RYO\s+Korea\b/i', 'from a verified ' . $originLabel . ' source', $out) ?? $out;
        $out = preg_replace('/\bKorea\s+trip-এ/u', 'product review-এর সময়', $out) ?? $out;
        $out = preg_replace('/\bKorea-র/u', 'verified source-এর', $out) ?? $out;
        $out = preg_replace('/\bKorea\s+থেকে\s+([^।.?!]{0,260}?)\s+directly import করে আনা হয়েছে/u', $originLabel . ' origin হিসেবে $1 verify করা হয়েছে', $out) ?? $out;
        $out = preg_replace('/\bKorea\s+থেকে\s+directly import করা/u', $originLabel . ' origin verified', $out) ?? $out;
        $out = preg_replace('/\bKorea\s+থেকে\s+directly import/u', 'verified source থেকে', $out) ?? $out;
        $out = preg_replace('/\bKorea\s+থেকে/u', 'verified source থেকে', $out) ?? $out;
        $out = preg_replace('/\bfrom Korea\b/i', 'from a verified ' . $originLabel . ' source', $out) ?? $out;
        $out = preg_replace('/\bKorea থেকে directly import করে আনা হয়েছে\b/u', $originLabel . ' origin হিসেবে verify করা হয়েছে', $out) ?? $out;
        $out = preg_replace('/কোরিয়ান\s+K-Beauty\s+ট্রেন্ড/u', 'global beauty trend', $out) ?? $out;
        $out = preg_replace('/কোরিয়ান\s+বিউটি\s+মার্কেটের/u', 'global beauty market-এর', $out) ?? $out;
        $out = preg_replace('/\bK-Beauty\s+প্রোডাক্ট/u', 'beauty প্রোডাক্ট', $out) ?? $out;
        $out = preg_replace('/\bK-Beauty\s+পণ্য/u', 'beauty পণ্য', $out) ?? $out;
        $out = preg_replace('/\bK-Beauty\s+জেল/u', 'beauty জেল', $out) ?? $out;
        $out = preg_replace('/\bK-Beauty\s+solution/u', 'beauty solution', $out) ?? $out;
        $out = preg_replace('/\bK-Beauty\s+excellence\b/i', 'trusted beauty quality', $out) ?? $out;
        $out = preg_replace('/\bK-Beauty\s+experience\b/i', 'beauty experience', $out) ?? $out;
        $out = preg_replace('/কোরিয়ান\s+বিউটি/u', $originLabel . ' beauty', $out) ?? $out;
        $out = preg_replace('/কোরিয়ান/u', $originLabel, $out) ?? $out;
        $out = preg_replace('/\bK-Beauty\b/i', 'beauty', $out) ?? $out;
        $out = preg_replace('/\bKorean skincare\b/i', $originLabel . ' beauty', $out) ?? $out;
        $out = preg_replace('/\bKorean makeup\b/i', $originLabel . ' makeup', $out) ?? $out;
        $out = preg_replace('/\bKorean beauty\b/i', $originLabel . ' beauty', $out) ?? $out;
        $out = preg_replace('/\bKorean product\b/i', $originLabel . ' product', $out) ?? $out;
        $out = preg_replace('/\bKorean\b/i', $originLabel, $out) ?? $out;
    }

    return $out;
}

if (!file_exists($scopeCsv)) {
    fwrite(STDERR, "Missing scope CSV: {$scopeCsv}\n");
    exit(1);
}

$ids = [];
$fh = fopen($scopeCsv, 'r');
fgetcsv($fh);
while (($row = fgetcsv($fh)) !== false) {
    $ids[(int)$row[1]] = true;
}
fclose($fh);

$fields = [
    'post_content' => 'post_content',
    'post_excerpt' => 'post_excerpt',
    '_rank_math_description' => 'meta',
    '_yoast_wpseo_metadesc' => 'meta',
    '_structured_description' => 'meta',
    '_emart_product_faq' => 'meta',
];

$rows = [];
$counts = [
    'post_content' => 0,
    'post_excerpt' => 0,
    '_rank_math_description' => 0,
    '_yoast_wpseo_metadesc' => 0,
    '_structured_description' => 0,
    '_emart_product_faq' => 0,
    'errors' => 0,
];

foreach (array_keys($ids) as $postId) {
    $originSlugs = emart_seo_origin_slugs($postId);
    if (count($originSlugs) !== 1 || !isset($labelBySlug[$originSlugs[0]])) {
        $counts['errors']++;
        continue;
    }

    $originSlug = $originSlugs[0];
    $originLabel = $labelBySlug[$originSlug];
    $post = get_post($postId);
    if (!$post) {
        $counts['errors']++;
        continue;
    }

    foreach ($fields as $field => $type) {
        $old = $type === 'meta'
            ? (string)get_post_meta($postId, $field, true)
            : (string)$post->{$field};
        $new = emart_seo_replace_origin_context($old, $originSlug, $originLabel);

        if ($new === $old) continue;

        $rows[] = [
            $postId,
            get_the_title($postId),
            implode('|', $originSlugs),
            $originLabel,
            $field,
            emart_seo_clean_excerpt($old),
            emart_seo_clean_excerpt($new),
        ];
        $counts[$field]++;

        if ($apply) {
            if ($type === 'meta') {
                update_post_meta($postId, $field, $new);
            } else {
                wp_update_post([
                    'ID' => $postId,
                    $field => $new,
                ]);
                $post->{$field} = $new;
            }
        }
    }

    if ($apply) {
        clean_post_cache($postId);
    }
}

$outHandle = fopen($out, 'w');
fputcsv($outHandle, [
    'product_id',
    'product_title',
    'pa_origin',
    'origin_label',
    'field',
    'old_excerpt',
    'new_excerpt',
]);
foreach ($rows as $row) {
    fputcsv($outHandle, $row);
}
fclose($outHandle);

if ($apply) {
    wc_delete_product_transients();
}

echo ($apply ? "APPLY complete\n" : "DRY RUN complete\n");
echo "CSV: {$out}\n";
echo "Rows: " . count($rows) . "\n";
foreach ($counts as $field => $count) {
    echo "{$field}: {$count}\n";
}
