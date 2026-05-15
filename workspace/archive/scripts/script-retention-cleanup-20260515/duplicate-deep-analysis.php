<?php
/**
 * Deep analysis of duplicate product pairs from brand-size audit CSV.
 *
 * Queries both products in each pair (even if trashed) and scores them
 * across content, SEO, images, sales, and URL quality.
 * Outputs a decision CSV for human review.
 *
 * Usage: wp eval-file workspace/scripts/active/duplicate-deep-analysis.php --allow-root
 */

$audit_csv = '/root/emart-platform/workspace/audit/active/duplicate-products-brand-size-audit.csv';
$out_file  = '/root/emart-platform/workspace/audit/active/duplicate-deep-analysis-' . date('Ymd') . '.csv';

if ( ! file_exists( $audit_csv ) ) {
    fwrite( STDERR, "Missing audit CSV: {$audit_csv}\n" );
    exit( 1 );
}

// ── helpers ──────────────────────────────────────────────────────────────────

function slug_quality( string $slug ): int {
    // Penalise -2, -3 etc suffixes (duplicate WordPress slugs)
    if ( preg_match( '/-\d+$/', $slug ) ) return 0;
    return 1;
}

function score_product( int $id ): array {
    $post = get_post( $id );
    if ( ! $post ) return [];

    $product   = wc_get_product( $id );
    $gallery   = $product ? $product->get_gallery_image_ids() : [];
    $seo_desc  = get_post_meta( $id, '_rank_math_description', true ) ?: '';
    $content   = wp_strip_all_tags( $post->post_content );
    $sales     = $product ? (int) $product->get_total_sales() : 0;
    $has_thumb = has_post_thumbnail( $id ) ? 1 : 0;

    $score = 0;
    $score += min( strlen( $content ), 5000 ) / 100;     // up to 50 pts: content length
    $score += min( strlen( $seo_desc ), 300 ) / 10;      // up to 30 pts: SEO description
    $score += count( $gallery ) * 5;                      // 5 pts per gallery image
    $score += $has_thumb * 10;                            // 10 pts: has thumbnail
    $score += min( $sales, 20 ) * 2;                     // up to 40 pts: sales (capped at 20)
    $score += slug_quality( $post->post_name ) * 15;     // 15 pts: clean slug (no -N suffix)

    // Older product gets a small bonus for URL age / indexing history
    $days_old = ( time() - strtotime( $post->post_date ) ) / 86400;
    $score   += min( $days_old / 30, 12 );               // up to 12 pts: up to 12 months age

    return [
        'id'           => $id,
        'status'       => $post->post_status,
        'title'        => $post->post_title,
        'slug'         => $post->post_name,
        'price'        => $product ? $product->get_price() : '',
        'sales'        => $sales,
        'has_thumb'    => $has_thumb,
        'gallery'      => count( $gallery ),
        'content_len'  => strlen( $content ),
        'seo_desc_len' => strlen( $seo_desc ),
        'created'      => $post->post_date,
        'slug_clean'   => slug_quality( $post->post_name ),
        'score'        => round( $score, 1 ),
    ];
}

// ── main ─────────────────────────────────────────────────────────────────────

$fh     = fopen( $audit_csv, 'r' );
$header = fgetcsv( $fh );
$idx    = array_flip( $header );

$pairs = [];
while ( ( $row = fgetcsv( $fh ) ) !== false ) {
    $group = $row[ $idx['group_key'] ];
    $pairs[ $group ][] = [
        'id'     => (int) $row[ $idx['product_id'] ],
        'role'   => $row[ $idx['recommended_action'] ], // KEEP_CANDIDATE or DUPLICATE_CANDIDATE
        'slug'   => $row[ $idx['slug'] ],
        'price'  => $row[ $idx['price'] ],
    ];
}
fclose( $fh );

$out = fopen( $out_file, 'w' );
fputcsv( $out, [
    'group_key',
    // A = brand-size-audit KEEP candidate
    'a_id', 'a_status', 'a_title', 'a_slug', 'a_slug_clean', 'a_price',
    'a_sales', 'a_thumb', 'a_gallery', 'a_content', 'a_seo', 'a_created', 'a_score',
    // B = brand-size-audit DUPLICATE candidate
    'b_id', 'b_status', 'b_title', 'b_slug', 'b_slug_clean', 'b_price',
    'b_sales', 'b_thumb', 'b_gallery', 'b_content', 'b_seo', 'b_created', 'b_score',
    // decision
    'audit_csv_keep', 'deep_score_keep', 'previous_action_keep',
    'recommendation', 'flag',
] );

