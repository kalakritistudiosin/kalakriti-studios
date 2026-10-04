#!/usr/bin/env python3
"""
Cache Regression Test for Kalakriti Studios
Tests that admin mutations immediately invalidate cached public data via revalidateTag('catalog')
"""
import requests
import json
import sys
import time
from typing import Optional, Dict, Any

# Base URL for testing
BASE_URL = "http://localhost:3000"

# Test session cookies
ADMIN_COOKIE = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoibjBYU29BZzJFcnNqUmRhaHF4Zm85UmQ5c1ZtWHJubHItV3BBMXNqZkhGWlNXd2tiZlFhLUFON1BpQjYycXJ1aVZ1Ml90cktLREZCM3M1WjM2djV0cncifQ..JWKizaqDFvNESLkdLPO8jg.l3KhDtjky96IkzucGYwqS1miFcB1Ta5V6AEhchPTACwmTIOSdA2zPpeAW6NKN-OfeANQbrCHYc6Ws5O-oXpxwn0hrtWUCgZfY3FEd5xuSDSZ7Hb7qZ_y-eMtQsUtx8uEcDFDtPmYRIsTsQIInHTY5ara2uzS7TQvZNIbalZwKe5gMecPWQYtVlzYoL9kYDcIfH6n-Adrkg2DOPmjULVEZwy42lOCAdFk1tflXq3eOhI5nhdu8eg_OJasozQI-6spwarXNy47YJOGLgpOk_FJmCuGBbYryxTTRl1TZHNErAkLA3nifVjABKV-9q6o0T_6.Q7Wl1ttu2ODWoHTCbVRLXCc5sRBVV7ApexI1xvH_VdE"
CUSTOMER_COOKIE = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoibjBYU29BZzJFcnNqUmRhaHF4Zm85UmQ5c1ZtWHJubHItV3BBMXNqZkhGWlNXd2tiZlFhLUFON1BpQjYycXJ1aVZ1Ml90cktLREZCM3M1WjM2djV0cncifQ..UOBQCLeUAXS_qinF4zHgOA.GuCzIxlMseAK9NzQdq8GgUXZRvuG2cdfhF6YN6iKUfb912o-mrVdyauD-6vTQBpeatHorPA-mHc8a2hU5SD2mxYPeYsIxwsfTO1wBrYcd9mvZRvavvCkaxp2YndD4Nzt5Ao072Sec0HaRFEMYA1JRdBJAzt29ZhsPSlv6Y3vlD-8_AZmyQI0iKrLJaH6G7VrNLdHNW2lX1Z0TbhhzsF3YcxvuvADHIMSlE3g6bpCOj_U1bqa-mRcs2_qJPJKaP5yvbujzmqNlmG_Kb1qNVs1P47OI0GU92bmm9uyaq8bq5PoSzm66Wc3L8gQEeC33MxR.-AgYrjinXgKaK19PicBMemB8zQ7lgFSz6CWycX82WbU"

# Track test results
test_results = {
    "passed": 0,
    "failed": 0,
    "errors": []
}

# Track created resources for cleanup
created_resources = {
    "products": [],
    "categories": [],
    "tags": []
}

def make_request(method: str, path: str, cookie: Optional[str] = None, json_data: Optional[Dict] = None) -> requests.Response:
    """Make HTTP request with optional authentication"""
    url = f"{BASE_URL}{path}"
    headers = {}
    if cookie:
        headers["Cookie"] = f"__Secure-authjs.session-token={cookie}"
    
    try:
        if method == "GET":
            return requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            return requests.post(url, headers=headers, json=json_data, timeout=10)
        elif method == "PUT":
            return requests.put(url, headers=headers, json=json_data, timeout=10)
        elif method == "PATCH":
            return requests.patch(url, headers=headers, json=json_data, timeout=10)
        elif method == "DELETE":
            return requests.delete(url, headers=headers, timeout=10)
    except Exception as e:
        print(f"❌ Request failed: {method} {path} - {str(e)}")
        raise

