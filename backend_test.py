#!/usr/bin/env python3
"""
Comprehensive backend API tests for Kalakriti Studios
Tests all endpoints with proper authorization, validation, and critical workflows
"""
import requests
import json
import sys
from typing import Optional, Dict, Any

# Base URL for testing
BASE_URL = "http://localhost:3000"

# Test session cookies (generated via make-test-session.mjs)
ADMIN_COOKIE = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiOFdDZXVUdkQ1OWlsR3lrcS0zNWJnQ2EtNi11emFNaWVzWjY4bklXem41QVV0Qk9jeEFacnBacXdzSUFCU3dOcmU3ZzRMTUFpRm5rVVhUdEdkY1RwVWcifQ..PuNsD-w_5XMhPO7v9UPvxQ.jivO2GpeS2uKTSEKipS3vS6IzHi1UjSygxfgCyOad07Ns-J9k5_s7IXXlgjJseq275fkRYyJLCNXE5HoSpgvR9l2V_bchrgEvQPlCFYPlin3xzyLR76j2clyEYCNVjzJSOsMphG8QMx3DscMnW0S9S2dmD6ipYquduBfNTg63gt4ulDuYGA9_TonhHWZYlSfzIkzsulePd9SsW-o9PjE7UrkmkOLSMUxRUTXKVqjOA98nuNJHTA-asjTIFYxaRQTLSLE7uGDUqIKg4mDt1k5-yW18TTALnfOPF_Jtj_rTnf7WX2F4UqsOFr3k2aW7wBE.3NW5DvuVMbxQoYjYEPKreuLAazfPafuxCx9tI4KRiI0"
CUSTOMER_COOKIE = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiOFdDZXVUdkQ1OWlsR3lrcS0zNWJnQ2EtNi11emFNaWVzWjY4bklXem41QVV0Qk9jeEFacnBacXdzSUFCU3dOcmU3ZzRMTUFpRm5rVVhUdEdkY1RwVWcifQ..X3SdFP8PTAjKpsdT_THrpw.U8elmSl7-g1BoLHLji_uJMH1LbUnZ2Y5dimfXkoe5AqHAYSpybWIArwwSPCISOMp1E25wODdJKf_bc3pbytDOTXgMXu3F5Rk-RryuUyrilKH0D_uC8w62QdjS_89KM-4e6N_jEsupLhWevFK2npx4yx2GxwHr7G_AqNs1PdsO_JxntKWzBhSC8qoXU_d0ED_8jc3gRFYCy2l9pvuefPNmeskPgWVbH6e8vR8-PZf9g22UX-b-PqNMeKgyvx5UtNaHbEonDiGgHMnba8atQ4ymj7yn2i8dbkUanYLaCreN4jZC3V5kQl8vRBs7_xizzQy.dVTZEI4xui0Mvepl4LhRJxYc6RAqU9j-jrzhHFAAwtM"

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

def make_request(method: str, path: str, cookie: Optional[str] = None, json_data: Optional[Dict] = None, 
                 files: Optional[Dict] = None, data: Optional[Dict] = None) -> requests.Response:
    """Make HTTP request with optional authentication"""
    url = f"{BASE_URL}{path}"
    headers = {}
    if cookie:
        headers["Cookie"] = f"authjs.session-token={cookie}"
    
    try:
        if method == "GET":
            return requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            if files:
                return requests.post(url, headers=headers, files=files, data=data, timeout=30)
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

