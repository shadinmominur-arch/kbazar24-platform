<?php

$feedFile = $argv[1] ?? '/var/www/wordpress/wp-content/uploads/facebook_for_woocommerce/product_catalog_4f8c616366e9374fbc294d175f454c19.csv';
$outDir = '/root/emart-platform/workspace/audit/active';
$timestamp = date('Ymd-His');
$summaryPath = "$outDir/facebook-catalog-image-fetch-verify-$timestamp.txt";
$issuesPath = "$outDir/facebook-catalog-image-fetch-issues-$timestamp.csv";

if (!is_readable($feedFile)) {
    fwrite(STDERR, "Feed not readable: $feedFile\n");
    exit(1);
}
if (!is_dir($outDir)) {
    mkdir($outDir, 0755, true);
}

$handle = fopen($feedFile, 'rb');
$header = fgetcsv($handle);
$index = array_flip($header ?: []);
$urls = [];
$rowsByUrl = [];

while (($row = fgetcsv($handle)) !== false) {
    $id = trim((string) ($row[$index['id']] ?? ''));
    $title = trim((string) ($row[$index['title']] ?? ''));
    $url = trim((string) ($row[$index['image_link']] ?? ''));
    if ($url === '') {
        continue;
    }
    $urls[$url] = true;
    $rowsByUrl[$url][] = [$id, $title];
}
fclose($handle);

$urls = array_keys($urls);
$queue = $urls;
$active = [];
$results = [];
$multi = curl_multi_init();
$concurrency = 40;

$startHandle = static function (string $url) use ($multi, &$active): void {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_NOBODY => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERAGENT => 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    curl_multi_add_handle($multi, $ch);
    $active[(int) $ch] = [$ch, $url];
};

while ($queue || $active) {
    while ($queue && count($active) < $concurrency) {
        $startHandle(array_shift($queue));
    }

    do {
        $status = curl_multi_exec($multi, $running);
    } while ($status === CURLM_CALL_MULTI_PERFORM);

    while ($info = curl_multi_info_read($multi)) {
        $ch = $info['handle'];
        [$handleRef, $url] = $active[(int) $ch];
        $results[] = [
            'url' => $url,
            'http_code' => curl_getinfo($ch, CURLINFO_RESPONSE_CODE),
            'content_type' => (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE),
            'effective_url' => (string) curl_getinfo($ch, CURLINFO_EFFECTIVE_URL),
            'error' => curl_error($ch),
        ];
        curl_multi_remove_handle($multi, $ch);
        curl_close($ch);
        unset($active[(int) $ch]);
    }

    if ($running) {
        curl_multi_select($multi, 1.0);
    }
}
curl_multi_close($multi);

$ok = 0;
$bad = [];
foreach ($results as $result) {
    $isImage = stripos($result['content_type'], 'image/') === 0;
    if ((int) $result['http_code'] === 200 && $isImage && $result['error'] === '') {
        $ok++;
    } else {
        $bad[] = $result;
    }
}

$issueHandle = fopen($issuesPath, 'wb');
fputcsv($issueHandle, ['id', 'title', 'http_code', 'content_type', 'error', 'image_url', 'effective_url']);
foreach ($bad as $result) {
    foreach ($rowsByUrl[$result['url']] ?? [['', '']] as [$id, $title]) {
        fputcsv($issueHandle, [
            $id,
            $title,
            $result['http_code'],
            $result['content_type'],
            $result['error'],
            $result['url'],
            $result['effective_url'],
        ]);
    }
}
fclose($issueHandle);

$summary = [
    'audit_time=' . date(DATE_ATOM),
    'feed_file=' . $feedFile,
    'unique_image_urls=' . count($urls),
    'ok_200_image=' . $ok,
    'failed_or_non_image=' . count($bad),
    'issues_csv=' . $issuesPath,
];

file_put_contents($summaryPath, implode("\n", $summary) . "\n");
echo file_get_contents($summaryPath);