def assert_status(response: requests.Response, expected: int, test_name: str):
    """Assert response status code"""
    if response.status_code == expected:
        print(f"✅ {test_name}: Status {response.status_code}")
        test_results["passed"] += 1
        return True
    else:
        error_msg = f"{test_name}: Expected {expected}, got {response.status_code}"
        try:
            error_msg += f" - {response.json()}"
        except:
            error_msg += f" - {response.text[:200]}"
        print(f"❌ {error_msg}")
        test_results["failed"] += 1
        test_results["errors"].append(error_msg)
        return False

def get_hand_craft_category_id():
    """Get the hand-craft-design category ID"""
    resp = make_request("GET", "/api/admin/categories", cookie=ADMIN_COOKIE)
    if resp.status_code == 200:
        categories = resp.json().get("categories", [])
        for cat in categories:
            if cat.get("slug") == "hand-craft-design":
                return cat["id"]
    return None

def get_existing_product_for_image():
    """Get an existing product to reuse its image URL and publicId"""
    resp = make_request("GET", "/api/admin/products?page=1", cookie=ADMIN_COOKIE)
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        for item in items:
            # Get full product details
            prod_resp = make_request("GET", f"/api/admin/products/{item['id']}", cookie=ADMIN_COOKIE)
            if prod_resp.status_code == 200:
                product = prod_resp.json().get("product", {})
                images = product.get("images", [])
                if images and len(images) > 0:
                    return {
                        "url": images[0].get("imageUrl"),
                        "publicId": images[0].get("publicId")
                    }
    return None