$counts = [ 'agree' => 0, 'conflict' => 0, 'already_trashed_correct' => 0, 'trashed_wrong' => 0 ];

foreach ( $pairs as $group => $members ) {
    // Find A (KEEP_CANDIDATE) and B (DUPLICATE_CANDIDATE)
    $a_meta = null; $b_meta = null;
    foreach ( $members as $m ) {
        if ( strpos( $m['role'], 'KEEP' ) !== false )      $a_meta = $m;
        if ( strpos( $m['role'], 'DUPLICATE' ) !== false ) $b_meta = $m;
    }
    if ( ! $a_meta || ! $b_meta ) continue;

    // Query both (including trash)
    $a = score_product( $a_meta['id'] );
    $b = score_product( $b_meta['id'] );
    if ( empty( $a ) || empty( $b ) ) continue;

    // Deep score winner
    $deep_keep = ( $a['score'] >= $b['score'] ) ? $a_meta['id'] : $b_meta['id'];
    // Audit CSV said to keep A
    $audit_keep = $a_meta['id'];

    // Determine if the right product ended up in trash
    // (one of them is now trashed because we ran the apply script)
    $a_trashed = ( $a['status'] === 'trash' );
    $b_trashed = ( $b['status'] === 'trash' );

    // Build recommendation
    $flag = '';
    $recommendation = '';

    if ( $a_trashed && $b_trashed ) {
        $flag = 'BOTH_TRASHED — investigate';
        $recommendation = 'MANUAL_REVIEW';
    } elseif ( ! $a_trashed && ! $b_trashed ) {
        // Neither trashed yet (shouldn't happen if apply ran, but handle it)
        $flag = 'NEITHER_TRASHED';
        $recommendation = ( $a['score'] >= $b['score'] ) ? "KEEP_A_{$a_meta['id']}_TRASH_B_{$b_meta['id']}" : "KEEP_B_{$b_meta['id']}_TRASH_A_{$a_meta['id']}";
    } elseif ( $b_trashed ) {
        // B is in trash → we kept A. Check if that was right.
        if ( $a['score'] >= $b['score'] ) {
            $recommendation = "CORRECT_A_{$a_meta['id']}_KEPT";
            $counts['already_trashed_correct']++;
        } else {
            // Deep score prefers B — we trashed the wrong one
            $flag = 'TRASHED_WRONG_PRODUCT';
            $recommendation = "RESTORE_B_{$b_meta['id']}_THEN_TRASH_A_{$a_meta['id']}";
            $counts['trashed_wrong']++;
        }
    } elseif ( $a_trashed ) {
        // A is in trash → we kept B. Check if that was right.
        if ( $b['score'] >= $a['score'] ) {
            $recommendation = "CORRECT_B_{$b_meta['id']}_KEPT";
            $counts['already_trashed_correct']++;
        } else {
            // Deep score prefers A — we trashed the wrong one
            $flag = 'TRASHED_WRONG_PRODUCT';
            $recommendation = "RESTORE_A_{$a_meta['id']}_THEN_TRASH_B_{$b_meta['id']}";
            $counts['trashed_wrong']++;
        }
    }

    if ( $deep_keep === $audit_keep ) {
        $counts['agree']++;
    } else {
        $counts['conflict']++;
    }

    fputcsv( $out, [
        $group,
        $a['id'], $a['status'], $a['title'], $a['slug'], $a['slug_clean'], $a['price'],
        $a['sales'], $a['has_thumb'], $a['gallery'], $a['content_len'], $a['seo_desc_len'],
        $a['created'], $a['score'],
        $b['id'], $b['status'], $b['title'], $b['slug'], $b['slug_clean'], $b['price'],
        $b['sales'], $b['has_thumb'], $b['gallery'], $b['content_len'], $b['seo_desc_len'],
        $b['created'], $b['score'],
        $audit_keep, $deep_keep,
        // Which one was kept by the previous apply run
        $a_trashed ? "B_{$b_meta['id']}" : ( $b_trashed ? "A_{$a_meta['id']}" : 'NEITHER' ),
        $recommendation,
        $flag,
    ] );
}

fclose( $out );

echo "Analysis CSV: {$out_file}\n\n";
echo "=== SUMMARY ===\n";
foreach ( $counts as $k => $v ) echo "{$k}: {$v}\n";
