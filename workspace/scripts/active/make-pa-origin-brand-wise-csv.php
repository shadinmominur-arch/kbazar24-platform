<?php
/**
 * Build brand-wise review CSV from pa-origin custom-origin dry-run CSV.
 */

$date = date('Ymd');
$input = "/root/emart-platform/workspace/audit/active/pa-origin-custom-origin-sync-dry-run-{$date}.csv";
$output = "/root/emart-platform/workspace/audit/active/pa-origin-custom-origin-sync-brand-wise-{$date}.csv";

if (!file_exists($input)) {
    fwrite(STDERR, "Missing input CSV: {$input}\n");
    exit(1);
}

$in = fopen($input, 'r');
$header = fgetcsv($in);
$rows = [];
$ids = [];
while (($row = fgetcsv($in)) !== false) {
    $id = (int)$row[0];
    $ids[] = $id;
    $rows[$id] = $row;
}
fclose($in);

$brandById = array_fill_keys($ids, '(no brand)');
$idList = implode(',', array_map('intval', $ids));

global $wpdb;
$brandRows = $wpdb->get_results("
    SELECT tr.object_id AS product_id,
           GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR '|') AS brand_names
    FROM {$wpdb->term_relationships} tr
    JOIN {$wpdb->term_taxonomy} tt
      ON tt.term_taxonomy_id = tr.term_taxonomy_id
     AND tt.taxonomy = 'product_brand'
    JOIN {$wpdb->terms} t
      ON t.term_id = tt.term_id
    WHERE tr.object_id IN ({$idList})
    GROUP BY tr.object_id
");

foreach ($brandRows as $brandRow) {
    if (!empty($brandRow->brand_names)) {
        $brandById[(int)$brandRow->product_id] = (string)$brandRow->brand_names;
    }
}

$missingIds = array_keys(array_filter($brandById, fn($brand) => $brand === '(no brand)'));
if ($missingIds) {
    $missingList = implode(',', array_map('intval', $missingIds));
    $paBrandRows = $wpdb->get_results("
        SELECT tr.object_id AS product_id,
               GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR '|') AS brand_names
        FROM {$wpdb->term_relationships} tr
        JOIN {$wpdb->term_taxonomy} tt
          ON tt.term_taxonomy_id = tr.term_taxonomy_id
         AND tt.taxonomy = 'pa_brand'
        JOIN {$wpdb->terms} t
          ON t.term_id = tt.term_id
        WHERE tr.object_id IN ({$missingList})
        GROUP BY tr.object_id
    ");

    foreach ($paBrandRows as $brandRow) {
        if (!empty($brandRow->brand_names)) {
            $brandById[(int)$brandRow->product_id] = (string)$brandRow->brand_names;
        }
    }
}

usort($rows, function ($a, $b) use ($brandById) {
    $brandA = $brandById[(int)$a[0]] ?? '';
    $brandB = $brandById[(int)$b[0]] ?? '';
    return [$brandA, $a[3], (int)$a[0]] <=> [$brandB, $b[3], (int)$b[0]];
});

$out = fopen($output, 'w');
fputcsv($out, [
    'brand',
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
    $id = (int)$row[0];
    fputcsv($out, [
        $brandById[$id] ?? '(no brand)',
        $row[0],
        $row[1],
        $row[2],
        $row[3],
        $row[4],
        $row[5],
        $row[6],
        $row[7],
        $row[8],
        $row[9],
        $row[10],
    ]);
}
fclose($out);

echo "Wrote {$output}\n";
echo "Rows: " . count($rows) . "\n";