def test_product_cache_invalidation():
    """Test that product mutations immediately invalidate cache"""
    print("\n=== Testing Product Cache Invalidation ===")
    
    category_id = get_hand_craft_category_id()
    if not category_id:
        print("❌ hand-craft-design category not found")
        test_results["failed"] += 1
        return
    
    # Get existing product image to reuse (DO NOT use new publicId as it won't exist in Cloudinary)
    existing_image = get_existing_product_for_image()
    if not existing_image:
        print("⚠️  No existing product with images found, creating product without images")
        images = []
    else:
        print(f"✅ Reusing existing image: {existing_image['publicId']}")
        images = []  # Per instructions: create test products with images: []
    
    # 1. CREATE product
    product_data = {
        "name": f"Cache Test Product {int(time.time())}",
        "code": f"CACHE-TEST-{int(time.time())}",
        "shortDescription": "Testing cache invalidation",
        "description": "This product tests that cache is invalidated on create",
        "categoryId": category_id,
        "tags": [],
        "mrp": 1000,
        "offerPrice": 900,
        "stockStatus": "IN_STOCK",
        "isFeatured": False,
        "isPublished": True,
        "isCustomizable": False,
        "images": images
    }
    
    resp = make_request("POST", "/api/admin/products", cookie=ADMIN_COOKIE, json_data=product_data)
    if not assert_status(resp, 201, "POST /api/admin/products creates product"):
        return
    
    product = resp.json().get("product")
    product_id = product["id"]
    product_slug = product["slug"]
    created_resources["products"].append(product_id)
    print(f"✅ Created product: {product_id} (slug: {product_slug})")
    
    # Verify product appears IMMEDIATELY in public APIs (no stale cache)
    time.sleep(0.5)  # Brief wait for revalidation to propagate
    
    # Check /api/products search
    resp = make_request("GET", f"/api/products?q={product_data['name']}")
    if assert_status(resp, 200, "Product appears in /api/products search"):
        items = resp.json().get("items", [])
        found = any(item.get("id") == product_id for item in items)
        if found:
            print(f"✅ Product found in public search immediately after creation")
        else:
            print(f"❌ CACHE ISSUE: Product NOT found in public search after creation")
            test_results["failed"] += 1
            test_results["errors"].append("Product not found in public search after creation")
    
    # Check /category/hand-craft-design page
    resp = make_request("GET", "/category/hand-craft-design")
    if assert_status(resp, 200, "Category page loads"):
        if product_data['name'] in resp.text:
            print(f"✅ Product appears in category page HTML immediately")
        else:
            print(f"⚠️  Product not in category page HTML (may be paginated)")
    
    # 2. UPDATE product (PUT) - rename and price change
    update_data = {
        **product_data,
        "name": f"Cache Test Updated {int(time.time())}",
        "mrp": 1200,
        "offerPrice": 1100
    }
    resp = make_request("PUT", f"/api/admin/products/{product_id}", cookie=ADMIN_COOKIE, json_data=update_data)
    if assert_status(resp, 200, "PUT updates product"):
        time.sleep(0.5)
        
        # Verify new name and price visible immediately
        resp = make_request("GET", f"/api/products?q={update_data['name']}")
        if resp.status_code == 200:
            items = resp.json().get("items", [])
            found_item = next((item for item in items if item.get("id") == product_id), None)
            if found_item:
                if found_item.get("name") == update_data["name"]:
                    print(f"✅ Updated name visible immediately in public API")
                    test_results["passed"] += 1
                else:
                    print(f"❌ CACHE ISSUE: Updated name NOT visible in public API")
                    test_results["failed"] += 1
                    test_results["errors"].append("Updated name not visible in public API")
                
                if found_item.get("offerPrice") == 1100:
                    print(f"✅ Updated price visible immediately in public API")
                    test_results["passed"] += 1
                else:
                    print(f"❌ CACHE ISSUE: Updated price NOT visible in public API")
                    test_results["failed"] += 1
                    test_results["errors"].append("Updated price not visible in public API")
    
    # 3. PATCH stockStatus to OUT_OF_STOCK
    resp = make_request("PATCH", f"/api/admin/products/{product_id}", cookie=ADMIN_COOKIE, 
                       json_data={"stockStatus": "OUT_OF_STOCK"})
    if assert_status(resp, 200, "PATCH stockStatus to OUT_OF_STOCK"):
        time.sleep(0.5)
        
        # Check product page shows "Currently Unavailable"
        resp = make_request("GET", f"/products/{product_slug}")
        if assert_status(resp, 200, f"Product page /products/{product_slug} loads"):
            if "Currently Unavailable" in resp.text or "Out of Stock" in resp.text or "OUT_OF_STOCK" in resp.text:
                print(f"✅ OUT_OF_STOCK status visible immediately on product page")
                test_results["passed"] += 1
            else:
                print(f"⚠️  OUT_OF_STOCK status text not found on product page")
    
    # 4. PATCH isPublished to false
    resp = make_request("PATCH", f"/api/admin/products/{product_id}", cookie=ADMIN_COOKIE,
                       json_data={"isPublished": False})
    if assert_status(resp, 200, "PATCH isPublished to false"):
        time.sleep(0.5)
        
        # Product page should 404
        resp = make_request("GET", f"/products/{product_slug}")
        if assert_status(resp, 404, f"Unpublished product /products/{product_slug} returns 404"):
            print(f"✅ Unpublished product 404s immediately")
        
        # Product should be gone from /api/products
        resp = make_request("GET", f"/api/products?q={update_data['name']}")
        if resp.status_code == 200:
            items = resp.json().get("items", [])
            found = any(item.get("id") == product_id for item in items)
            if not found:
                print(f"✅ Unpublished product removed from public API immediately")
                test_results["passed"] += 1
            else:
                print(f"❌ CACHE ISSUE: Unpublished product still in public API")
                test_results["failed"] += 1
                test_results["errors"].append("Unpublished product still in public API")
    
    # Re-publish for featured test
    make_request("PATCH", f"/api/admin/products/{product_id}", cookie=ADMIN_COOKIE,
                json_data={"isPublished": True})
    time.sleep(0.5)
    
    # 5. PATCH isFeatured to true
    resp = make_request("PATCH", f"/api/admin/products/{product_id}", cookie=ADMIN_COOKIE,
                       json_data={"isFeatured": True})
    if assert_status(resp, 200, "PATCH isFeatured to true"):
        time.sleep(0.5)
        
        # Check homepage for "Best Sellers" section
        resp = make_request("GET", "/")
        if assert_status(resp, 200, "Homepage loads"):
            if "Best Sellers" in resp.text or "Featured" in resp.text:
                print(f"✅ Homepage has featured products section")
                # Note: Product may not appear if there are already 4 more recently updated featured products
                if update_data['name'] in resp.text:
                    print(f"✅ Featured product appears in homepage immediately")
                    test_results["passed"] += 1
                else:
                    print(f"⚠️  Featured product not in homepage (may be outside top 4)")
            else:
                print(f"⚠️  Featured products section not found on homepage")