def test_health():
    """Test health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    try:
        resp = make_request("GET", "/api/health")
        assert_status(resp, 200, "Health check")
        if resp.status_code == 200:
            data = resp.json()
            if data.get("ok") and data.get("db") == "up":
                print("✅ Database connection verified")
            else:
                print(f"⚠️  Health check response: {data}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        test_results["failed"] += 1

def test_authorization():
    """Test authorization on admin endpoints"""
    print("\n=== Testing Authorization ===")
    
    # Test 401 (no auth)
    resp = make_request("GET", "/api/admin/products")
    assert_status(resp, 401, "Admin endpoint without auth returns 401")
    
    # Test 403 (customer auth)
    resp = make_request("GET", "/api/admin/products", cookie=CUSTOMER_COOKIE)
    assert_status(resp, 403, "Admin endpoint with customer auth returns 403")
    
    # Test 200 (admin auth)
    resp = make_request("GET", "/api/admin/products", cookie=ADMIN_COOKIE)
    assert_status(resp, 200, "Admin endpoint with admin auth returns 200")

def test_account_endpoints():
    """Test account endpoints"""
    print("\n=== Testing Account Endpoints ===")
    
    # GET /api/account without auth
    resp = make_request("GET", "/api/account")
    assert_status(resp, 401, "GET /api/account without auth returns 401")
    
    # GET /api/account with admin auth
    resp = make_request("GET", "/api/account", cookie=ADMIN_COOKIE)
    if assert_status(resp, 200, "GET /api/account with admin auth"):
        data = resp.json()
        if "user" in data and data["user"].get("email"):
            print(f"✅ Account data retrieved: {data['user']['email']}")
    
    # PATCH /api/account
    resp = make_request("PATCH", "/api/account", cookie=ADMIN_COOKIE, 
                       json_data={"name": "Kalakriti Admin"})
    assert_status(resp, 200, "PATCH /api/account updates name")

def test_categories_crud():
    """Test categories CRUD operations"""
    print("\n=== Testing Categories CRUD ===")
    
    # GET categories
    resp = make_request("GET", "/api/admin/categories", cookie=ADMIN_COOKIE)
    if assert_status(resp, 200, "GET /api/admin/categories"):
        data = resp.json()
        print(f"✅ Found {len(data.get('categories', []))} categories")
    
    # POST category
    category_data = {
        "name": "Test Category Auto",
        "slug": "test-category-auto",
        "description": "Automated test category",
        "sortOrder": 999,
        "isPublished": True
    }
    resp = make_request("POST", "/api/admin/categories", cookie=ADMIN_COOKIE, json_data=category_data)
    if assert_status(resp, 201, "POST /api/admin/categories creates category"):
        category = resp.json().get("category")
        if category and category.get("id"):
            created_resources["categories"].append(category["id"])
            print(f"✅ Created category: {category['id']}")
            
            # PUT category
            update_data = {**category_data, "name": "Test Category Updated"}
            resp = make_request("PUT", f"/api/admin/categories/{category['id']}", 
                              cookie=ADMIN_COOKIE, json_data=update_data)
            assert_status(resp, 200, "PUT /api/admin/categories/:id updates category")

def test_tags_crud():
    """Test tags CRUD operations"""
    print("\n=== Testing Tags CRUD ===")
    
    # GET tags
    resp = make_request("GET", "/api/admin/tags", cookie=ADMIN_COOKIE)
    if assert_status(resp, 200, "GET /api/admin/tags"):
        data = resp.json()
        print(f"✅ Found {len(data.get('tags', []))} tags")
    
    # POST tag
    tag_data = {"name": "Test Tag Auto"}
    resp = make_request("POST", "/api/admin/tags", cookie=ADMIN_COOKIE, json_data=tag_data)
    if assert_status(resp, 201, "POST /api/admin/tags creates tag"):
        tag = resp.json().get("tag")
        if tag and tag.get("id"):
            created_resources["tags"].append(tag["id"])
            print(f"✅ Created tag: {tag['id']}")
            
            # PUT tag
            update_data = {"name": "Test Tag Updated"}
            resp = make_request("PUT", f"/api/admin/tags/{tag['id']}", 
                              cookie=ADMIN_COOKIE, json_data=update_data)
            assert_status(resp, 200, "PUT /api/admin/tags/:id updates tag")

def test_upload_signature():
    """Test Cloudinary upload signature generation"""
    print("\n=== Testing Upload Signature ===")
    
    # Test without auth
    resp = make_request("POST", "/api/admin/upload-signature", json_data={"kind": "product"})
    assert_status(resp, 401, "Upload signature without auth returns 401")
    
    # Test with admin auth
    resp = make_request("POST", "/api/admin/upload-signature", cookie=ADMIN_COOKIE, 
                       json_data={"kind": "product"})
    if assert_status(resp, 200, "Upload signature with admin auth"):
        data = resp.json()
        required_fields = ["timestamp", "folder", "signature", "apiKey", "cloudName"]
        if all(field in data for field in required_fields):
            print(f"✅ Upload signature contains all required fields")
            print(f"   Cloud: {data.get('cloudName')}, Folder: {data.get('folder')}")
        else:
            print(f"⚠️  Missing fields in upload signature: {data}")

def get_existing_product_image():
    """Get an image URL from an existing product"""
    try:
        resp = make_request("GET", "/api/products?pageSize=1")
        if resp.status_code == 200:
            data = resp.json()
            items = data.get("items", [])
            if items and items[0].get("images") and len(items[0]["images"]) > 0:
                return items[0]["images"][0].get("imageUrl")
    except:
        pass
    # Fallback to a known Cloudinary URL format
    return "https://res.cloudinary.com/uhqsdfgy/image/upload/v1/products/sample.jpg"

def test_products_crud():
    """Test products CRUD operations with critical workflow"""
    print("\n=== Testing Products CRUD ===")
    
    # Get existing image URL
    image_url = get_existing_product_image()
    print(f"Using image URL: {image_url}")
    
    # Get rakhi category ID
    resp = make_request("GET", "/api/admin/categories", cookie=ADMIN_COOKIE)
    rakhi_category_id = None
    if resp.status_code == 200:
        categories = resp.json().get("categories", [])
        for cat in categories:
            if cat.get("slug") == "rakhi":
                rakhi_category_id = cat["id"]
                break
    
    if not rakhi_category_id:
        print("⚠️  Rakhi category not found, using None")
    
    # POST product
    product_data = {
        "name": "Test Rakhi Automated",
        "code": f"TEST-AUTO-001",
        "shortDescription": "Automated test rakhi product",
        "description": "This is a test product created by automated testing",
        "categoryId": rakhi_category_id,
        "tags": ["test", "automated"],
        "mrp": 500,
        "offerPrice": 450,
        "stockStatus": "IN_STOCK",
        "isFeatured": True,
        "isPublished": True,
        "isCustomizable": False,
        "images": [{
            "publicId": "products/test-auto",
            "url": image_url,
            "width": 800,
            "height": 800
        }]
    }
    
    resp = make_request("POST", "/api/admin/products", cookie=ADMIN_COOKIE, json_data=product_data)
    if not assert_status(resp, 201, "POST /api/admin/products creates product"):
        return
    
    product = resp.json().get("product")
    if not product or not product.get("id"):
        print("❌ Product creation failed - no product ID returned")
        return
    
    product_id = product["id"]
    product_slug = product.get("slug")
    created_resources["products"].append(product_id)
    print(f"✅ Created product: {product_id} (slug: {product_slug})")
    
    # Verify product appears in public API
    import time
    time.sleep(1)  # Brief wait for revalidation
    
    resp = make_request("GET", f"/api/products?q={product_data['name']}")
    if assert_status(resp, 200, "Public API shows new product"):
        data = resp.json()
        items = data.get("items", [])
        found = any(item.get("id") == product_id for item in items)
        if found:
            print(f"✅ Product found in public search")
        else:
            print(f"⚠️  Product not found in public search (may need more time)")
    
    # GET single product (admin)
    resp = make_request("GET", f"/api/admin/products/{product_id}", cookie=ADMIN_COOKIE)
    assert_status(resp, 200, "GET /api/admin/products/:id retrieves product")
    
    # PUT product (full update)
    update_data = {
        **product_data,
        "name": "Test Rakhi Updated",
        "mrp": 600,
        "offerPrice": 550,
        "stockStatus": "LIMITED_STOCK"
    }
    resp = make_request("PUT", f"/api/admin/products/{product_id}", cookie=ADMIN_COOKIE, 
                       json_data=update_data)
    if assert_status(resp, 200, "PUT /api/admin/products/:id updates product"):
        updated = resp.json().get("product")
        if updated.get("name") == "Test Rakhi Updated":
            print(f"✅ Product name updated successfully")
        if updated.get("offerPrice") == 550:
            print(f"✅ Product price updated successfully")
    
    # Verify updates appear in public API
    time.sleep(1)
    resp = make_request("GET", f"/api/products?q=Test Rakhi Updated")
    if resp.status_code == 200:
        data = resp.json()
        items = data.get("items", [])
        found_item = next((item for item in items if item.get("id") == product_id), None)
        if found_item:
            if found_item.get("offerPrice") == 550:
                print(f"✅ Updated price appears in public API")
            if found_item.get("stockStatus") == "LIMITED_STOCK":
                print(f"✅ Updated stock status appears in public API")
    
    # PATCH product (quick update)
    patch_data = {
        "stockStatus": "OUT_OF_STOCK",
        "isPublished": True
    }
    resp = make_request("PATCH", f"/api/admin/products/{product_id}", cookie=ADMIN_COOKIE, 
                       json_data=patch_data)
    assert_status(resp, 200, "PATCH /api/admin/products/:id quick update")
    
    # Test unpublishing
    resp = make_request("PATCH", f"/api/admin/products/{product_id}", cookie=ADMIN_COOKIE,
                       json_data={"isPublished": False})
    if assert_status(resp, 200, "PATCH unpublishes product"):
        time.sleep(1)
        resp = make_request("GET", f"/api/products?q=Test Rakhi Updated")
        if resp.status_code == 200:
            items = resp.json().get("items", [])
            found = any(item.get("id") == product_id for item in items)
            if not found:
                print(f"✅ Unpublished product not in public API")
            else:
                print(f"⚠️  Unpublished product still appears in public API")
    
    # Re-publish for further tests
    make_request("PATCH", f"/api/admin/products/{product_id}", cookie=ADMIN_COOKIE,
                json_data={"isPublished": True})

def test_product_validation():
    """Test product validation rules"""
    print("\n=== Testing Product Validation ===")
    
    image_url = get_existing_product_image()
    
    # Test offer price > MRP (should fail with 422)
    invalid_data = {
        "name": "Invalid Product",
        "code": "INVALID-001",
        "shortDescription": "Test validation",
        "mrp": 100,
        "offerPrice": 150,  # Higher than MRP
        "images": [{"publicId": "test", "url": image_url}]
    }
    resp = make_request("POST", "/api/admin/products", cookie=ADMIN_COOKIE, json_data=invalid_data)
    assert_status(resp, 422, "Product with offer > MRP returns 422")
    
    # Test foreign image URL (should fail with 422)
    foreign_image_data = {
        "name": "Foreign Image Product",
        "code": "FOREIGN-001",
        "shortDescription": "Test validation",
        "mrp": 100,
        "offerPrice": 90,
        "images": [{"publicId": "test", "url": "https://evil.com/image.jpg"}]
    }
    resp = make_request("POST", "/api/admin/products", cookie=ADMIN_COOKIE, json_data=foreign_image_data)
    assert_status(resp, 422, "Product with foreign image URL returns 422")
    
    # Test duplicate code (create one, then try to create another with same code)
    unique_code = f"DUP-TEST-{int(time.time())}"
    valid_data = {
        "name": "Duplicate Test 1",
        "code": unique_code,
        "shortDescription": "Test duplicate",
        "mrp": 100,
        "offerPrice": 90,
        "images": [{"publicId": "test", "url": image_url}]
    }
    resp = make_request("POST", "/api/admin/products", cookie=ADMIN_COOKIE, json_data=valid_data)
    if resp.status_code == 201:
        product_id = resp.json().get("product", {}).get("id")
        if product_id:
            created_resources["products"].append(product_id)
        
        # Try to create another with same code
        dup_data = {**valid_data, "name": "Duplicate Test 2"}
        resp = make_request("POST", "/api/admin/products", cookie=ADMIN_COOKIE, json_data=dup_data)
        assert_status(resp, 409, "Duplicate product code returns 409")

def test_public_products_api():
    """Test public products API with search, filters, sorting"""
    print("\n=== Testing Public Products API ===")
    
    # Basic search
    resp = make_request("GET", "/api/products")
    if assert_status(resp, 200, "GET /api/products (no params)"):
        data = resp.json()
        print(f"✅ Found {len(data.get('items', []))} products, total: {data.get('total', 0)}")
    
    # Search by name
    resp = make_request("GET", "/api/products?q=rakhi")
    if assert_status(resp, 200, "GET /api/products?q=rakhi"):
        data = resp.json()
        print(f"✅ Search 'rakhi' returned {len(data.get('items', []))} products")
    
    # Filter by category
    resp = make_request("GET", "/api/products?category=rakhi")
    if assert_status(resp, 200, "GET /api/products?category=rakhi"):
        data = resp.json()
        print(f"✅ Category filter returned {len(data.get('items', []))} products")
    
    # Filter by stock status
    resp = make_request("GET", "/api/products?stock=IN_STOCK")
    assert_status(resp, 200, "GET /api/products?stock=IN_STOCK")
    
    # Sort by price
    resp = make_request("GET", "/api/products?sort=price_asc")
    if assert_status(resp, 200, "GET /api/products?sort=price_asc"):
        items = resp.json().get("items", [])
        if len(items) >= 2:
            prices = [item.get("offerPrice", 0) for item in items]
            if prices == sorted(prices):
                print(f"✅ Products sorted by price ascending")
    
    # Pagination
    resp = make_request("GET", "/api/products?page=1&pageSize=5")
    if assert_status(resp, 200, "GET /api/products with pagination"):
        data = resp.json()
        if len(data.get("items", [])) <= 5:
            print(f"✅ Pagination working: {len(data.get('items', []))} items")

def test_settings():
    """Test settings GET/PUT and WhatsApp number update"""
    print("\n=== Testing Settings ===")
    
    # GET settings
    resp = make_request("GET", "/api/admin/settings", cookie=ADMIN_COOKIE)
    if not assert_status(resp, 200, "GET /api/admin/settings"):
        return
    
    original_settings = resp.json().get("settings")
    if not original_settings:
        print("❌ No settings returned")
        return
    
    original_whatsapp = original_settings.get("whatsappNumber", "")
    print(f"✅ Original WhatsApp: {original_whatsapp}")
    
    # Update WhatsApp number
    new_whatsapp = "919999999999"
    update_data = {
        **original_settings,
        "whatsappNumber": new_whatsapp
    }
    resp = make_request("PUT", "/api/admin/settings", cookie=ADMIN_COOKIE, json_data=update_data)
    if assert_status(resp, 200, "PUT /api/admin/settings updates WhatsApp"):
        updated = resp.json().get("settings")
        if updated.get("whatsappNumber") == new_whatsapp:
            print(f"✅ WhatsApp number updated to {new_whatsapp}")
    
    # Restore original settings
    import time
    time.sleep(1)
    restore_data = {
        **original_settings,
        "whatsappNumber": original_whatsapp or "918637269422"
    }
    resp = make_request("PUT", "/api/admin/settings", cookie=ADMIN_COOKIE, json_data=restore_data)
    if resp.status_code == 200:
        print(f"✅ Settings restored to original values")
    else:
        print(f"⚠️  Failed to restore settings: {resp.status_code}")
    
    # Test invalid WhatsApp number
    invalid_data = {
        **original_settings,
        "whatsappNumber": "invalid"
    }
    resp = make_request("PUT", "/api/admin/settings", cookie=ADMIN_COOKIE, json_data=invalid_data)
    assert_status(resp, 422, "Invalid WhatsApp number returns 422")

def test_public_pages():
    """Test public page status codes"""
    print("\n=== Testing Public Pages ===")
    
    pages = [
        ("/", 200, "Homepage"),
        ("/shop", 200, "Shop page"),
        ("/category/rakhi", 200, "Rakhi category page"),
        ("/category/hand-craft-design", 200, "Hand craft category page"),
        ("/category/handmade-portrait-designs", 200, "Handmade portrait category page"),
        ("/category/nope", 404, "Non-existent category"),
        ("/sitemap.xml", 200, "Sitemap"),
        ("/robots.txt", 200, "Robots.txt"),
    ]
    
    for path, expected_status, name in pages:
        try:
            resp = make_request("GET", path)
            assert_status(resp, expected_status, f"{name} ({path})")
        except Exception as e:
            print(f"❌ {name} failed: {e}")
            test_results["failed"] += 1

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
    """Run all tests"""
    print("=" * 60)
    print("KALAKRITI STUDIOS BACKEND API TESTS")
    print("=" * 60)
    
    try:
        # Core tests
        test_health()
        test_authorization()
        test_account_endpoints()
        
        # Admin CRUD tests
        test_categories_crud()
        test_tags_crud()
        test_upload_signature()
        test_products_crud()
        test_product_validation()
        
        # Public API tests
        test_public_products_api()
        
        # Settings tests
        test_settings()
        
        # Public pages
        test_public_pages()
        
    finally:
        # Always cleanup
        cleanup_resources()
    
    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
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
    import time
    main()
