<?php
/**
 * Plugin Name: Emart Review Request
 * Description: Sends a post-purchase review request email 3 days after order completion. No MailPoet Premium required.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ── Schedule email 3 days after order completes ──────────────────────────────

add_action( 'woocommerce_order_status_completed', 'emart_schedule_review_request' );

function emart_schedule_review_request( $order_id ) {
    if ( wp_next_scheduled( 'emart_send_review_email', [ $order_id ] ) ) return;
    wp_schedule_single_event( time() + ( 3 * DAY_IN_SECONDS ), 'emart_send_review_email', [ $order_id ] );
}

// ── Send the email ────────────────────────────────────────────────────────────

add_action( 'emart_send_review_email', 'emart_send_review_request_email' );

function emart_send_review_request_email( $order_id ) {
    $order = wc_get_order( $order_id );
    if ( ! $order ) return;

    $email   = $order->get_billing_email();
    $name    = $order->get_billing_first_name() ?: 'there';

    if ( ! $email || ! is_email( $email ) ) return;

    // Build product list with review links
    $items        = $order->get_items();
    $product_links = [];
    foreach ( $items as $item ) {
        $product = $item->get_product();
        if ( ! $product ) continue;
        $url   = get_permalink( $product->get_id() );
        $title = $product->get_name();
        // Convert WP /product/ URL to Next.js /shop/ URL
        $url = preg_replace( '#/product/#', '/shop/', $url );
        $url = preg_replace( '#e-mart\.com\.bd/shop/#', 'e-mart.com.bd/shop/', $url );
        $product_links[] = '<li><a href="' . esc_url( $url ) . '">' . esc_html( $title ) . '</a></li>';
    }

    if ( empty( $product_links ) ) return;

    $products_html = '<ul>' . implode( '', $product_links ) . '</ul>';

    // Plain text — avoids Gmail Promotions tab
    $subject = 'How was your order?';

    // Use the first product's review link only (single link = Primary tab)
    $first_product_url = '';
    foreach ( $order->get_items() as $item ) {
        $product = $item->get_product();
        if ( $product ) {
            $url = get_permalink( $product->get_id() );
            $first_product_url = preg_replace( '#/product/#', '/shop/', $url );
            break;
        }
    }

    $product_list = '';
    foreach ( $order->get_items() as $item ) {
        $product = $item->get_product();
        if ( $product ) $product_list .= '- ' . $product->get_name() . "\n";
    }

    $message = "Hi {$name},\n\n"
        . "Thank you for your recent order from Emart Skincare Bangladesh.\n\n"
        . "Your order included:\n{$product_list}\n"
        . "Would you take 2 minutes to leave a review? Your feedback helps other customers in Bangladesh choose the right products.\n\n"
        . ( $first_product_url ? "Leave a review here: {$first_product_url}\n\n" : '' )
        . "Thank you,\n"
        . "Emart Skincare Bangladesh\n"
        . "e-mart.com.bd | +8801717082135";

    $headers = [
        'Content-Type: text/plain; charset=UTF-8',
        'From: Emart Skincare Bangladesh <order@e-mart.com.bd>',
        'Reply-To: support@e-mart.com.bd',
    ];

    wp_mail( $email, $subject, $message, $headers );
}

// ── Admin: manually trigger for testing ──────────────────────────────────────

add_action( 'wp_ajax_emart_test_review_email', 'emart_test_review_email' );

function emart_test_review_email() {
    if ( ! current_user_can( 'manage_options' ) ) wp_die( 'Unauthorized' );
    $order_id = intval( $_GET['order_id'] ?? 0 );
    if ( ! $order_id ) wp_die( 'Missing order_id' );
    emart_send_review_request_email( $order_id );
    wp_die( 'Review email sent for order ' . $order_id );
}