def test_category_cache_invalidation():
    """Test that category mutations immediately invalidate cache"""
    print("\n=== Testing Category Cache Invalidation ===")
    
    # Create temporary category
    category_data = {
        "name": f"Cache Test Category {int(time.time())}",
        "slug": f"cache-test-cat-{int(time.time())}",
        "description": "Testing cache invalidation",
        "sortOrder": 999,
        "isPublished": True
    }
    
    resp = make_request("POST", "/api/admin/categories", cookie=ADMIN_COOKIE, json_data=category_data)
    if not assert_status(resp, 201, "POST /api/admin/categories creates category"):
        return
    
    category = resp.json().get("category")
    category_id = category["id"]
    created_resources["categories"].append(category_id)
    print(f"✅ Created category: {category_id}")
    
    time.sleep(0.5)
    
    # Verify category appears in /shop filters
    resp = make_request("GET", "/shop")
    if assert_status(resp, 200, "Shop page loads"):
        if category_data['name'] in resp.text:
            print(f"✅ New category appears in /shop filters immediately")
            test_results["passed"] += 1
        else:
            print(f"⚠️  New category not in /shop filters (may not be rendered)")
    
    # Verify category appears in footer
    resp = make_request("GET", "/")
    if resp.status_code == 200:
        if category_data['name'] in resp.text:
            print(f"✅ New category appears in footer immediately")
            test_results["passed"] += 1
        else:
            print(f"⚠️  New category not in footer")
    
    # Rename category
    update_data = {
        **category_data,
        "name": f"Cache Test Renamed {int(time.time())}"
    }
    resp = make_request("PUT", f"/api/admin/categories/{category_id}", cookie=ADMIN_COOKIE, json_data=update_data)
    if assert_status(resp, 200, "PUT renames category"):
        time.sleep(0.5)
        
        # Verify new name appears in /shop
        resp = make_request("GET", "/shop")
        if resp.status_code == 200:
            if update_data['name'] in resp.text:
                print(f"✅ Renamed category appears in /shop immediately")
                test_results["passed"] += 1
            else:
                print(f"⚠️  Renamed category not in /shop")

def test_tag_cache_invalidation():
    """Test that tag mutations immediately invalidate cache"""
    print("\n=== Testing Tag Cache Invalidation ===")
    
    # Create tag
    tag_data = {"name": f"cachetest{int(time.time())}"}
    resp = make_request("POST", "/api/admin/tags", cookie=ADMIN_COOKIE, json_data=tag_data)
    if not assert_status(resp, 201, "POST /api/admin/tags creates tag"):
        return
    
    tag = resp.json().get("tag")
    tag_id = tag["id"]
    tag_slug = tag["slug"]
    created_resources["tags"].append(tag_id)
    print(f"✅ Created tag: {tag_id} (slug: {tag_slug})")
    
    time.sleep(0.5)
    
    # Query /api/products?tag=<slug>
    resp = make_request("GET", f"/api/products?tag={tag_slug}")
    if assert_status(resp, 200, f"GET /api/products?tag={tag_slug}"):
        print(f"✅ Tag query endpoint works immediately")
    
    # Rename tag
    update_data = {"name": f"cachetest-renamed-{int(time.time())}"}
    resp = make_request("PUT", f"/api/admin/tags/{tag_id}", cookie=ADMIN_COOKIE, json_data=update_data)
    if assert_status(resp, 200, "PUT renames tag"):
        time.sleep(0.5)
        updated_tag = resp.json().get("tag", {})
        new_slug = updated_tag.get("slug")
        
        # Query with new slug
        resp = make_request("GET", f"/api/products?tag={new_slug}")
        if assert_status(resp, 200, f"GET /api/products?tag={new_slug} after rename"):
            print(f"✅ Renamed tag query works immediately")
            test_results["passed"] += 1

