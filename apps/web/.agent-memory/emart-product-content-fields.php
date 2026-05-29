<?php
/**
 * Emart-native product content fields for the headless storefront.
 */

if (!defined('ABSPATH')) {
	exit;
}

function emart_product_content_field_keys() {
	return array(
		'ingredients' => '_emart_ingredients',
		'how_to_use'  => '_emart_how_to_use',
		'faq'         => '_emart_product_faq',
	);
}

function emart_legacy_product_content_keys() {
	return array(
		'_woodmart_product_custom_tab_title',
		'_woodmart_product_custom_tab_content',
		'_woodmart_product_custom_tab_title_2',
		'_woodmart_product_custom_tab_content_2',
		'custom_tab_content1',
		'custom_tab_content2',
	);
}

function emart_get_legacy_tab_content(WC_Product $product, $matcher) {
	$pairs = array(
		array(
			'title'   => (string) $product->get_meta('_woodmart_product_custom_tab_title'),
			'content' => (string) ($product->get_meta('_woodmart_product_custom_tab_content') ?: $product->get_meta('custom_tab_content1')),
		),
		array(
			'title'   => (string) $product->get_meta('_woodmart_product_custom_tab_title_2'),
			'content' => (string) ($product->get_meta('_woodmart_product_custom_tab_content_2') ?: $product->get_meta('custom_tab_content2')),
		),
	);

	foreach ($pairs as $pair) {
		if ($pair['title'] !== '' && preg_match($matcher, $pair['title']) && trim($pair['content']) !== '') {
			return $pair['content'];
		}
	}

	return '';
}

function emart_get_legacy_ingredients(WC_Product $product) {
	$facebook_value = (string) $product->get_meta('_wc_facebook_enhanced_catalog_attributes_ingredients');
	if (trim($facebook_value) !== '') {
		return $facebook_value;
	}

	return emart_get_legacy_tab_content($product, '/ingredient/i');
}

function emart_get_legacy_how_to_use(WC_Product $product) {
	$instruction_value = (string) $product->get_meta('_wc_facebook_enhanced_catalog_attributes_instructions');
	if (trim($instruction_value) !== '') {
		return $instruction_value;
	}

	$care_value = (string) $product->get_meta('_wc_facebook_enhanced_catalog_attributes_care_instructions');
	if (trim($care_value) !== '') {
		return $care_value;
	}

	return emart_get_legacy_tab_content($product, '/(how\s*to\s*use|usage|direction|instruction|application|use)/i');
}

function emart_add_product_content_tab($tabs) {
	$tabs['emart_content'] = array(
		'label'    => __('Emart Content', 'emart'),
		'target'   => 'emart_product_content_panel',
		'class'    => array(),
		'priority' => 75,
	);

	return $tabs;
}
add_filter('woocommerce_product_data_tabs', 'emart_add_product_content_tab');

function emart_render_product_content_panel() {
	global $post;

	if (!$post instanceof WP_Post) {
		return;
	}

	$product = wc_get_product($post->ID);
	if (!$product) {
		return;
	}

	$keys = emart_product_content_field_keys();
	?>
	<div id="emart_product_content_panel" class="panel woocommerce_options_panel hidden">
		<div class="options_group">
			<p class="form-field">
				<label for="emart_ingredients"><?php esc_html_e('Ingredients', 'emart'); ?></label>
				<textarea id="emart_ingredients" name="emart_ingredients" rows="6" style="width:70%;"><?php echo esc_textarea((string) $product->get_meta($keys['ingredients'])); ?></textarea>
				<span class="description"><?php esc_html_e('Shown in the product Ingredients tab. Basic HTML is allowed.', 'emart'); ?></span>
			</p>
			<p class="form-field">
				<label for="emart_how_to_use"><?php esc_html_e('How to use', 'emart'); ?></label>
				<textarea id="emart_how_to_use" name="emart_how_to_use" rows="6" style="width:70%;"><?php echo esc_textarea((string) $product->get_meta($keys['how_to_use'])); ?></textarea>
				<span class="description"><?php esc_html_e('Shown in the product How to use tab. Basic HTML is allowed.', 'emart'); ?></span>
			</p>
			<p class="form-field">
				<label for="emart_product_faq"><?php esc_html_e('Product FAQ', 'emart'); ?></label>
				<textarea id="emart_product_faq" name="emart_product_faq" rows="8" style="width:70%;"><?php echo esc_textarea((string) $product->get_meta($keys['faq'])); ?></textarea>
				<span class="description"><?php esc_html_e('Use one Q:/A: pair per question. Example: Q: Is it authentic? A: Yes, Emart verifies stock before dispatch.', 'emart'); ?></span>
			</p>
		</div>
		<div class="options_group">
			<p class="form-field">
				<label><?php esc_html_e('Legacy fallback', 'emart'); ?></label>
				<span class="description" style="display:block;max-width:70%;">
					<?php esc_html_e('Old Woodmart/Facebook catalog fields are still kept as fallback. Saving this product will copy legacy Ingredients and How to use into empty Emart fields only.', 'emart'); ?>
				</span>
			</p>
		</div>
	</div>
	<?php
}
add_action('woocommerce_product_data_panels', 'emart_render_product_content_panel');

