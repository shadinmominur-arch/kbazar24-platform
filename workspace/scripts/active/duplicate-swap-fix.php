<?php
/**
 * Fix 8 incorrectly-trashed duplicate products.
 *
 * For each pair: restore the wrongly-trashed product, then trash the one
 * that was incorrectly kept. Logs every action.
 *
 * Usage: wp eval-file workspace/scripts/active/duplicate-swap-fix.php --allow-root
 */

$result_file = '/root/emart-platform/workspace/audit/active/duplicate-swap-fix-' . date('Ymd-His') . '.csv';

// [ restore_id, trash_id, label ]
$swaps = [
    [ 40362, 26495,  'Simple Daily Skin Detox SOS Clearing Booster 25ml' ],
    [ 42234, 36770,  'Neutrogena Ultra Sheer Dry Touch Sunscreen SPF 55 88ml' ],
    [ 50891, 61125,  'Raip R3 Argan Hair Oil 100ml' ],
    [ 59530, 62304,  'I\'M FROM Black Rice Toner 150ml' ],
    [ 61617, 60864,  'Raip Moisture Repair Body Lotion 500ml' ],
    [ 74630, 74643,  'Kiss Beauty Bling Bling Liquid Highlighter #01 40ml' ],
    [ 74681, 74688,  'L.A. Girl Pro Matte Liquid Foundation GLM715(Porcelain) 30ml' ],
    [ 74685, 74689,  'LMLTOP Beauty Makeup Tools 2pcs Puff' ],
];

$out = fopen( $result_file, 'w' );
fputcsv( $out, [ 'label', 'restore_id', 'restore_result', 'trash_id', 'trash_result', 'note' ] );

$ok = 0; $err = 0;

foreach ( $swaps as [ $restore_id, $trash_id, $label ] ) {
    $restore_note = '';
    $trash_note   = '';

    // ── Restore ──────────────────────────────────────────────────────────────
    $restore_post = get_post( $restore_id );
    if ( ! $restore_post ) {
        $restore_result = 'ERROR_NOT_FOUND';
        $err++;
    } elseif ( $restore_post->post_status !== 'trash' ) {
        $restore_result = "SKIP_STATUS:{$restore_post->post_status}";
    } else {
        $restored = wp_untrash_post( $restore_id );
        if ( $restored ) {
            // wp_untrash_post sets status to 'draft'; re-publish it
            $updated = wp_update_post([
                'ID'          => $restore_id,
                'post_status' => 'publish',
            ]);
            $restore_result = $updated ? 'RESTORED_AND_PUBLISHED' : 'RESTORED_BUT_PUBLISH_FAILED';
            $restore_note   = 'slug: ' . get_post( $restore_id )->post_name;
        } else {
            $restore_result = 'ERROR_UNTRASH_FAILED';
            $err++;
        }
    }

    // ── Trash ────────────────────────────────────────────────────────────────
    $trash_post = get_post( $trash_id );
    if ( ! $trash_post ) {
        $trash_result = 'ERROR_NOT_FOUND';
        $err++;
    } elseif ( $trash_post->post_status === 'trash' ) {
        $trash_result = 'ALREADY_TRASHED';
    } else {
        $trashed = wp_trash_post( $trash_id );
        if ( $trashed ) {
            $trash_result = 'TRASHED';
            $trash_note   = 'slug: ' . $trash_post->post_name;
        } else {
            $trash_result = 'ERROR_TRASH_FAILED';
            $err++;
        }
    }

    if ( strpos( $restore_result, 'ERROR' ) === false && strpos( $trash_result, 'ERROR' ) === false ) {
        $ok++;
        echo "OK  restore={$restore_id}({$restore_result}) trash={$trash_id}({$trash_result}) — {$label}\n";
    } else {
        echo "ERR restore={$restore_id}({$restore_result}) trash={$trash_id}({$trash_result}) — {$label}\n";
    }

    fputcsv( $out, [
        $label, $restore_id, $restore_result, $trash_id, $trash_result,
        "{$restore_note} | {$trash_note}",
    ] );
}

fclose( $out );

echo "\nResult CSV: {$result_file}\n";
echo "ok={$ok}  errors={$err}\n";