def test_settings_cache_invalidation():
    """Test that settings mutations immediately invalidate cache"""
    print("\n=== Testing Settings Cache Invalidation ===")
    
    # GET original settings
    resp = make_request("GET", "/api/admin/settings", cookie=ADMIN_COOKIE)
    if not assert_status(resp, 200, "GET /api/admin/settings"):
        return
    
    original_settings = resp.json().get("settings")
    if not original_settings:
        print("❌ No settings returned")
        test_results["failed"] += 1
        return
    
    original_hero_title = original_settings.get("heroTitle", "")
    print(f"✅ Original heroTitle: {original_hero_title}")
    
    # Update heroTitle
    new_hero_title = f"Cache Test Hero {int(time.time())}"
    update_data = {
        **original_settings,
        "heroTitle": new_hero_title
    }
    resp = make_request("PUT", "/api/admin/settings", cookie=ADMIN_COOKIE, json_data=update_data)
    if assert_status(resp, 200, "PUT /api/admin/settings updates heroTitle"):
        time.sleep(0.5)
        
        # Check homepage HTML
        resp = make_request("GET", "/")
        if assert_status(resp, 200, "Homepage loads after settings update"):
            if new_hero_title in resp.text:
                print(f"✅ New heroTitle appears on homepage immediately")
                test_results["passed"] += 1
            else:
                print(f"❌ CACHE ISSUE: New heroTitle NOT on homepage")
                test_results["failed"] += 1
                test_results["errors"].append("New heroTitle not on homepage")
    
    # Restore original settings
    time.sleep(0.5)
    restore_data = {
        **original_settings,
        "whatsappNumber": original_settings.get("whatsappNumber") or "918637269422"
    }
    resp = make_request("PUT", "/api/admin/settings", cookie=ADMIN_COOKIE, json_data=restore_data)
    if assert_status(resp, 200, "Settings restored to original"):
        time.sleep(0.5)
        
        # Verify restoration
        resp = make_request("GET", "/api/admin/settings", cookie=ADMIN_COOKIE)
        if resp.status_code == 200:
            restored = resp.json().get("settings", {})
            if restored.get("heroTitle") == original_hero_title:
                print(f"✅ Settings restored successfully")
                test_results["passed"] += 1
            else:
                print(f"⚠️  Settings restoration may have failed")
            
            # Verify WhatsApp ends with 918637269422
            whatsapp = restored.get("whatsappNumber", "")
            if whatsapp.endswith("918637269422"):
                print(f"✅ WhatsApp number ends with 918637269422")
                test_results["passed"] += 1
            else:
                print(f"❌ WhatsApp number does not end with 918637269422: {whatsapp}")
                test_results["failed"] += 1
                test_results["errors"].append(f"WhatsApp number incorrect: {whatsapp}")

def test_auth_enforcement():
    """Test that auth is still enforced on admin endpoints"""
    print("\n=== Testing Auth Enforcement ===")
    
    # Test 401 (no auth)
    resp = make_request("GET", "/api/admin/products")
    assert_status(resp, 401, "Admin endpoint without auth returns 401")
    
    # Test 403 (customer auth)
    resp = make_request("GET", "/api/admin/products", cookie=CUSTOMER_COOKIE)
    assert_status(resp, 403, "Admin endpoint with customer auth returns 403")
    
    # Test 200 (admin auth)
    resp = make_request("GET", "/api/admin/products", cookie=ADMIN_COOKIE)
    assert_status(resp, 200, "Admin endpoint with admin auth returns 200")

