<?php
/**
 * Fix stale Korea/Korean/K-beauty wording on published The Derma Co products.
 *
 * Dry-run:
 *   wp --path=/var/www/wordpress --allow-root eval-file workspace/scripts/active/fix-the-derma-co-meta-copy.php
 *
 * Apply:
 *   APPLY=1 wp --path=/var/www/wordpress --allow-root eval-file workspace/scripts/active/fix-the-derma-co-meta-copy.php
 */

if (!defined('ABSPATH')) {
    fwrite(STDERR, "Run with wp eval-file.\n");
    exit(1);
}

$apply = getenv('APPLY') === '1';
$timestamp = date('Ymd-His');
$out_dir = '/root/emart-platform/workspace/audit/active';
$csv_path = sprintf(
    '%s/the-derma-co-meta-copy-%s-%s.csv',
    $out_dir,
    $apply ? 'apply' : 'dry-run',
    $timestamp
);

$bad_pattern = '/(Korea import|South Korea|K-beauty|K beauty|Korean|Korea|কোরিয়ান|কোরিয়ান|কোরিয়া|কোরিয়া)/iu';
$meta_keys = [
    '_rank_math_title',
    '_rank_math_description',
    '_rank_math_focus_keyword',
    '_emart_meta_description',
    '_structured_description',
];

function emart_derma_rewrite_text(string $text, string $title, string $field): string {
    if ($field === 'post_excerpt') {
        return sprintf(
            '<p>Buy %s in Bangladesh from Emart. Authentic The Derma Co skincare from India with COD and fast nationwide delivery.</p>',
            esc_html($title)
        );
    }

    $replacements = [
        '/100%\s+authentic\s+Korea\s+import/i' => 'authentic The Derma Co skincare from India',
        '/Korea\s+import/i' => 'The Derma Co skincare from India',
        '/South\s+Korea/i' => 'India',
        '/Korean\s+skincare/i' => 'Indian-origin skincare',
        '/Korean/i' => 'Indian-origin',
        '/K-beauty/i' => 'skincare',
        '/K\s+beauty/i' => 'skincare',
        '/Origin:\s*Korea/i' => 'Origin:India',
        '/Korea\s+origin/i' => 'India origin',
        '/\bKorea\b/i' => 'India',
        '/কোরিয়ান/u' => 'ভারতীয়',
        '/কোরিয়ান/u' => 'ভারতীয়',
        '/কোরিয়া/u' => 'ভারত',
        '/কোরিয়া/u' => 'ভারত',
    ];

    return preg_replace(array_keys($replacements), array_values($replacements), $text);
}

$products = wc_get_products([
    'status' => 'publish',
    'limit' => -1,
    'return' => 'objects',
    'tax_query' => [
        [
            'taxonomy' => 'product_brand',
            'field' => 'slug',
            'terms' => ['the-derma-co'],
        ],
    ],
]);

$fh = fopen($csv_path, 'w');
if (!$fh) {
    fwrite(STDERR, "Could not open CSV output: $csv_path\n");
    exit(1);
}

fputcsv($fh, ['product_id', 'slug', 'title', 'field', 'old_text', 'new_text', 'action']);

$changes = 0;
$products_touched = [];

foreach ($products as $product) {
    $id = $product->get_id();
    $title = html_entity_decode(get_the_title($id), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $post = get_post($id);
    if (!$post) {
        continue;
    }

    $fields = [
        'post_excerpt' => (string) $post->post_excerpt,
        'post_content' => (string) $post->post_content,
    ];

    foreach ($fields as $field => $old) {
        if (!preg_match($bad_pattern, $old)) {
            continue;
        }

        $new = emart_derma_rewrite_text($old, $title, $field);
        if ($new === $old) {
            continue;
        }

        $changes++;
        $products_touched[$id] = true;
        fputcsv($fh, [$id, $product->get_slug(), $title, $field, $old, $new, $apply ? 'updated' : 'would_update']);

        if ($apply) {
            wp_update_post([
                'ID' => $id,
                $field => $new,
            ]);
        }
    }

    foreach ($meta_keys as $key) {
        $old = (string) get_post_meta($id, $key, true);
        if ($old === '' || !preg_match($bad_pattern, $old)) {
            continue;
        }

        $new = emart_derma_rewrite_text($old, $title, $key);
        if ($new === $old) {
            continue;
        }

        $changes++;
        $products_touched[$id] = true;
        fputcsv($fh, [$id, $product->get_slug(), $title, $key, $old, $new, $apply ? 'updated' : 'would_update']);

        if ($apply) {
            update_post_meta($id, $key, $new);
        }
    }
}

fclose($fh);

printf(
    "%s\nproducts=%d\nproducts_touched=%d\nchanges=%d\ncsv=%s\n",
    $apply ? 'APPLY complete' : 'DRY-RUN complete',
    count($products),
    count($products_touched),
    $changes,
    $csv_path
);