function emart_save_product_content_fields(WC_Product $product) {
	$keys = emart_product_content_field_keys();

	$ingredients = isset($_POST['emart_ingredients']) ? wp_kses_post(wp_unslash($_POST['emart_ingredients'])) : '';
	$how_to_use = isset($_POST['emart_how_to_use']) ? wp_kses_post(wp_unslash($_POST['emart_how_to_use'])) : '';
	$faq = isset($_POST['emart_product_faq']) ? wp_kses_post(wp_unslash($_POST['emart_product_faq'])) : '';

	if (trim($ingredients) === '' && trim((string) $product->get_meta($keys['ingredients'])) === '') {
		$ingredients = emart_get_legacy_ingredients($product);
	}

	if (trim($how_to_use) === '' && trim((string) $product->get_meta($keys['how_to_use'])) === '') {
		$how_to_use = emart_get_legacy_how_to_use($product);
	}

	$product->update_meta_data($keys['ingredients'], $ingredients);
	$product->update_meta_data($keys['how_to_use'], $how_to_use);
	$product->update_meta_data($keys['faq'], $faq);
}
add_action('woocommerce_admin_process_product_object', 'emart_save_product_content_fields');

function emart_backfill_product_content_batch($limit = 300) {
	$keys = emart_product_content_field_keys();
	$query = new WP_Query(array(
		'post_type'      => 'product',
		'post_status'    => array('publish', 'draft', 'private'),
		'posts_per_page' => (int) $limit,
		'fields'         => 'ids',
		'meta_query'     => array(
			'relation' => 'OR',
			array(
				'key'     => $keys['ingredients'],
				'compare' => 'NOT EXISTS',
			),
			array(
				'key'     => $keys['how_to_use'],
				'compare' => 'NOT EXISTS',
			),
		),
	));

	$updated = 0;
	foreach ($query->posts as $product_id) {
		$product = wc_get_product($product_id);
		if (!$product) {
			continue;
		}

		$changed = false;
		if (trim((string) $product->get_meta($keys['ingredients'])) === '') {
			$ingredients = emart_get_legacy_ingredients($product);
			if (trim($ingredients) !== '') {
				$product->update_meta_data($keys['ingredients'], $ingredients);
				$changed = true;
			}
		}

		if (trim((string) $product->get_meta($keys['how_to_use'])) === '') {
			$how_to_use = emart_get_legacy_how_to_use($product);
			if (trim($how_to_use) !== '') {
				$product->update_meta_data($keys['how_to_use'], $how_to_use);
				$changed = true;
			}
		}

		if ($changed) {
			$product->save();
			$updated++;
		}
	}

	return $updated;
}

// Expose _emart_version and concern_terms in WC REST API response
add_filter('woocommerce_rest_prepare_product_object', function($response, $product, $request) {
	$data    = $response->get_data();
	$changed = false;

	$version = get_post_meta($product->get_id(), '_emart_version', true);
	if ($version) {
		$data['emart_version'] = $version;
		$changed = true;
	}

	$terms = wp_get_post_terms($product->get_id(), 'pa_concern');
	if (!is_wp_error($terms) && !empty($terms)) {
		$data['concern_terms'] = array_map(function($term) {
			return [
				'name' => html_entity_decode($term->name, ENT_QUOTES, 'UTF-8'),
				'slug' => $term->slug,
			];
		}, $terms);
		$changed = true;
	}

	if ($changed) {
		$response->set_data($data);
	}

	return $response;
}, 10, 3);