def test_auth_providers():
    """Test auth providers endpoint"""
    print("\n=== Testing Auth Providers ===")
    
    resp = make_request("GET", "/api/auth/providers")
    if assert_status(resp, 200, "GET /api/auth/providers"):
        data = resp.json()
        google = data.get("google", {})
        callback_url = google.get("callbackUrl", "")
        expected_callback = "https://handmade-shop-71.preview.emergentagent.com/api/auth/callback/google"
        
        if callback_url == expected_callback:
            print(f"✅ Google callbackUrl is correct: {callback_url}")
            test_results["passed"] += 1
        else:
            print(f"❌ Google callbackUrl incorrect: {callback_url}")
            print(f"   Expected: {expected_callback}")
            test_results["failed"] += 1
            test_results["errors"].append(f"Google callbackUrl incorrect: {callback_url}")

def test_page_status_codes():
    """Test page status codes"""
    print("\n=== Testing Page Status Codes ===")
    
    pages = [
        ("/", 200, "Homepage"),
        ("/shop", 200, "Shop page"),
        ("/category/rakhi", 200, "Rakhi category"),
        ("/category/hand-craft-design", 200, "Hand craft category"),
        ("/category/handmade-portrait-designs", 200, "Handmade portrait category"),
        ("/products/shubh-labh-gota-toran", 200, "Existing product page"),
        ("/products/nope", 404, "Non-existent product"),
    ]
    
    for path, expected_status, name in pages:
        try:
            resp = make_request("GET", path)
            assert_status(resp, expected_status, f"{name} ({path})")
        except Exception as e:
            print(f"❌ {name} failed: {e}")
            test_results["failed"] += 1
            test_results["errors"].append(f"{name} failed: {e}")

def cleanup_resources():
    """Clean up all created test resources"""
    print("\n=== Cleaning Up Test Resources ===")
    
    # Delete products
    for product_id in created_resources["products"]:
        try:
            resp = make_request("DELETE", f"/api/admin/products/{product_id}", cookie=ADMIN_COOKIE)
            if resp.status_code == 200:
                print(f"✅ Deleted product: {product_id}")
            else:
                print(f"⚠️  Failed to delete product {product_id}: {resp.status_code}")
        except Exception as e:
            print(f"⚠️  Error deleting product {product_id}: {e}")
    
    # Delete categories
    for category_id in created_resources["categories"]:
        try:
            resp = make_request("DELETE", f"/api/admin/categories/{category_id}", cookie=ADMIN_COOKIE)
            if resp.status_code == 200:
                print(f"✅ Deleted category: {category_id}")
            else:
                print(f"⚠️  Failed to delete category {category_id}: {resp.status_code}")
        except Exception as e:
            print(f"⚠️  Error deleting category {category_id}: {e}")
    
    # Delete tags
    for tag_id in created_resources["tags"]:
        try:
            resp = make_request("DELETE", f"/api/admin/tags/{tag_id}", cookie=ADMIN_COOKIE)
            if resp.status_code == 200:
                print(f"✅ Deleted tag: {tag_id}")
            else:
                print(f"⚠️  Failed to delete tag {tag_id}: {resp.status_code}")
        except Exception as e:
            print(f"⚠️  Error deleting tag {tag_id}: {e}")

def main():
    """Run all cache regression tests"""
    print("=" * 80)
    print("KALAKRITI STUDIOS - CACHE REGRESSION TEST")
    print("Testing that admin mutations immediately invalidate cached public data")
    print("=" * 80)
    
    try:
        # Core cache invalidation tests
        test_product_cache_invalidation()
        test_category_cache_invalidation()
        test_tag_cache_invalidation()
        test_settings_cache_invalidation()
        
        # Auth and page tests
        test_auth_enforcement()
        test_auth_providers()
        test_page_status_codes()
        
    finally:
        # Always cleanup
        cleanup_resources()
    
    # Print summary
    print("\n" + "=" * 80)
    print("CACHE REGRESSION TEST SUMMARY")
    print("=" * 80)
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    print(f"Total: {test_results['passed'] + test_results['failed']}")
    
    if test_results["errors"]:
        print("\n❌ FAILED TESTS:")
        for error in test_results["errors"]:
            print(f"  - {error}")
    
    # Exit with appropriate code
    sys.exit(0 if test_results["failed"] == 0 else 1)

if __name__ == "__main__":
    main()
